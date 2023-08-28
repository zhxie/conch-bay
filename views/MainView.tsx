import { useAppState } from "@react-native-community/hooks";
import { AxiosError } from "axios";
import dayjs from "dayjs";
import * as Application from "expo-application";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import Constants, { AppOwnership } from "expo-constants";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as MailComposer from "expo-mail-composer";
import * as ModulesCore from "expo-modules-core";
import * as Notifications from "expo-notifications";
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
import * as Progress from "react-native-progress";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  AvatarButton,
  Badge,
  BannerLevel,
  Button,
  Center,
  Color,
  CustomDialog,
  Dialog,
  DialogSection,
  FloatingActionButton,
  HStack,
  Icon,
  Marquee,
  Modal,
  Picker,
  Text,
  TextStyles,
  ToolButton,
  VStack,
  ViewStyles,
  useBanner,
  useTheme,
} from "../components";
import t from "../i18n";
import {
  CatalogResult,
  CoopHistoryDetailResult,
  DetailVotingStatusResult,
  FriendListResult,
  MyOutfitCommonDataEquipmentsResult,
  Schedules,
  Shop,
  VsHistoryDetailResult,
  WeaponRecordResult,
} from "../models/types";
import {
  fetchAnarchyBattleHistories,
  fetchAppStoreVersion,
  fetchCatalog,
  fetchChallengeHistories,
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchDetailVotingStatus,
  fetchEquipments,
  fetchFriends,
  fetchLatestBattleHistories,
  fetchPrivateBattleHistories,
  fetchRegularBattleHistories,
  fetchReleaseVersion,
  fetchShop,
  fetchSchedules,
  fetchSplatfests,
  fetchSummary,
  fetchVsHistoryDetail,
  fetchWeaponRecords,
  fetchXBattleHistories,
  generateLogIn,
  getBulletToken,
  getCurrentVersions,
  getSessionToken,
  getWebServiceToken,
  updateNsoVersion,
  updateSplatnetVersion,
} from "../utils/api";
import { useAsyncStorage, useBooleanAsyncStorage } from "../utils/async-storage";
import {
  isBackgroundTaskRegistered,
  registerBackgroundTask,
  unregisterBackgroundTask,
} from "../utils/background";
import { decode64String, encode64String, parseVersion } from "../utils/codec";
import * as Database from "../utils/database";
import { ok } from "../utils/promise";
import { StatsProps } from "../utils/stats";
import {
  convertStageImageUrl,
  getImageCacheKey,
  getImageHash,
  getUserIconCacheSource,
  isImageExpired,
} from "../utils/ui";
import CatalogView from "./CatalogView";
import FilterView from "./FilterView";
import FriendView from "./FriendView";
import ImportView from "./ImportView";
import ResultView, { GroupProps, ResultProps } from "./ResultView";
import ScheduleView from "./ScheduleView";
import ShopView from "./ShopView";
import SplatNetView from "./SplatNetView";
import StatsView from "./StatsView";
import TrendsView from "./TrendsView";
import XView from "./XView";

enum TimeRange {
  CurrentBattleSchedule = "current_battle_schedule",
  CurrentSalmonRunSchedule = "current_salmon_run_schedule",
  Today = "today",
  ThisWeek = "this_week",
  ThisMonth = "this_month",
  ThisSeason = "this_season",
  AllResults = "all_results",
}

let autoRefreshTimeout: NodeJS.Timeout | undefined;

