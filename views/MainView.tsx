import * as Application from "expo-application";
import { CacheManager } from "expo-cached-image";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import { activateKeepAwake, deactivateKeepAwake } from "expo-keep-awake";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Linking,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  useColorScheme,
} from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Avatar,
  AvatarButton,
  Badge,
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
} from "../components";
import t from "../i18n";
import {
  CoopHistoryDetail,
  Friends,
  Schedules,
  VsHistoryDetail,
  WeaponRecords,
} from "../models/types";
import {
  fetchBattleHistories,
  fetchCatalog,
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchFriends,
  fetchEquipments,
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
} from "../utils/api";
import * as Database from "../utils/database";
import { useAsyncStorage } from "../utils/hooks";
import { ok } from "../utils/promise";
import { convertStageImageUrl, getImageCacheKey, getUserIconCacheSource } from "../utils/ui";
import FilterView from "./FilterView";
import FriendView from "./FriendView";
import ResultView from "./ResultView";
import ScheduleView from "./ScheduleView";
import StatsView from "./StatsView";

let autoRefreshTimeout: NodeJS.Timeout | undefined;

const MainView = () => {
  const colorScheme = useColorScheme();
  const backgroundStyle = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const insets = useSafeAreaInsets();

  const [ready, setReady] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
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
  const [language, setLanguage, _, languageReady] = useAsyncStorage("language", t("lang"));

  const [icon, setIcon, clearIcon] = useAsyncStorage("icon");
  const [catalogLevel, setCatalogLevel, clearCatalogLevel] = useAsyncStorage("catalogLevel");
  const [level, setLevel, clearLevel] = useAsyncStorage("level");
  const [rank, setRank, clearRank] = useAsyncStorage("rank");
  const [grade, setGrade, clearGrade] = useAsyncStorage("grade");

  const [apiUpdated, setApiUpdated] = useState(false);
  const [schedules, setSchedules] = useState<Schedules>();
  const [friends, setFriends] = useState<Friends>();
  const [results, setResults] =
    useState<{ battle?: VsHistoryDetail; coop?: CoopHistoryDetail }[]>();
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
          showToast(e);
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
      loadResults(20, true);
    }
  }, [filter]);
  useEffect(() => {
    if (ready) {
      clearTimeout(autoRefreshTimeout);
      if (autoRefresh && !refreshing) {
        autoRefreshTimeout = setTimeout(() => {
          refreshResults();
        }, 10000);
      }
    }
  }, [refreshing, autoRefresh, language]);

  const showToast = (e: any) => {
    if (e instanceof Error) {
      Toast.show(e.message);
    } else if (typeof e === "string") {
      Toast.show(e);
    }
  };

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
          coop: JSON.parse(record.detail) as CoopHistoryDetail,
        };
      }
      return { battle: JSON.parse(record.detail) as VsHistoryDetail };
    });
    if (results !== undefined && results.length >= 20 && length > results.length) {
      setResults((results ?? []).concat(details));
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
  const addBattle = async (battle: VsHistoryDetail) => {
    try {
      await Database.addBattle(battle);
      return true;
    } catch {
      return false;
    }
  };
  const addCoop = async (coop: CoopHistoryDetail) => {
    try {
      await Database.addCoop(coop);
      return true;
    } catch {
      return false;
    }
  };
  const generateBulletToken = async () => {
    if (bulletToken.length > 0) {
      showToast(t("reacquiring_tokens"));
    }

    const res = await getWebServiceToken(sessionToken);
    const newBulletToken = await getBulletToken(res.webServiceToken, res.country);

    await setBulletToken(newBulletToken);

    return newBulletToken;
  };
  const refresh = async () => {
    setRefreshing(true);
    try {
      // Fetch schedules.
      const schedules = await fetchSchedules();
      setSchedules(schedules);
      if (sessionToken) {
        // Attempt to friends.
        let newBulletToken = "";
        let friendsAttempt: Friends | undefined;
        if (bulletToken.length > 0) {
          try {
            friendsAttempt = await fetchFriends(bulletToken);
            newBulletToken = bulletToken;
          } catch {
            /* empty */
          }
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
            showToast(t("failed_to_check_api_update"));
          }
        }

        // Fetch friends, summary, catalog and results.
        const [friends, summary, catalog, battleHistories, coopResult] = await Promise.all([
          friendsAttempt || fetchFriends(newBulletToken),
          fetchSummary(newBulletToken),
          fetchCatalog(newBulletToken),
          fetchBattleHistories(newBulletToken),
          fetchCoopResult(newBulletToken),
        ]);
        setFriends(friends);
        const icon = summary.currentPlayer.userIcon.url;
        const catalogLevel = String(catalog.catalog.progress?.level ?? 0);
        const level = String(summary.playHistory.rank);
        const rank = summary.playHistory.udemae;
        await setIcon(icon);
        await setCatalogLevel(catalogLevel);
        await setLevel(level);
        await setRank(rank);
        if (coopResult.coopResult.regularGrade) {
          await setGrade(coopResult.coopResult.regularGrade.id);
        }

        // Fetch details.
        const results: {
          id: string;
          isCoop: boolean;
        }[] = [];
        battleHistories.regular.regularBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        battleHistories.anarchy.bankaraBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        battleHistories.x.xBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        battleHistories.private.privateBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        coopResult.coopResult.historyGroups.nodes.forEach((historyGroup) => {
          historyGroup.historyDetails.nodes.forEach((historyDetail) => {
            results.push({ id: historyDetail.id, isCoop: true });
          });
        });

        const existed = await Promise.all(results.map((result) => Database.isExist(result.id)));
        const newResults = results.filter((_, i) => !existed[i]);
        if (newResults.length > 0) {
          showToast(t("loading_n_results", { n: newResults.length }));
          const details = await Promise.all(
            newResults.map((result) => {
              if (!result.isCoop) {
                return fetchVsHistoryDetail(result.id, newBulletToken, language);
              }
              return fetchCoopHistoryDetail(result.id, newBulletToken, language);
            })
          );
          let fail = 0;
          for (let i = 0; i < newResults.length; i++) {
            let result: boolean;
            if (!newResults[i].isCoop) {
              result = await addBattle(details[i] as VsHistoryDetail);
            } else {
              result = await addCoop(details[i] as CoopHistoryDetail);
            }
            if (!result) {
              fail++;
            }
          }
          if (fail > 0) {
            showToast(t("loaded_n_results_fail_failed", { n: newResults.length, fail }));
          } else {
            showToast(t("loaded_n_results", { n: newResults.length }));
          }
        }

        await loadResults(20, true);
      }
    } catch (e) {
      showToast(e);
    }
    setRefreshing(false);
  };
  const refreshResults = async () => {
    setRefreshing(true);
    try {
      if (sessionToken) {
        // Fetch results.
        const [battleHistories, coopResult] = await Promise.all([
          fetchBattleHistories(bulletToken),
          fetchCoopResult(bulletToken),
        ]);

        // Fetch details.
        const results: {
          id: string;
          isCoop: boolean;
        }[] = [];
        battleHistories.regular.regularBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        battleHistories.anarchy.bankaraBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        battleHistories.x.xBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        battleHistories.private.privateBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            results.push({ id: historyDetail.id, isCoop: false })
          )
        );
        coopResult.coopResult.historyGroups.nodes.forEach((historyGroup) => {
          historyGroup.historyDetails.nodes.forEach((historyDetail) => {
            results.push({ id: historyDetail.id, isCoop: true });
          });
        });

        const existed = await Promise.all(results.map((result) => Database.isExist(result.id)));
        const newResults = results.filter((_, i) => !existed[i]);
        if (newResults.length > 0) {
          showToast(t("loading_n_results", { n: newResults.length }));
          const details = await Promise.all(
            newResults.map((result) => {
              if (!result.isCoop) {
                return fetchVsHistoryDetail(result.id, bulletToken, language);
              }
              return fetchCoopHistoryDetail(result.id, bulletToken, language);
            })
          );
          let fail = 0;
          for (let i = 0; i < newResults.length; i++) {
            let result: boolean;
            if (!newResults[i].isCoop) {
              result = await addBattle(details[i] as VsHistoryDetail);
            } else {
              result = await addCoop(details[i] as CoopHistoryDetail);
            }
            if (!result) {
              fail++;
            }
          }
          if (fail > 0) {
            showToast(t("loaded_n_results_fail_failed", { n: newResults.length, fail }));
          } else {
            showToast(t("loaded_n_results", { n: newResults.length }));
          }

          await loadResults(20, true);
        }
      }
    } catch (e) {
      await refresh();
    }
    setRefreshing(false);
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
    } catch (e) {
      showToast(e);
      setLoggingIn(false);
    }
  };
  const onLogOutPress = () => {
    setLogOut(true);
  };
  const onLogOutClose = () => {
    if (!loggingOut && !exporting) {
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
      await Promise.all([
        clearSessionToken(),
        clearBulletToken(),
        clearIcon(),
        clearCatalogLevel(),
        clearLevel(),
        clearRank(),
        clearGrade(),
        Database.clear(),
      ]);
      setLoggingOut(false);
      setLogOut(false);
    } catch (e) {
      showToast(e);
      setLoggingOut(false);
    }
  };
  const onChangeFilterPress = (filter?: Database.FilterProps) => {
    setFilter(filter);
  };
  const onLoadMorePress = async () => {
    await loadResults(results!.length + 20, true);
  };
  const onLoadAllPress = async () => {
    await loadResults(count, true);
  };
  const onImportPress = async () => {
    let uri = "";
    try {
      const doc = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (doc.type !== "success") {
        return;
      }
      uri = doc.uri;

      setRefreshing(true);
      const result = JSON.parse(await FileSystem.readAsStringAsync(uri));
      const n = result["battles"].length + result["coops"].length;
      showToast(t("loading_n_results", { n }));
      const battleExisted = await Promise.all(
        result["battles"].map((battle: VsHistoryDetail) =>
          Database.isExist(battle.vsHistoryDetail.id)
        )
      );
      const coopExisted = await Promise.all(
        result["coops"].map((coop: CoopHistoryDetail) =>
          Database.isExist(coop.coopHistoryDetail.id)
        )
      );
      const newBattles = result["battles"].filter((_, i: number) => !battleExisted[i]);
      const newCoops = result["coops"].filter((_, i: number) => !coopExisted[i]);
      const skip = n - (newBattles.length + newCoops.length);
      let fail = 0;
      for (const battle of newBattles) {
        const result = await addBattle(battle);
        if (!result) {
          fail++;
        }
      }
      for (const coop of newCoops) {
        const result = await addCoop(coop);
        if (!result) {
          fail++;
        }
      }
      if (fail > 0 && skip > 0) {
        showToast(t("loaded_n_results_fail_failed_skip_skipped", { n, fail, skip }));
      } else if (fail > 0) {
        showToast(t("loaded_n_results_fail_failed", { n, fail }));
      } else if (skip > 0) {
        showToast(t("loaded_n_results_skip_skipped", { n, skip }));
      } else {
        showToast(t("loaded_n_results", { n }));
      }

      // Query stored latest results if updated.
      if (n - fail - skip > 0) {
        await loadResults(20, true);
      }
    } catch (e) {
      showToast(e);
    }

    // Clean up.
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      showToast(e);
    }
    setRefreshing(false);
  };
  const onExportPress = async () => {
    setExporting(true);
    const uri = FileSystem.cacheDirectory + "conch-bay-export.json";
    try {
      const battles: VsHistoryDetail[] = [];
      const coops: CoopHistoryDetail[] = [];
      const records = await Database.queryAll(false);
      records.forEach((record) => {
        if (record.mode === "salmon_run") {
          coops.push(JSON.parse(record.detail) as CoopHistoryDetail);
        } else {
          battles.push(JSON.parse(record.detail) as VsHistoryDetail);
        }
      });

      const result = { battles, coops };
      await FileSystem.writeAsStringAsync(uri, JSON.stringify(result), {
        encoding: FileSystem.EncodingType.UTF8,
      });
      await Sharing.shareAsync(uri, { UTI: "public.json" });
    } catch (e) {
      showToast(e);
    }

    // Clean up.
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      showToast(e);
    }
    setExporting(false);
  };
  const onSupportPress = () => {
    setSupport(true);
  };
  const onSupportClose = () => {
    if (!preloadingResources) {
      setSupport(false);
    }
  };
  const onLanguageSelected = async (language: string) => {
    await setLanguage(language);
  };
  const onClearCachePress = async () => {
    setClearingCache(true);
    try {
      const files = await FileSystem.readDirectoryAsync(FileSystem.cacheDirectory!);
      for (const file of files) {
        try {
          await FileSystem.deleteAsync(`${FileSystem.cacheDirectory!}${file}`, {
            idempotent: true,
          });
        } catch {
          /* empty */
        }
      }
    } catch (e) {
      showToast(e);
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
          const coop = JSON.parse(record.detail) as CoopHistoryDetail;
          const stage = convertStageImageUrl(coop.coopHistoryDetail.coopStage);
          resources.set(getImageCacheKey(stage), stage);

          [coop.coopHistoryDetail.myResult, ...coop.coopHistoryDetail.memberResults].forEach(
            (memberResult) => {
              // Weapons.
              memberResult.weapons.forEach((weapon) => {
                resources.set(getImageCacheKey(weapon.image.url), weapon.image.url);
              });
              if (memberResult.specialWeapon) {
                resources.set(
                  getImageCacheKey(memberResult.specialWeapon.image.url),
                  memberResult.specialWeapon.image.url
                );
              }

              // Work suits.
              resources.set(
                getImageCacheKey(memberResult.player.uniform.image.url),
                memberResult.player.uniform.image.url
              );

              // Splashtags.
              resources.set(
                getImageCacheKey(memberResult.player.nameplate.background.image.url),
                memberResult.player.nameplate.background.image.url
              );
              memberResult.player.nameplate.badges.forEach((badge) => {
                if (badge) {
                  resources.set(getImageCacheKey(badge.image.url), badge.image.url);
                }
              });
            }
          );
        } else {
          const battle = JSON.parse(record.detail) as VsHistoryDetail;
          const stage = convertStageImageUrl(battle.vsHistoryDetail.vsStage);
          resources.set(getImageCacheKey(stage), stage);

          [battle.vsHistoryDetail.myTeam, ...battle.vsHistoryDetail.otherTeams].forEach((team) => {
            team.players.forEach((player) => {
              // Weapons.
              resources.set(getImageCacheKey(player.weapon.image2d.url), player.weapon.image2d.url);
              resources.set(
                getImageCacheKey(player.weapon.subWeapon.image.url),
                player.weapon.subWeapon.image.url
              );
              resources.set(
                getImageCacheKey(player.weapon.specialWeapon.image.url),
                player.weapon.specialWeapon.image.url
              );

              // Gears.
              [player.headGear, player.clothingGear, player.shoesGear].forEach((gear) => {
                resources.set(getImageCacheKey(gear.originalImage.url), gear.originalImage.url);
                resources.set(getImageCacheKey(gear.brand.image.url), gear.brand.image.url);
                resources.set(
                  getImageCacheKey(gear.primaryGearPower.image.url),
                  gear.primaryGearPower.image.url
                );
                gear.additionalGearPowers.forEach((gearPower) => {
                  resources.set(getImageCacheKey(gearPower.image.url), gearPower.image.url);
                });
              });

              // Splashtags.
              resources.set(
                getImageCacheKey(player.nameplate.background.image.url),
                player.nameplate.background.image.url
              );
              player.nameplate.badges.forEach((badge) => {
                if (badge) {
                  resources.set(getImageCacheKey(badge.image.url), badge.image.url);
                }
              });
            });
          });
        }
      });

      // Attempt to preload weapon images from API.
      let newBulletToken = "";
      let weaponRecordsAttempt: WeaponRecords | undefined;
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
      const resourcesArray = Array.from(resources);
      const resourcesInfo = await Promise.all(
        resourcesArray.map((resource) =>
          FileSystem.getInfoAsync(`${FileSystem.cacheDirectory}${resource[0]}`, { size: true })
        )
      );
      const newResources = resourcesArray.filter(
        // 67 bytes seems to be the smallest PNG size.
        (_, i) => !resourcesInfo[i].exists || (resourcesInfo[i].size ?? 0) < 68
      );
      await Promise.all(
        Array.from(newResources).map((resource) =>
          CacheManager.downloadAsync({ uri: resource[1], key: resource[0] })
        )
      );
    } catch (e) {
      showToast(e);
    }
    setPreloadingResources(false);
  };
  const onCreateAGithubIssuePress = async () => {
    await Linking.openURL("https://github.com/zhxie/conch-bay/issues/new");
  };
  const onCopySessionTokenPress = async () => {
    if (sessionToken.length > 0) {
      await Clipboard.setStringAsync(sessionToken);
    }
  };
  const onCopyBulletTokenPress = async () => {
    if (bulletToken.length > 0) {
      await Clipboard.setStringAsync(bulletToken);
    }
  };
  const onExportDatabasePress = async () => {
    const uri = FileSystem.documentDirectory + "SQLite/conch-bay.db";
    try {
      await Sharing.shareAsync(uri, { UTI: "public.database" });
    } catch (e) {
      showToast(e);
    }
  };
  const onAcknowledgmentsPress = () => {
    setAcknowledgments(true);
  };
  const onAcknowledgmentsClose = () => {
    setAcknowledgments(false);
  };
  const onSplatoon3InkPress = async () => {
    await Linking.openURL("https://splatoon3.ink/");
  };
  const onIminkFApiPress = async () => {
    await Linking.openURL("https://github.com/imink-app/f-API");
  };
  const onAutoRefreshPress = async () => {
    if (!autoRefresh) {
      showToast(t("auto_refresh_enabled"));
      await activateKeepAwake();
    } else {
      await deactivateKeepAwake();
    }
    setAutoRefresh(!autoRefresh);
  };

  return (
    <VStack flex style={backgroundStyle}>
      <Animated.View style={[ViewStyles.f, { opacity: fade }]}>
        {/* TODO: it is a little bit weird concentrating on result list. */}
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
            <SafeAreaView edges={["top", "left", "right"]} style={{ alignItems: "center" }}>
              {!sessionToken && (
                <Center flex style={[ViewStyles.px4, ViewStyles.mb4]}>
                  <Button style={ViewStyles.accent} onPress={onLogInPress}>
                    <Marquee style={reverseTextColor}>{t("log_in")}</Marquee>
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
                  <HStack>
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
                    {grade.length > 0 && <Badge color={Color.SalmonRun} title={t(grade)} />}
                  </HStack>
                </VStack>
              )}
              <ScheduleView schedules={schedules} style={ViewStyles.mb4} />
              {sessionToken.length > 0 &&
                (friends === undefined || friends.friends.nodes.length > 0) && (
                  <FriendView friends={friends} style={ViewStyles.mb4} />
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
            <SafeAreaView edges={["bottom", "left", "right"]} style={{ alignItems: "center" }}>
              {sessionToken.length > 0 && (
                <VStack style={[ViewStyles.mb4, ViewStyles.wf, ViewStyles.px4]}>
                  <Button
                    isDisabled={loadedAll}
                    isLoading={refreshing || loadingMore}
                    isLoadingText={t("loading_more")}
                    style={[
                      (results?.length ?? 0) > 40 && (results?.length ?? 0) <= 60 && ViewStyles.mb2,
                      results === undefined || results.length > 0 ? ViewStyles.rt0 : ViewStyles.rt2,
                      ViewStyles.rb2,
                      { height: 64 },
                    ]}
                    textStyle={TextStyles.h3}
                    onPress={onLoadMorePress}
                    onLongPress={onLoadAllPress}
                  >
                    <Marquee style={TextStyles.h3}>
                      {loadedAll ? t("loaded_all") : t("load_more")}
                    </Marquee>
                  </Button>
                  {(results?.length ?? 0) > 40 && (results?.length ?? 0) <= 60 && (
                    <HStack style={ViewStyles.c}>
                      <Icon
                        name="info"
                        size={14}
                        color={Color.MiddleTerritory}
                        style={ViewStyles.mr1}
                      />
                      <Text center style={TextStyles.subtle}>
                        {t("load_more_notice")}
                      </Text>
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
                    <StatsView
                      count={count}
                      total={total}
                      results={results}
                      style={ViewStyles.mr2}
                    />
                    <ToolButton
                      isLoading={false}
                      isLoadingText=""
                      isDisabled={refreshing}
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
                  <Text
                    style={TextStyles.subtle}
                  >{`${Application.applicationName} ${Application.nativeApplicationVersion} (${Application.nativeBuildVersion})`}</Text>
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
                backgroundStyle,
              ]}
              onPress={onPrivacyPolicyPress}
            >
              <Marquee>{t("privacy_policy")}</Marquee>
            </Button>
            <Button
              isLoading={loggingIn}
              isLoadingText={t("logging_in")}
              style={ViewStyles.accent}
              textStyle={reverseTextColor}
              onPress={onLogInContinuePress}
            >
              <Marquee style={reverseTextColor}>{t("log_in_continue")}</Marquee>
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
              textStyle={reverseTextColor}
              onPress={onLogInContinuePress}
            >
              <Marquee style={reverseTextColor}>{t("relog_in")}</Marquee>
            </Button>
            <Button
              isDisabled={loggingIn || refreshing || loadingMore || exporting}
              isLoading={loggingOut}
              isLoadingText={t("logging_out")}
              style={ViewStyles.danger}
              textStyle={reverseTextColor}
              onPress={onLogOutContinuePress}
            >
              <Marquee style={reverseTextColor}>{t("log_out_continue")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={support} onClose={onSupportClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Icon name="help-circle" size={48} color={Color.MiddleTerritory} style={ViewStyles.mb4} />
          <VStack style={[ViewStyles.mb4, ViewStyles.wf]}>
            <VStack center>
              <Text style={ViewStyles.mb2}>{t("language_notice")}</Text>
            </VStack>
            <Picker
              isDisabled={refreshing}
              title={t("change_language")}
              items={[
                { key: "de-DE", value: "Deutsch" },
                { key: "en-GB", value: "English (UK)" },
                { key: "en-US", value: "English (United States)" },
                { key: "es-ES", value: "Español" },
                { key: "es-MX", value: "Español (México)" },
                { key: "fr-CA", value: "Français (Canada)" },
                { key: "it-IT", value: "Italiano" },
                { key: "ja-JP", value: "日本語" },
                { key: "ko-KR", value: "한국어" },
                { key: "nl-NL", value: "Nederlands" },
                { key: "ru-RU", value: "Русский язык" },
                { key: "zh-CN", value: "简体中文" },
                { key: "zh-TW", value: "繁體中文" },
              ]}
              onSelected={onLanguageSelected}
              style={ViewStyles.wf}
            />
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
                textStyle={reverseTextColor}
                onPress={onLogInContinuePress}
              >
                <Marquee style={reverseTextColor}>{t("relog_in")}</Marquee>
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
                isLoadingText={t("preloading_resources")}
                style={[ViewStyles.accent, ViewStyles.mb2]}
                textStyle={reverseTextColor}
                onPress={onClearCachePress}
              >
                <Marquee style={reverseTextColor}>{t("clear_cache")}</Marquee>
              </Button>
              <Button
                isLoading={preloadingResources}
                isLoadingText={t("preloading_resources")}
                style={ViewStyles.accent}
                textStyle={reverseTextColor}
                onPress={onPreloadResourcesPress}
              >
                <Marquee style={reverseTextColor}>{t("preload_resources")}</Marquee>
              </Button>
            </VStack>
          )}
          <VStack style={[ViewStyles.mb4, ViewStyles.wf]}>
            <VStack center>
              <Text style={ViewStyles.mb2}>{t("feedback_notice")}</Text>
            </VStack>
            <Button style={ViewStyles.accent} onPress={onCreateAGithubIssuePress}>
              <Marquee style={reverseTextColor}>{t("create_a_github_issue")}</Marquee>
            </Button>
          </VStack>
          <VStack style={ViewStyles.wf}>
            <VStack center>
              <Text style={ViewStyles.mb2}>{t("debug_notice")}</Text>
            </VStack>
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCopySessionTokenPress}>
              <Marquee style={reverseTextColor}>{t("copy_session_token")}</Marquee>
            </Button>
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCopyBulletTokenPress}>
              <Marquee style={reverseTextColor}>{t("copy_bullet_token")}</Marquee>
            </Button>
            <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
              <Marquee style={reverseTextColor}>{t("export_database")}</Marquee>
            </Button>
          </VStack>
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
            <Avatar
              size={48}
              image={{
                uri: "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/1afd1450a5a5ebec",
                cacheKey: "1afd1450a5a5ebec",
              }}
              style={ViewStyles.mr2}
            />
            <Avatar
              size={48}
              image={{
                uri: "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/4b98d8291ae60b8c",
                cacheKey: "4b98d8291ae60b8c",
              }}
              style={ViewStyles.mr2}
            />
          </HStack>
        </VStack>
        <VStack center>
          <Marquee style={[TextStyles.h3, ViewStyles.mb2]}>{t("license")}</Marquee>
          <VStack center>
            <Text style={[TextStyles.link, ViewStyles.mb1]} onPress={onSplatoon3InkPress}>
              Splatoon3.ink
            </Text>
            <Text style={TextStyles.link} onPress={onIminkFApiPress}>
              imink f API
            </Text>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={firstAid} fade style={ViewStyles.modal1dc}>
        <VStack center>
          <Icon name="life-buoy" size={48} color={Color.MiddleTerritory} style={ViewStyles.mb4} />
          <Text style={ViewStyles.mb4}>{t("first_aid_notice")}</Text>
          <VStack style={ViewStyles.wf}>
            <Button
              isLoading={exporting}
              isLoadingText={t("exporting")}
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={reverseTextColor}
              onPress={onExportPress}
            >
              <Marquee style={reverseTextColor}>{t("export_results")}</Marquee>
            </Button>
            <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
              <Marquee style={reverseTextColor}>{t("export_database")}</Marquee>
            </Button>
          </VStack>
        </VStack>
      </Modal>
    </VStack>
  );
};

export default MainView;
