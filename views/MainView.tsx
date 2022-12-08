import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
  Avatar,
  Badge,
  Button,
  HStack,
  Modal,
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
import { BattleHistoryGroup, Friends, Schedules, VsHistoryDetail } from "../models";
import {
  checkBulletToken,
  fetchBattleHistories,
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

  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const [sessionToken, setSessionToken] = useState("");
  const [bulletToken, setBulletToken] = useState("");
  const [icon, setIcon] = useState("");
  const [level, setLevel] = useState("");
  const [rank, setRank] = useState("");
  const [grade, setGrade] = useState("");

  const [schedules, setSchedules] = useState<Schedules | undefined>(undefined);
  const [friends, setFriends] = useState<Friends | undefined>(undefined);
  const [battles, setBattles] = useState<VsHistoryDetail[] | undefined>(undefined);

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
        await refresh(sessionToken, bulletToken);
      } catch (e) {
        showError(e);
      }
    };
    fetchData();
  }, []);
  const loadPersistence = async () => {
    const sessionToken = (await AsyncStorage.getItem("sessionToken")) ?? "";
    const bulletToken = (await AsyncStorage.getItem("bulletToken")) ?? "";

    setSessionToken(sessionToken);
    setBulletToken(bulletToken);
    setIcon((await AsyncStorage.getItem("icon")) ?? "");
    setLevel((await AsyncStorage.getItem("level")) ?? "");
    setRank((await AsyncStorage.getItem("rank")) ?? "");
    setGrade((await AsyncStorage.getItem("grade")) ?? "");

    return {
      sessionToken,
      bulletToken,
    };
  };
  const savePersistence = async (persistence: Record<string, string>) => {
    for (let key of ["sessionToken", "bulletToken", "icon", "level", "rank", "grade"]) {
      if (persistence[key]) {
        await AsyncStorage.setItem(key, persistence[key]);
      }
    }
  };
  const clearPersistence = async () => {
    await AsyncStorage.clear();
  };

  const refresh = async (sessionToken: string, bulletToken?: string) => {
    setRefreshing(true);
    // Query stored latest 50 results.
    const connection = await Database.open();
    await Database.clear(connection);
    const details = (await Database.query(connection, 0, 50)).map(
      (record) => JSON.parse(record.detail) as VsHistoryDetail
    );
    if (details.length > 0) {
      setBattles(details);
    }
    try {
      // Fetch schedules.
      const schedules = await fetchSchedules();
      setSchedules(schedules);
      if (sessionToken) {
        // Update versions.
        await updateNsoappVersion();
        await updateWebViewVersion();

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
          savePersistence({
            bulletToken: newBulletToken,
          });
        }

        // Fetch friends and summary.
        const [friends, summary] = await Promise.all([
          fetchFriends(newBulletToken),
          fetchSummary(newBulletToken),
        ]);
        setFriends(friends);
        const icon = summary.currentPlayer.userIcon.url;
        const level = summary.playHistory.rank;
        const rank = summary.playHistory.udemae;
        setIcon(icon);
        setLevel(String(level));
        setRank(rank);
        savePersistence({
          icon: icon,
          level: String(level),
          rank: rank,
        });

        // Fetch battle results.
        const [battleHistories] = await Promise.all([fetchBattleHistories(newBulletToken)]);
        let battles: {
          id: string;
          historyGroup: BattleHistoryGroup;
        }[] = [];
        battleHistories.regular.regularBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            battles.push({ id: historyDetail.id, historyGroup: historyGroup })
          )
        );
        battleHistories.anarchy.bankaraBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            battles.push({ id: historyDetail.id, historyGroup: historyGroup })
          )
        );
        battleHistories.x.xBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            battles.push({ id: historyDetail.id, historyGroup: historyGroup })
          )
        );
        battleHistories.private.privateBattleHistories.historyGroups.nodes.forEach((historyGroup) =>
          historyGroup.historyDetails.nodes.forEach((historyDetail) =>
            battles.push({ id: historyDetail.id, historyGroup: historyGroup })
          )
        );
        const existed = await Promise.all(
          battles.map((battle) => Database.isExist(connection, battle.id))
        );
        const newBattles = battles.filter((_, i) => !existed[i]);
        if (newBattles.length > 0) {
          const details = await Promise.all(
            newBattles.map((battle) => fetchVsHistoryDetail(battle.id, newBulletToken))
          );
          const skipOverviews: string[] = [];
          for (let i = 0; i < newBattles.length; i++) {
            let overview = "";
            if (!skipOverviews.find((id) => id === newBattles[i].id)) {
              overview = JSON.stringify(newBattles[i].historyGroup);
            }
            newBattles[i].historyGroup.historyDetails.nodes.forEach((detail) => {
              skipOverviews.push(detail.id);
            });
            await Database.add(
              connection,
              details[i].vsHistoryDetail.id,
              new Date(details[i].vsHistoryDetail.playedTime).valueOf(),
              details[i].vsHistoryDetail.vsMode.id,
              details[i].vsHistoryDetail.vsRule.id,
              overview,
              JSON.stringify(details[i])
            );
          }
        }

        // Query stored latest 50 results if updated.
        if (newBattles.length > 0) {
          const details = (await Database.query(connection, 0, 50)).map(
            (record) => JSON.parse(record.detail) as VsHistoryDetail
          );
          setBattles(details);
        }
      }
    } catch (e) {
      showError(e);
    }
    Database.close(connection);
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

      await refresh(res3);

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
      await clearPersistence();
      await loadPersistence();
      setFriends(undefined);
      setLoggingOut(false);
      setLogOut(false);
    } catch (e) {
      showError(e);
      setLoggingOut(false);
    }
  };

  return (
    <VStack flex={1} bg="gray.50" _dark={{ bg: "gray.900" }}>
      <ScrollView
        refreshControl={
          <RefreshControl
            progressViewOffset={insets.top}
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
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
                {level.length > 0 && <Badge colorScheme="green">{level}</Badge>}
                {rank.length > 0 && <Badge colorScheme="orange">{rank}</Badge>}
                {grade.length > 0 && <Badge colorScheme="amber">{grade}</Badge>}
              </HStack>
            </VStack>
          )}
          <ScheduleView t={t} accentColor={accentColor} schedules={schedules} />
          {sessionToken.length > 0 && <FriendView accentColor={accentColor} friends={friends} />}
          {sessionToken.length > 0 && (
            <ResultView t={t} accentColor={accentColor} battles={battles} />
          )}
        </VStack>
      </ScrollView>
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