const MainView = () => {
  const appState = useAppState();

  const theme = useTheme();

  const { height } = useWindowDimensions();
  const insets = useSafeAreaInsets();

  const showBanner = useBanner();

  const [ready, setReady] = useState(false);
  const [upgrade, setUpgrade] = useState(false);
  const [update, setUpdate] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [counting, setCounting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [support, setSupport] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [preloadingResources, setPreloadingResources] = useState(false);
  const [diagnosingNetwork, setDiagnosingNetwork] = useState(false);
  const [acknowledgments, setAcknowledgments] = useState(false);
  const [backgroundRefresh, setBackgroundRefresh] = useState(false);
  const [fault, setFault] = useState<Error>();

  const [sessionToken, setSessionToken, clearSessionToken, sessionTokenReady] =
    useAsyncStorage("sessionToken");
  const [webServiceToken, setWebServiceToken, clearWebServiceToken, webServiceTokenReady] =
    useAsyncStorage("webServiceToken");
  const [bulletToken, setBulletToken, clearBulletToken, bulletTokenReady] =
    useAsyncStorage("bulletToken");
  const [language, setLanguage, clearLanguage, languageReady] = useAsyncStorage(
    "language",
    t("lang")
  );
  const [autoRefresh, setAutoRefresh, clearAutoRefresh] = useBooleanAsyncStorage(
    "autoRefresh",
    false
  );

  const [icon, setIcon, clearIcon] = useAsyncStorage("icon");
  const [catalogLevel, setCatalogLevel, clearCatalogLevel] = useAsyncStorage("catalogLevel");
  const [level, setLevel, clearLevel] = useAsyncStorage("level");
  const [rank, setRank, clearRank] = useAsyncStorage("rank");
  const [splatZonesXPower, setSplatZonesXPower, clearSplatZonesXPower] = useAsyncStorage(
    "splatZonesXPower",
    "0"
  );
  const [towerControlXPower, setTowerControlXPower, clearTowerControlXPower] = useAsyncStorage(
    "towerControlXPower",
    "0"
  );
  const [rainmakerXPower, setRainmakerXPower, clearRainmakerXPower] = useAsyncStorage(
    "rainmakerXPower",
    "0"
  );
  const [clamBlitzXPower, setClamBlitzXPower, clearClamBlitzXPower] = useAsyncStorage(
    "clamBlitzXPower",
    "0"
  );
  const [grade, setGrade, clearGrade] = useAsyncStorage("grade");
  const [playedTime, setPlayedTime] = useAsyncStorage("playedTime");

  const [apiUpdated, setApiUpdated] = useState(false);
  const [schedules, setSchedules] = useState<Schedules>();
  const [shop, setShop] = useState<Shop>();
  const [friends, setFriends] = useState<FriendListResult>();
  const [voting, setVoting] = useState<DetailVotingStatusResult>();
  const [catalog, setCatalog] = useState<CatalogResult>();
  const [groups, setGroups] = useState<GroupProps[]>();
  const [filtered, setFiltered] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<Database.FilterProps>();
  const filterRef = useRef<Database.FilterProps>();
  const [filterOptions, setFilterOptions] = useState<Database.FilterProps>();
  const [stats, setStats] = useState<StatsProps[]>();

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

  const count = useMemo(() => {
    let current = 0;
    for (const group of groups ?? []) {
      current += (group.battles?.length ?? 0) + (group.coops?.length ?? 0);
    }
    return current;
  }, [groups]);
  const allResultsShown = count >= filtered;

  useEffect(() => {
    if (sessionTokenReady && webServiceTokenReady && bulletTokenReady && languageReady) {
      (async () => {
        try {
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
  }, [sessionTokenReady, webServiceTokenReady, bulletTokenReady, languageReady]);
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
          let current: number[];
          if (Constants.appOwnership !== AppOwnership.Expo) {
            current = parseVersion(Application.nativeApplicationVersion!);
          } else {
            current = parseVersion(Constants.expoConfig!.version!);
          }
          if (Constants.appOwnership !== AppOwnership.Expo) {
            switch (Platform.OS) {
              case "ios":
                ok(
                  fetchAppStoreVersion().then((version) => {
                    const latest = parseVersion(version);
                    if (latest > current) {
                      setUpdate(true);
                    }
                  })
                );
                break;
              case "android":
                ok(
                  fetchReleaseVersion().then((version) => {
                    const latest = parseVersion(version.replace("v", ""));
                    if (latest > current) {
                      setUpdate(true);
                    }
                  })
                );
                break;
              case "windows":
              case "macos":
              case "web":
                break;
            }
          }
        }, 100);
      });
    }
  }, [ready]);
  useEffect(() => {
    if (ready) {
      // HACK: avoid animation racing.
      setTimeout(refresh, 100);
    }
  }, [sessionToken]);
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
    if (!progressTotal) {
      setProgress(0);
    }
  }, [progressTotal]);
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
      if (autoRefresh && !refreshing) {
        autoRefreshTimeout = setTimeout(async () => {
          setRefreshing(true);
          try {
            await refreshResults(bulletToken, true);
          } catch (e) {
            await refresh();
          }
          setRefreshing(false);
        }, 10000);
      }
    }
  }, [refreshing, bulletToken, autoRefresh, language]);
  useEffect(() => {
    (async () => {
      if (appState === "active") {
        if ((await Notifications.getPermissionsAsync()).granted) {
          Notifications.setBadgeCountAsync(0);
        }
        if (ready) {
          const updated = await updatePlayedTime();
          if (updated) {
            await loadResults(20);
          }
        }
      }
    })();
  }, [ready, appState]);
  useEffect(() => {
    if (fault) {
      throw fault;
    }
  }, [fault]);

  const canGroup = (current: ResultProps, group: GroupProps) => {
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
    const details: ResultProps[] = [];
    let read = 0;
    while (read < limit) {
      const records = await Database.queryDetail(
        offset + read,
        Math.min(Database.BATCH_SIZE, limit - read),
        filterRef.current
      );
      for (const record of records) {
        if (record.mode === "salmon_run") {
          details.push({ coop: JSON.parse(record.detail) as CoopHistoryDetailResult });
        } else {
          details.push({ battle: JSON.parse(record.detail) as VsHistoryDetailResult });
        }
      }
      if (records.length < Math.min(Database.BATCH_SIZE, limit - read)) {
        break;
      }
      read += records.length;
    }
    const newGroups: GroupProps[] = [];
    let group: GroupProps = {};
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
  const updatePlayedTime = async () => {
    const time = await Database.queryLatestTime();
    if (time !== undefined) {
      const lastPlayedTime = time.toString();
      if (playedTime !== lastPlayedTime) {
        await setPlayedTime(lastPlayedTime);
        return true;
      }
    }
    return false;
  };
  const generateBulletToken = async () => {
    if (bulletToken.length > 0) {
      showBanner(BannerLevel.Info, t("reacquiring_tokens"));
    }

    // Update versions.
    if (!apiUpdated) {
      await Promise.all([updateNsoVersion(), updateSplatnetVersion()])
        .then(() => {
          setApiUpdated(true);
        })
        .catch((e) => {
          showBanner(BannerLevel.Warn, t("failed_to_check_api_update", { error: e }));
        });
    }

    // Attempt to acquire bullet token from web service token.
    let newBulletTokenAttempt: string | undefined;
    if (webServiceToken.length > 0) {
      newBulletTokenAttempt = await getBulletToken(webServiceToken).catch(() => undefined);
    }
    if (newBulletTokenAttempt) {
      await setBulletToken(newBulletTokenAttempt);
      return newBulletTokenAttempt;
    }

    // Acquire both web service token and bullet token.
    const res = await getWebServiceToken(sessionToken).catch((e) => {
      throw new Error(t("failed_to_acquire_web_service_token", { error: e }));
    });
    await setWebServiceToken(res.webServiceToken);
    const newBulletToken = await getBulletToken(res.webServiceToken).catch((e) => {
      throw new Error(t("failed_to_acquire_bullet_token", { error: e }));
    });
    await setBulletToken(newBulletToken);

    return newBulletToken;
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
        (async () => {
          if (sessionToken) {
            // Attempt to friends.
            let newBulletToken = "";
            let friendsAttempt: FriendListResult | undefined;
            if (bulletToken.length > 0) {
              try {
                friendsAttempt = await fetchFriends(bulletToken);
                setFriends(friendsAttempt);
                newBulletToken = bulletToken;
              } catch {
                /* empty */
              }
            }

            // Regenerate bullet token if necessary.
            if (!newBulletToken) {
              newBulletToken = await generateBulletToken();
            }

            // Fetch friends, voting, summary, catalog and results.
            await Promise.all([
              friendsAttempt ||
                fetchFriends(newBulletToken)
                  .then((friends) => {
                    setFriends(friends);
                  })
                  .catch((e) => {
                    showBanner(BannerLevel.Warn, t("failed_to_load_friends", { error: e }));
                  }),
              fetchSplatfests()
                .then(async (splatfests) => {
                  if (splatfests.festRecords.nodes[0]?.isVotable) {
                    await fetchDetailVotingStatus(
                      splatfests.festRecords.nodes[0].id,
                      newBulletToken,
                      language
                    )
                      .then((voting) => {
                        setVoting(voting);
                      })
                      .catch((e) => {
                        showBanner(
                          BannerLevel.Warn,
                          t("failed_to_load_friends_splatfest_voting", { error: e })
                        );
                      });
                  }
                })
                .catch((e) => {
                  showBanner(BannerLevel.Warn, t("failed_to_check_splatfest", { error: e }));
                }),
              fetchSummary(newBulletToken)
                .then(async (summary) => {
                  const icon = summary.currentPlayer.userIcon.url;
                  const level = String(summary.playHistory.rank);
                  const rank = summary.playHistory.udemae;
                  await Promise.all([setIcon(icon), setRank(rank), setLevel(level)]);
                })
                .catch((e) => {
                  showBanner(BannerLevel.Warn, t("failed_to_load_summary", { error: e }));
                }),
              fetchCatalog(newBulletToken, language)
                .then(async (catalog) => {
                  setCatalog(catalog);
                  const catalogLevel = String(catalog.catalog.progress?.level ?? 0);
                  await setCatalogLevel(catalogLevel);
                })
                .catch((e) => {
                  showBanner(BannerLevel.Warn, t("failed_to_load_catalog", { error: e }));
                }),
              ok(refreshResults(newBulletToken, false)),
            ]);

            // Background refresh.
            // HACK: not use notification and background refresh in Expo Go currently.
            if (Constants.appOwnership !== AppOwnership.Expo) {
              switch ((await Notifications.getPermissionsAsync()).status) {
                case ModulesCore.PermissionStatus.GRANTED:
                case ModulesCore.PermissionStatus.DENIED:
                  await onBackgroundRefreshContinue();
                  break;
                case ModulesCore.PermissionStatus.UNDETERMINED:
                  setBackgroundRefresh(true);
                  break;
              }
            }
          }
        })(),
      ]);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setRefreshing(false);
  };
  const refreshResults = async (bulletToken: string, latestOnly: boolean) => {
    // Fetch results.
    let n = -1;
    let throwable = 0;
    let error: Error | undefined;
    const [battleFail, coopFail] = await Promise.all([
      Promise.all([
        fetchLatestBattleHistories(bulletToken),
        latestOnly ? undefined : fetchXBattleHistories(bulletToken),
      ])
        .then(async ([latestBattleHistories, xBattleHistoriesAttempt]) => {
          if (xBattleHistoriesAttempt) {
            setSplatZonesXPower(
              xBattleHistoriesAttempt.xBattleHistories.summary.xPowerAr?.lastXPower?.toString() ??
                "0"
            );
            setTowerControlXPower(
              xBattleHistoriesAttempt.xBattleHistories.summary.xPowerLf?.lastXPower?.toString() ??
                "0"
            );
            setRainmakerXPower(
              xBattleHistoriesAttempt.xBattleHistories.summary.xPowerGl?.lastXPower?.toString() ??
                "0"
            );
            setClamBlitzXPower(
              xBattleHistoriesAttempt.xBattleHistories.summary.xPowerCl?.lastXPower?.toString() ??
                "0"
            );
          }

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
            skipRegular ? undefined : fetchRegularBattleHistories(bulletToken),
            skipAnarchy ? undefined : fetchAnarchyBattleHistories(bulletToken),
            skipX
              ? undefined
              : xBattleHistoriesAttempt ||
                fetchXBattleHistories(bulletToken).then((historyDetail) => {
                  setSplatZonesXPower(
                    historyDetail.xBattleHistories.summary.xPowerAr?.lastXPower?.toString() ?? "0"
                  );
                  setTowerControlXPower(
                    historyDetail.xBattleHistories.summary.xPowerLf?.lastXPower?.toString() ?? "0"
                  );
                  setRainmakerXPower(
                    historyDetail.xBattleHistories.summary.xPowerGl?.lastXPower?.toString() ?? "0"
                  );
                  setClamBlitzXPower(
                    historyDetail.xBattleHistories.summary.xPowerCl?.lastXPower?.toString() ?? "0"
                  );
                  return historyDetail;
                }),
            skipChallenge ? undefined : fetchChallengeHistories(bulletToken),
            skipPrivate ? undefined : fetchPrivateBattleHistories(bulletToken),
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
            if (n !== 0) {
              setProgressTotal(n + 50);
            }
          } else {
            n += newIds.length;
            setProgressTotal(n);
            if (n > 0) {
              showBanner(BannerLevel.Info, t("loading_n_results", { n }));
            }
          }
          const results = await Promise.all(
            newIds.map((id) =>
              fetchVsHistoryDetail(id, bulletToken, language)
                .then(async (detail) => {
                  setProgress((progress) => progress + 1);
                  await Database.addBattle(detail);
                  return true;
                })
                .catch((e) => {
                  if (!error) {
                    error = e;
                  }
                })
            )
          );
          return results.filter((result) => !result).length;
        })
        .catch((e) => {
          throwable += 1;
          showBanner(BannerLevel.Warn, t("failed_to_load_battle_results", { error: e }));
          return 0;
        }),
      fetchCoopResult(bulletToken)
        .then(async (coopResult) => {
          await setGrade(coopResult.coopResult.regularGrade.id);

          // Fetch details.
          const ids: string[] = [];
          coopResult.coopResult.historyGroups.nodes.forEach((historyGroup) => {
            historyGroup.historyDetails.nodes.forEach((historyDetail) => {
              ids.push(historyDetail.id);
            });
          });

          const existed = await Promise.all(ids.map((id) => Database.isExist(id)));
          const newIds = ids.filter((_, i) => !existed[i]);
          setProgressTotal((progressTotal) => progressTotal + newIds.length);
          if (n === -1) {
            n = newIds.length;
            if (n !== 0) {
              setProgressTotal(n + 250);
            }
          } else {
            n += newIds.length;
            setProgressTotal(n);
            if (n > 0) {
              showBanner(BannerLevel.Info, t("loading_n_results", { n }));
            }
          }
          const results = await Promise.all(
            newIds.map((id) =>
              fetchCoopHistoryDetail(id, bulletToken, language)
                .then(async (detail) => {
                  setProgress((progress) => progress + 1);
                  await Database.addCoop(detail);
                  return true;
                })
                .catch((e) => {
                  if (!error) {
                    error = e;
                  }
                })
            )
          );
          return results.filter((result) => !result).length;
        })
        .catch((e) => {
          throwable += 1;
          showBanner(BannerLevel.Warn, t("failed_to_load_salmon_run_results", { error: e }));
          return 0;
        }),
    ]);
    setProgressTotal(0);

    if (n > 0) {
      const fail = battleFail + coopFail;
      if (fail > 0) {
        showBanner(BannerLevel.Warn, t("loaded_n_results_fail_failed", { n, fail, error }));
      } else {
        showBanner(BannerLevel.Success, t("loaded_n_results", { n }));
      }
    }
    const updated = await updatePlayedTime();
    if (n > 0 || updated) {
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
  const onLogInPress = () => {
    setLogIn(true);
  };
  const onLogInClose = () => {
    if (!loggingIn) {
      setLogIn(false);
    }
  };
  const onPrivacyPolicyPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/Privacy-Policy");
  };
  const onLogInContinuePress = async () => {
    try {
      setLoggingIn(true);
      const res = await generateLogIn();
      WebBrowser.maybeCompleteAuthSession();
      const res2 = await WebBrowser.openAuthSessionAsync(res.url, "npf71b963c1b7b6d119://");
      if (res2.type !== "success") {
        setLoggingIn(false);
        return;
      }
      const res3 = await getSessionToken(res2.url, res.cv).catch((e) => {
        // Rethrow to error banner.
        throw new Error(t("failed_to_acquire_session_token", { error: e }));
      });
      if (!res3) {
        setLoggingIn(false);
        return;
      }
      await setSessionToken(res3);

      setLoggingIn(false);
      setLogIn(false);
      setLogOut(false);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      setLoggingIn(false);
    }
  };
  const onAlternativeLogInPress = async () => {
    try {
      setLoggingIn(true);
      const paste = await Clipboard.getStringAsync();
      const sessionToken = paste.trim();
      if (sessionToken.length > 0) {
        await setSessionToken(await Clipboard.getStringAsync());
      }

      setLoggingIn(false);
      if (sessionToken.length > 0) {
        setLogIn(false);
        setLogOut(false);
      }
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      setLoggingIn(false);
    }
  };
  const onLogOutPress = () => {
    setLogOut(true);
  };
  const onLogOutClose = () => {
    if (!loggingIn && !loggingOut) {
      setLogOut(false);
    }
  };
  const onLogOutContinuePress = async () => {
    try {
      setLoggingOut(true);
      setFriends(undefined);
      setVoting(undefined);
      setCatalog(undefined);
      await Promise.all([
        clearSessionToken(),
        clearWebServiceToken(),
        clearBulletToken(),
        clearAutoRefresh(),
        clearIcon(),
        clearCatalogLevel(),
        clearLevel(),
        clearRank(),
        clearSplatZonesXPower(),
        clearTowerControlXPower(),
        clearRainmakerXPower(),
        clearClamBlitzXPower(),
        clearGrade(),
        Notifications.getPermissionsAsync().then(async (res) => {
          if (res.granted) {
            await Notifications.setBadgeCountAsync(0);
          }
        }),
        ok(
          isBackgroundTaskRegistered().then(async (res) => {
            if (res) {
              await unregisterBackgroundTask();
            }
          })
        ),
      ]);
      setLoggingOut(false);
      setLogOut(false);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      setLoggingOut(false);
    }
  };
  const onEquipmentsRefresh = async () => {
    try {
      let newBulletToken = "";
      let equipmentsAttempt: MyOutfitCommonDataEquipmentsResult | undefined;
      if (bulletToken.length > 0) {
        try {
          equipmentsAttempt = await fetchEquipments(bulletToken, language);
          newBulletToken = bulletToken;
        } catch {
          /* empty */
        }
      }

      // Regenerate bullet token if necessary.
      if (!newBulletToken) {
        newBulletToken = await generateBulletToken();
      }

      const equipments =
        equipmentsAttempt ||
        (await fetchEquipments(newBulletToken, language)
          .then((equipments) => {
            return equipments;
          })
          .catch((e) => {
            showBanner(BannerLevel.Warn, t("failed_to_load_owned_gears", { error: e }));
            return undefined;
          }));
      return equipments;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
  };
  const onChangeFilterPress = (filter?: Database.FilterProps) => {
    setFilter(filter);
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
      case TimeRange.CurrentBattleSchedule:
        num = await Database.count(filter, new Date().valueOf() - (new Date().valueOf() % 7200000));
        break;
      case TimeRange.CurrentSalmonRunSchedule:
        if (schedules) {
          const current = new Date().valueOf();
          const shift = [
            ...schedules.coopGroupingSchedule.regularSchedules.nodes,
            ...schedules.coopGroupingSchedule.bigRunSchedules.nodes,
          ].find(
            (shift) =>
              current >= new Date(shift.startTime).valueOf() &&
              current < new Date(shift.endTime).valueOf()
          );
          if (shift) {
            num = await Database.count(filter, new Date(shift.startTime).valueOf());
            break;
          }
        }
        return;
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
    const results: StatsProps[] = [];
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
  const onGetWebServiceToken = async () => {
    // Update versions.
    if (!apiUpdated) {
      await Promise.all([updateNsoVersion(), updateSplatnetVersion()])
        .then(() => {
          setApiUpdated(true);
        })
        .catch((e) => {
          showBanner(BannerLevel.Warn, t("failed_to_check_api_update", { error: e }));
        });
    }

    // Attempt to acquire bullet token from web service token.
    let newBulletTokenAttempt: string | undefined;
    if (webServiceToken.length > 0) {
      newBulletTokenAttempt = await getBulletToken(webServiceToken).catch(() => undefined);
    }
    if (newBulletTokenAttempt) {
      await setBulletToken(newBulletTokenAttempt);
      return webServiceToken;
    }

    // Acquire web service token.
    showBanner(BannerLevel.Info, t("reacquiring_tokens"));
    const res = await getWebServiceToken(sessionToken).catch((e) => {
      showBanner(BannerLevel.Error, t("failed_to_acquire_web_service_token", { error: e }));
      return undefined;
    });
    if (res) {
      await setWebServiceToken(res.webServiceToken);
      return res.webServiceToken as string;
    }
    return "";
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
    const battleExisted = await Promise.all(
      battles.map((battle: VsHistoryDetailResult) => Database.isExist(battle.vsHistoryDetail!.id))
    );
    const coopExisted = await Promise.all(
      coops.map((coop: CoopHistoryDetailResult) => Database.isExist(coop.coopHistoryDetail!.id))
    );
    const newBattles = battles.filter((_, i: number) => !battleExisted[i]);
    const newCoops = coops.filter((_, i: number) => !coopExisted[i]);
    const skip = n - newBattles.length - newCoops.length;
    let error: Error | undefined;
    let fail = 0;
    for (const battle of newBattles) {
      const result = await Database.addBattle(battle)
        .then(() => {
          return true;
        })
        .catch((e) => {
          if (!error) {
            error = e;
          }
          return false;
        });
      if (!result) {
        fail++;
      }
    }
    for (const coop of newCoops) {
      const result = await Database.addCoop(coop)
        .then(() => {
          return true;
        })
        .catch((e) => {
          if (!error) {
            error = e;
          }
          return false;
        });
      if (!result) {
        fail++;
      }
    }
    return { skip, fail, error };
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
          const records = await Database.queryDetail(
            Database.BATCH_SIZE * batch,
            Database.BATCH_SIZE
          );
          for (const record of records) {
            if (record.mode === "salmon_run") {
              coops += `${record.detail},`;
            } else {
              battles += `${record.detail},`;
            }
          }
          if (records.length < Database.BATCH_SIZE) {
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
        await FileSystem.writeAsStringAsync(uri, '{"battles":[', {
          encoding: FileSystem.EncodingType.UTF8,
        });
        const battleModes = (filterOptions?.modes ?? []).filter((mode) => mode !== "salmon_run");
        if (battleModes.length > 0) {
          let batch = 0;
          while (true) {
            let result = "";
            const records = await Database.queryDetail(
              Database.BATCH_SIZE * batch,
              Database.BATCH_SIZE,
              {
                modes: battleModes,
              }
            );
            for (let i = 0; i < records.length; i++) {
              if (batch === 0 && i === 0) {
                result += `${records[i].detail}`;
              } else {
                result += `,${records[i].detail}`;
              }
            }
            await FileAccess.FileSystem.appendFile(uri, result, "utf8");
            if (records.length < Database.BATCH_SIZE) {
              break;
            }
            batch += 1;
          }
        }
        await FileAccess.FileSystem.appendFile(uri, '],"coops":[', "utf8");
        let batch = 0;
        while (true) {
          let result = "";
          const records = await Database.queryDetail(
            Database.BATCH_SIZE * batch,
            Database.BATCH_SIZE,
            {
              modes: ["salmon_run"],
            }
          );
          for (let i = 0; i < records.length; i++) {
            if (batch === 0 && i === 0) {
              result += `${records[i].detail}`;
            } else {
              result += `,${records[i].detail}`;
            }
          }
          await FileAccess.FileSystem.appendFile(uri, result, "utf8");
          if (records.length < Database.BATCH_SIZE) {
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
    switch (Platform.OS) {
      case "ios":
        Linking.openURL("https://apps.apple.com/us/app/conch-bay/id1659268579");
        break;
      case "android":
        WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/releases");
        break;
      case "windows":
      case "macos":
      case "web":
        throw new Error(`unexpected OS ${Platform.OS}`);
    }
  };
  const onSupportPress = () => {
    setSupport(true);
  };
  const onSupportClose = () => {
    if (!clearingCache && !preloadingResources && !diagnosingNetwork) {
      setSupport(false);
    }
  };
  const onGameLanguageSelected = async (language: string) => {
    if (language === t("lang")) {
      await clearLanguage();
    } else {
      await setLanguage(language);
    }
  };
  const onChangeDisplayLanguagePress = () => {
    Linking.openSettings();
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
        const records = await Database.queryDetail(
          Database.BATCH_SIZE * batch,
          Database.BATCH_SIZE
        );
        for (const record of records) {
          if (record.mode === "salmon_run") {
            const coop = JSON.parse(record.detail) as CoopHistoryDetailResult;

            // Stages.
            const stage = convertStageImageUrl(coop.coopHistoryDetail!.coopStage);
            const stageCacheKey = getImageCacheKey(stage);
            if (!resources.has(stageCacheKey)) {
              resources.set(stageCacheKey, stage);
            }

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

            // Stages.
            const stage = convertStageImageUrl(battle.vsHistoryDetail!.vsStage);
            const stageCacheKey = getImageCacheKey(stage);
            if (!resources.has(stageCacheKey)) {
              resources.set(stageCacheKey, stage);
            }

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
        if (records.length < Database.BATCH_SIZE) {
          break;
        }
        batch += 1;
      }

      // Attempt to preload weapon images from API.
      // TODO: need better error message.
      try {
        if (sessionToken.length > 0) {
          let newBulletToken = "";
          let weaponRecordsAttempt: WeaponRecordResult | undefined;
          if (bulletToken.length > 0) {
            try {
              weaponRecordsAttempt = await fetchWeaponRecords(bulletToken);
              weaponRecordsAttempt.weaponRecords.nodes.forEach((record) => {
                resources.set(getImageCacheKey(record.image2d.url), record.image2d.url);
                resources.set(
                  getImageCacheKey(record.subWeapon.image.url),
                  record.subWeapon.image.url
                );
                resources.set(
                  getImageCacheKey(record.specialWeapon.image.url),
                  record.specialWeapon.image.url
                );
              });
              newBulletToken = bulletToken;
            } catch {
              /* empty */
            }
          }

          // Regenerate bullet token if necessary.
          if (!newBulletToken) {
            newBulletToken = await generateBulletToken();
          }

          // Preload weapon, equipments, badge images from API.
          await Promise.all([
            weaponRecordsAttempt ||
              ok(
                fetchWeaponRecords(newBulletToken).then((weaponRecords) => {
                  weaponRecords.weaponRecords.nodes.forEach((record) => {
                    resources.set(getImageCacheKey(record.image2d.url), record.image2d.url);
                    resources.set(
                      getImageCacheKey(record.subWeapon.image.url),
                      record.subWeapon.image.url
                    );
                    resources.set(
                      getImageCacheKey(record.specialWeapon.image.url),
                      record.specialWeapon.image.url
                    );
                  });
                })
              ),
            ok(
              fetchEquipments(newBulletToken).then((equipments) => {
                [
                  ...equipments.headGears.nodes,
                  ...equipments.clothingGears.nodes,
                  ...equipments.shoesGears.nodes,
                ].forEach((gear) => {
                  resources.set(getImageCacheKey(gear.image.url), gear.image.url);
                  resources.set(getImageCacheKey(gear.brand.image.url), gear.brand.image.url);
                  resources.set(
                    getImageCacheKey(gear.primaryGearPower.image.url),
                    gear.primaryGearPower.image.url
                  );
                  gear.additionalGearPowers.forEach((gearPower) => {
                    resources.set(getImageCacheKey(gearPower.image.url), gearPower.image.url);
                  });
                });
              })
            ),
            ok(
              fetchSummary(newBulletToken).then((summary) => {
                summary.playHistory.allBadges.forEach((badge) => {
                  resources.set(getImageCacheKey(badge.image.url), badge.image.url);
                });
              })
            ),
          ]);
        }
      } catch {
        /* empty */
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
  const onDiagnoseNetworkPress = async () => {
    setDiagnosingNetwork(true);
    const versions = getCurrentVersions();
    const result = {
      NSO_VERSION: versions.NSO_VERSION,
      SPLATNET_VERSION: versions.SPLATNET_VERSION,
      sessionToken: sessionToken,
      webServiceToken: webServiceToken,
      language: language,
      tests: {
        bulletToken: {},
        webServiceToken: {},
      },
    };

    // Diagnose bullet token.
    try {
      const bulletToken = await getBulletToken(webServiceToken, language);
      result.tests.bulletToken["bulletToken"] = bulletToken;
    } catch (e) {
      if (e instanceof AxiosError) {
        result.tests.bulletToken["error"] = e.toJSON();
      } else if (e instanceof Error) {
        result.tests.bulletToken["error"] = e.message;
      }
    }

    // Diagnose web service token.
    try {
      const webServiceToken = await getWebServiceToken(sessionToken);
      result.tests.webServiceToken["webServiceToken"] = webServiceToken;
      const bulletToken = await getBulletToken(webServiceToken.webServiceToken, language);
      result.tests.webServiceToken["bulletToken"] = bulletToken;
    } catch (e) {
      if (e instanceof AxiosError) {
        result.tests.webServiceToken["error"] = e.toJSON();
      } else if (e instanceof Error) {
        result.tests.webServiceToken["error"] = e.message;
      }
    }

    await Clipboard.setStringAsync(JSON.stringify(result));
    showBanner(BannerLevel.Info, t("copied_to_clipboard"));
    setDiagnosingNetwork(false);
  };
  const onCopySessionTokenPress = async () => {
    if (sessionToken.length > 0) {
      await Clipboard.setStringAsync(sessionToken);
      showBanner(BannerLevel.Info, t("copied_to_clipboard"));
    }
  };
  const onCopyWebServiceTokenPress = async () => {
    if (webServiceToken.length > 0) {
      await Clipboard.setStringAsync(webServiceToken);
      showBanner(BannerLevel.Info, t("copied_to_clipboard"));
    }
  };
  const onCopyBulletTokenPress = async () => {
    if (bulletToken.length > 0) {
      await Clipboard.setStringAsync(bulletToken);
      showBanner(BannerLevel.Info, t("copied_to_clipboard"));
    }
  };
  const onExportDatabasePress = async () => {
    const uri = FileSystem.documentDirectory + "SQLite/conch-bay.db";
    try {
      await Sharing.shareAsync(uri, { UTI: "public.database" });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
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
  const onAutoRefreshPress = () => {
    if (!autoRefresh) {
      showBanner(BannerLevel.Info, t("auto_refresh_enabled"));
      setAutoRefresh(true);
    } else {
      showBanner(BannerLevel.Info, t("auto_refresh_disabled"));
      setAutoRefresh(false);
    }
  };
  const onBackgroundRefreshClose = () => {
    setBackgroundRefresh(false);
  };
  const onBackgroundRefreshContinue = async () => {
    await Notifications.requestPermissionsAsync();
    if (!(await isBackgroundTaskRegistered())) {
      await registerBackgroundTask().catch((e) => {
        showBanner(BannerLevel.Warn, t("failed_to_enable_background_refresh", { error: e }));
      });
    }
    setBackgroundRefresh(false);
  };

  return (
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
              {!sessionToken && (
                <Center flex style={[ViewStyles.px4, ViewStyles.mb4]}>
                  <Button style={ViewStyles.accent} onPress={onLogInPress}>
                    <Marquee style={theme.reverseTextStyle}>{t("log_in")}</Marquee>
                  </Button>
                </Center>
              )}
              {sessionToken.length > 0 && (
                <VStack center style={[ViewStyles.px4, ViewStyles.mb4]}>
                  <AvatarButton
                    size={64}
                    image={icon.length > 0 ? getUserIconCacheSource(icon) : undefined}
                    onPress={onLogOutPress}
                    style={ViewStyles.mb2}
                  />
                  {/* HACK: withdraw 4px margin in the last badge. */}
                  <HStack style={{ marginRight: -ViewStyles.mr1.marginRight }}>
                    {catalogLevel.length > 0 && (
                      <CatalogView
                        catalogLevel={catalogLevel}
                        catalog={catalog}
                        style={ViewStyles.mr1}
                      />
                    )}
                    {level.length > 0 && (
                      <Badge color={Color.RegularBattle} title={level} style={ViewStyles.mr1} />
                    )}
                    {rank.length > 0 && (
                      <Badge color={Color.AnarchyBattle} title={rank} style={ViewStyles.mr1} />
                    )}
                    {(splatZonesXPower.length > 1 ||
                      towerControlXPower.length > 1 ||
                      rainmakerXPower.length > 1 ||
                      clamBlitzXPower.length > 1) && (
                      <XView
                        splatZones={parseFloat(splatZonesXPower)}
                        towerControl={parseFloat(towerControlXPower)}
                        rainmaker={parseFloat(rainmakerXPower)}
                        clamBlitz={parseFloat(clamBlitzXPower)}
                        style={ViewStyles.mr1}
                      />
                    )}
                    {grade.length > 0 && (
                      <Badge color={Color.SalmonRun} title={t(grade)} style={ViewStyles.mr1} />
                    )}
                  </HStack>
                  {progressTotal > 0 && progress < progressTotal && (
                    <Progress.Bar
                      animated
                      progress={progress / progressTotal}
                      color={Color.AccentColor}
                      unfilledColor={theme.territoryColor}
                      borderColor={Color.AccentColor}
                      width={64}
                      borderRadius={2}
                      useNativeDriver
                      style={{ position: "absolute", top: 50 }}
                    />
                  )}
                </VStack>
              )}
              <ScheduleView schedules={schedules} style={ViewStyles.mb4}>
                {shop && (
                  <ShopView
                    shop={shop}
                    onRefresh={sessionToken.length > 0 ? onEquipmentsRefresh : undefined}
                  />
                )}
              </ScheduleView>
              {sessionToken.length > 0 &&
                (friends === undefined || friends.friends.nodes.length > 0) && (
                  <FriendView friends={friends} voting={voting} style={ViewStyles.mb4} />
                )}
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
                  style={[
                    count <= 20 && !allResultsShown && ViewStyles.mb2,
                    ViewStyles.rt0,
                    ViewStyles.rb2,
                    { height: 64 },
                    theme.territoryStyle,
                  ]}
                  textStyle={[TextStyles.h3, theme.textStyle]}
                  // HACK: forcly cast.
                  onSelected={onShowMoreSelected as (_: string) => void}
                  onPress={onShowMorePress}
                />
                {count <= 20 && !allResultsShown && (
                  <HStack style={ViewStyles.c}>
                    <Icon
                      name="info"
                      size={14}
                      color={Color.MiddleTerritory}
                      style={ViewStyles.mr1}
                    />
                    <HStack style={ViewStyles.i}>
                      <Marquee style={TextStyles.subtle}>{t("show_more_notice")}</Marquee>
                    </HStack>
                  </HStack>
                )}
              </VStack>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[ViewStyles.mb4, ViewStyles.wf]}
              >
                <HStack flex center style={ViewStyles.px4}>
                  <StatsView disabled={counting} onStats={onStatsPress} style={ViewStyles.mr2} />
                  <TrendsView disabled={counting} onStats={onStatsPress} style={ViewStyles.mr2} />
                  {sessionToken.length > 0 && (
                    <SplatNetView
                      lang={language}
                      style={ViewStyles.mr2}
                      onGetWebServiceToken={onGetWebServiceToken}
                    />
                  )}
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
        {sessionToken.length > 0 && (
          <FloatingActionButton
            size={50}
            color={autoRefresh ? Color.AccentColor : undefined}
            icon="refresh-cw"
            spin={autoRefresh}
            onPress={onAutoRefreshPress}
          />
        )}
      </Animated.View>
      <Modal isVisible={logIn} onClose={onLogInClose} style={ViewStyles.modal1d}>
        <CustomDialog icon="alert-circle">
          <DialogSection text={t("log_in_notice")} style={ViewStyles.mb4}>
            <Button
              style={[
                ViewStyles.mb2,
                { borderColor: Color.AccentColor, borderWidth: 1.5 },
                theme.backgroundStyle,
              ]}
              onPress={onPrivacyPolicyPress}
            >
              <Marquee>{t("privacy_policy")}</Marquee>
            </Button>
            <Button
              disabled={refreshing}
              loading={loggingIn}
              loadingText={t("logging_in")}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onLogInContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("log_in_continue")}</Marquee>
            </Button>
          </DialogSection>
          <DialogSection text={t("alternative_log_in_notice")}>
            <Button
              disabled={refreshing}
              loading={loggingIn}
              loadingText={t("logging_in")}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onAlternativeLogInPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("log_in_with_session_token")}</Marquee>
            </Button>
          </DialogSection>
        </CustomDialog>
      </Modal>
      <Modal isVisible={logOut} onClose={onLogOutClose} style={ViewStyles.modal1d}>
        <CustomDialog icon="alert-circle">
          <DialogSection text={t("relog_in_notice")} style={ViewStyles.mb4}>
            <Button
              disabled={refreshing}
              loading={loggingIn}
              loadingText={t("logging_in")}
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={theme.reverseTextStyle}
              onPress={onLogInContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("relog_in")}</Marquee>
            </Button>
            <Button
              disabled={refreshing}
              loading={loggingIn}
              loadingText={t("logging_in")}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onAlternativeLogInPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("relog_in_with_session_token")}</Marquee>
            </Button>
          </DialogSection>
          <DialogSection text={t("log_out_notice")}>
            <Button
              disabled={loggingIn || refreshing || loadingMore || exporting}
              loading={loggingOut}
              loadingText={t("logging_out")}
              style={ViewStyles.danger}
              textStyle={theme.reverseTextStyle}
              onPress={onLogOutContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("log_out_continue")}</Marquee>
            </Button>
          </DialogSection>
        </CustomDialog>
      </Modal>
      <Modal isVisible={support} onClose={onSupportClose} style={ViewStyles.modal1d}>
        <CustomDialog icon="help-circle">
          <DialogSection text={t("language_notice")} style={ViewStyles.mb4}>
            <Picker
              disabled={refreshing}
              title={t("change_game_language_language", { language: t(language) })}
              items={[
                { key: "de-DE", value: t("de-DE") },
                { key: "en-GB", value: t("en-GB") },
                { key: "en-US", value: t("en-US") },
                { key: "es-ES", value: t("es-ES") },
                { key: "es-MX", value: t("es-MX") },
                { key: "fr-CA", value: t("fr-CA") },
                { key: "it-IT", value: t("it-IT") },
                { key: "ja-JP", value: t("ja-JP") },
                { key: "ko-KR", value: t("ko-KR") },
                { key: "nl-NL", value: t("nl-NL") },
                { key: "ru-RU", value: t("ru-RU") },
                { key: "zh-CN", value: t("zh-CN") },
                { key: "zh-TW", value: t("zh-TW") },
              ]}
              onSelected={onGameLanguageSelected}
              style={ViewStyles.mb2}
            />
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
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCreateAGithubIssuePress}>
              <Marquee style={theme.reverseTextStyle}>{t("create_a_github_issue")}</Marquee>
            </Button>
            <Button style={ViewStyles.accent} onPress={onSendAMailPress}>
              <Marquee style={theme.reverseTextStyle}>{t("send_a_mail")}</Marquee>
            </Button>
          </DialogSection>
          <DialogSection text={t("debug_notice")}>
            <Button
              loading={diagnosingNetwork}
              loadingText={t("diagnosing_network")}
              style={[sessionToken.length > 0 && ViewStyles.mb2, ViewStyles.accent]}
              textStyle={theme.reverseTextStyle}
              onPress={onDiagnoseNetworkPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("diagnose_network")}</Marquee>
            </Button>
            {sessionToken.length > 0 && (
              <VStack>
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  onPress={onCopySessionTokenPress}
                >
                  <Marquee style={theme.reverseTextStyle}>{t("copy_session_token")}</Marquee>
                </Button>
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  onPress={onCopyWebServiceTokenPress}
                >
                  <Marquee style={theme.reverseTextStyle}>{t("copy_web_service_token")}</Marquee>
                </Button>
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  onPress={onCopyBulletTokenPress}
                >
                  <Marquee style={theme.reverseTextStyle}>{t("copy_bullet_token")}</Marquee>
                </Button>
                <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
                  <Marquee style={theme.reverseTextStyle}>{t("export_database")}</Marquee>
                </Button>
              </VStack>
            )}
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
      <Modal
        isVisible={backgroundRefresh}
        onClose={onBackgroundRefreshClose}
        style={ViewStyles.modal1d}
      >
        <Dialog icon="bell-dot" text={t("background_refresh_notice")}>
          <Button style={ViewStyles.accent} onPress={onBackgroundRefreshContinue}>
            <Marquee style={theme.reverseTextStyle}>{t("ok")}</Marquee>
          </Button>
        </Dialog>
      </Modal>
    </VStack>
  );
};

export default MainView;
