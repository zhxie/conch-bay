import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import { CacheManager } from "expo-cached-image";
import * as Clipboard from "expo-clipboard";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
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
  Badge,
  Button,
  Center,
  Color,
  FilterButton,
  HStack,
  Modal,
  Text,
  TextStyles,
  ToolButton,
  VStack,
  ViewStyles,
} from "../components";
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
  fetchSchedules,
  fetchSummary,
  fetchVsHistoryDetail,
  fetchWeaponRecords,
  generateLogIn,
  getBulletToken,
  getSessionToken,
  getWebServiceToken,
  updateNsoappVersion,
  updateWebViewVersion,
} from "../utils/api";
import * as Database from "../utils/database";
import { getImageCacheKey, getUserIconCacheKey } from "../utils/ui";
import FriendView from "./FriendView";
import ResultView from "./ResultView";
import ScheduleView from "./ScheduleView";

interface MainViewProps {
  t: (f: string, params?: Record<string, any>) => string;
}

const MainView = (props: MainViewProps) => {
  const { t } = props;

  const colorScheme = useColorScheme();
  const backgroundStyle = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;
  const reverseTextColor = colorScheme === "light" ? TextStyles.dark : TextStyles.light;

  const insets = useSafeAreaInsets();

  const [ready, setReady] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [debug, setDebug] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [filter, setFilter] = useState("");
  const [exporting, setExporting] = useState(false);
  const [acknowledgments, setAcknowledgments] = useState(false);
  const [firstAid, setFirstAid] = useState(false);

  const [sessionToken, setSessionToken] = useState("");
  const [bulletToken, setBulletToken] = useState("");
  const [icon, setIcon] = useState("");
  const [catalogLevel, setCatalogLevel] = useState("");
  const [level, setLevel] = useState("");
  const [rank, setRank] = useState("");
  const [grade, setGrade] = useState("");

  const [schedules, setSchedules] = useState<Schedules | undefined>(undefined);
  const [friends, setFriends] = useState<Friends | undefined>(undefined);
  const [results, setResults] = useState<
    { battle?: VsHistoryDetail; coop?: CoopHistoryDetail }[] | undefined
  >(undefined);

  const showToast = (e: any) => {
    if (e instanceof Error) {
      Toast.show(e.message);
    } else if (typeof e === "string") {
      Toast.show(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        await loadPersistence();
        await Database.open();
        await loadResults(20, false);
        setReady(true);
      } catch (e) {
        showToast(e);
        setFirstAid(true);
      }
    };
    fetchData();
  }, []);
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

  const loadPersistence = async () => {
    const [sessionToken, bulletToken, icon, catalogLevel, level, rank, grade] = await Promise.all([
      AsyncStorage.getItem("sessionToken"),
      AsyncStorage.getItem("bulletToken"),
      AsyncStorage.getItem("icon"),
      AsyncStorage.getItem("catalogLevel"),
      AsyncStorage.getItem("level"),
      AsyncStorage.getItem("rank"),
      AsyncStorage.getItem("grade"),
    ]);

    setSessionToken(sessionToken ?? "");
    setBulletToken(bulletToken ?? "");
    setIcon(icon ?? "");
    setCatalogLevel(catalogLevel ?? "");
    setLevel(level ?? "");
    setRank(rank ?? "");
    setGrade(grade ?? "");
  };
  const savePersistence = async (persistence: Record<string, string>) => {
    for (const key of [
      "sessionToken",
      "bulletToken",
      "icon",
      "catalogLevel",
      "level",
      "rank",
      "grade",
    ]) {
      if (persistence[key]) {
        await AsyncStorage.setItem(key, persistence[key]);
      }
    }
  };
  const clearPersistence = async () => {
    await AsyncStorage.clear();
  };
  const loadResults = async (length: number, forceUpdate: boolean) => {
    setLoadingMore(true);
    let offset: number, limit: number;
    if (results !== undefined && length > results.length) {
      offset = results.length;
      limit = length - results.length;
    } else {
      offset = 0;
      limit = length;
    }
    let condition: string | undefined = undefined;
    switch (filter) {
      case "regular_battle":
        condition =
          "mode = 'VnNNb2RlLTE=' OR mode = 'VnNNb2RlLTY=' OR mode = 'VnNNb2RlLTc=' OR mode = 'VnNNb2RlLTg='";
        break;
      case "anarchy_battle":
        condition = "mode = 'VnNNb2RlLTI=' OR mode == 'VnNNb2RlLTUx'";
        break;
      case "x_battle":
        condition = "mode = 'VnNNb2RlLTM='";
        break;
      case "private_battle":
        condition = "mode = 'VnNNb2RlLTU='";
        break;
      case "salmon_run":
        condition = "mode = 'salmon_run'";
        break;
    }

    const details = (await Database.query(offset, limit, condition)).map((record) => {
      if (record.mode === "salmon_run") {
        return {
          coop: JSON.parse(record.detail) as CoopHistoryDetail,
        };
      }
      return { battle: JSON.parse(record.detail) as VsHistoryDetail };
    });
    if (results !== undefined && length > results.length) {
      setResults((results ?? []).concat(details));
    } else {
      if (details.length > 0 || forceUpdate) {
        setResults(details);
      }
    }
    setLoadingMore(false);
  };
  const addBattle = async (battle: VsHistoryDetail, check: boolean) => {
    try {
      if (check && (await Database.isExist(battle.vsHistoryDetail.id))) {
        return 0;
      }
      await Database.addBattle(battle);
      return 1;
    } catch {
      return -1;
    }
  };
  const addCoop = async (coop: CoopHistoryDetail, check: boolean) => {
    try {
      if (check && (await Database.isExist(coop.coopHistoryDetail.id))) {
        return 0;
      }
      await Database.addCoop(coop);
      return 1;
    } catch {
      return -1;
    }
  };
  const refresh = async () => {
    setRefreshing(true);
    try {
      // Fetch schedules.
      const schedules = await fetchSchedules();
      setSchedules(schedules);
      if (sessionToken) {
        // Update versions.
        try {
          await Promise.all([await updateNsoappVersion(), await updateWebViewVersion()]);
        } catch {
          showToast(t("failed_to_check_api_update"));
        }

        // Attempt to fetch weapon records.
        let newBulletToken = "";
        let weaponRecordsAttempt: WeaponRecords | undefined = undefined;
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
          if (bulletToken.length > 0) {
            showToast(t("reacquiring_tokens"));
          }

          const res = await getWebServiceToken(sessionToken);
          newBulletToken = await getBulletToken(res.webServiceToken, res.country);

          setBulletToken(newBulletToken);
          await savePersistence({
            bulletToken: newBulletToken,
          });
        }

        // Fetch friends, summary, catalog, weapon records and results.
        const [friends, summary, catalog, weaponRecords, battleHistories, coopResult] =
          await Promise.all([
            fetchFriends(newBulletToken),
            fetchSummary(newBulletToken),
            fetchCatalog(newBulletToken),
            weaponRecordsAttempt || fetchWeaponRecords(newBulletToken),
            fetchBattleHistories(newBulletToken),
            fetchCoopResult(newBulletToken),
          ]);
        setFriends(friends);
        const icon = summary.currentPlayer.userIcon.url;
        const catalogLevel = String(catalog.catalog.progress?.level ?? 0);
        const level = String(summary.playHistory.rank);
        const rank = summary.playHistory.udemae;
        setIcon(icon);
        setCatalogLevel(catalogLevel);
        setLevel(level);
        setRank(rank);
        await savePersistence({
          icon: icon,
          catalogLevel: catalogLevel,
          level: level,
          rank: rank,
        });
        // Pre-download weapon images.
        const resources = new Map<string, string>();
        weaponRecords.weaponRecords.nodes.forEach((record) => {
          resources.set(getImageCacheKey(record.image2d.url), record.image2d.url);
        });
        const resourcesArray = Array.from(resources);
        const resourcesInfo = await Promise.all(
          resourcesArray.map((resource) =>
            FileSystem.getInfoAsync(`${FileSystem.cacheDirectory}${resource[0]}`)
          )
        );
        const newResources = resourcesArray.filter((_, i) => !resourcesInfo[i].exists);
        await Promise.all(
          Array.from(newResources).map((resource) =>
            CacheManager.downloadAsync({ uri: resource[1], key: resource[0] })
          )
        );
        if (coopResult.coopResult.regularGrade) {
          setGrade(coopResult.coopResult.regularGrade.id);
          await savePersistence({
            grade: coopResult.coopResult.regularGrade.id,
          });
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
          showToast(t("loading_n_new_results", { n: newResults.length }));
          const details = await Promise.all(
            newResults.map((result) => {
              if (!result.isCoop) {
                return fetchVsHistoryDetail(result.id, newBulletToken, t("lang"));
              }
              return fetchCoopHistoryDetail(result.id, newBulletToken, t("lang"));
            })
          );
          let fail = 0;
          for (let i = 0; i < newResults.length; i++) {
            let result: number;
            if (!newResults[i].isCoop) {
              result = await addBattle(details[i] as VsHistoryDetail, false);
            } else {
              result = await addCoop(details[i] as CoopHistoryDetail, false);
            }
            if (result < 0) {
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

  const onScrollEndDrag = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    if (refreshing) {
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
  const onIminkPrivacyPolicyPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/JoneWang/imink/wiki/Privacy-Policy");
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
      setSessionToken(res3);
      await savePersistence({ sessionToken: res3 });

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
      await Promise.all([clearPersistence(), Database.clear()]);
      setResults(undefined);
      setFriends(undefined);
      await loadPersistence();
      setLoggingOut(false);
      setLogOut(false);
    } catch (e) {
      showToast(e);
      setLoggingOut(false);
    }
  };
  const onDebugPress = () => {
    setDebug(true);
  };
  const onDebugClose = () => {
    setDebug(false);
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
  const onFilterRegularBattlePress = async () => {
    if (filter !== "regular_battle") {
      setFilter("regular_battle");
    } else {
      setFilter("");
    }
  };
  const onFilterAnarchyBattlePress = async () => {
    if (filter !== "anarchy_battle") {
      setFilter("anarchy_battle");
    } else {
      setFilter("");
    }
  };
  const onFilterXBattlePress = async () => {
    if (filter !== "x_battle") {
      setFilter("x_battle");
    } else {
      setFilter("");
    }
  };
  const onFilterPrivateBattlePress = async () => {
    if (filter !== "private_battle") {
      setFilter("private_battle");
    } else {
      setFilter("");
    }
  };
  const onFilterSalmonRunPress = async () => {
    if (filter !== "salmon_run") {
      setFilter("salmon_run");
    } else {
      setFilter("");
    }
  };
  const onLoadMorePress = async () => {
    await loadResults(results!.length + 20, true);
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
      let [fail, skip] = [0, 0];
      const result = JSON.parse(await FileSystem.readAsStringAsync(uri));
      const n = result["battles"].length + result["coops"].length;
      showToast(t("loading_n_results", { n }));
      for (const battle of result["battles"]) {
        const result = await addBattle(battle, true);
        if (result < 0) {
          fail++;
        } else if (result === 0) {
          skip++;
        }
      }
      for (const coop of result["coops"]) {
        const result = await addCoop(coop, true);
        if (result < 0) {
          fail++;
        } else if (result === 0) {
          skip++;
        }
      }
      if (fail === 0 && skip === 0) {
        showToast(t("loaded_n_results", { n }));
      } else {
        showToast(t("loaded_n_results_fail_failed_skip_skipped", { n, fail, skip }));
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
    const uri = FileSystem.documentDirectory + "conch-bay-export.json";
    try {
      const battles: VsHistoryDetail[] = [];
      const coops: CoopHistoryDetail[] = [];
      const records = await Database.queryAll();
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
  const onFeedbackPress = () => {
    Linking.openURL("https://github.com/zhxie/conch-bay/issues/new");
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
    Linking.openURL("https://splatoon3.ink/");
  };
  const onIminkFApiPress = () => {
    Linking.openURL("https://github.com/imink-app/f-API");
  };

  return (
    <VStack flex style={backgroundStyle}>
      <Animated.View style={{ opacity: fade }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              progressViewOffset={insets.top}
              refreshing={refreshing}
              onRefresh={refresh}
            />
          }
          showsVerticalScrollIndicator={false}
          onScrollEndDrag={onScrollEndDrag}
          style={{ height: "100%" }}
        >
          <SafeAreaView style={{ alignItems: "center" }}>
            {!sessionToken && (
              <Center flex style={[ViewStyles.px4, ViewStyles.mb4]}>
                <Button style={ViewStyles.accent} onPress={onLogInPress}>
                  <Text numberOfLines={1} style={reverseTextColor}>
                    {t("log_in")}
                  </Text>
                </Button>
              </Center>
            )}
            {sessionToken.length > 0 && (
              <VStack center style={[ViewStyles.px4, ViewStyles.mb4]}>
                <Avatar
                  size={64}
                  uri={icon.length > 0 ? icon : undefined}
                  cacheKey={icon.length > 0 ? getUserIconCacheKey(icon) : undefined}
                  onPress={onLogOutPress}
                  onLongPress={onDebugPress}
                  style={ViewStyles.mb2}
                />
                <HStack>
                  {catalogLevel.length > 0 && (
                    <Badge color={Color.AccentColor} title={catalogLevel} style={ViewStyles.mr1} />
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
            <ScheduleView t={t} schedules={schedules} style={ViewStyles.mb4} />
            {sessionToken.length > 0 &&
              (friends === undefined || friends.friends.nodes.length > 0) && (
                <FriendView friends={friends} style={ViewStyles.mb4} />
              )}
            {sessionToken.length > 0 && (
              <VStack style={[ViewStyles.mb4, ViewStyles.wf]}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={ViewStyles.mb2}
                >
                  <HStack flex center style={ViewStyles.px4}>
                    <FilterButton
                      isDisabled={refreshing || loadingMore}
                      color={filter === "regular_battle" ? Color.RegularBattle : undefined}
                      title={t("regular_battle")}
                      style={ViewStyles.mr2}
                      onPress={onFilterRegularBattlePress}
                    />
                    <FilterButton
                      isDisabled={refreshing || loadingMore}
                      color={filter === "anarchy_battle" ? Color.AnarchyBattle : undefined}
                      title={t("anarchy_battle")}
                      style={ViewStyles.mr2}
                      onPress={onFilterAnarchyBattlePress}
                    />
                    <FilterButton
                      isDisabled={refreshing || loadingMore}
                      color={filter === "x_battle" ? Color.XBattle : undefined}
                      title={t("x_battle")}
                      style={ViewStyles.mr2}
                      onPress={onFilterXBattlePress}
                    />
                    <FilterButton
                      isDisabled={refreshing || loadingMore}
                      color={filter === "private_battle" ? Color.PrivateBattle : undefined}
                      title={t("private_battle")}
                      style={ViewStyles.mr2}
                      onPress={onFilterPrivateBattlePress}
                    />
                    <FilterButton
                      isDisabled={refreshing || loadingMore}
                      color={filter === "salmon_run" ? Color.SalmonRun : undefined}
                      title={t("salmon_run")}
                      onPress={onFilterSalmonRunPress}
                    />
                  </HStack>
                </ScrollView>
                <ResultView
                  t={t}
                  isLoading={refreshing || loadingMore}
                  loadMore={onLoadMorePress}
                  results={results}
                />
              </VStack>
            )}
            {sessionToken.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={[ViewStyles.mb4, ViewStyles.wf]}
              >
                <HStack flex center style={ViewStyles.px4}>
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
                    isDisabled={refreshing}
                    icon="share"
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
                    onPress={onFeedbackPress}
                  >
                    {t("feedback")}
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
        </ScrollView>
      </Animated.View>
      <Modal isVisible={logIn} onClose={onLogInClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Feather
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
              onPress={onIminkPrivacyPolicyPress}
            >
              <Text numberOfLines={1}>{t("imink_privacy_policy")}</Text>
            </Button>
            <Button
              isLoading={loggingIn}
              isLoadingText={t("logging_in")}
              style={ViewStyles.accent}
              textStyle={reverseTextColor}
              onPress={onLogInContinuePress}
            >
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("log_in_continue")}
              </Text>
            </Button>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={logOut} onClose={onLogOutClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Feather
            name="alert-circle"
            size={48}
            color={Color.MiddleTerritory}
            style={ViewStyles.mb4}
          />
          <Text style={ViewStyles.mb4}>{t("log_out_notice")}</Text>
          <VStack style={ViewStyles.wf}>
            <Button
              isLoading={exporting}
              isLoadingText={t("exporting")}
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={reverseTextColor}
              onPress={onExportPress}
            >
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("export_results")}
              </Text>
            </Button>
            <Button
              isDisabled={exporting}
              isLoading={loggingOut}
              isLoadingText={t("logging_out")}
              style={ViewStyles.accent}
              textStyle={reverseTextColor}
              onPress={onLogOutContinuePress}
            >
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("log_out_continue")}
              </Text>
            </Button>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={debug} onClose={onDebugClose} style={ViewStyles.modal1d}>
        <VStack center>
          <Feather
            name="alert-circle"
            size={48}
            color={Color.MiddleTerritory}
            style={ViewStyles.mb4}
          />
          <Text style={ViewStyles.mb4}>{t("debug_notice")}</Text>
          <VStack style={ViewStyles.wf}>
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCopySessionTokenPress}>
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("copy_session_token")}
              </Text>
            </Button>
            <Button style={[ViewStyles.mb2, ViewStyles.accent]} onPress={onCopyBulletTokenPress}>
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("copy_bullet_token")}
              </Text>
            </Button>
            <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("export_database")}
              </Text>
            </Button>
          </VStack>
        </VStack>
      </Modal>
      <Modal isVisible={firstAid} style={ViewStyles.modal1dc}>
        <VStack center>
          <Feather
            name="alert-triangle"
            size={48}
            color={Color.MiddleTerritory}
            style={ViewStyles.mb4}
          />
          <Text style={ViewStyles.mb4}>{t("first_aid_notice")}</Text>
          <VStack style={ViewStyles.wf}>
            <Button
              isLoading={exporting}
              isLoadingText={t("exporting")}
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={reverseTextColor}
              onPress={onExportPress}
            >
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("export_results")}
              </Text>
            </Button>
            <Button style={ViewStyles.accent} onPress={onExportDatabasePress}>
              <Text numberOfLines={1} style={reverseTextColor}>
                {t("export_database")}
              </Text>
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
          <Text numberOfLines={1} style={[TextStyles.h3, ViewStyles.mb2]}>
            {t("creators")}
          </Text>
          <HStack center>
            <Avatar
              size={48}
              uri="https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/1afd1450a5a5ebec"
              cacheKey="1afd1450a5a5ebec"
              style={ViewStyles.mr2}
            />
            <Avatar
              size={48}
              uri="https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/4b98d8291ae60b8c"
              cacheKey="4b98d8291ae60b8c"
              style={ViewStyles.mr2}
            />
          </HStack>
        </VStack>
        <VStack center>
          <Text numberOfLines={1} style={[TextStyles.h3, ViewStyles.mb2]}>
            {t("license")}
          </Text>
          <VStack center>
            <Text
              numberOfLines={1}
              style={[TextStyles.link, ViewStyles.mb1]}
              onPress={onSplatoon3InkPress}
            >
              Splatoon3.ink
            </Text>
            <Text numberOfLines={1} style={TextStyles.link} onPress={onIminkFApiPress}>
              imink f API
            </Text>
          </VStack>
        </VStack>
      </Modal>
    </VStack>
  );
};

export default MainView;
