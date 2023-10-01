import dayjs from "dayjs";
import * as Application from "expo-application";
import { BlurView } from "expo-blur";
import Constants, { AppOwnership } from "expo-constants";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as IntentLauncher from "expo-intent-launcher";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as MailComposer from "expo-mail-composer";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  LayoutChangeEvent,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import semver from "semver";
import {
  AvatarButton,
  BannerLevel,
  Button,
  Center,
  Color,
  CustomDialog,
  DialogSection,
  FloatingActionButton,
  HStack,
  Marquee,
  Modal,
  Picker,
  SalmonRunSwitcherContext,
  Text,
  TextStyles,
  ToolButton,
  VStack,
  ViewStyles,
  useBanner,
  useTheme,
} from "../components";
import t from "../i18n";
import { CoopHistoryDetailResult, Schedules, Shop, VsHistoryDetailResult } from "../models/types";
import {
  fetchAnarchyBattleHistories,
  fetchAppStoreVersion,
  fetchChallengeHistories,
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchLatestBattleHistories,
  fetchPrivateBattleHistories,
  fetchRegularBattleHistories,
  fetchReleaseVersion,
  fetchShop,
  fetchSchedules,
  fetchVsHistoryDetail,
  fetchXBattleHistories,
} from "../utils/api";
import { Key, useAsyncStorage, useBooleanAsyncStorage } from "../utils/async-storage";
import { decode64String, encode64String } from "../utils/codec";
import * as Database from "../utils/database";
import { BATCH_SIZE, requestMemory } from "../utils/memory";
import { ok, sleep } from "../utils/promise";
import { Stats } from "../utils/stats";
import {
  getImageCacheKey,
  getImageHash,
  getUserIconCacheSource,
  isImageExpired,
} from "../utils/ui";
import FilterView from "./FilterView";
import ImportView from "./ImportView";
import ResultView, { ResultGroup, Result } from "./ResultView";
import RotationsView from "./RotationsView";
import ScheduleView from "./ScheduleView";
import ShopView from "./ShopView";
import StatsView from "./StatsView";
import TrendsView from "./TrendsView";

enum TimeRange {
  Today = "today",
  ThisWeek = "this_week",
  ThisMonth = "this_month",
  ThisSeason = "this_season",
  AllResults = "all_results",
}

let autoRefreshTimeout: NodeJS.Timeout | undefined;

