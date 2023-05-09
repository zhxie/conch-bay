import dayjs from "dayjs";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import utc from "dayjs/plugin/utc";
import * as Application from "expo-application";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
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
  fetchBattleHistories,
  fetchCatalog,
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchEquipments,
  fetchFriends,
  fetchShop,
  fetchSchedules,
  fetchSummary,
  fetchVsHistoryDetail,
  fetchWeaponRecords,
  generateLogIn,
  getBulletToken,
  getSessionToken,
  getWebServiceToken,
  updateNsoVersion,
  updateSplatnetVersion,
  fetchLatestVersion,
  fetchSplatfests,
  fetchDetailVotingStatus,
} from "../utils/api";
import * as Database from "../utils/database";
import { useAsyncStorage } from "../utils/hooks";
import { ok } from "../utils/promise";
import {
  convertStageImageUrl,
  getImageCacheKey,
  getUserIconCacheSource,
  isImageExpired,
} from "../utils/ui";
import FilterView from "./FilterView";
import FriendView from "./FriendView";
import ResultView from "./ResultView";
import ScheduleView from "./ScheduleView";
import ShopView from "./ShopView";
import StatsView from "./StatsView";
import TrendsView from "./TrendsView";
import XView from "./XView";

dayjs.extend(quarterOfYear);
dayjs.extend(utc);

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
  const theme = useTheme();

  const insets = useSafeAreaInsets();

  const showBanner = useBanner();

  const [ready, setReady] = useState(false);
  const [update, setUpdate] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressTotal, setProgressTotal] = useState(0);
  const [loadingMore, setLoadingMore] = useState(false);
  const [import_, setImport] = useState(false);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [support, setSupport] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [preloadingResources, setPreloadingResources] = useState(false);
  const [acknowledgments, setAcknowledgments] = useState(false);
  const [firstAid, setFirstAid] = useState(false);

  const [sessionToken, setSessionToken, clearSessionToken, sessionTokenReady] =
    useAsyncStorage("sessionToken");
  const [bulletToken, setBulletToken, clearBulletToken, bulletTokenReady] =
    useAsyncStorage("bulletToken");
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [language, setLanguage, clearLanguage, languageReady] = useAsyncStorage(
    "language",
    t("lang")
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

  const [apiUpdated, setApiUpdated] = useState(false);
  const [schedules, setSchedules] = useState<Schedules>();
  const [shop, setShop] = useState<Shop>();
  const [friends, setFriends] = useState<FriendListResult>();
  const [voting, setVoting] = useState<DetailVotingStatusResult>();
  const [results, setResults] =
    useState<{ battle?: VsHistoryDetailResult; coop?: CoopHistoryDetailResult }[]>();
  const [count, setCount] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState<Database.FilterProps>();
  const [filterOptions, setFilterOptions] = useState<Database.FilterProps>();
  const [autoRefresh, setAutoRefresh] = useState(false);

  const loadedAll = (results?.length ?? 0) >= count;

  useEffect(() => {
    if (sessionTokenReady && bulletTokenReady && languageReady) {
      (async () => {
        try {
          await Database.open();
          await loadResults(20, false);
          setReady(true);
        } catch (e) {
          showBanner(BannerLevel.Error, e);
          setFirstAid(true);
        }
      })();
    }
  }, [sessionTokenReady, bulletTokenReady, languageReady]);
  const fade = useRef(new Animated.Value(0)).current;
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
          Platform.OS === "android" &&
            fetchLatestVersion()
              .then((version) => {
                const versionRegex = /(\d+)\.(\d+)\.(\d+)/g;
                const current = versionRegex.exec(Application.nativeApplicationVersion!);
                const tagRegex = /v(\d+)\.(\d+)\.(\d+)/g;
                const latest = tagRegex.exec(version ?? "");
                if (current!.slice(1) < latest!.slice(1)) {
                  setUpdate(true);
                }
              })
              .catch((_) => {
                showBanner(BannerLevel.Warn, t("failed_to_check_update"));
              });
        }, 100);
      });
    }
  }, [ready]);
  useEffect(() => {
    if (ready) {
      // HACK: avoid animation racing.
      setTimeout(() => {
        refresh();
      }, 100);
    }
  }, [sessionToken]);
  useEffect(() => {
    if (ready) {
      loadResults(20, false);
    }
  }, [filter]);
  useEffect(() => {
    if (ready) {
      clearTimeout(autoRefreshTimeout);
      if (autoRefresh && !refreshing) {
        autoRefreshTimeout = setTimeout(async () => {
          setRefreshing(true);
          try {
            await refreshResults(bulletToken);
          } catch (e) {
            await refresh();
          }
          setProgressTotal(0);
          setRefreshing(false);
        }, 10000);
      }
    }
  }, [refreshing, bulletToken, autoRefresh, language]);

  const loadResults = async (length: number, forceUpdate: boolean) => {
    setLoadingMore(true);
    let offset: number, limit: number;
    if (results !== undefined && results.length >= 20 && length > results.length) {
      offset = results.length;
      limit = length - results.length;
    } else {
      offset = 0;
      limit = length;
    }

    const details = (await Database.query(offset, limit, filter)).map((record) => {
      if (record.mode === "salmon_run") {
        return {
          coop: JSON.parse(record.detail) as CoopHistoryDetailResult,
        };
      }
      return { battle: JSON.parse(record.detail) as VsHistoryDetailResult };
    });
    if (results !== undefined && results.length >= 20 && length > results.length) {
      setResults(results.concat(details));
    } else {
      if (details.length > 0 || forceUpdate) {
        setResults(details);
        const [count, newTotal] = await Promise.all([Database.count(filter), Database.count()]);
        setCount(count);
        setTotal(newTotal);
        if (newTotal !== total) {
          const filterOptions = await Database.queryFilterOptions();
          setFilterOptions(filterOptions);
        }
      }
    }
    setLoadingMore(false);
  };
  const generateBulletToken = async () => {
    if (bulletToken.length > 0) {
      showBanner(BannerLevel.Info, t("reacquiring_tokens"));
    }

    const res = await getWebServiceToken(sessionToken);
    const newBulletToken = await getBulletToken(res.webServiceToken, res.country);

    await setBulletToken(newBulletToken);

    return newBulletToken;
  };
  const refresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        // Fetch schedules and shop.
        fetchSchedules().then((schedules) => setSchedules(schedules)),
        fetchShop(t("lang")).then((shop) => setShop(shop)),
        (async () => {
          if (sessionToken) {
            // Attempt to friends.
            let newBulletToken = "";
            let friendsAttempt: FriendListResult | undefined;
            if (bulletToken.length > 0) {
              try {
                friendsAttempt = await fetchFriends(bulletToken);
                newBulletToken = bulletToken;
              } catch {
                /* empty */
              }
            }
            if (friendsAttempt) {
              setFriends(friendsAttempt);
            }

            // Regenerate bullet token if necessary.
            if (!newBulletToken) {
              // Also update versions.
              const [newBulletTokenInner, nsoUpdated, splatnetUpdated] = await Promise.all([
                generateBulletToken(),
                apiUpdated ? true : ok(updateNsoVersion()),
                apiUpdated ? true : ok(updateSplatnetVersion()),
              ]);
              newBulletToken = newBulletTokenInner;
              if (nsoUpdated && splatnetUpdated) {
                setApiUpdated(true);
              } else {
                showBanner(BannerLevel.Warn, t("failed_to_check_api_update"));
              }
            }

            // Fetch friends, voting, summary, catalog and results.
            await Promise.all([
              friendsAttempt ||
                fetchFriends(newBulletToken).then((friends) => {
                  setFriends(friends);
                }),
              fetchSplatfests().then(async (splatfests) => {
                if (splatfests.festRecords.nodes[0]?.isVotable) {
                  const voting = await fetchDetailVotingStatus(
                    splatfests.festRecords.nodes[0].id,
                    newBulletToken,
                    language
                  );
                  setVoting(voting);
                }
              }),
              fetchSummary(newBulletToken).then(async (summary) => {
                const icon = summary.currentPlayer.userIcon.url;
                const level = String(summary.playHistory.rank);
                const rank = summary.playHistory.udemae;
                await setIcon(icon);
                await setRank(rank);
                await setLevel(level);
              }),
              fetchCatalog(newBulletToken).then(async (catalog) => {
                const catalogLevel = String(catalog.catalog.progress?.level ?? 0);
                await setCatalogLevel(catalogLevel);
              }),
              refreshResults(newBulletToken).then(async () => {
                await loadResults(20, true);
              }),
            ]);
          }
        })(),
      ]);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setProgressTotal(0);
    setRefreshing(false);
  };
  const refreshResults = async (bulletToken: string) => {
    // Fetch results.
    setProgress(0);
    setProgressTotal(0);
    let n = -1;
    const [battleFail, coopFail] = await Promise.all([
      fetchBattleHistories(bulletToken).then(async (battleHistories) => {
        setSplatZonesXPower(
          battleHistories.x.xBattleHistories.summary.xPowerAr?.lastXPower.toFixed(1) ?? "0"
        );
        setTowerControlXPower(
          battleHistories.x.xBattleHistories.summary.xPowerLf?.lastXPower.toFixed(1) ?? "0"
        );
        setRainmakerXPower(
          battleHistories.x.xBattleHistories.summary.xPowerGl?.lastXPower.toFixed(1) ?? "0"
        );
        setClamBlitzXPower(
          battleHistories.x.xBattleHistories.summary.xPowerCl?.lastXPower.toFixed(1) ?? "0"
        );

        // Fetch details.
        const ids: string[] = [];
        battleHistories.regular.regularBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) => ids.push(historyDetail.id))
        );
        battleHistories.anarchy.bankaraBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) => ids.push(historyDetail.id))
        );
        battleHistories.x.xBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) => ids.push(historyDetail.id))
        );
        battleHistories.private.privateBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) => ids.push(historyDetail.id))
        );

        const existed = await Promise.all(ids.map((id) => Database.isExist(id)));
        const newIds = ids.filter((_, i) => !existed[i]);
        if (n === -1) {
          n = newIds.length;
          if (n !== 0) {
            setProgressTotal(250);
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
            ok(
              fetchVsHistoryDetail(id, bulletToken, language).then(async (detail) => {
                setProgress((progress) => progress + 1);
                return await Database.addBattle(detail);
              })
            )
          )
        );
        return results.filter((result) => !result).length;
      }),
      fetchCoopResult(bulletToken).then(async (coopResult) => {
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
            setProgressTotal(250);
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
            ok(
              fetchCoopHistoryDetail(id, bulletToken, language).then(async (detail) => {
                setProgress((progress) => progress + 1);
                return await Database.addCoop(detail);
              })
            )
          )
        );
        return results.filter((result) => !result).length;
      }),
    ]);

    if (n > 0) {
      const fail = battleFail + coopFail;
      if (fail > 0) {
        showBanner(BannerLevel.Warn, t("loaded_n_results_fail_failed", { n, fail }));
      } else {
        showBanner(BannerLevel.Success, t("loaded_n_results", { n }));
      }

      await loadResults(20, true);
    }
  };

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (refreshing) {
      return;
    }
    if (loadedAll) {
      return;
    }
    const overHeight = event.nativeEvent.contentSize.height - Dimensions.get("window").height;
    if (overHeight >= 0 && event.nativeEvent.contentOffset.y - 80 > overHeight) {
      onLoadMorePress();
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
  const onPrivacyPolicyPress = async () => {
    await WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/Privacy-Policy");
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
      const res3 = await getSessionToken(res2.url, res.cv);
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
      if (autoRefresh) {
        await onAutoRefreshPress();
      }
      setFilterOptions(undefined);
      setFilter(undefined);
      setTotal(0);
      setCount(0);
      setResults(undefined);
      setFriends(undefined);
      setVoting(undefined);
      await Promise.all([
        clearSessionToken(),
        clearBulletToken(),
        clearIcon(),
        clearCatalogLevel(),
        clearLevel(),
        clearRank(),
        clearSplatZonesXPower(),
        clearTowerControlXPower(),
        clearRainmakerXPower(),
        clearClamBlitzXPower(),
        clearGrade(),
        Database.clear(),
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
        setBulletToken(newBulletToken);
      }

      const equipments = equipmentsAttempt || (await fetchEquipments(newBulletToken, language));
      return equipments;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
  };
  const onChangeFilterPress = (filter?: Database.FilterProps) => {
    setFilter(filter);
  };
  const onLoadMorePress = async () => {
    if (loadedAll) {
      return;
    }
    await loadResults(results!.length + 20, true);
  };
  const onLoadMoreSelected = async (key: TimeRange) => {
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
        num = await Database.count(filter, dayjs().utc().startOf("quarter").valueOf());
        break;
      case TimeRange.AllResults:
        num = count;
        break;
    }
    await loadResults(num, true);
  };
  const onImportPress = () => {
    setImport(true);
  };
  const onImportClose = () => {
    setImport(false);
  };
  const onFaqPress = async () => {
    await WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay#faqs");
  };
  const onImportContinuePress = async () => {
    setImporting(true);
    let uri = "";
    let success = false;
    try {
      const doc = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (doc.type !== "success") {
        setImporting(false);
        return;
      }
      uri = doc.uri;

      setRefreshing(true);
      const result = JSON.parse(await FileSystem.readAsStringAsync(uri));
      const n = result["battles"].length + result["coops"].length;
      showBanner(BannerLevel.Info, t("loading_n_results", { n }));
      const battleExisted = await Promise.all(
        result["battles"].map((battle: VsHistoryDetailResult) =>
          Database.isExist(battle.vsHistoryDetail!.id)
        )
      );
      const coopExisted = await Promise.all(
        result["coops"].map((coop: CoopHistoryDetailResult) =>
          Database.isExist(coop.coopHistoryDetail!.id)
        )
      );
      const newBattles = result["battles"].filter((_, i: number) => !battleExisted[i]);
      const newCoops = result["coops"].filter((_, i: number) => !coopExisted[i]);
      const skip = n - (newBattles.length + newCoops.length);
      let fail = 0;
      for (const battle of newBattles) {
        const result = await ok(Database.addBattle(battle));
        if (!result) {
          fail++;
        }
      }
      for (const coop of newCoops) {
        const result = await ok(Database.addCoop(coop));
        if (!result) {
          fail++;
        }
      }
      if (fail > 0 && skip > 0) {
        showBanner(
          BannerLevel.Warn,
          t("loaded_n_results_fail_failed_skip_skipped", { n, fail, skip })
        );
      } else if (fail > 0) {
        showBanner(BannerLevel.Warn, t("loaded_n_results_fail_failed", { n, fail }));
      } else if (skip > 0) {
        showBanner(BannerLevel.Success, t("loaded_n_results_skip_skipped", { n, skip }));
      } else {
        showBanner(BannerLevel.Success, t("loaded_n_results", { n }));
      }

      // Query stored latest results if updated.
      if (n - fail - skip > 0) {
        await loadResults(20, true);
      }
      success = true;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setRefreshing(false);
    setImporting(false);
    if (success) {
      setImport(false);
    }
  };
  const onExportPress = async () => {
    setExporting(true);
    const uri = FileSystem.cacheDirectory + "conch-bay-export.json";
    try {
      const battles: VsHistoryDetailResult[] = [];
      const coops: CoopHistoryDetailResult[] = [];
      const records = await Database.queryAll(false);
      records.forEach((record) => {
        if (record.mode === "salmon_run") {
          coops.push(JSON.parse(record.detail) as CoopHistoryDetailResult);
        } else {
          battles.push(JSON.parse(record.detail) as VsHistoryDetailResult);
        }
      });

      const result = { battles, coops };
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(result), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(uri, { UTI: "public.json" });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setExporting(false);
  };
  const onUpdatePress = async () => {
    await WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/releases");
  };
  const onSupportPress = () => {
    setSupport(true);
  };
  const onSupportClose = () => {
    if (!loggingIn && !clearingCache && !preloadingResources) {
      setSupport(false);
    }
  };
  const onAlternativeLogInPress = async () => {
    try {
      setLoggingIn(true);
      await setSessionToken(await Clipboard.getStringAsync());
      setLoggingIn(false);
      setLogIn(false);
      setLogOut(false);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      setLoggingIn(false);
    }
  };
  const onGameLanguageSelected = async (language: string) => {
    if (language === t("lang")) {
      await clearLanguage();
    } else {
      await setLanguage(language);
    }
  };
  const onChangeDisplayLanguagePress = async () => {
    await Linking.openSettings();
  };
  const onClearCachePress = async () => {
    setClearingCache(true);
    try {
      await Image.clearDiskCache();
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setClearingCache(false);
  };
  const onPreloadResourcesPress = async () => {
    setPreloadingResources(true);
    try {
      // Preload images from saved results.
      const resources = new Map<string, string>();
      const records = await Database.queryAll(true);
      records.forEach((record) => {
        if (record.mode === "salmon_run") {
          const coop = JSON.parse(record.detail) as CoopHistoryDetailResult;
          const stage = convertStageImageUrl(coop.coopHistoryDetail!.coopStage);
          resources.set(getImageCacheKey(stage), stage);

          [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults].forEach(
            (memberResult) => {
              // Weapons.
              memberResult.weapons
                .filter((weapon) => !isImageExpired(weapon.image.url))
                .forEach((weapon) => {
                  resources.set(getImageCacheKey(weapon.image.url), weapon.image.url);
                });
              if (
                memberResult.specialWeapon &&
                !isImageExpired(memberResult.specialWeapon.image.url)
              ) {
                resources.set(
                  getImageCacheKey(memberResult.specialWeapon.image.url),
                  memberResult.specialWeapon.image.url
                );
              }

              // Work suits.
              if (!isImageExpired(memberResult.player.uniform.image.url)) {
                resources.set(
                  getImageCacheKey(memberResult.player.uniform.image.url),
                  memberResult.player.uniform.image.url
                );
              }

              // Splashtags.
              if (!isImageExpired(memberResult.player.nameplate!.background.image.url)) {
                resources.set(
                  getImageCacheKey(memberResult.player.nameplate!.background.image.url),
                  memberResult.player.nameplate!.background.image.url
                );
              }
              memberResult.player.nameplate!.badges.forEach((badge) => {
                if (badge && !isImageExpired(badge.image.url)) {
                  resources.set(getImageCacheKey(badge.image.url), badge.image.url);
                }
              });
            }
          );
        } else {
          const battle = JSON.parse(record.detail) as VsHistoryDetailResult;
          const stage = convertStageImageUrl(battle.vsHistoryDetail!.vsStage);
          resources.set(getImageCacheKey(stage), stage);

          [battle.vsHistoryDetail!.myTeam, ...battle.vsHistoryDetail!.otherTeams].forEach(
            (team) => {
              team.players.forEach((player) => {
                // Weapons.
                if (!isImageExpired(player.weapon.image2d.url)) {
                  resources.set(
                    getImageCacheKey(player.weapon.image2d.url),
                    player.weapon.image2d.url
                  );
                }
                if (!isImageExpired(player.weapon.subWeapon.image.url)) {
                  resources.set(
                    getImageCacheKey(player.weapon.subWeapon.image.url),
                    player.weapon.subWeapon.image.url
                  );
                }
                if (!isImageExpired(player.weapon.specialWeapon.image.url)) {
                  resources.set(
                    getImageCacheKey(player.weapon.specialWeapon.image.url),
                    player.weapon.specialWeapon.image.url
                  );
                }

                // Gears.
                [player.headGear, player.clothingGear, player.shoesGear].forEach((gear) => {
                  if (!isImageExpired(gear.originalImage.url)) {
                    resources.set(getImageCacheKey(gear.originalImage.url), gear.originalImage.url);
                  }
                  if (!isImageExpired(gear.brand.image.url)) {
                    resources.set(getImageCacheKey(gear.brand.image.url), gear.brand.image.url);
                  }
                  if (!isImageExpired(gear.primaryGearPower.image.url)) {
                    resources.set(
                      getImageCacheKey(gear.primaryGearPower.image.url),
                      gear.primaryGearPower.image.url
                    );
                  }
                  gear.additionalGearPowers
                    .filter((gearPower) => !isImageExpired(gearPower.image.url))
                    .forEach((gearPower) => {
                      resources.set(getImageCacheKey(gearPower.image.url), gearPower.image.url);
                    });
                });

                // Splashtags.
                if (!isImageExpired(player.nameplate!.background.image.url)) {
                  resources.set(
                    getImageCacheKey(player.nameplate!.background.image.url),
                    player.nameplate!.background.image.url
                  );
                }
                player.nameplate!.badges.forEach((badge) => {
                  if (badge && !isImageExpired(badge.image.url)) {
                    resources.set(getImageCacheKey(badge.image.url), badge.image.url);
                  }
                });
              });
            }
          );
        }
      });

      // Attempt to preload weapon images from API.
      let newBulletToken = "";
      let weaponRecordsAttempt: WeaponRecordResult | undefined;
      if (bulletToken.length > 0) {
        try {
          weaponRecordsAttempt = await fetchWeaponRecords(bulletToken);
          newBulletToken = bulletToken;
        } catch {
          /* empty */
        }
      }

      // Regenerate bullet token if necessary.
      if (!newBulletToken) {
        newBulletToken = await generateBulletToken();
        setBulletToken(newBulletToken);
      }

      // Preload weapon, equipments, badge images from API.
      const [weaponRecords, equipments, summary] = await Promise.all([
        weaponRecordsAttempt || fetchWeaponRecords(newBulletToken),
        fetchEquipments(newBulletToken),
        fetchSummary(newBulletToken),
      ]);
      weaponRecords.weaponRecords.nodes.forEach((record) => {
        resources.set(getImageCacheKey(record.image2d.url), record.image2d.url);
        resources.set(getImageCacheKey(record.subWeapon.image.url), record.subWeapon.image.url);
        resources.set(
          getImageCacheKey(record.specialWeapon.image.url),
          record.specialWeapon.image.url
        );
      });
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
      summary.playHistory.allBadges.forEach((badge) => {
        resources.set(getImageCacheKey(badge.image.url), badge.image.url);
      });

      // Preload images.
      // HACK: add a hashtag do not break the URL. Here the cache key will be appended after the hashtag.
      Image.prefetch(Array.from(resources).map((resource) => `${resource[1]}#${resource[0]}`));
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setPreloadingResources(false);
  };
  const onCreateAGithubIssuePress = async () => {
    await Linking.openURL("https://github.com/zhxie/conch-bay/issues/new");
  };
  const onSendAMailPress = async () => {
    await Linking.openURL("mailto:conch-bay@outlook.com");
  };
  const onCopySessionTokenPress = async () => {
    if (sessionToken.length > 0) {
      await Clipboard.setStringAsync(sessionToken);
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
  const onSplatoon3InkPress = async () => {
    await WebBrowser.openBrowserAsync("https://splatoon3.ink/");
  };
  const onIminkFApiPress = async () => {
    await WebBrowser.openBrowserAsync("https://github.com/imink-app/f-API");
  };
  const onNintendoAppVersionsPress = async () => {
    await WebBrowser.openBrowserAsync("https://github.com/nintendoapis/nintendo-app-versions");
  };
  const onOssLicensesPress = async () => {
    await WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/OSS-Licenses");
  };
  const onSourceCodeRepositoryPress = async () => {
    await WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay");
  };
  const onAutoRefreshPress = async () => {
    if (!autoRefresh) {
      showBanner(BannerLevel.Info, t("auto_refresh_enabled"));
      await activateKeepAwakeAsync();
    } else {
      showBanner(BannerLevel.Info, t("auto_refresh_disabled"));
      await deactivateKeepAwake();
    }
    setAutoRefresh(!autoRefresh);
  };

  return (
    <VStack flex style={theme.backgroundStyle}>
      <Animated.View style={[ViewStyles.f, { opacity: fade }]}>
        {/* HACK: it is a little bit weird concentrating on result list. */}
        <ResultView
          results={sessionToken.length > 0 ? results : []}
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
              style={{ marginTop: 8, alignItems: "center" }}
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
                  <HStack style={{ marginRight: -4 }}>
                    {catalogLevel.length > 0 && (
                      <Badge
                        color={Color.AccentColor}
                        title={catalogLevel}
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
                    isEquipmentsAvailable={!!sessionToken}
                    onRefresh={onEquipmentsRefresh}
                  />
                )}
              </ScheduleView>
              {sessionToken.length > 0 &&
                (friends === undefined || friends.friends.nodes.length > 0) && (
                  <FriendView friends={friends} voting={voting} style={ViewStyles.mb4} />
                )}
              {sessionToken.length > 0 && (
                <FilterView
                  isDisabled={refreshing || loadingMore}
                  filter={filter}
                  options={filterOptions}
                  onChange={onChangeFilterPress}
                  style={ViewStyles.mb2}
                />
              )}
            </SafeAreaView>
          }
          footer={
            <SafeAreaView
              edges={["bottom", "left", "right"]}
              style={[ViewStyles.mb2, { alignItems: "center" }]}
            >
              {sessionToken.length > 0 && (
                <VStack style={[ViewStyles.mb4, ViewStyles.wf, ViewStyles.px4]}>
                  <Picker
                    isLoading={refreshing || loadingMore}
                    isLoadingText={t("loading_more")}
                    title={loadedAll ? t("loaded_all") : t("load_more")}
                    items={Object.values(TimeRange).map((range) => ({
                      key: range,
                      value: t(range),
                    }))}
                    header={
                      <VStack center>
                        <Marquee style={ViewStyles.mb2}>
                          {count === total
                            ? t("loaded_n_total_results", { n: results?.length ?? 0, total })
                            : t("loaded_n_filtered_total_filtered_results", {
                                n: results?.length ?? 0,
                                filtered: count,
                                total,
                              })}
                        </Marquee>
                      </VStack>
                    }
                    style={[
                      (results?.length ?? 0) <= 20 && !loadedAll && ViewStyles.mb2,
                      results === undefined || results.length > 0 ? ViewStyles.rt0 : ViewStyles.rt2,
                      ViewStyles.rb2,
                      { height: 64 },
                      theme.territoryStyle,
                    ]}
                    textStyle={[TextStyles.h3, theme.textStyle]}
                    // HACK: forcly cast.
                    onSelected={onLoadMoreSelected as (_: string) => void}
                    onPress={onLoadMorePress}
                  />
                  {(results?.length ?? 0) <= 20 && !loadedAll && (
                    <HStack style={ViewStyles.c}>
                      <Icon
                        name="info"
                        size={14}
                        color={Color.MiddleTerritory}
                        style={ViewStyles.mr1}
                      />
                      <HStack style={ViewStyles.i}>
                        <Marquee style={TextStyles.subtle}>{t("load_more_notice")}</Marquee>
                      </HStack>
                    </HStack>
                  )}
                </VStack>
              )}
              {sessionToken.length > 0 && (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={[ViewStyles.mb4, ViewStyles.wf]}
                >
                  <HStack flex center style={ViewStyles.px4}>
                    <StatsView results={results} style={ViewStyles.mr2} />
                    <TrendsView results={results} style={ViewStyles.mr2} />
                    <ToolButton
                      icon="download"
                      title={t("import")}
                      style={ViewStyles.mr2}
                      onPress={onImportPress}
                    />
                    <ToolButton
                      isLoading={exporting}
                      isLoadingText={t("exporting")}
                      icon="upload"
                      title={t("export")}
                      onPress={onExportPress}
                    />
                  </HStack>
                </ScrollView>
              )}
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
          onScrollEndDrag={onScrollEndDrag}
        />
        {sessionToken.length > 0 && (
          <FloatingActionButton
            size={50}
            color={autoRefresh ? Color.AccentColor : undefined}
            icon="refresh-cw"
            onPress={onAutoRefreshPress}
          />
        )}
      </Animated.View>
      <Modal isVisible={logIn} onClose={onLogInClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Icon
            name="alert-circle"
            size={48}
            color={Color.MiddleTerritory}
            style={ViewStyles.mb4}
          />
          <Text style={ViewStyles.mb4}>{t("log_in_notice")}</Text>
          <VStack style={ViewStyles.wf}>
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
              isLoading={loggingIn}
              isLoadingText={t("logging_in")}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onLogInContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("log_in_continue")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={logOut} onClose={onLogOutClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Icon
            name="alert-circle"
            size={48}
            color={Color.MiddleTerritory}
            style={ViewStyles.mb4}
          />
          <Text style={ViewStyles.mb4}>{t("log_out_notice")}</Text>
          <VStack style={ViewStyles.wf}>
            <Button
              isDisabled={refreshing}
              isLoading={loggingIn}
              isLoadingText={t("logging_in")}
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={theme.reverseTextStyle}
              onPress={onLogInContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("relog_in")}</Marquee>
            </Button>
            <Button
              isDisabled={loggingIn || refreshing || loadingMore || exporting}
              isLoading={loggingOut}
              isLoadingText={t("logging_out")}
              style={ViewStyles.danger}
              textStyle={theme.reverseTextStyle}
              onPress={onLogOutContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("log_out_continue")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={import_} onClose={onImportClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Icon name="download" size={48} color={Color.MiddleTerritory} style={ViewStyles.mb4} />
          <Text style={ViewStyles.mb4}>{t("import_notice")}</Text>
          <VStack style={ViewStyles.wf}>
            <Button
              style={[
                ViewStyles.mb2,
                { borderColor: Color.AccentColor, borderWidth: 1.5 },
                theme.backgroundStyle,
              ]}
              onPress={onFaqPress}
            >
              <Marquee>{t("faq")}</Marquee>
            </Button>
            <Button
              isDisabled={refreshing && !importing}
              isLoading={importing}
              isLoadingText={t("importing")}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onImportContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={support} onClose={onSupportClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Icon name="help-circle" size={48} color={Color.MiddleTerritory} style={ViewStyles.mb4} />
          {sessionToken.length === 0 && (
            <VStack style={[ViewStyles.mb4, ViewStyles.wf]}>
              <VStack center>
                <Text style={ViewStyles.mb2}>{t("alternative_log_in_notice")}</Text>
              </VStack>
              <Button
                isDisabled={refreshing}
                isLoading={loggingIn}
                isLoadingText={t("logging_in")}
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onAlternativeLogInPress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("log_in_with_session_token")}</Marquee>
              </Button>
            </VStack>
          )}
          <VStack style={[ViewStyles.mb4, ViewStyles.wf]}>
            <VStack center>
              <Text style={ViewStyles.mb2}>{t("language_notice")}</Text>
            </VStack>
            <Picker
              isDisabled={refreshing}
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
          </VStack>
          {sessionToken.length > 0 && (
            <VStack style={[ViewStyles.mb4, ViewStyles.wf]}>
              <VStack center>
                <Text style={ViewStyles.mb2}>{t("relog_in_notice")}</Text>
              </VStack>
              <Button
                isDisabled={refreshing}
                isLoading={loggingIn}
                isLoadingText={t("logging_in")}
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onLogInContinuePress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("relog_in")}</Marquee>
              </Button>
            </VStack>
          )}
          {sessionToken.length > 0 && (
            <VStack style={[ViewStyles.mb4, ViewStyles.wf]}>
              <VStack center>
                <Text style={ViewStyles.mb2}>{t("resource_notice")}</Text>
              </VStack>
              <Button
                isLoading={clearingCache}
                isLoadingText={t("clearing_cache")}
                style={[ViewStyles.accent, ViewStyles.mb2]}
                textStyle={theme.reverseTextStyle}
                onPress={onClearCachePress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("clear_cache")}</Marquee>
              </Button>
              <Button
                isLoading={preloadingResources}
                isLoadingText={t("preloading_resources")}
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onPreloadResourcesPress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("preload_resources")}</Marquee>
              </Button>
            </VStack>
          )}
          <VStack style={[sessionToken.length > 0 && ViewStyles.mb4, ViewStyles.wf]}>
            <VStack center>
              <Text style={ViewStyles.mb2}>{t("feedback_notice")}</Text>
            </VStack>
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCreateAGithubIssuePress}>
              <Marquee style={theme.reverseTextStyle}>{t("create_a_github_issue")}</Marquee>
            </Button>
            <Button style={ViewStyles.accent} onPress={onSendAMailPress}>
              <Marquee style={theme.reverseTextStyle}>{t("send_a_mail")}</Marquee>
            </Button>
          </VStack>
          {sessionToken.length > 0 && (
            <VStack style={ViewStyles.wf}>
              <VStack center>
                <Text style={ViewStyles.mb2}>{t("debug_notice")}</Text>
              </VStack>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCopySessionTokenPress}>
                <Marquee style={theme.reverseTextStyle}>{t("copy_session_token")}</Marquee>
              </Button>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCopyBulletTokenPress}>
                <Marquee style={theme.reverseTextStyle}>{t("copy_bullet_token")}</Marquee>
              </Button>
              <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
                <Marquee style={theme.reverseTextStyle}>{t("export_database")}</Marquee>
              </Button>
            </VStack>
          )}
        </VStack>
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
              image={{
                uri: "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/1afd1450a5a5ebec",
                cacheKey: "1afd1450a5a5ebec",
              }}
              onPress={async () => {
                await WebBrowser.openBrowserAsync("https://weibo.com/u/2269567390");
              }}
              style={ViewStyles.mr2}
            />
            <AvatarButton
              size={48}
              image={{
                uri: "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/4b98d8291ae60b8c",
                cacheKey: "4b98d8291ae60b8c",
              }}
              onPress={async () => {
                await WebBrowser.openBrowserAsync("https://weibo.com/u/6622470330");
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
            <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onNintendoAppVersionsPress}>
              Nintendo app versions
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
      <Modal isVisible={firstAid} style={ViewStyles.modal1d}>
        <VStack center>
          <Icon name="life-buoy" size={48} color={Color.MiddleTerritory} style={ViewStyles.mb4} />
          <Text style={ViewStyles.mb4}>{t("first_aid_notice")}</Text>
          <VStack style={ViewStyles.wf}>
            <Button
              isLoading={exporting}
              isLoadingText={t("exporting")}
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={theme.reverseTextStyle}
              onPress={onExportPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("export_results")}</Marquee>
            </Button>
            <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
              <Marquee style={theme.reverseTextStyle}>{t("export_database")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
    </VStack>
  );
};

export default MainView;
