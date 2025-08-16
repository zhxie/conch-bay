import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAppState } from "@react-native-community/hooks";
import dayjs from "dayjs";
import { reloadAppAsync } from "expo";
import * as Application from "expo-application";
import { BlurView } from "expo-blur";
import * as Clipboard from "expo-clipboard";
import * as DevClient from "expo-dev-client";
import { registerDevMenuItems } from "expo-dev-menu";
// TODO: migrate to expo-file-system/next.
import * as FileSystem from "expo-file-system";
import { Image } from "expo-image";
import * as IntentLauncher from "expo-intent-launcher";
import { activateKeepAwakeAsync, deactivateKeepAwake } from "expo-keep-awake";
import * as Linking from "expo-linking";
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
  Linking as RNLinking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Platform,
  RefreshControl,
  ScrollView,
  useWindowDimensions,
} from "react-native";
import { useMMKV } from "react-native-mmkv";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { zip } from "react-native-zip-archive";
import semver from "semver";
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
import {
  CoopHistoryDetailResult,
  DetailVotingStatusResult,
  FriendListResult,
  Schedules,
  Shop,
  VsHistoryDetailResult,
} from "../models/types";
import {
  fetchAnarchyBattleHistories,
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
  fetchXBattleHistories,
  generateLogIn,
  getBulletToken,
  getSessionToken,
  getWebServiceToken,
  updateSplatnetVersion,
  WebServiceToken,
} from "../utils/api";
import {
  isBackgroundTaskRegistered,
  registerBackgroundTask,
  unregisterBackgroundTask,
} from "../utils/background";
import { decode64String, decode64Url, deepCopy, encode64String } from "../utils/codec";
import * as Database from "../utils/database";
import {
  AsyncStorageKey,
  Key,
  Tip,
  useBooleanMmkv,
  useMmkv,
  useNumberMmkv,
  useStringMmkv,
} from "../utils/mmkv";
import { ok, sleep } from "../utils/promise";
import { Brief } from "../utils/stats";
import { getUserIconCacheSource } from "../utils/ui";
import FilterView from "./FilterView";
import FriendView from "./FriendView";
import GearsView from "./GearsView";
import ImportView from "./ImportView";
import ResultView from "./ResultView";
import RotationsView from "./RotationsView";
import ScheduleView from "./ScheduleView";
import ShopView from "./ShopView";
import SplatNetView, { SplatNetViewRef } from "./SplatNetView";
import StatsView from "./StatsView";
import TrendsView from "./TrendsView";
import XView from "./XView";

let enableDevelopmentBuildResultRefreshing = false;

const devMenuItems = [
  {
    name: "Enable Result Refreshing",
    callback: () => {
      enableDevelopmentBuildResultRefreshing = true;
    },
  },
  {
    name: "Invalidate Bullet Token",
    callback: () => {
      const storage = useMMKV();
      const token = storage.getString(Key.SessionToken) ?? "";
      storage.set(Key.SessionToken, token.split("").reverse().join(""));
      // HACK: reload to refresh.
      reloadAppAsync();
    },
  },
  {
    name: "Invalidate Web Service Token",
    callback: () => {
      const storage = useMMKV();
      const text = storage.getString(Key.WebServiceToken) ?? "{}";
      const token: WebServiceToken = JSON.parse(text);
      if (token.accessToken) {
        token.accessToken = token.accessToken.split("").reverse().join("");
      }
      storage.set(Key.SessionToken, JSON.stringify(token));
      // HACK: reload to refresh.
      reloadAppAsync();
    },
  },
  {
    name: "Remove Latest Result",
    callback: async () => {
      const result = await Database.queryBrief();
      await Database.remove(result[0].id);
    },
  },
];
registerDevMenuItems(devMenuItems);

enum TimeRange {
  Today = "today",
  ThisWeek = "this_week",
  ThisMonth = "this_month",
  ThisSeason = "this_season",
  AllResults = "all_results",
}

let autoRefreshTimeout: NodeJS.Timeout | undefined;