const MainView = () => {
  const theme = useTheme();

  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const showBanner = useBanner();

  const [ready, setReady] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [update, setUpdate] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [headers, setHeaders] = useState<Record<string, string>>();
  const [loadingMore, setLoadingMore] = useState(false);
  const [counting, setCounting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [support, setSupport] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [preloadingResources, setPreloadingResources] = useState(false);
  const [clearingDatabase, setClearingDatabase] = useState(false);
  const [acknowledgments, setAcknowledgments] = useState(false);
  const [fault, setFault] = useState<Error>();

  const [filter, setFilter, clearFilter, filterReady] = useAsyncStorage<Database.FilterProps>(
    Key.Filter
  );
  const [salmonRunFriendlyMode, setSalmonRunFriendlyMode, clearSalmonRunFriendlyMode] =
    useBooleanAsyncStorage(Key.SalmonRunFriendlyMode);
  const [autoRefresh, setAutoRefresh] = useBooleanAsyncStorage(Key.AutoRefresh, false);

  const [schedules, setSchedules] = useState<Schedules>();
  const [shop, setShop] = useState<Shop>();
  const [groups, setGroups] = useState<ResultGroup[]>();
  const [filtered, setFiltered] = useState(0);
  const [total, setTotal] = useState(0);
  const filterRef = useRef<Database.FilterProps>();
  const [filterOptions, setFilterOptions] = useState<Database.FilterProps>();
  const [stats, setStats] = useState<Stats[]>();

  const count = useMemo(() => {
    let current = 0;
    for (const group of groups ?? []) {
      current += (group.battles?.length ?? 0) + (group.coops?.length ?? 0);
    }
    return current;
  }, [groups]);
  const allResultsShown = count >= filtered;

  const fade = useRef(new Animated.Value(0)).current;
  const blurOnTopFade = useRef(new Animated.Value(0)).current;
  const [headerHeight, setHeaderHeight] = useState(0);
  const [filterHeight, setFilterHeight] = useState(0);
  const blurOnTopTranslateY = blurOnTopFade.interpolate({
    inputRange: [1, 2],
    outputRange: [0, filterHeight + ViewStyles.mt2.marginTop + ViewStyles.mb2.marginBottom],
  });
  const topFilterFade = blurOnTopFade.interpolate({
    inputRange: [1, 2],
    outputRange: [0, 1],
  });

  useEffect(() => {
    if (filterReady) {
      (async () => {
        try {
          await requestMemory();
          const upgrade = await Database.open();
          if (upgrade !== undefined) {
            if (upgrade > 0) {
              setUpgrade(true);
            }
            await Database.upgrade();
            setUpgrade(false);
          }
          await loadResults(20);
          setReady(true);
        } catch (e) {
          setFault(new Error(`database corrupted: ${(e as Error).message}`));
        }
      })();
    }
  }, [filterReady]);
  useEffect(() => {
    if (ready) {
      Animated.timing(fade, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // HACK: avoid animation racing.
        setTimeout(() => {
          refresh();
          if (Constants.appOwnership !== AppOwnership.Expo) {
            const current = Application.nativeApplicationVersion!;
            if (Platform.OS === "ios") {
              ok(
                fetchAppStoreVersion().then((version) => {
                  if (semver.compare(version, current) > 0) {
                    setUpdate(true);
                  }
                })
              );
            } else {
              ok(
                fetchReleaseVersion().then((version) => {
                  if (semver.compare(version.replace("v", ""), current) > 0) {
                    setUpdate(true);
                  }
                })
              );
            }
          }
        }, 100);
      });
    }
  }, [ready]);
  useEffect(() => {
    filterRef.current = filter;
    if (ready) {
      loadResults(20);
    }
  }, [filter]);
  useEffect(() => {
    setStats(undefined);
  }, [filter, filtered]);
  useEffect(() => {
    if (autoRefresh) {
      activateKeepAwakeAsync("refresh");
    } else {
      deactivateKeepAwake("refresh");
    }
  }, [autoRefresh]);
  useEffect(() => {
    if (ready) {
      clearTimeout(autoRefreshTimeout);
      if (autoRefresh && !refreshing && headers) {
        autoRefreshTimeout = setTimeout(async () => {
          setRefreshing(true);
          await ok(refreshResults());
          setRefreshing(false);
        }, 10000);
      }
    }
  }, [refreshing, headers, autoRefresh]);
  useEffect(() => {
    if (fault) {
      throw fault;
    }
  }, [fault]);

  const canGroup = (current: Result, group: ResultGroup) => {
    // Battles with the same mode and in the 2 hours (24 hours for tricolors and unlimited for
    // privates) period will be regarded in the same group, coops with the same rule, stage and
    // supplied weapons in the 48 hours (2 hours period) will be regarded in the same group. There
    // is also a 2 minutes grace period for both battles and coops when certain conditions are met.
    // TODO: these grade conditions are not completed. E.g., regular battles even with the same
    // stages cannot be regarded as in the same rotation. We have to check the context (the above
    // only now) to group correctly.
    if (current.battle && group.battles) {
      const mode = current.battle.vsHistoryDetail!.vsMode.id;
      if (mode === group.battles[0].vsHistoryDetail!.vsMode.id) {
        switch (mode) {
          case "VnNNb2RlLTE=":
          case "VnNNb2RlLTY=":
          case "VnNNb2RlLTc=":
            if (
              Math.floor(dayjs(current.battle.vsHistoryDetail!.playedTime).valueOf() / 7200000) ===
              Math.floor(dayjs(group.battles[0].vsHistoryDetail!.playedTime).valueOf() / 7200000)
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTI=":
          case "VnNNb2RlLTUx":
          case "VnNNb2RlLTM=":
          case "VnNNb2RlLTQ=":
            if (
              Math.floor(dayjs(current.battle.vsHistoryDetail!.playedTime).valueOf() / 7200000) ===
                Math.floor(
                  dayjs(group.battles[0].vsHistoryDetail!.playedTime).valueOf() / 7200000
                ) ||
              (current.battle.vsHistoryDetail!.vsRule.id ===
                group.battles[0].vsHistoryDetail!.vsRule.id &&
                Math.floor(
                  dayjs(current.battle.vsHistoryDetail!.playedTime).valueOf() / 7200000
                ) ===
                  Math.floor(
                    dayjs(group.battles[0].vsHistoryDetail!.playedTime)
                      .subtract(2, "minute")
                      .valueOf() / 7200000
                  ))
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTg=":
            if (
              Math.floor(dayjs(current.battle.vsHistoryDetail!.playedTime).valueOf() / 86400000) ===
                Math.floor(
                  dayjs(group.battles[0].vsHistoryDetail!.playedTime).valueOf() / 86400000
                ) ||
              Math.floor(dayjs(current.battle.vsHistoryDetail!.playedTime).valueOf() / 86400000) ===
                Math.floor(
                  dayjs(group.battles[0].vsHistoryDetail!.playedTime)
                    .subtract(2, "minute")
                    .valueOf() / 86400000
                )
            ) {
              return true;
            }
            break;
          case "VnNNb2RlLTU=":
          default:
            return true;
        }
      }
    }
    if (current.coop && group.coops) {
      if (
        current.coop.coopHistoryDetail!.rule === group.coops[0].coopHistoryDetail!.rule &&
        current.coop.coopHistoryDetail!.coopStage.id ===
          group.coops[0].coopHistoryDetail!.coopStage.id &&
        current.coop
          .coopHistoryDetail!.weapons.map((weapon) => getImageHash(weapon.image.url))
          .join() ===
          group.coops[0]
            .coopHistoryDetail!.weapons.map((weapon) => getImageHash(weapon.image.url))
            .join() &&
        (Math.ceil(dayjs(current.coop.coopHistoryDetail!.playedTime).valueOf() / 7200000) -
          Math.floor(dayjs(group.coops[0].coopHistoryDetail!.playedTime).valueOf() / 7200000) <=
          24 ||
          Math.ceil(dayjs(current.coop.coopHistoryDetail!.playedTime).valueOf() / 7200000) -
            Math.floor(
              dayjs(group.coops[0].coopHistoryDetail!.playedTime).subtract(2, "minute").valueOf() /
                7200000
            ) <=
            24)
      ) {
        return true;
      }
    }
    return false;
  };

  const loadResults = async (length: number) => {
    setLoadingMore(true);
    let offset: number, limit: number;
    if (groups !== undefined && count >= 20 && length > count) {
      offset = count;
      limit = length - count;
    } else {
      offset = 0;
      limit = length;
    }

    // Query results and merge into groups.
    const details: Result[] = [];
    let read = 0;
    while (read < limit) {
      const records = await Database.queryDetail(
        offset + read,
        Math.min(BATCH_SIZE, limit - read),
        filterRef.current
      );
      for (const record of records) {
        if (record.mode === "salmon_run") {
          details.push({ coop: JSON.parse(record.detail) as CoopHistoryDetailResult });
        } else {
          details.push({ battle: JSON.parse(record.detail) as VsHistoryDetailResult });
        }
      }
      if (records.length < Math.min(BATCH_SIZE, limit - read)) {
        break;
      }
      read += records.length;
    }
    const newGroups: ResultGroup[] = [];
    let group: ResultGroup = {};
    for (const detail of details) {
      if (canGroup(detail, group)) {
        if (detail.battle) {
          group.battles!.push(detail.battle);
        } else {
          group.coops!.push(detail.coop!);
        }
      } else {
        if (group.battles || group.coops) {
          newGroups.push(group);
        }
        if (detail.battle) {
          group = { battles: [detail.battle] };
        } else {
          group = { coops: [detail.coop!] };
        }
      }
    }
    if (group.battles || group.coops) {
      newGroups.push(group);
    }

    // Set groups.
    if (groups !== undefined && count >= 20 && length > count) {
      let final = groups;
      const lastGroupIndex = groups.length - 1;
      if (
        newGroups.length > 0 &&
        groups.length > 0 &&
        newGroups[0].battles &&
        canGroup({ battle: newGroups[0].battles[0] }, groups[lastGroupIndex])
      ) {
        final = groups.concat(newGroups.slice(1));
        final[lastGroupIndex].battles = final[lastGroupIndex].battles!.concat(
          newGroups[0].battles!
        );
      } else if (
        newGroups.length > 0 &&
        groups.length > 0 &&
        newGroups[0].coops &&
        canGroup({ coop: newGroups[0].coops[0] }, groups[lastGroupIndex])
      ) {
        final = groups.concat(newGroups.slice(1));
        final[lastGroupIndex].coops = final[lastGroupIndex].coops!.concat(newGroups[0].coops!);
      } else {
        final = groups.concat(newGroups);
      }
      setGroups(final);
    } else {
      setGroups(newGroups);
      const [filtered, newTotal] = await Promise.all([
        Database.count(filterRef.current),
        Database.count(),
      ]);
      setFiltered(filtered);
      setTotal(newTotal);
      if (newTotal !== total) {
        const filterOptions = await Database.queryFilterOptions();
        setFilterOptions(filterOptions);
      }
    }
    setLoadingMore(false);
  };
  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        // Fetch schedules and shop.
        fetchSchedules()
          .then((schedules) => setSchedules(schedules))
          .catch((e) => {
            showBanner(BannerLevel.Warn, t("failed_to_update_schedules", { error: e }));
          }),
        fetchShop()
          .then((shop) => setShop(shop))
          .catch((e) => {
            showBanner(BannerLevel.Warn, t("failed_to_update_splatnet_shop", { error: e }));
          }),
        headers && ok(refreshResults()),
      ]);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setRefreshing(false);
  };
  const refreshResults = async () => {
    if (!headers) {
      throw new Error();
    }
    // Fetch results.
    let n = -1;
    let throwable = 0;
    let error: Error | undefined;
    const [battleFail, coopFail] = await Promise.all([
      fetchLatestBattleHistories(headers)
        .then(async (latestBattleHistories) => {
          // Fetch more battle histories if needed.
          const ids: string[] = [];
          let regularId: string | undefined,
            anarchyId: string | undefined,
            xId: string | undefined,
            challengeId: string | undefined,
            privateId: string | undefined;
          for (const historyGroup of latestBattleHistories.latestBattleHistories.historyGroups
            .nodes) {
            for (const historyDetail of historyGroup.historyDetails.nodes) {
              const id = decode64String(historyDetail.id);
              let encodedId = "";
              switch (historyDetail.vsMode.id) {
                case "VnNNb2RlLTE=":
                case "VnNNb2RlLTY=":
                case "VnNNb2RlLTc=":
                case "VnNNb2RlLTg=":
                  encodedId = encode64String(id.replace("RECENT", "REGULAR"));
                  regularId = encodedId;
                  break;
                case "VnNNb2RlLTI=":
                case "VnNNb2RlLTUx":
                  encodedId = encode64String(id.replace("RECENT", "BANKARA"));
                  anarchyId = encodedId;
                  break;
                case "VnNNb2RlLTM=":
                  encodedId = encode64String(id.replace("RECENT", "XMATCH"));
                  xId = encodedId;
                  break;
                case "VnNNb2RlLTQ=":
                  encodedId = encode64String(id.replace("RECENT", "LEAGUE"));
                  challengeId = encodedId;
                  break;
                case "VnNNb2RlLTU=":
                  encodedId = encode64String(id.replace("RECENT", "PRIVATE"));
                  privateId = encodedId;
                  break;
                default:
                  continue;
              }
              ids.push(encodedId);
            }
          }
          const [skipRegular, skipAnarchy, skipX, skipChallenge, skipPrivate] = await Promise.all([
            regularId ? Database.isExist(regularId!) : false,
            anarchyId ? Database.isExist(anarchyId!) : false,
            xId ? Database.isExist(xId!) : false,
            challengeId ? Database.isExist(challengeId!) : false,
            privateId ? Database.isExist(privateId!) : false,
          ]);
          const [
            regularBattleHistories,
            anarchyBattleHistories,
            xBattleHistories,
            challengeHistories,
            privateBattleHistories,
          ] = await Promise.all([
            skipRegular ? undefined : fetchRegularBattleHistories(headers),
            skipAnarchy ? undefined : fetchAnarchyBattleHistories(headers),
            skipX ? undefined : fetchXBattleHistories(headers),
            skipChallenge ? undefined : fetchChallengeHistories(headers),
            skipPrivate ? undefined : fetchPrivateBattleHistories(headers),
          ]);

          // Fetch details.
          regularBattleHistories?.regularBattleHistories.historyGroups.nodes.forEach(
            (historyGroup) =>
              historyGroup.historyDetails.nodes.forEach((historyDetail) =>
                ids.push(historyDetail.id)
              )
          );
          anarchyBattleHistories?.bankaraBattleHistories.historyGroups.nodes.forEach(
            (historyGroup) =>
              historyGroup.historyDetails.nodes.forEach((historyDetail) =>
                ids.push(historyDetail.id)
              )
          );
          xBattleHistories?.xBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
            historyGroup.historyDetails.nodes.forEach((historyDetail) => ids.push(historyDetail.id))
          );
          challengeHistories?.eventBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
            historyGroup.historyDetails.nodes.forEach((historyDetail) => ids.push(historyDetail.id))
          );
          privateBattleHistories?.privateBattleHistories.historyGroups.nodes.forEach(
            (historyGroup) =>
              historyGroup.historyDetails.nodes.forEach((historyDetail) =>
                ids.push(historyDetail.id)
              )
          );

          const uniqueIds = ids.filter((id, i, ids) => ids.indexOf(id) === i);
          const existed = await Promise.all(uniqueIds.map((id) => Database.isExist(id)));
          const newIds = uniqueIds.filter((_, i) => !existed[i]);
          if (n === -1) {
            n = newIds.length;
          } else {
            n += newIds.length;
            if (n > 0) {
              showBanner(BannerLevel.Info, t("loading_n_results", { n }));
            }
          }
          let results = 0;
          await Promise.all(
            newIds.map((id, i) =>
              sleep(i * 500)
                .then(() => fetchVsHistoryDetail(headers, id))
                .then(async (detail) => Database.addBattle(detail))
                .catch((e) => {
                  if (!error) {
                    error = e;
                  }
                  results += 1;
                })
            )
          );
          return results;
        })
        .catch((e) => {
          throwable += 1;
          showBanner(BannerLevel.Warn, t("failed_to_load_battle_results", { error: e }));
          return 0;
        }),
      fetchCoopResult(headers)
        .then(async (coopResult) => {
          // Fetch details.
          const ids: string[] = [];
          coopResult.coopResult.historyGroups.nodes.forEach((historyGroup) => {
            historyGroup.historyDetails.nodes.forEach((historyDetail) => {
              ids.push(historyDetail.id);
            });
          });

          const existed = await Promise.all(ids.map((id) => Database.isExist(id)));
          const newIds = ids.filter((_, i) => !existed[i]);
          if (n === -1) {
            n = newIds.length;
          } else {
            n += newIds.length;
            if (n > 0) {
              showBanner(BannerLevel.Info, t("loading_n_results", { n }));
            }
          }
          let results = 0;
          await Promise.all(
            newIds.map((id, i) =>
              sleep(i * 500)
                .then(() => fetchCoopHistoryDetail(headers, id))
                .then(async (detail) => Database.addCoop(detail))
                .catch((e) => {
                  if (!error) {
                    error = e;
                  }
                  results += 1;
                })
            )
          );
          return results;
        })
        .catch((e) => {
          throwable += 1;
          showBanner(BannerLevel.Warn, t("failed_to_load_salmon_run_results", { error: e }));
          return 0;
        }),
    ]);

    if (n > 0) {
      const fail = battleFail + coopFail;
      if (fail > 0) {
        showBanner(BannerLevel.Warn, t("loaded_n_results_fail_failed", { n, fail, error }));
      } else {
        showBanner(BannerLevel.Success, t("loaded_n_results", { n }));
      }
    }
    if (n > 0) {
      await loadResults(20);
    }
    if (throwable > 1) {
      throw new Error();
    }
  };

  const onHeaderLayout = (event: LayoutChangeEvent) => {
    setHeaderHeight(event.nativeEvent.layout.height);
  };
  const onFilterLayout = (event: LayoutChangeEvent) => {
    setFilterHeight(event.nativeEvent.layout.height);
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // HACK: onScrollToTop has a delay, use onScroll instead.
    if (event.nativeEvent.contentOffset.y < 8) {
      onScrollEnd(event);
    }
  };
  const onScrollBegin = () => {
    // HACK: blur view shows following the extra 8px padding in the top.
    Animated.timing(blurOnTopFade, {
      toValue: 1,
      duration: 300,
      useNativeDriver: true,
    }).start();
  };
  const onScrollEnd = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const offset = event.nativeEvent.contentOffset.y;
    if (offset >= headerHeight - filterHeight - insets.top - ViewStyles.mt2.marginTop) {
      Animated.timing(blurOnTopFade, {
        toValue: 2,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }).start();
    } else if (offset >= ViewStyles.mt2.marginTop) {
      // HACK: blur view shows following the extra 8px padding in the top.
      Animated.timing(blurOnTopFade, {
        toValue: 1,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(blurOnTopFade, {
        toValue: 0,
        duration: 300,
        delay: 100,
        useNativeDriver: true,
      }).start();
    }
  };
  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    onScrollEnd(event);
    if (loadingMore || allResultsShown) {
      return;
    }
    const overHeight = event.nativeEvent.contentSize.height - height;
    if (overHeight >= 0 && event.nativeEvent.contentOffset.y - 80 > overHeight) {
      onShowMorePress();
    }
  };
  const onChangeFilterPress = async (filter?: Database.FilterProps) => {
    if (filter) {
      await setFilter(filter);
    } else {
      await clearFilter();
    }
  };
  const onShowMorePress = async () => {
    if (allResultsShown) {
      return;
    }
    await loadResults(count + 20);
  };
  const onShowMoreSelected = async (key: TimeRange) => {
    let num = 20;
    switch (key) {
      case TimeRange.Today:
        num = await Database.count(filter, dayjs().utc().startOf("day").valueOf());
        break;
      case TimeRange.ThisWeek:
        num = await Database.count(filter, dayjs().utc().startOf("week").valueOf());
        break;
      case TimeRange.ThisMonth:
        num = await Database.count(filter, dayjs().utc().startOf("month").valueOf());
        break;
      case TimeRange.ThisSeason:
        num = await Database.count(
          filter,
          dayjs().utc().startOf("quarter").subtract(1, "month").valueOf()
        );
        break;
      case TimeRange.AllResults:
        num = filtered;
        break;
    }
    await loadResults(num);
  };
  const onStatsPress = async () => {
    if (stats) {
      return stats;
    }
    setCounting(true);
    const records = await Database.queryStats(filter);
    const results: Stats[] = [];
    for (const record of records) {
      if (record.mode === "salmon_run") {
        results.push({ coop: JSON.parse(record.stats) });
      } else {
        results.push({ battle: JSON.parse(record.stats) });
      }
    }
    setStats(results);
    setCounting(false);
    return results;
  };
  const onImportBegin = () => {
    setRefreshing(true);
    activateKeepAwakeAsync("import");
  };
  const onImportResults = async (
    battles: VsHistoryDetailResult[],
    coops: CoopHistoryDetailResult[]
  ) => {
    const n = battles.length + coops.length;
    // There is a bug introduced in 1.9.0 where all IDs imported from Salmonia3+ backup are suffixed with undefined.
    const corruptedIds = new Set<string>();
    for (let i = 0; i < coops.length; i++) {
      if (
        coops[i].coopHistoryDetail!.id.length > 124 &&
        decode64String(coops[i].coopHistoryDetail!.id).endsWith("undefined")
      ) {
        corruptedIds.add(coops[i].coopHistoryDetail!.id);
      }
    }
    const battleExisted = await Promise.all(
      battles.map((battle: VsHistoryDetailResult) => Database.isExist(battle.vsHistoryDetail!.id))
    );
    const coopExisted = await Promise.all(
      coops.map((coop: CoopHistoryDetailResult) => Database.isExist(coop.coopHistoryDetail!.id))
    );
    const newBattles = battles.filter((_, i: number) => !battleExisted[i]);
    const newCoops = coops
      .filter((_, i: number) => !coopExisted[i])
      .filter((coop) => !corruptedIds.has(coop.coopHistoryDetail!.id));
    const skip = n - newBattles.length - newCoops.length;
    let error: Error | undefined;
    const battleResults = await Promise.all(
      newBattles.map((battle) =>
        Database.addBattle(battle)
          .then(() => {
            return true;
          })
          .catch((e) => {
            if (!error) {
              error = e;
            }
            return false;
          })
      )
    );
    const coopResults = await Promise.all(
      newCoops.map((coop) =>
        Database.addCoop(coop)
          .then(() => {
            return true;
          })
          .catch((e) => {
            if (!error) {
              error = e;
            }
            return false;
          })
      )
    );
    return {
      skip,
      fail:
        battleResults.filter((result) => !result).length +
        coopResults.filter((result) => !result).length,
      error,
    };
  };
  const onImportComplete = async (n: number) => {
    // Query stored latest results if updated.
    if (n > 0) {
      await loadResults(20);
    }
    deactivateKeepAwake("import");
    setRefreshing(false);
  };
  const onExportPress = async () => {
    setExporting(true);
    const uri = FileSystem.cacheDirectory + `conch-bay-export.json`;
    try {
      if (Constants.appOwnership === AppOwnership.Expo) {
        let battles = "";
        let coops = "";
        let batch = 0;
        while (true) {
          const records = await Database.queryDetail(BATCH_SIZE * batch, BATCH_SIZE);
          for (const record of records) {
            if (record.mode === "salmon_run") {
              coops += `${record.detail},`;
            } else {
              battles += `${record.detail},`;
            }
          }
          if (records.length < BATCH_SIZE) {
            break;
          }
          batch += 1;
        }

        if (battles.endsWith(",")) {
          battles = battles.substring(0, battles.length - 1);
        }
        if (coops.endsWith(",")) {
          coops = coops.substring(0, coops.length - 1);
        }
        await FileSystem.writeAsStringAsync(uri, `{"battles":[${battles}],"coops":[${coops}]}`, {
          encoding: FileSystem.EncodingType.UTF8,
        });
      } else {
        // HACK: dynamic import the library.
        const FileAccess = await import("react-native-file-access");
        // Export battles.
        await FileSystem.writeAsStringAsync(uri, '{"battles":[', {
          encoding: FileSystem.EncodingType.UTF8,
        });
        let batch = 0;
        while (true) {
          let result = "";
          const records = await Database.queryDetail(BATCH_SIZE * batch, BATCH_SIZE, {
            modes: ["salmon_run"],
            inverted: true,
          });
          for (let i = 0; i < records.length; i++) {
            result += `,${records[i].detail}`;
          }
          await FileAccess.FileSystem.appendFile(uri, result.slice(1), "utf8");
          if (records.length < BATCH_SIZE) {
            break;
          }
          batch += 1;
        }
        // Export coops.
        await FileAccess.FileSystem.appendFile(uri, '],"coops":[', "utf8");
        batch = 0;
        while (true) {
          let result = "";
          const records = await Database.queryDetail(BATCH_SIZE * batch, BATCH_SIZE, {
            modes: ["salmon_run"],
          });
          for (let i = 0; i < records.length; i++) {
            result += `,${records[i].detail}`;
          }
          await FileAccess.FileSystem.appendFile(uri, result.slice(1), "utf8");
          if (records.length < BATCH_SIZE) {
            break;
          }
          batch += 1;
        }
        await FileAccess.FileSystem.appendFile(uri, "]}", "utf8");
      }

      await Sharing.shareAsync(uri, { UTI: "public.json" });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    setExporting(false);
  };
  const onUpdatePress = () => {
    if (Platform.OS === "ios") {
      Linking.openURL("https://apps.apple.com/us/app/conch-bay/id1659268579");
    } else {
      IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
        data: "https://play.google.com/store/apps/details?id=name.sketch.conch_bay",
        packageName: "com.android.vending",
      });
    }
  };
  const onSupportPress = () => {
    setSupport(true);
  };
  const onSupportClose = () => {
    if (!clearingCache && !preloadingResources && !clearingDatabase) {
      setSupport(false);
    }
  };
  const onChangeDisplayLanguagePress = () => {
    Linking.openSettings();
  };
  const onSalmonRunFriendlyModePress = async () => {
    if (salmonRunFriendlyMode) {
      await clearSalmonRunFriendlyMode();
    } else {
      await setSalmonRunFriendlyMode(true);
    }
  };
  const onClearCachePress = async () => {
    setClearingCache(true);
    await Image.clearDiskCache();
    setClearingCache(false);
  };
  const onPreloadResourcesPress = async () => {
    setPreloadingResources(true);
    try {
      // Preload images from saved results.
      const resources = new Map<string, string>();
      let batch = 0;
      while (true) {
        const records = await Database.queryDetail(BATCH_SIZE * batch, BATCH_SIZE);
        for (const record of records) {
          if (record.mode === "salmon_run") {
            const coop = JSON.parse(record.detail) as CoopHistoryDetailResult;
            for (const memberResult of [
              coop.coopHistoryDetail!.myResult,
              ...coop.coopHistoryDetail!.memberResults,
            ]) {
              // Weapons.
              for (const weapon of memberResult.weapons) {
                const cacheKey = getImageCacheKey(weapon.image.url);
                if (!resources.has(cacheKey) && !isImageExpired(weapon.image.url)) {
                  resources.set(cacheKey, weapon.image.url);
                }
              }
              if (memberResult.specialWeapon) {
                const cacheKey = getImageCacheKey(memberResult.specialWeapon.image.url);
                if (
                  !resources.has(cacheKey) &&
                  !isImageExpired(memberResult.specialWeapon.image.url)
                ) {
                  resources.set(cacheKey, memberResult.specialWeapon.image.url);
                }
              }

              // Work suits.
              const uniformCacheKey = getImageCacheKey(memberResult.player.uniform.image.url);
              if (
                !resources.has(uniformCacheKey) &&
                !isImageExpired(memberResult.player.uniform.image.url)
              ) {
                resources.set(uniformCacheKey, memberResult.player.uniform.image.url);
              }

              // Splashtags.
              const backgroundCacheKey = getImageCacheKey(
                memberResult.player.nameplate!.background.image.url
              );
              if (
                !resources.has(backgroundCacheKey) &&
                !isImageExpired(memberResult.player.nameplate!.background.image.url)
              ) {
                resources.set(
                  backgroundCacheKey,
                  memberResult.player.nameplate!.background.image.url
                );
              }
              for (const badge of memberResult.player.nameplate!.badges) {
                if (badge) {
                  const cacheKey = getImageCacheKey(badge.image.url);
                  if (!resources.has(cacheKey) && !isImageExpired(badge.image.url)) {
                    resources.set(getImageCacheKey(badge.image.url), badge.image.url);
                  }
                }
              }
            }
          } else {
            const battle = JSON.parse(record.detail) as VsHistoryDetailResult;
            for (const team of [
              battle.vsHistoryDetail!.myTeam,
              ...battle.vsHistoryDetail!.otherTeams,
            ]) {
              for (const player of team.players) {
                // Weapons.
                const weaponCacheKey = getImageCacheKey(player.weapon.image2d.url);
                if (!resources.has(weaponCacheKey) && !isImageExpired(player.weapon.image2d.url)) {
                  resources.set(weaponCacheKey, player.weapon.image2d.url);
                }
                const subWeaponCacheKey = getImageCacheKey(player.weapon.subWeapon.image.url);
                if (
                  !resources.has(subWeaponCacheKey) &&
                  !isImageExpired(player.weapon.subWeapon.image.url)
                ) {
                  resources.set(subWeaponCacheKey, player.weapon.subWeapon.image.url);
                }
                const specialWeaponCacheKey = getImageCacheKey(
                  player.weapon.specialWeapon.image.url
                );
                if (
                  !resources.has(specialWeaponCacheKey) &&
                  !isImageExpired(player.weapon.specialWeapon.image.url)
                ) {
                  resources.set(specialWeaponCacheKey, player.weapon.specialWeapon.image.url);
                }

                // Gears.
                for (const gear of [player.headGear, player.clothingGear, player.shoesGear]) {
                  const gearCacheKey = getImageCacheKey(gear.originalImage.url);
                  if (!resources.has(gearCacheKey) && !isImageExpired(gear.originalImage.url)) {
                    resources.set(gearCacheKey, gear.originalImage.url);
                  }
                  const brandCacheKey = getImageCacheKey(gear.brand.image.url);
                  if (!resources.has(brandCacheKey) && !isImageExpired(gear.brand.image.url)) {
                    resources.set(brandCacheKey, gear.brand.image.url);
                  }
                  const primaryGearPowerCacheKey = getImageCacheKey(
                    gear.primaryGearPower.image.url
                  );
                  if (
                    !resources.has(primaryGearPowerCacheKey) &&
                    !isImageExpired(gear.primaryGearPower.image.url)
                  ) {
                    resources.set(primaryGearPowerCacheKey, gear.primaryGearPower.image.url);
                  }
                  for (const gearPower of gear.additionalGearPowers) {
                    const cacheKey = getImageCacheKey(gearPower.image.url);
                    if (!resources.has(cacheKey) && !isImageExpired(gearPower.image.url)) {
                      resources.set(cacheKey, gearPower.image.url);
                    }
                  }
                }

                // Splashtags.
                const backgroundCacheKey = getImageCacheKey(player.nameplate!.background.image.url);
                if (
                  !resources.has(backgroundCacheKey) &&
                  !isImageExpired(player.nameplate!.background.image.url)
                ) {
                  resources.set(backgroundCacheKey, player.nameplate!.background.image.url);
                }
                for (const badge of player.nameplate!.badges) {
                  if (badge) {
                    const cacheKey = getImageCacheKey(badge.image.url);
                    if (!resources.has(cacheKey) && !isImageExpired(badge.image.url)) {
                      resources.set(getImageCacheKey(badge.image.url), badge.image.url);
                    }
                  }
                }
              }
            }
          }
        }
        if (records.length < BATCH_SIZE) {
          break;
        }
        batch += 1;
      }

      // Preload images.
      // HACK: add a hashtag do not break the URL. Here the cache key will be appended after the
      // hashtag.
      Image.prefetch(Array.from(resources).map((resource) => `${resource[1]}#${resource[0]}`));
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setPreloadingResources(false);
  };
  const onCreateAGithubIssuePress = () => {
    Linking.openURL("https://github.com/zhxie/conch-bay/issues/new");
  };
  const onSendAMailPress = async () => {
    if (await MailComposer.isAvailableAsync()) {
      MailComposer.composeAsync({
        recipients: ["conch-bay@outlook.com"],
      });
    } else {
      Linking.openURL("mailto:conch-bay@outlook.com");
    }
  };
  const onClearDatabasePress = async () => {
    setClearingDatabase(true);
    await Database.clear();
    loadResults(20);
    setClearingDatabase(false);
    setSupport(false);
  };
  const onExportDatabasePress = async () => {
    const uri = FileSystem.documentDirectory + "SQLite/conch-bay.db";
    try {
      await Sharing.shareAsync(uri, { UTI: "public.database" });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
  };
  const onPrivacyPolicyPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/Privacy-Policy");
  };
  const onAcknowledgmentsPress = () => {
    setAcknowledgments(true);
  };
  const onAcknowledgmentsClose = () => {
    setAcknowledgments(false);
  };
  const onSplatoon3InkPress = () => {
    WebBrowser.openBrowserAsync("https://splatoon3.ink/");
  };
  const onIminkFApiPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/imink-app/f-API");
  };
  const onNxapiZncaApiPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/samuelthomas2774/nxapi-znca-api");
  };
  const onNintendoAppVersionsPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/nintendoapis/nintendo-app-versions");
  };
  const onSplat3Press = () => {
    WebBrowser.openBrowserAsync("https://github.com/Leanny/splat3");
  };
  const onOssLicensesPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/OSS-Licenses");
  };
  const onSourceCodeRepositoryPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay");
  };
  const onAutoRefreshPress = async () => {
    if (!autoRefresh) {
      showBanner(BannerLevel.Info, t("auto_refresh_enabled"));
      await setAutoRefresh(true);
    } else {
      showBanner(BannerLevel.Info, t("auto_refresh_disabled"));
      await setAutoRefresh(false);
    }
  };

  return (
    <SalmonRunSwitcherContext.Provider value={{ salmonRun: salmonRunFriendlyMode }}>
      <VStack flex style={theme.backgroundStyle}>
        {upgrade && (
          // TODO: the safe area view may not be in size when start up.
          <SafeAreaView style={[ViewStyles.ff, { position: "absolute" }]}>
            <Center style={ViewStyles.ff}>
              <VStack center>
                <ActivityIndicator style={ViewStyles.mb2} />
                <Text>{t("upgrading_database")}</Text>
              </VStack>
            </Center>
          </SafeAreaView>
        )}
        <Animated.View style={[ViewStyles.f, { opacity: fade }]}>
          {/* HACK: it is a little bit weird concentrating on result list. */}
          <ResultView
            groups={groups}
            refreshControl={
              <RefreshControl
                progressViewOffset={insets.top}
                refreshing={refreshing}
                onRefresh={refresh}
              />
            }
            header={
              <SafeAreaView
                edges={["top", "left", "right"]}
                // HACK: add additional 8px margin in the top.
                style={[ViewStyles.mt2, { alignItems: "center" }]}
                onLayout={onHeaderLayout}
              >
                <ScheduleView schedules={schedules} style={ViewStyles.mb4}>
                  {shop && <ShopView shop={shop} />}
                </ScheduleView>
                <FilterView
                  disabled={loadingMore}
                  filter={filter}
                  options={filterOptions}
                  onChange={onChangeFilterPress}
                  onLayout={onFilterLayout}
                  style={ViewStyles.mb2}
                />
              </SafeAreaView>
            }
            footer={
              <SafeAreaView
                edges={["bottom", "left", "right"]}
                style={[ViewStyles.mb2, { alignItems: "center" }]}
              >
                <VStack style={[ViewStyles.mb4, ViewStyles.wf, ViewStyles.px4]}>
                  <Picker
                    loading={loadingMore}
                    loadingText={t("loading_more")}
                    title={allResultsShown ? t("all_results_showed") : t("show_more")}
                    items={Object.values(TimeRange).map((range) => ({
                      key: range,
                      value: t(range),
                    }))}
                    header={
                      <VStack center>
                        <Marquee style={ViewStyles.mb2}>
                          {filtered === total
                            ? t("n_total_results_showed", { n: count, total })
                            : t("n_filtered_total_filtered_results_showed", {
                                n: count,
                                filtered,
                                total,
                              })}
                        </Marquee>
                      </VStack>
                    }
                    style={[ViewStyles.rt0, ViewStyles.rb2, { height: 64 }, theme.territoryStyle]}
                    textStyle={[TextStyles.h3, theme.textStyle]}
                    // HACK: forcly cast.
                    onSelected={onShowMoreSelected as (_: string) => void}
                    onPress={onShowMorePress}
                  />
                </VStack>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={[ViewStyles.mb4, ViewStyles.wf]}
                >
                  <HStack flex center style={ViewStyles.px4}>
                    <StatsView disabled={counting} onStats={onStatsPress} style={ViewStyles.mr2} />
                    <TrendsView disabled={counting} onStats={onStatsPress} style={ViewStyles.mr2} />
                    <RotationsView
                      disabled={counting}
                      onStats={onStatsPress}
                      style={ViewStyles.mr2}
                    />
                    <ImportView
                      disabled={refreshing}
                      onBegin={onImportBegin}
                      onResults={onImportResults}
                      onComplete={onImportComplete}
                      style={ViewStyles.mr2}
                    />
                    <ToolButton
                      loading={exporting}
                      loadingText={t("exporting")}
                      icon="upload"
                      title={t("export")}
                      onPress={onExportPress}
                    />
                  </HStack>
                </ScrollView>
                <VStack center style={ViewStyles.px4}>
                  <Text center style={[TextStyles.subtle, ViewStyles.mb2]}>
                    {t("disclaimer")}
                  </Text>
                  <VStack center>
                    <HStack center>
                      <Text
                        style={[update && ViewStyles.mr1, TextStyles.subtle]}
                      >{`${Application.applicationName} ${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}</Text>
                      {update && (
                        <Text style={[TextStyles.link, TextStyles.subtle]} onPress={onUpdatePress}>
                          {t("update")}
                        </Text>
                      )}
                    </HStack>
                    <HStack center>
                      <Text
                        style={[TextStyles.link, TextStyles.subtle, ViewStyles.mr2]}
                        onPress={onSupportPress}
                      >
                        {t("support")}
                      </Text>
                      <Text
                        style={[TextStyles.link, TextStyles.subtle, ViewStyles.mr2]}
                        onPress={onPrivacyPolicyPress}
                      >
                        {t("privacy_policy")}
                      </Text>
                      <Text
                        style={[TextStyles.link, TextStyles.subtle]}
                        onPress={onAcknowledgmentsPress}
                      >
                        {t("acknowledgments")}
                      </Text>
                    </HStack>
                  </VStack>
                </VStack>
              </SafeAreaView>
            }
            onScroll={onScroll}
            onScrollBeginDrag={onScrollBegin}
            onScrollEndDrag={onScrollEndDrag}
            onMomentumScrollBegin={onScrollBegin}
            onMomentumScrollEnd={onScrollEnd}
          />
          <Animated.View
            style={{
              position: "absolute",
              top: -(filterHeight + ViewStyles.mt2.marginTop + ViewStyles.mb2.marginBottom),
              width: "100%",
              height:
                filterHeight + insets.top + ViewStyles.mt2.marginTop + ViewStyles.mb2.marginBottom,
              opacity: blurOnTopFade,
              transform: [
                {
                  translateY: blurOnTopTranslateY,
                },
              ],
            }}
          >
            <BlurView
              intensity={100}
              tint={theme.colorScheme ?? "default"}
              style={[ViewStyles.f, { flexDirection: "column-reverse" }]}
            >
              <Animated.View style={{ opacity: topFilterFade }}>
                <FilterView
                  disabled={loadingMore}
                  filter={filter}
                  options={filterOptions}
                  style={ViewStyles.mb2}
                  onChange={onChangeFilterPress}
                  onLayout={onFilterLayout}
                />
              </Animated.View>
            </BlurView>
          </Animated.View>
          <FloatingActionButton
            size={50}
            color={autoRefresh ? Color.AccentColor : undefined}
            icon="refresh-cw"
            spin={autoRefresh}
            onPress={onAutoRefreshPress}
          />
        </Animated.View>
        <Modal isVisible={support} onClose={onSupportClose} style={ViewStyles.modal1d}>
          <CustomDialog icon="help-circle">
            <DialogSection text={t("preference_notice")} style={ViewStyles.mb4}>
              <Button
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onSalmonRunFriendlyModePress}
              >
                <Marquee style={theme.reverseTextStyle}>
                  {t("salmon_run_friendly_mode_enabled", {
                    enabled: salmonRunFriendlyMode ? t("enabled") : t("disabled"),
                  })}
                </Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("language_notice")} style={ViewStyles.mb4}>
              <Button
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onChangeDisplayLanguagePress}
              >
                <Marquee style={theme.reverseTextStyle}>
                  {t("change_display_language_language", { language: t(t("lang")) })}
                </Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("resource_notice")} style={ViewStyles.mb4}>
              <Button
                loading={clearingCache}
                loadingText={t("clearing_cache")}
                style={[ViewStyles.accent, ViewStyles.mb2]}
                textStyle={theme.reverseTextStyle}
                onPress={onClearCachePress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("clear_cache")}</Marquee>
              </Button>
              <Button
                loading={preloadingResources}
                loadingText={t("preloading_resources")}
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onPreloadResourcesPress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("preload_resources")}</Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("feedback_notice")} style={ViewStyles.mb4}>
              <Button
                style={[ViewStyles.mb2, ViewStyles.accent]}
                onPress={onCreateAGithubIssuePress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("create_a_github_issue")}</Marquee>
              </Button>
              <Button style={ViewStyles.accent} onPress={onSendAMailPress}>
                <Marquee style={theme.reverseTextStyle}>{t("send_a_mail")}</Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("database_notice")} style={ViewStyles.mb4}>
              <Button
                loading={clearingDatabase}
                loadingText={t("clearing_database")}
                style={ViewStyles.danger}
                textStyle={theme.reverseTextStyle}
                onLongPress={onClearDatabasePress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("clear_database")}</Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("debug_notice")}>
              <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
                <Marquee style={theme.reverseTextStyle}>{t("export_database")}</Marquee>
              </Button>
            </DialogSection>
          </CustomDialog>
        </Modal>
        <Modal
          isVisible={acknowledgments}
          onClose={onAcknowledgmentsClose}
          style={ViewStyles.modal1d}
        >
          <VStack center style={ViewStyles.mb3}>
            <Marquee style={[TextStyles.h3, ViewStyles.mb2]}>{t("creators")}</Marquee>
            <HStack center>
              <AvatarButton
                size={48}
                image={getUserIconCacheSource(
                  "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/1afd1450a5a5ebec"
                )}
                onPress={() => {
                  WebBrowser.openBrowserAsync("https://weibo.com/u/2269567390");
                }}
                style={ViewStyles.mr2}
              />
              <AvatarButton
                size={48}
                image={getUserIconCacheSource(
                  "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/4b98d8291ae60b8c"
                )}
                onPress={() => {
                  WebBrowser.openBrowserAsync("https://weibo.com/u/6622470330");
                }}
                style={ViewStyles.mr2}
              />
            </HStack>
          </VStack>
          <VStack center style={ViewStyles.mb3}>
            <Marquee style={[TextStyles.h3, ViewStyles.mb2]}>{t("license")}</Marquee>
            <VStack center>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onSplatoon3InkPress}>
                Splatoon3.ink
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onIminkFApiPress}>
                imink f API
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onNxapiZncaApiPress}>
                nxapi znca API
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onNintendoAppVersionsPress}>
                Nintendo app versions
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onSplat3Press}>
                splat3
              </Text>
              <Text style={TextStyles.link} onPress={onOssLicensesPress}>
                {t("oss_licenses")}
              </Text>
            </VStack>
          </VStack>
          <VStack center>
            <Marquee style={[TextStyles.h3, ViewStyles.mb2]}>{t("source_code_repository")}</Marquee>
            <VStack center>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onSourceCodeRepositoryPress}>
                GitHub
              </Text>
            </VStack>
          </VStack>
        </Modal>
      </VStack>
    </SalmonRunSwitcherContext.Provider>
  );
};

export default MainView;
