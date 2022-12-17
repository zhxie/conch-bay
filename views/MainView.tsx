import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Application from "expo-application";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import * as WebBrowser from "expo-web-browser";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Linking, RefreshControl, ScrollView, View, useColorScheme } from "react-native";
import Toast from "react-native-root-toast";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Avatar,
  Badge,
  Button,
  Center,
  HStack,
  Modal,
  Text,
  TextStyles,
  ToolButton,
  VStack,
  ViewStyles,
} from "../components";
import { Color, CoopHistoryDetail, Friends, Schedules, VsHistoryDetail } from "../models";
import {
  checkBulletToken,
  fetchBattleHistories,
  fetchCatalog,
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchFriends,
  fetchSchedules,
  fetchSummary,
  fetchVsHistoryDetail,
  generateLogIn,
  getBulletToken,
  getSessionToken,
  getWebServiceToken,
  updateNsoappVersion,
  updateWebViewVersion,
} from "../utils/api";
import ResultView from "./ResultView";
import FriendView from "./FriendView";
import ScheduleView from "./ScheduleView";
import * as Database from "../utils/database";
import { Feather } from "@expo/vector-icons";

interface MainViewProps {
  t: (f: string, params?: Record<string, any>) => string;
}

const MainView = (props: MainViewProps) => {
  const { t } = props;

  const colorScheme = useColorScheme();
  const accentColor = colorScheme === "light" ? Color.Shiver : Color.Frye;
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
  const [acknowledgments, setAcknowledgments] = useState(false);

  const [sessionToken, setSessionToken] = useState("");
  const [language, setLanguage] = useState("");
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

  const showError = (e: any) => {
    if (e instanceof Error) {
      Toast.show(e.message);
    } else if (typeof e === "string") {
      Toast.show(e);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { sessionToken, language, bulletToken } = await loadPersistence();
        setReady(true);
        await Database.open();
        // HACK: load asynchronously and delay to avoid refresh control layout misbehavior.
        loadResults(false);
        setTimeout(() => {
          refresh(sessionToken, language, bulletToken);
        }, 600);
      } catch (e) {
        showError(e);
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
      }).start();
    }
  }, [ready]);
  const loadPersistence = async () => {
    const [sessionToken, language, bulletToken, icon, catalogLevel, level, rank, grade] =
      await Promise.all([
        AsyncStorage.getItem("sessionToken"),
        AsyncStorage.getItem("language"),
        AsyncStorage.getItem("bulletToken"),
        AsyncStorage.getItem("icon"),
        AsyncStorage.getItem("catalogLevel"),
        AsyncStorage.getItem("level"),
        AsyncStorage.getItem("rank"),
        AsyncStorage.getItem("grade"),
      ]);

    setSessionToken(sessionToken ?? "");
    setLanguage(language ?? "");
    setBulletToken(bulletToken ?? "");
    setIcon(icon ?? "");
    setCatalogLevel(catalogLevel ?? "");
    setLevel(level ?? "");
    setRank(rank ?? "");
    setGrade(grade ?? "");

    return {
      sessionToken: sessionToken ?? "",
      language: language ?? "",
      bulletToken: bulletToken ?? "",
    };
  };
  const savePersistence = async (persistence: Record<string, string>) => {
    for (let key of [
      "sessionToken",
      "language",
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
  const loadResults = async (force: boolean) => {
    const details = (await Database.query(0, 20)).map((record) => {
      if (record.mode === "salmon_run") {
        return {
          coop: JSON.parse(record.detail) as CoopHistoryDetail,
        };
      }
      return { battle: JSON.parse(record.detail) as VsHistoryDetail };
    });
    if (details.length > 0 || force) {
      setResults(details);
    }
  };
  const loadMoreResults = async () => {
    setLoadingMore(true);
    const details = (await Database.query(results!.length, 20)).map((record) => {
      if (record.mode === "salmon_run") {
        return {
          coop: JSON.parse(record.detail) as CoopHistoryDetail,
        };
      }
      return { battle: JSON.parse(record.detail) as VsHistoryDetail };
    });
    if (details.length > 0) {
      setResults(results!.concat(details));
    }
    setLoadingMore(false);
  };

  const addBattle = async (battle: VsHistoryDetail, check: boolean) => {
    try {
      if (check && (await Database.isExist(battle.vsHistoryDetail.id))) {
        return 0;
      }
      await Database.add(
        battle.vsHistoryDetail.id,
        new Date(battle.vsHistoryDetail.playedTime).valueOf(),
        battle.vsHistoryDetail.vsMode.id,
        battle.vsHistoryDetail.vsRule.id,
        battle.vsHistoryDetail.myTeam.players.find((player) => player.isMyself)!.weapon.id,
        battle.vsHistoryDetail.myTeam.players
          .map((player) => player.id)
          .concat(
            battle.vsHistoryDetail.otherTeams
              .map((otherTeam) => otherTeam.players.map((player) => player.id))
              .flat()
          ),
        JSON.stringify(battle)
      );
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
      await Database.add(
        coop.coopHistoryDetail.id,
        new Date(coop.coopHistoryDetail.playedTime).valueOf(),
        "salmon_run",
        coop.coopHistoryDetail.rule,
        "",
        coop.coopHistoryDetail.memberResults
          .map((memberResult) => memberResult.player.id)
          .concat(coop.coopHistoryDetail.myResult.player.id),
        JSON.stringify(coop)
      );
      return 1;
    } catch {
      return -1;
    }
  };
  const refresh = async (sessionToken: string, language?: string, bulletToken?: string) => {
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
          Toast.show(t("failed_to_check_update"));
        }

        // Regenerate bullet token if necessary.
        let newLanguage = language;
        let newBulletToken = "";
        if (bulletToken && bulletToken.length > 0 && (await checkBulletToken(bulletToken))) {
          newBulletToken = bulletToken;
        }
        if (!newBulletToken) {
          if (bulletToken && bulletToken.length > 0) {
            Toast.show(t("reacquiring_tokens"));
          }

          const res = await getWebServiceToken(sessionToken);
          newLanguage = res.language;
          newBulletToken = await getBulletToken(res.webServiceToken, res.country);

          setLanguage(res.language);
          setBulletToken(newBulletToken);
          await savePersistence({
            language: res.language,
            bulletToken: newBulletToken,
          });
        }

        // Fetch friends, summary and catalog.
        const [friends, summary, catalog] = await Promise.all([
          fetchFriends(newBulletToken),
          fetchSummary(newBulletToken),
          fetchCatalog(newBulletToken),
        ]);
        setFriends(friends);
        const icon = summary.currentPlayer.userIcon.url;
        const catalogLevel = String(catalog.catalog.progress.level);
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

        // Fetch results.
        const [battleHistories, coopResult] = await Promise.all([
          fetchBattleHistories(newBulletToken),
          fetchCoopResult(newBulletToken),
        ]);
        if (coopResult.coopResult.regularGrade) {
          setGrade(coopResult.coopResult.regularGrade.id);
          await savePersistence({
            grade: coopResult.coopResult.regularGrade.id,
          });
        }

        // Fetch details.
        let results: {
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
          Toast.show(t("loading_n_new_results", { n: newResults.length }));
          const details = await Promise.all(
            newResults.map((result) => {
              if (!result.isCoop) {
                return fetchVsHistoryDetail(result.id, newBulletToken, newLanguage);
              }
              return fetchCoopHistoryDetail(result.id, newBulletToken, newLanguage);
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
            Toast.show(t("loaded_n_results_fail_failed", { n: newResults.length, fail }));
          } else {
            Toast.show(t("loaded_n_results", { n: newResults.length }));
          }
        }

        // Query stored latest results if updated.
        await loadResults(true);
      }
    } catch (e) {
      showError(e);
    }
    setRefreshing(false);
  };
  const onRefresh = async () => {
    await refresh(sessionToken, language, bulletToken);
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
      setSessionToken(res3);
      await savePersistence({ sessionToken: res3 });

      refresh(res3);

      setLoggingIn(false);
      setLogIn(false);
    } catch (e) {
      showError(e);
      setLoggingIn(false);
    }
  };
  const onLogOutPress = () => {
    setLogOut(true);
  };
  const onLogOutClose = () => {
    if (!loggingOut) {
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
      showError(e);
      setLoggingOut(false);
    }
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
      Toast.show(t("loading_n_results", { n }));
      for (let battle of result["battles"]) {
        const result = await addBattle(battle, true);
        if (result < 0) {
          fail++;
        } else if (result === 0) {
          skip++;
        }
      }
      for (let coop of result["coops"]) {
        const result = await addCoop(coop, true);
        if (result < 0) {
          fail++;
        } else if (result === 0) {
          skip++;
        }
      }
      if (fail === 0 && skip === 0) {
        Toast.show(t("loaded_n_results", { n }));
      } else {
        Toast.show(t("loaded_n_results_fail_failed_skip_skipped", { n, fail, skip }));
      }

      // Query stored latest results if updated.
      if (n - fail - skip > 0) {
        await loadResults(true);
      }
    } catch (e) {
      showError(e);
    }

    // Clean up.
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      showError(e);
    }
    setRefreshing(false);
  };
  const onExportPress = async () => {
    setExporting(true);
    const uri = FileSystem.documentDirectory + "conch-bay-export.json";
    try {
      let battles: VsHistoryDetail[] = [];
      let coops: CoopHistoryDetail[] = [];
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
      showError(e);
    }

    // Clean up.
    try {
      await FileSystem.deleteAsync(uri, { idempotent: true });
    } catch (e) {
      showError(e);
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
    <VStack flex center style={backgroundStyle}>
      <Animated.View style={{ opacity: fade }}>
        <ScrollView
          refreshControl={
            <RefreshControl
              progressViewOffset={insets.top}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
          style={{ height: "100%" }}
        >
          <SafeAreaView style={{ alignItems: "center" }}>
            {!sessionToken && (
              <Center flex style={[ViewStyles.px4, ViewStyles.mb4]}>
                <Button style={{ backgroundColor: accentColor }} onPress={onLogInPress}>
                  <Text style={reverseTextColor}>{t("log_in")}</Text>
                </Button>
              </Center>
            )}
            {sessionToken.length > 0 && (
              <VStack center style={[ViewStyles.px4, ViewStyles.mb4]}>
                <Avatar
                  size={64}
                  source={
                    icon.length > 0
                      ? {
                          uri: icon,
                        }
                      : undefined
                  }
                  onPress={onLogOutPress}
                  style={ViewStyles.mb2}
                />
                <HStack>
                  {catalogLevel.length > 0 && (
                    <Badge color={Color.Shiver} title={catalogLevel} style={ViewStyles.mr1} />
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
            {sessionToken.length > 0 && <FriendView friends={friends} style={ViewStyles.mb4} />}
            {sessionToken.length > 0 && (
              <ResultView
                t={t}
                isLoading={refreshing || loadingMore}
                loadMore={loadMoreResults}
                results={results}
                style={ViewStyles.mb4}
              />
            )}
            {sessionToken.length > 0 && (
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={ViewStyles.mb4}>
                <HStack style={ViewStyles.px4}>
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
              <Text style={[TextStyles.subtle, ViewStyles.mb2, { textAlign: "center" }]}>
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
          <VStack center style={{ width: "100%" }}>
            <Button
              style={[
                ViewStyles.mb2,
                { width: "100%", borderColor: accentColor, borderWidth: 1.5 },
                backgroundStyle,
              ]}
              onPress={onIminkPrivacyPolicyPress}
            >
              <Text>{t("imink_privacy_policy")}</Text>
            </Button>
            <Button
              isLoading={loggingIn}
              isLoadingText={t("logging_in")}
              style={[{ width: "100%", backgroundColor: accentColor }]}
              textStyle={reverseTextColor}
              onPress={onLogInContinuePress}
            >
              <Text style={reverseTextColor}>{t("log_in_continue")}</Text>
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
          <Button
            isLoading={loggingOut}
            isLoadingText={t("logging_out")}
            style={[{ width: "100%", backgroundColor: accentColor }]}
            textStyle={reverseTextColor}
            onPress={onLogOutContinuePress}
          >
            <Text style={reverseTextColor}>{t("log_out_continue")}</Text>
          </Button>
        </VStack>
      </Modal>
      <Modal
        isVisible={acknowledgments}
        onClose={onAcknowledgmentsClose}
        style={ViewStyles.modal1d}
      >
        <VStack center style={ViewStyles.mb3}>
          <Text style={[TextStyles.h3, ViewStyles.mb2]}>{t("creators")}</Text>
          <HStack center>
            <Avatar
              size={48}
              source={{
                uri: "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/1afd1450a5a5ebec",
              }}
              style={ViewStyles.mr2}
            />
            <Avatar
              size={48}
              source={{
                uri: "https://cdn-image-e0d67c509fb203858ebcb2fe3f88c2aa.baas.nintendo.com/1/4b98d8291ae60b8c",
              }}
              style={ViewStyles.mr2}
            />
          </HStack>
        </VStack>
        <VStack center>
          <Text style={[TextStyles.h3, ViewStyles.mb2]}>{t("license")}</Text>
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
    </VStack>
  );
};

export default MainView;
