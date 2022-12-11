import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
  Avatar,
  Badge,
  Button,
  HStack,
  Modal,
  PresenceTransition,
  ScrollView,
  Skeleton,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  WarningIcon,
} from "native-base";
import React, { useEffect, useState } from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { TransformPressable } from "../components";
import { CoopHistoryDetail, Friends, Schedules, VsHistoryDetail } from "../models";
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

interface MainViewProps {
  t: (str: string) => string;
}

const MainView = (props: MainViewProps) => {
  const { t } = props;

  const accentColorScheme = useColorModeValue("blue", "yellow");
  const accentColor = useColorModeValue("blue.500", "yellow.500");

  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [ready, setReady] = useState(false);
  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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

  const showError = (e: any) => {
    if (e instanceof Error) {
      toast.show({ description: e.message });
    } else if (typeof e === "string") {
      toast.show({ description: e });
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { sessionToken, bulletToken } = await loadPersistence();
        setReady(true);
        await Database.open();
        // HACK: load asynchronously to avoid refresh control layout misbehavior.
        loadResults(false);
        await refresh(sessionToken, bulletToken);
      } catch (e) {
        showError(e);
      }
    };
    fetchData();
  }, []);
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

    return {
      sessionToken: sessionToken ?? "",
      bulletToken: bulletToken ?? "",
    };
  };
  const savePersistence = async (persistence: Record<string, string>) => {
    for (let key of [
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
    setRefreshing(true);
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
    setRefreshing(false);
  };

  const refresh = async (sessionToken: string, bulletToken?: string) => {
    setRefreshing(true);
    try {
      // Fetch schedules.
      const schedules = await fetchSchedules();
      setSchedules(schedules);
      if (sessionToken) {
        // Update versions.
        await Promise.all([await updateNsoappVersion(), await updateWebViewVersion()]);

        // Regenerate bullet token if necessary.
        let newBulletToken = "";
        if (bulletToken && bulletToken.length > 0 && (await checkBulletToken(bulletToken))) {
          newBulletToken = bulletToken;
        }
        if (!newBulletToken) {
          if (bulletToken && bulletToken.length > 0) {
            toast.show({ description: t("reacquiring_tokens") });
          }

          const res = await getWebServiceToken(sessionToken);
          newBulletToken = await getBulletToken(res.webServiceToken, res.country);

          setBulletToken(newBulletToken);
          await savePersistence({
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
          const details = await Promise.all(
            newResults.map((result) => {
              if (!result.isCoop) {
                return fetchVsHistoryDetail(result.id, newBulletToken);
              }
              return fetchCoopHistoryDetail(result.id, newBulletToken);
            })
          );
          for (let i = 0; i < newResults.length; i++) {
            if (!newResults[i].isCoop) {
              // Battle.
              await Database.add(
                (details[i] as VsHistoryDetail).vsHistoryDetail.id,
                new Date((details[i] as VsHistoryDetail).vsHistoryDetail.playedTime).valueOf(),
                (details[i] as VsHistoryDetail).vsHistoryDetail.vsMode.id,
                (details[i] as VsHistoryDetail).vsHistoryDetail.vsRule.id,
                JSON.stringify(details[i])
              );
            } else {
              // Coop.
              await Database.add(
                (details[i] as CoopHistoryDetail).coopHistoryDetail.id,
                new Date((details[i] as CoopHistoryDetail).coopHistoryDetail.playedTime).valueOf(),
                "salmon_run",
                (details[i] as CoopHistoryDetail).coopHistoryDetail.rule,
                JSON.stringify(details[i])
              );
            }
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
    await refresh(sessionToken, bulletToken);
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

  return (
    <VStack flex={1} bg="gray.50" _dark={{ bg: "gray.900" }}>
      <PresenceTransition
        visible={ready}
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
          transition: {
            duration: 300,
          },
        }}
      >
        <ScrollView
          h="full"
          refreshControl={
            <RefreshControl
              progressViewOffset={insets.top}
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          showsVerticalScrollIndicator={false}
        >
          <VStack space={4} alignItems="center" safeArea>
            {!sessionToken && (
              <VStack px={4} space={2} alignItems="center">
                <Button colorScheme={accentColorScheme} onPress={onLogInPress}>
                  {t("log_in")}
                </Button>
              </VStack>
            )}
            {sessionToken.length > 0 && (
              <VStack px={4} space={2} alignItems="center">
                <TransformPressable onPress={onLogOutPress}>
                  <Skeleton w={16} h={16} rounded="full" isLoaded={!!icon}>
                    <Avatar
                      size="lg"
                      bg="gray.100"
                      _dark={{ bg: "gray.700" }}
                      source={{
                        uri: icon,
                      }}
                    />
                  </Skeleton>
                </TransformPressable>
                <HStack space={2} alignSelf="center">
                  {catalogLevel.length > 0 && <Badge colorScheme="lightBlue">{catalogLevel}</Badge>}
                  {level.length > 0 && <Badge colorScheme="green">{level}</Badge>}
                  {rank.length > 0 && <Badge colorScheme="orange">{rank}</Badge>}
                  {grade.length > 0 && <Badge colorScheme="amber">{t(grade)}</Badge>}
                </HStack>
              </VStack>
            )}
            <ScheduleView t={t} accentColor={accentColor} schedules={schedules} />
            {sessionToken.length > 0 && <FriendView accentColor={accentColor} friends={friends} />}
            {sessionToken.length > 0 && (
              <ResultView
                t={t}
                accentColor={accentColor}
                isLoading={refreshing}
                loadMore={loadMoreResults}
                results={results}
              />
            )}
          </VStack>
        </ScrollView>
      </PresenceTransition>
      <Modal
        isOpen={logIn}
        onClose={onLogInClose}
        avoidKeyboard
        justifyContent="flex-end"
        safeArea
        size="lg"
      >
        <Modal.Content>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <WarningIcon size="4xl" />
              <Text lineHeight="sm">{t("log_in_notice")}</Text>
              <VStack space={2} alignItems="center">
                <Button
                  colorScheme={accentColorScheme}
                  variant="subtle"
                  onPress={onPrivacyPolicyPress}
                >
                  {t("imink_privacy_policy")}
                </Button>
                <Button
                  colorScheme={accentColorScheme}
                  isLoading={loggingIn}
                  isLoadingText={t("logging_in")}
                  onPress={onLogInContinuePress}
                >
                  {t("log_in_continue")}
                </Button>
              </VStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
      <Modal
        isOpen={logOut}
        onClose={onLogOutClose}
        avoidKeyboard
        justifyContent="flex-end"
        safeArea
        size="lg"
      >
        <Modal.Content>
          <Modal.Body>
            <VStack space={4} alignItems="center">
              <WarningIcon size="4xl" />
              <Text lineHeight="sm">{t("log_out_notice")}</Text>
              <VStack space={2} alignItems="center">
                <Button
                  colorScheme={accentColorScheme}
                  isLoading={loggingOut}
                  isLoadingText={t("logging_out")}
                  onPress={onLogOutContinuePress}
                >
                  {t("log_out_continue")}
                </Button>
              </VStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </VStack>
  );
};

export default MainView;