const MainView = () => {
  const appState = useAppState();
  const url = Linking.useURL();

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
  const [logInWithMudmouth, setLogInWithMudmouth] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshingGears, setRefreshingGears] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [support, setSupport] = useState(false);
  const [clearingCache, setClearingCache] = useState(false);
  const [clearingDatabase, setClearingDatabase] = useState(false);
  const [debug, setDebug] = useState(false);
  const [notification, setNotification] = useState(false);
  const [acknowledgments, setAcknowledgments] = useState(false);
  const [welcomeTip, setWelcomeTip] = useState(false);
  const [mudmouthTip, setMudmouthTip] = useState(false);
  const [fault, setFault] = useState<Error>();

  const [sessionToken, setSessionToken, clearSessionToken, sessionTokenReady] = useStringMmkv(
    Key.SessionToken,
  );
  const [webServiceToken, setWebServiceToken, clearWebServiceToken, webServiceTokenReady] =
    useMmkv<WebServiceToken>(Key.WebServiceToken);
  const [bulletToken, setBulletToken, clearBulletToken, bulletTokenReady] = useStringMmkv(
    Key.BulletToken,
  );
  const [language, setLanguage, clearLanguage, languageReady] = useStringMmkv(
    Key.Language,
    t("lang"),
  );

  const [icon, setIcon, clearIcon] = useStringMmkv(Key.Icon);
  const [level, setLevel, clearLevel] = useStringMmkv(Key.Level);
  const [rank, setRank, clearRank] = useStringMmkv(Key.Rank);
  const [splatZonesXPower, setSplatZonesXPower, clearSplatZonesXPower] = useStringMmkv(
    Key.SplatZonesXPower,
  );
  const [towerControlXPower, setTowerControlXPower, clearTowerControlXPower] = useStringMmkv(
    Key.TowerControlXPower,
  );
  const [rainmakerXPower, setRainmakerXPower, clearRainmakerXPower] = useStringMmkv(
    Key.RainmakerXPower,
  );
  const [clamBlitzXPower, setClamBlitzXPower, clearClamBlitzXPower] = useStringMmkv(
    Key.ClamBlitzXPower,
  );
  const [grade, setGrade, clearGrade] = useStringMmkv(Key.Grade);
  const [playedTime, setPlayedTime, clearPlayedTime] = useNumberMmkv(Key.PlayedTime);

  const [mudmouth, setMudmouth, clearMudmouth, mudmouthReady] = useBooleanMmkv(Key.Mudmouth, false);

  const [filter, setFilter, clearFilter, filterReady] = useMmkv<Database.FilterProps>(Key.Filter);
  const filterRef = useRef(filter);
  const [backgroundRefresh, setBackgroundRefresh, clearBackgroundRefresh] = useBooleanMmkv(
    Key.BackgroundRefresh,
  );
  const [salmonRunFriendlyMode, setSalmonRunFriendlyMode, clearSalmonRunFriendlyMode] =
    useBooleanMmkv(Key.SalmonRunFriendlyMode);
  const [autoRefresh, setAutoRefresh, clearAutoRefresh] = useBooleanMmkv(Key.AutoRefresh, false);
  const [migrated, setMigrated, , migratedReady] = useBooleanMmkv(Key.Migrated, false);
  const [tips, setTips, , tipsReady] = useMmkv<string[]>(Key.Tips);

  const [apiUpdated, setApiUpdated] = useState(false);
  const [schedules, setSchedules] = useState<Schedules>();
  const [shop, setShop] = useState<Shop>();
  const [friends, setFriends] = useState<FriendListResult>();
  const [voting, setVoting] = useState<DetailVotingStatusResult>();
  const [briefs, setBriefs] = useState<Brief[]>();
  const [count, setCount] = useState(20);
  const [filtered, setFiltered] = useState(0);
  const [total, setTotal] = useState(0);
  const [players, setPlayers] = useState<Record<string, string>>();
  const [filterOptions, setFilterOptions] = useState<Database.FilterProps>();

  const showedBriefs = useMemo(() => briefs?.slice(0, count), [briefs, count]);

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

  const splatNetViewRef = useRef<SplatNetViewRef>(null);

  useEffect(() => {
    if (
      sessionTokenReady &&
      webServiceTokenReady &&
      bulletTokenReady &&
      languageReady &&
      mudmouthReady &&
      filterReady &&
      migratedReady
    ) {
      (async () => {
        try {
          // Migrate async storage.
          if (!migrated) {
            // HACK: not all fields are migrated for convenience and clear installation.
            const [
              sessionToken,
              language,
              playedTime,
              backgroundRefresh,
              salmonRunFriendlyMode,
              autoRefresh,
            ] = await AsyncStorage.multiGet([
              AsyncStorageKey.SessionToken,
              AsyncStorageKey.Language,
              AsyncStorageKey.PlayedTime,
              AsyncStorageKey.BackgroundRefresh,
              AsyncStorageKey.SalmonRunFriendlyMode,
              AsyncStorageKey.AutoRefresh,
            ]);
            if (sessionToken[1]) {
              setSessionToken(sessionToken[1]);
            }
            if (language[1]) {
              setLanguage(language[1]);
            }
            if (playedTime[1]) {
              setPlayedTime(parseInt(playedTime[1]));
            }
            if (backgroundRefresh[1]) {
              setBackgroundRefresh(backgroundRefresh[1] === "1");
            }
            if (salmonRunFriendlyMode[1]) {
              setSalmonRunFriendlyMode(salmonRunFriendlyMode[1] === "1");
            }
            if (autoRefresh[1]) {
              setAutoRefresh(autoRefresh[1] === "1");
            }
            setMigrated(true);
          }
          // Remove players filter since we do not have their names now.
          if (filter?.players) {
            const newFilter = deepCopy(filter);
            newFilter.players = [];
            setFilter(newFilter);
          }
          const upgrade = await Database.open();
          if (upgrade) {
            setUpgrade(true);
            await Database.upgrade();
            setUpgrade(false);
          }
          await loadBriefs();
          setReady(true);
        } catch (e) {
          setFault(new Error(`database corrupted: ${(e as Error).message}`));
        }
      })();
    }
  }, [
    sessionTokenReady,
    webServiceTokenReady,
    bulletTokenReady,
    languageReady,
    mudmouthReady,
    filterReady,
    migratedReady,
  ]);
  useEffect(() => {
    if (
      ready &&
      url &&
      url.startsWith(`conchbay${DevClient.isDevelopmentBuild() ? "dev" : ""}://refresh?`)
    ) {
      try {
        const encoded = new URL(url).searchParams.get("requestHeaders")!;
        const headers = decode64String(decode64Url(encoded)).split("\r\n");
        const headerMap = new Map<string, string>();
        for (const header of headers) {
          const components = header.split(":");
          headerMap.set(components[0], components.slice(1).join(":").trim());
        }
        const cookieMap = new Map<string, string>();
        const cookies = headerMap.get("Cookie")?.split(";") ?? [];
        for (const cookie of cookies) {
          const components = cookie.trim().split("=");
          cookieMap.set(components[0], components.slice(1).join("="));
        }
        const referer = headerMap.get("Referer") ?? "";
        const refererUrl = new URL(referer);
        setWebServiceToken({
          accessToken: cookieMap.get("_gtoken") ?? "",
          country: refererUrl.searchParams.get("na_country")!,
          language: refererUrl.searchParams.get("na_lang")!,
        });
      } catch (e) {
        showBanner(BannerLevel.Error, t("failed_to_acquire_web_service_token", { error: e }));
      }
    }
  }, [ready, url]);
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
          const current = Application.nativeApplicationVersion!;
          ok(
            fetchReleaseVersion().then((version) => {
              if (semver.compare(version.replace("v", ""), current) > 0) {
                setUpdate(true);
              }
            }),
          );
        }, 100);
      });
    }
  }, [ready]);
  useEffect(() => {
    if (ready && tipsReady) {
      if (!tips?.includes(Tip.Welcome)) {
        setWelcomeTip(true);
        const newTips = tips ?? [];
        newTips.push(Tip.Welcome);
        setTips(newTips);
        return;
      }
      if (!tips.includes(Tip.Mudmouth) && Platform.OS === "ios" && sessionToken) {
        setMudmouthTip(true);
        const newTips = tips;
        newTips.push(Tip.Mudmouth);
        setTips(newTips);
        return;
      }
    }
  }, [ready, tipsReady]);
  useEffect(() => {
    if (ready) {
      // HACK: avoid animation racing.
      setTimeout(refresh, 100);
    }
  }, [sessionToken]);
  useEffect(() => {
    filterRef.current = filter;
    if (ready) {
      loadBriefs();
    }
  }, [filter]);
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
            if (webServiceToken) {
              await refreshResults(webServiceToken, bulletToken, true);
            } else {
              throw new Error("empty web service token");
            }
          } catch {
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
            loadBriefs();
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

  const loadBriefs = async () => {
    setLoadingMore(true);
    const records = await Database.queryBrief(filterRef.current);
    const briefs: Brief[] = [];
    for (const record of records) {
      if (record.mode === "salmon_run") {
        briefs.push({ coop: JSON.parse(record.brief) });
      } else {
        briefs.push({ battle: JSON.parse(record.brief) });
      }
    }
    setBriefs(briefs);
    setCount(20);
    // Read total and filter options on loading new results.
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
    setLoadingMore(false);
  };
  const updatePlayedTime = async () => {
    const time = await Database.queryLatestTime();
    if (time !== undefined) {
      if (playedTime !== time) {
        setPlayedTime(time);
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
      await updateSplatnetVersion()
        .then(() => {
          setApiUpdated(true);
        })
        .catch((e) => {
          showBanner(BannerLevel.Warn, t("failed_to_check_api_update", { error: e }));
        });
    }

    // Attempt to acquire bullet token from web service token.
    if (webServiceToken) {
      const newBulletToken = await getBulletToken(webServiceToken, language).catch(() => undefined);
      if (newBulletToken) {
        setBulletToken(newBulletToken);
        return { webServiceToken, bulletToken: newBulletToken };
      }
    }

    // If Mudmouth is enabled, acquire web service token from Mudmouth.
    if (mudmouth) {
      RNLinking.openURL(
        `mudmouth://capture?name=Conch%20Bay${DevClient.isDevelopmentBuild() ? "%20%28Dev%29" : ""}`,
      );
      throw new Error(t("reacquiring_tokens_with_mudmouth"));
    }

    // Acquire both web service token and bullet token.
    const newWebServiceToken = await getWebServiceToken(sessionToken).catch((e) => {
      throw new Error(t("failed_to_acquire_web_service_token", { error: e }));
    });
    setWebServiceToken(newWebServiceToken);
    const newBulletToken = await getBulletToken(newWebServiceToken, language).catch((e) => {
      throw new Error(t("failed_to_acquire_bullet_token", { error: e }));
    });
    setBulletToken(newBulletToken);

    return { webServiceToken: newWebServiceToken, bulletToken: newBulletToken };
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
          // Avoid refresh in development build by default.
          if (!enableDevelopmentBuildResultRefreshing && DevClient.isDevelopmentBuild()) {
            return;
          }
          if (sessionToken) {
            // Attempt to friends.
            let newWebServiceToken: WebServiceToken | undefined = undefined;
            let newBulletToken = "";
            let friendsAttempt: FriendListResult | undefined;
            if (apiUpdated && webServiceToken && bulletToken.length > 0) {
              try {
                friendsAttempt = await fetchFriends(webServiceToken, bulletToken, language);
                setFriends(friendsAttempt);
                newWebServiceToken = webServiceToken;
                newBulletToken = bulletToken;
              } catch {
                /* empty */
              }
            }

            // Regenerate bullet token if necessary.
            if (!newBulletToken) {
              const res = await generateBulletToken();
              newWebServiceToken = res.webServiceToken;
              newBulletToken = res.bulletToken;
            }

            // Fetch friends, voting, summary and results.
            await Promise.all([
              friendsAttempt ||
                fetchFriends(newWebServiceToken!, newBulletToken, language)
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
                      newWebServiceToken!,
                      newBulletToken,
                      language,
                      splatfests.festRecords.nodes[0].id,
                    )
                      .then((voting) => {
                        setVoting(voting);
                      })
                      .catch((e) => {
                        showBanner(
                          BannerLevel.Warn,
                          t("failed_to_load_friends_splatfest_voting", { error: e }),
                        );
                      });
                  }
                })
                .catch((e) => {
                  showBanner(BannerLevel.Warn, t("failed_to_check_splatfest", { error: e }));
                }),
              fetchSummary(newWebServiceToken!, newBulletToken, language)
                .then(async (summary) => {
                  const icon = summary.currentPlayer.userIcon.url;
                  const level = String(summary.playHistory.rank);
                  const rank = summary.playHistory.udemae;
                  await Promise.all([setIcon(icon), setRank(rank), setLevel(level)]);
                })
                .catch((e) => {
                  showBanner(BannerLevel.Warn, t("failed_to_load_summary", { error: e }));
                }),
              ok(refreshResults(newWebServiceToken!, newBulletToken, false)),
            ]);
          }
        })(),
      ]);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }
    setRefreshing(false);
  };
  const refreshResults = async (
    webServiceToken: WebServiceToken,
    bulletToken: string,
    latestOnly: boolean,
  ) => {
    // Fetch results.
    let n = -1;
    let throwable = 0;
    let error: Error | undefined;
    const [battleFail, coopFail] = await Promise.all([
      Promise.all([
        latestOnly ? fetchLatestBattleHistories(webServiceToken, bulletToken, language) : undefined,
      ])
        .then(async ([latestBattleHistories]) => {
          // Fetch more battle histories if needed.
          const ids: string[] = [];
          let [skipRegular, skipAnarchy, skipX, skipChallenge, skipPrivate] = [
            false,
            false,
            false,
            false,
            false,
          ];
          if (latestBattleHistories) {
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
            [skipRegular, skipAnarchy, skipX, skipChallenge, skipPrivate] = await Promise.all([
              regularId ? Database.isExist(regularId) : false,
              anarchyId ? Database.isExist(anarchyId) : false,
              // X matches have X powers which should also be updated.
              xId && latestOnly ? Database.isExist(xId) : false,
              challengeId ? Database.isExist(challengeId) : false,
              privateId ? Database.isExist(privateId) : false,
            ]);
          }
          const [
            regularBattleHistories,
            anarchyBattleHistories,
            xBattleHistories,
            challengeHistories,
            privateBattleHistories,
          ] = await Promise.all([
            skipRegular
              ? undefined
              : fetchRegularBattleHistories(webServiceToken, bulletToken, language),
            skipAnarchy
              ? undefined
              : fetchAnarchyBattleHistories(webServiceToken, bulletToken, language),
            skipX
              ? undefined
              : fetchXBattleHistories(webServiceToken, bulletToken, language).then(
                  (historyDetail) => {
                    setSplatZonesXPower(
                      historyDetail.xBattleHistories.summary.xPowerAr?.lastXPower?.toString() ?? "",
                    );
                    setTowerControlXPower(
                      historyDetail.xBattleHistories.summary.xPowerLf?.lastXPower?.toString() ?? "",
                    );
                    setRainmakerXPower(
                      historyDetail.xBattleHistories.summary.xPowerGl?.lastXPower?.toString() ?? "",
                    );
                    setClamBlitzXPower(
                      historyDetail.xBattleHistories.summary.xPowerCl?.lastXPower?.toString() ?? "",
                    );
                    return historyDetail;
                  },
                ),
            skipChallenge
              ? undefined
              : fetchChallengeHistories(webServiceToken, bulletToken, language),
            skipPrivate
              ? undefined
              : fetchPrivateBattleHistories(webServiceToken, bulletToken, language),
          ]);

          // Fetch details.
          regularBattleHistories?.regularBattleHistories.historyGroups.nodes.forEach(
            (historyGroup) =>
              historyGroup.historyDetails.nodes.forEach((historyDetail) =>
                ids.push(historyDetail.id),
              ),
          );
          anarchyBattleHistories?.bankaraBattleHistories.historyGroups.nodes.forEach(
            (historyGroup) =>
              historyGroup.historyDetails.nodes.forEach((historyDetail) =>
                ids.push(historyDetail.id),
              ),
          );
          xBattleHistories?.xBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
            historyGroup.historyDetails.nodes.forEach((historyDetail) =>
              ids.push(historyDetail.id),
            ),
          );
          challengeHistories?.eventBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
            historyGroup.historyDetails.nodes.forEach((historyDetail) =>
              ids.push(historyDetail.id),
            ),
          );
          privateBattleHistories?.privateBattleHistories.historyGroups.nodes.forEach(
            (historyGroup) =>
              historyGroup.historyDetails.nodes.forEach((historyDetail) =>
                ids.push(historyDetail.id),
              ),
          );

          const uniqueIds = ids.filter((id, i, ids) => ids.indexOf(id) === i);
          const existed = await Promise.all(uniqueIds.map(Database.isExist));
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
              sleep(i * 750)
                .then(() => fetchVsHistoryDetail(webServiceToken, bulletToken, language, id))
                .then((detail) => Database.addBattle(detail))
                .catch((e) => {
                  if (!error) {
                    error = e;
                  }
                  results += 1;
                }),
            ),
          );
          return results;
        })
        .catch((e) => {
          throwable += 1;
          showBanner(BannerLevel.Warn, t("failed_to_load_battle_results", { error: e }));
          return 0;
        }),
      fetchCoopResult(webServiceToken, bulletToken, language)
        .then(async (coopResult) => {
          setGrade(coopResult.coopResult.regularGrade.id);

          // Fetch details.
          const ids: string[] = [];
          coopResult.coopResult.historyGroups.nodes.forEach((historyGroup) => {
            historyGroup.historyDetails.nodes.forEach((historyDetail) => {
              ids.push(historyDetail.id);
            });
          });

          const existed = await Promise.all(ids.map(Database.isExist));
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
              sleep(i * 750)
                .then(() => fetchCoopHistoryDetail(webServiceToken, bulletToken, language, id))
                .then((detail) => Database.addCoop(detail))
                .catch((e) => {
                  if (!error) {
                    error = e;
                  }
                  results += 1;
                }),
            ),
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
        showBanner(BannerLevel.Warn, t("loaded_n_results_failed", { n, fail, error }));
      } else {
        showBanner(BannerLevel.Success, t("loaded_n_results", { n }));
      }
    }
    const updated = await updatePlayedTime();
    if (n > 0 || updated) {
      await loadBriefs();
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
  const onFilterPlayer = (id: string, name: string) => {
    let newFilter: Database.FilterProps;
    if (!filter) {
      newFilter = { players: [], modes: [], rules: [], stages: [], weapons: [] };
    } else {
      if (!filter.players) {
        filter.players = [];
      }
      newFilter = deepCopy(filter);
    }
    newFilter.players!.push(id);
    setFilter(newFilter);
    if (players?.[id] !== name) {
      const newPlayers = deepCopy(players ?? {});
      newPlayers[id] = name;
      setPlayers(newPlayers);
    }
  };
  const onQuery = (id: string) => {
    const record = Database.queryDetail(id);
    if (record) {
      if (record.mode === "salmon_run") {
        return { coop: JSON.parse(record.detail) };
      } else {
        return { battle: JSON.parse(record.detail) };
      }
    }
  };
  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    // HACK: onScrollToTop has a delay, use onScroll instead.
    if (event.nativeEvent.contentOffset.y < 8) {
      onScrollEnd(event);
    }
    if (loadingMore || allResultsShown) {
      return;
    }
    const overHeight =
      event.nativeEvent.contentOffset.y + height - event.nativeEvent.contentSize.height;
    if (overHeight > 80) {
      onShowMorePress();
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
  const onUpdateDismiss = () => {
    setUpdate(false);
  };
  const onGoToAppStore = () => {
    RNLinking.openURL("https://apps.apple.com/us/app/conch-bay/id1659268579");
  };
  const onGoToGooglePlay = () => {
    IntentLauncher.startActivityAsync("android.intent.action.VIEW", {
      data: "https://play.google.com/store/apps/details?id=name.sketch.conch_bay",
      packageName: "com.android.vending",
    });
  };
  const onReleaseNotesPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/releases/latest");
  };
  const onLogInPress = () => {
    setLogIn(true);
  };
  const onLogInDismiss = () => {
    setLogIn(false);
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
      setSessionToken(res3);

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
        setSessionToken(await Clipboard.getStringAsync());
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
  const onLogOutDismiss = () => {
    setLogOut(false);
  };
  const onLogOutContinuePress = async () => {
    try {
      setLoggingOut(true);
      setFriends(undefined);
      setVoting(undefined);
      await Promise.all([
        clearSessionToken(),
        clearWebServiceToken(),
        clearBulletToken(),
        clearAutoRefresh(),
        clearMudmouth(),
        clearIcon(),
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
        isBackgroundTaskRegistered().then(async (res) => {
          if (res) {
            await unregisterBackgroundTask();
          }
        }),
      ]);
      setLoggingOut(false);
      setLogOut(false);
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      setLoggingOut(false);
    }
  };
  const onLogInWithMudmouthPress = () => {
    setLogInWithMudmouth(true);
  };
  const onLogInWithMudmouthDismiss = () => {
    setLogInWithMudmouth(false);
  };
  const onInstallMudmouthPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/Mudmouth/wiki/Join-the-Beta-Version");
  };
  const onAddMudmouthProfilePress = () => {
    RNLinking.openURL(
      `mudmouth://add?name=Conch%20Bay${
        DevClient.isDevelopmentBuild() ? "%20%28Dev%29" : ""
      }&url=https%3A%2F%2Fapi.lp1.av5ja.srv.nintendo.net%2Fapi%2Fbullet_tokens&preAction=1&preActionUrlScheme=com.nintendo.znca%3A%2F%2Fznca%2Fgame%2F4834290508791808&postAction=1&postActionUrlScheme=conchbay${
        DevClient.isDevelopmentBuild() ? "dev" : ""
      }%3A%2F%2Frefresh`,
    );
  };
  const onLogInWithMudmouthContinuePress = () => {
    if (!mudmouth) {
      setMudmouth(true);
    } else {
      setMudmouth(false);
    }
  };
  const onSplatNetPress = () => {
    splatNetViewRef.current?.open();
  };
  const onChangeFilterPress = (filter?: Database.FilterProps) => {
    if (filter) {
      setFilter(filter);
    } else {
      clearFilter();
    }
  };
  const onShowMorePress = () => {
    if (allResultsShown) {
      return;
    }
    setCount(count + 20);
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
          dayjs().utc().startOf("quarter").subtract(1, "month").valueOf(),
        );
        break;
      case TimeRange.AllResults:
        num = filtered;
        break;
    }
    setCount(num);
  };
  const onRefreshGears = async () => {
    try {
      setRefreshingGears(true);
      const equipments = await fetchEquipments(webServiceToken!, bulletToken, language)
        .then((equipments) => {
          return equipments;
        })
        .catch((e) => {
          showBanner(BannerLevel.Warn, t("failed_to_load_gears", { error: e }));
          return undefined;
        });
      setRefreshingGears(false);
      return equipments;
    } catch (e) {
      setRefreshingGears(false);
      showBanner(BannerLevel.Error, e);
    }
  };
  const onGetWebServiceToken = async () => {
    // Update versions.
    if (!apiUpdated) {
      await updateSplatnetVersion()
        .then(() => {
          setApiUpdated(true);
        })
        .catch((e) => {
          showBanner(BannerLevel.Warn, t("failed_to_check_api_update", { error: e }));
        });
    }

    // Attempt to acquire bullet token from web service token.
    try {
      await getBulletToken(webServiceToken!, language);
      return webServiceToken;
    } catch (e) {
      showBanner(BannerLevel.Error, t("failed_to_acquire_bullet_token", { error: e }));
      return undefined;
    }
  };
  const onImportBegin = () => {
    setRefreshing(true);
    activateKeepAwakeAsync("import");
  };
  const onImportResults = async (
    battles: VsHistoryDetailResult[],
    coops: CoopHistoryDetailResult[],
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
      battles.map((battle: VsHistoryDetailResult) => Database.isExist(battle.vsHistoryDetail!.id)),
    );
    const coopExisted = await Promise.all(
      coops.map((coop: CoopHistoryDetailResult) => Database.isExist(coop.coopHistoryDetail!.id)),
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
          }),
      ),
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
          }),
      ),
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
      await loadBriefs();
    }
    deactivateKeepAwake("import");
    setRefreshing(false);
  };
  const onExportPress = async () => {
    setExporting(true);
    const dir = FileSystem.cacheDirectory + "conch-bay-export";
    const uri = FileSystem.cacheDirectory + "conch-bay-export.zip";
    try {
      await FileSystem.makeDirectoryAsync(dir, { intermediates: true });
      await Promise.all([
        FileSystem.makeDirectoryAsync(`${dir}/battles`, { intermediates: true }),
        FileSystem.makeDirectoryAsync(`${dir}/coops`, { intermediates: true }),
      ]);
      const battleDuplicate = new Map<number, number>();
      const coopDuplicate = new Map<number, number>();
      for await (const row of Database.queryDetailEach()) {
        const time = row.time / 1000;
        if (row.mode === "salmon_run") {
          const sequence = (coopDuplicate.get(time) ?? 0) + 1;
          coopDuplicate.set(time, sequence);
          await FileSystem.writeAsStringAsync(
            `${dir}/coops/${time}${sequence ? `-${sequence}` : ""}.json`,
            row.detail,
          );
        } else {
          const sequence = (battleDuplicate.get(time) ?? 0) + 1;
          battleDuplicate.set(time, sequence);
          await FileSystem.writeAsStringAsync(
            `${dir}/battles/${time}${sequence > 1 ? `-${sequence}` : ""}.json`,
            row.detail,
          );
        }
      }
      await zip(dir, uri);

      await Sharing.shareAsync(uri, { UTI: "public.zip-archive" });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    await Promise.all([
      FileSystem.deleteAsync(uri, { idempotent: true }),
      FileSystem.deleteAsync(dir, { idempotent: true }),
    ]);
    setExporting(false);
  };
  const onSupportPress = () => {
    setSupport(true);
  };
  const onSupportDismiss = () => {
    setSupport(false);
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
  const onBackgroundRefreshPress = async () => {
    if (backgroundRefresh) {
      const registered = await isBackgroundTaskRegistered();
      if (registered) {
        await unregisterBackgroundTask();
      }
      clearBackgroundRefresh();
    } else {
      switch ((await Notifications.getPermissionsAsync()).status) {
        case ModulesCore.PermissionStatus.GRANTED:
          await onNotificationContinue();
          break;
        case ModulesCore.PermissionStatus.DENIED:
        case ModulesCore.PermissionStatus.UNDETERMINED:
          setNotification(true);
          break;
      }
    }
  };
  const onSalmonRunFriendlyModePress = () => {
    if (salmonRunFriendlyMode) {
      clearSalmonRunFriendlyMode();
    } else {
      setSalmonRunFriendlyMode(true);
    }
  };
  const onGameLanguageSelected = (language: string) => {
    if (language === t("lang")) {
      clearLanguage();
    } else {
      setLanguage(language);
    }
  };
  const onChangeDisplayLanguagePress = () => {
    RNLinking.openSettings();
  };
  const onClearCachePress = async () => {
    setClearingCache(true);
    await Image.clearDiskCache();
    setClearingCache(false);
  };
  const onReadConchBayWikiPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki");
  };
  const onSendAMailPress = async () => {
    if (await MailComposer.isAvailableAsync()) {
      MailComposer.composeAsync({
        recipients: ["conch-bay@outlook.com"],
        body: `> ${t("feedback_notice")}


        > ${t("version")}
        ${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})
        `,
      });
    } else {
      RNLinking.openURL("mailto:conch-bay@outlook.com");
    }
  };
  const onJoinDiscordServerPress = () => {
    RNLinking.openURL("https://discord.gg/JfZJ6xzRZC");
  };
  const onJoinTheBetaVersionPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/Join-the-Beta-Version");
  };
  const onClearDatabasePress = async () => {
    setClearingDatabase(true);
    await Database.clear();
    clearPlayedTime();
    await loadBriefs();
    setClearingDatabase(false);
    setSupport(false);
  };
  const onDebugPress = () => {
    setDebug(true);
  };
  const onCopySessionTokenPress = async () => {
    if (sessionToken.length > 0) {
      await Clipboard.setStringAsync(sessionToken);
      showBanner(BannerLevel.Info, t("copied_to_clipboard"));
    }
  };
  const onCopyWebServiceTokenPress = async () => {
    if (webServiceToken) {
      await Clipboard.setStringAsync(webServiceToken.accessToken);
      showBanner(BannerLevel.Info, t("copied_to_clipboard"));
    }
  };
  const onCopyBulletTokenPress = async () => {
    if (bulletToken.length > 0) {
      await Clipboard.setStringAsync(bulletToken);
      showBanner(BannerLevel.Info, t("copied_to_clipboard"));
    }
  };
  const onExportConfiguration = async () => {
    const uri = FileSystem.documentDirectory + "mmkv/mmkv.default";
    try {
      await Sharing.shareAsync(uri, { UTI: "public.database" });
    } catch (e) {
      showBanner(BannerLevel.Error, e);
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
  const onNotificationDismiss = () => {
    setNotification(false);
  };
  const onNotificationContinue = async () => {
    await Notifications.requestPermissionsAsync();
    setBackgroundRefresh(true);
    await registerBackgroundTask().catch((e) => {
      showBanner(BannerLevel.Warn, t("failed_to_enable_background_refresh", { error: e }));
    });
    setNotification(false);
  };
  const onAcknowledgmentsPress = () => {
    setAcknowledgments(true);
  };
  const onAcknowledgmentsDismiss = () => {
    setAcknowledgments(false);
  };
  const onSplatoon3InkPress = () => {
    WebBrowser.openBrowserAsync("https://splatoon3.ink/");
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
  const onSendouInkPress = () => {
    WebBrowser.openBrowserAsync("https://sendou.ink/");
  };
  const onSplatTopPress = () => {
    WebBrowser.openBrowserAsync("https://splat.top/");
  };
  const onOssLicensesPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay/wiki/OSS-Licenses");
  };
  const onSourceCodeRepositoryPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay");
  };
  const onWelcomeTipDismiss = () => {
    setWelcomeTip(false);
  };
  const oMudmouthTipDismiss = () => {
    setMudmouthTip(false);
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
            briefs={showedBriefs}
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
                      onLongPress={onSplatNetPress}
                      style={ViewStyles.mb2}
                    />
                    {/* HACK: withdraw 4px margin in the last badge. */}
                    <HStack
                      style={[
                        ViewStyles.c,
                        {
                          marginRight: -ViewStyles.mr1.marginRight,
                          marginBottom: -ViewStyles.mb1.marginBottom,
                        },
                        { flexWrap: "wrap" },
                      ]}
                    >
                      {level.length > 0 && (
                        <Badge
                          color={Color.RegularBattle}
                          title={level}
                          style={[ViewStyles.mr1, ViewStyles.mb1]}
                        />
                      )}
                      {rank.length > 0 && (
                        <Badge
                          color={Color.AnarchyBattle}
                          title={rank}
                          style={[ViewStyles.mr1, ViewStyles.mb1]}
                        />
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
                          style={[ViewStyles.mr1, ViewStyles.mb1]}
                        />
                      )}
                      {grade.length > 0 && (
                        <Badge
                          color={Color.SalmonRun}
                          title={t(grade)}
                          style={[ViewStyles.mr1, ViewStyles.mb1]}
                        />
                      )}
                    </HStack>
                  </VStack>
                )}
                <ScheduleView schedules={schedules} style={ViewStyles.mb4}>
                  {shop && <ShopView shop={shop} />}
                </ScheduleView>
                {sessionToken.length > 0 &&
                  (friends === undefined || friends.friends.nodes.length > 0) && (
                    <FriendView friends={friends} voting={voting} style={ViewStyles.mb4} />
                  )}
                <FilterView
                  disabled={loadingMore}
                  filter={filter}
                  players={players}
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
                            ? t("n_results_showed", { n: count, total })
                            : t("n_filtered_results_showed", {
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
                    <StatsView disabled={refreshingGears} briefs={briefs} style={ViewStyles.mr2} />
                    <TrendsView disabled={refreshingGears} briefs={briefs} style={ViewStyles.mr2} />
                    <RotationsView
                      disabled={refreshingGears}
                      briefs={briefs}
                      style={ViewStyles.mr2}
                    />
                    {sessionToken.length > 0 && (
                      <GearsView
                        disabled={refreshingGears}
                        onPress={onRefreshGears}
                        style={ViewStyles.mr2}
                      />
                    )}
                    {sessionToken.length > 0 && (
                      <SplatNetView
                        ref={splatNetViewRef}
                        disabled={refreshingGears}
                        lang={language}
                        style={ViewStyles.mr2}
                        onGetWebServiceToken={onGetWebServiceToken}
                      />
                    )}
                    <ImportView
                      disabled={refreshingGears}
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
                      <Text style={TextStyles.subtle}>{`${t(
                        Platform.OS === "ios" ? "CFBundleDisplayName" : "app_name",
                        {
                          // HACK: cannot trust Application.applicationName in iOS since it will not
                          // return localized application name.
                          defaultValue: Application.applicationName,
                        },
                      )} ${Application.nativeApplicationVersion} (${
                        Application.nativeBuildVersion
                      })`}</Text>
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
            filterDisabled={loadingMore}
            onFilterPlayer={onFilterPlayer}
            onQuery={onQuery}
            onScroll={onScroll}
            onScrollBeginDrag={onScrollBegin}
            onScrollEndDrag={onScrollEnd}
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
        <Modal isVisible={update} size="medium" allowDismiss onDismiss={onUpdateDismiss}>
          <Dialog icon="sparkles" text={t("update_notice")}>
            {Platform.OS === "ios" && (
              <Button
                style={[ViewStyles.mb2, ViewStyles.accent]}
                textStyle={theme.reverseTextStyle}
                onPress={onGoToAppStore}
              >
                <Marquee style={theme.reverseTextStyle}>{t("go_to_app_store")}</Marquee>
              </Button>
            )}
            {Platform.OS === "android" && (
              <Button
                style={[ViewStyles.mb2, ViewStyles.accent]}
                textStyle={theme.reverseTextStyle}
                onPress={onGoToGooglePlay}
              >
                <Marquee style={theme.reverseTextStyle}>{t("go_to_google_play")}</Marquee>
              </Button>
            )}
            <Button
              style={[{ borderColor: Color.AccentColor, borderWidth: 1.5 }, theme.backgroundStyle]}
              onPress={onReleaseNotesPress}
            >
              <Marquee>{t("release_notes")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
        <Modal isVisible={logIn} size="medium" allowDismiss={!loggingIn} onDismiss={onLogInDismiss}>
          <CustomDialog icon="circle-alert">
            <Text
              style={[
                ViewStyles.mb2,
                ViewStyles.p1,
                ViewStyles.r2,
                {
                  borderWidth: 2,
                  borderColor: Color.Special,
                  backgroundColor: `${Color.Special}1f`,
                  overflow: "hidden",
                },
              ]}
            >
              {t("log_in_warning")}
            </Text>
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
        <Modal
          isVisible={logOut}
          size="medium"
          allowDismiss={!loggingIn && !loggingOut}
          onDismiss={onLogOutDismiss}
        >
          <CustomDialog icon="circle-alert">
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
                style={[Platform.OS === "ios" && ViewStyles.mb2, ViewStyles.accent]}
                textStyle={theme.reverseTextStyle}
                onPress={onAlternativeLogInPress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("relog_in_with_session_token")}</Marquee>
              </Button>
              {Platform.OS === "ios" && (
                <Button
                  disabled={refreshing}
                  loading={loggingIn}
                  loadingText={t("logging_in")}
                  style={ViewStyles.accent}
                  textStyle={theme.reverseTextStyle}
                  onPress={onLogInWithMudmouthPress}
                >
                  <Marquee style={theme.reverseTextStyle}>{t("relog_in_with_mudmouth")}</Marquee>
                </Button>
              )}
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
          <Modal
            isVisible={logInWithMudmouth}
            size="medium"
            allowDismiss
            onDismiss={onLogInWithMudmouthDismiss}
          >
            <CustomDialog icon="globe-lock">
              <DialogSection text={t("mudmouth_notice")}>
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  textStyle={theme.reverseTextStyle}
                  onPress={onInstallMudmouthPress}
                >
                  <Marquee style={theme.reverseTextStyle}>{t("install_mudmouth")}</Marquee>
                </Button>
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  textStyle={theme.reverseTextStyle}
                  onPress={onAddMudmouthProfilePress}
                >
                  <Marquee style={theme.reverseTextStyle}>{t("add_mudmouth_profile")}</Marquee>
                </Button>
                <Button
                  style={ViewStyles.accent}
                  textStyle={theme.reverseTextStyle}
                  onPress={onLogInWithMudmouthContinuePress}
                >
                  <Marquee style={theme.reverseTextStyle}>
                    {t("log_in_with_mudmouth", { enable: mudmouth ? t("enable") : t("disable") })}
                  </Marquee>
                </Button>
              </DialogSection>
            </CustomDialog>
          </Modal>
        </Modal>
        <Modal
          isVisible={support}
          size="medium"
          allowDismiss={!clearingCache && !clearingDatabase}
          onDismiss={onSupportDismiss}
        >
          <CustomDialog icon="circle-help">
            <DialogSection text={t("preference_notice")} style={ViewStyles.mb4}>
              {sessionToken.length > 0 && (
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  textStyle={theme.reverseTextStyle}
                  onPress={onAutoRefreshPress}
                >
                  <Marquee style={theme.reverseTextStyle}>
                    {t("auto_refresh", {
                      enable: autoRefresh ? t("enable") : t("disable"),
                    })}
                  </Marquee>
                </Button>
              )}
              {sessionToken.length > 0 && (
                <Button
                  style={[ViewStyles.mb2, ViewStyles.accent]}
                  textStyle={theme.reverseTextStyle}
                  onPress={onBackgroundRefreshPress}
                >
                  <Marquee style={theme.reverseTextStyle}>
                    {t("background_refresh", {
                      enable: backgroundRefresh ? t("enable") : t("disable"),
                    })}
                  </Marquee>
                </Button>
              )}
              <Button
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onSalmonRunFriendlyModePress}
              >
                <Marquee style={theme.reverseTextStyle}>
                  {t("salmon_run_friendly_mode", {
                    enable: salmonRunFriendlyMode ? t("enable") : t("disable"),
                  })}
                </Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("language_notice")} style={ViewStyles.mb4}>
              <Picker
                disabled={refreshing}
                title={t("change_game_language", { language: t(language) })}
                items={[
                  { key: "de-DE", value: t("de-DE") },
                  { key: "en-GB", value: t("en-GB") },
                  { key: "en-US", value: t("en-US") },
                  { key: "es-ES", value: t("es-ES") },
                  { key: "es-MX", value: t("es-MX") },
                  { key: "fr-CA", value: t("fr-CA") },
                  { key: "fr-FR", value: t("fr-FR") },
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
                  {t("change_display_language", { language: t(t("lang")) })}
                </Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("resource_notice")} style={ViewStyles.mb4}>
              <Button
                loading={clearingCache}
                loadingText={t("clearing_cache")}
                style={ViewStyles.accent}
                textStyle={theme.reverseTextStyle}
                onPress={onClearCachePress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("clear_cache")}</Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("feedback_notice")} style={ViewStyles.mb4}>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onReadConchBayWikiPress}>
                <Marquee style={theme.reverseTextStyle}>{t("read_conch_bay_wiki")}</Marquee>
              </Button>
              <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onSendAMailPress}>
                <Marquee style={theme.reverseTextStyle}>{t("send_a_mail")}</Marquee>
              </Button>
              <Button
                style={[ViewStyles.mb2, ViewStyles.accent]}
                onPress={onJoinDiscordServerPress}
              >
                <Marquee style={theme.reverseTextStyle}>{t("join_discord_server")}</Marquee>
              </Button>
              <Button style={ViewStyles.accent} onPress={onJoinTheBetaVersionPress}>
                <Marquee style={theme.reverseTextStyle}>{t("join_the_beta_version")}</Marquee>
              </Button>
            </DialogSection>
            <DialogSection text={t("database_notice")} style={ViewStyles.mb4}>
              <Button
                disabled={refreshing || loadingMore || exporting}
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
              {!debug && (
                <Button
                  style={ViewStyles.accent}
                  textStyle={theme.reverseTextStyle}
                  onLongPress={onDebugPress}
                >
                  <Marquee style={theme.reverseTextStyle}>{t("enable_debugging")}</Marquee>
                </Button>
              )}
              {debug && (
                <VStack>
                  {sessionToken.length > 0 && (
                    <VStack style={ViewStyles.mb2}>
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
                        <Marquee style={theme.reverseTextStyle}>
                          {t("copy_web_service_token")}
                        </Marquee>
                      </Button>
                      <Button style={ViewStyles.accent} onPress={onCopyBulletTokenPress}>
                        <Marquee style={theme.reverseTextStyle}>{t("copy_bullet_token")}</Marquee>
                      </Button>
                    </VStack>
                  )}
                  <Button
                    style={[ViewStyles.mb2, ViewStyles.accent]}
                    textStyle={theme.reverseTextStyle}
                    onPress={onExportConfiguration}
                  >
                    <Marquee style={theme.reverseTextStyle}>{t("export_configuration")}</Marquee>
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
          isVisible={notification}
          size="medium"
          allowDismiss
          onDismiss={onNotificationDismiss}
        >
          <Dialog icon="bell-dot" text={t("notification_notice")}>
            <Button style={ViewStyles.accent} onPress={onNotificationContinue}>
              <Marquee style={theme.reverseTextStyle}>{t("ok")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
        <Modal
          isVisible={acknowledgments}
          size="medium"
          allowDismiss
          onDismiss={onAcknowledgmentsDismiss}
        >
          <VStack center style={ViewStyles.mb3}>
            <Marquee style={[TextStyles.h3, ViewStyles.mb2]}>{t("creators")}</Marquee>
            <HStack center>
              <AvatarButton
                size={48}
                image={getUserIconCacheSource(
                  "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/1afd1450a5a5ebec",
                )}
                onPress={() => {
                  WebBrowser.openBrowserAsync("https://weibo.com/u/2269567390");
                }}
                style={ViewStyles.mr2}
              />
              <AvatarButton
                size={48}
                image={getUserIconCacheSource(
                  "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/4b98d8291ae60b8c",
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
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onNxapiZncaApiPress}>
                nxapi znca API
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onNintendoAppVersionsPress}>
                Nintendo app versions
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onSplat3Press}>
                splat3
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onSendouInkPress}>
                sendou.ink
              </Text>
              <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onSplatTopPress}>
                splat.top
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
        <Modal isVisible={welcomeTip} size="medium" allowDismiss onDismiss={onWelcomeTipDismiss}>
          <Dialog icon="smile" text={t("welcome_tip")}>
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onReadConchBayWikiPress}>
              <Marquee style={theme.reverseTextStyle}>{t("read_conch_bay_wiki")}</Marquee>
            </Button>
            <Button
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onJoinDiscordServerPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("join_discord_server")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
        <Modal isVisible={mudmouthTip} size="medium" allowDismiss onDismiss={oMudmouthTipDismiss}>
          <Dialog icon="smile" text={t("mudmouth_tip")}>
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onReadConchBayWikiPress}>
              <Marquee style={theme.reverseTextStyle}>{t("read_conch_bay_wiki")}</Marquee>
            </Button>
            <Button
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onJoinDiscordServerPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("join_discord_server")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
      </VStack>
    </SalmonRunSwitcherContext.Provider>
  );
};

export default MainView;
