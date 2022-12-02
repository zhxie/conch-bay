import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
  Avatar,
  Badge,
  Button,
  HStack,
  Modal,
  Pressable,
  ScrollView,
  Skeleton,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  WarningIcon,
} from "native-base";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  fetchFriends,
  fetchSchedules,
  fetchSummary,
  generateLogIn,
  getBulletToken,
  getSessionToken,
  getWebServiceToken,
  updateNsoappVersion,
  updateWebViewVersion,
} from "../utils/api";
import ScheduleView from "./ScheduleView";

const MainView = (props) => {
  const { t } = props;

  const accentColorScheme = useColorModeValue("blue", "yellow");
  const accentColor = useColorModeValue("blue.500", "yellow.500");

  const insets = useSafeAreaInsets();
  const toast = useToast();

  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [refreshing, setRefreshing] = useState(true);

  const [sessionToken, setSessionToken] = useState("");
  const [bulletToken, setBulletToken] = useState("");
  const [icon, setIcon] = useState("");
  const [level, setLevel] = useState("");
  const [rank, setRank] = useState("");
  const [grade, setGrade] = useState("");

  const [schedules, setSchedules] = useState(null);
  const [friends, setFriends] = useState(undefined);

  useEffect(() => {
    loadPersistence().catch((e) => toast.show({ description: e.message }));
  }, [loadPersistence]);
  const loadPersistence = async () => {
    setSessionToken((await AsyncStorage.getItem("sessionToken")) ?? "");
    setBulletToken((await AsyncStorage.getItem("bulletToken")) ?? "");
    setIcon((await AsyncStorage.getItem("icon")) ?? "");
    setLevel((await AsyncStorage.getItem("level")) ?? "");
    setRank((await AsyncStorage.getItem("rank")) ?? "");
    setGrade((await AsyncStorage.getItem("grade")) ?? "");
  };
  const savePersistence = async (persistence) => {
    for (let key of ["sessionToken", "bulletToken", "icon", "level", "rank", "grade"]) {
      if (persistence[key]) {
        await AsyncStorage.setItem(key, persistence[key]);
      }
    }
  };
  const clearPersistence = async () => {
    await AsyncStorage.clear();
  };

  const friendMark = (onlineState) => {
    switch (onlineState) {
      case "COOP_MODE_FIGHTING":
        return "orange.500";
      case "VS_MODE_FIGHTING":
        return "orange.600";
      case "ONLINE":
        return "teal.300";
      default:
        return "white";
    }
  };

  const regeneratingBulletToken = useRef(false);
  const regenerateBulletToken = async (sessionToken) => {
    if (!sessionToken || regeneratingBulletToken.current) {
      return;
    }
    regeneratingBulletToken.current = true;

    try {
      await updateNsoappVersion();
      await updateWebViewVersion();
      const res = await getWebServiceToken(sessionToken);
      const res2 = await getBulletToken(res.webServiceToken, res.country);
      setBulletToken(res2);
      await savePersistence({
        bulletToken: res2,
      });
    } catch (e) {
      toast.show({ description: e.message });
    }
    regeneratingBulletToken.current = false;
  };
  useEffect(() => {
    onRefresh();
  }, [bulletToken]);
  const onRefreshCount = useRef(0);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    onRefreshCount.current += 1;

    try {
      const schedules = await fetchSchedules();
      setSchedules(schedules);
      if (sessionToken) {
        const [friends, summary] = await Promise.all([
          fetchFriends(bulletToken),
          fetchSummary(bulletToken),
        ]);
        setFriends(friends);
        const icon = summary["data"]["currentPlayer"]["userIcon"]["url"];
        const level = summary["data"]["playHistory"]["rank"];
        const rank = summary["data"]["playHistory"]["udemae"];
        setIcon(icon);
        setLevel(String(level));
        setRank(rank);
        savePersistence({
          icon: icon,
          level: String(level),
          rank: rank,
        });
      }
      if (onRefreshCount.current === 1) {
        setRefreshing(false);
      }
    } catch (e) {
      toast.show({ description: e.message });
      await regenerateBulletToken(sessionToken);
    }
    onRefreshCount.current -= 1;
  });

  const onLogInClose = useCallback(() => {
    if (!loggingIn) {
      setLogIn(false);
    }
  }, [loggingIn]);
  const onPrivacyPolicyPress = useCallback(() => {
    WebBrowser.openBrowserAsync("https://github.com/JoneWang/imink/wiki/Privacy-Policy");
  }, []);
  const onLogInPress = useCallback(async () => {
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

      await regenerateBulletToken(res3);

      setLoggingIn(false);
      setLogIn(false);
    } catch (e) {
      toast.show({ description: e.message });
      setLoggingIn(false);
    }
  });
  const onLogOutClose = useCallback(() => {
    if (!loggingOut) {
      setLogOut(false);
    }
  }, [loggingOut]);
  const onLogOutPress = useCallback(async () => {
    try {
      setLoggingOut(true);
      await clearPersistence();
      await loadPersistence();
      setFriends(undefined);
      setLoggingOut(false);
      setLogOut(false);
    } catch (e) {
      toast.show({ description: e.message });
      setLoggingOut(false);
    }
  }, []);

  return (
    <VStack flex={1} _dark={{ bg: "gray.900" }} _light={{ bg: "gray.50" }}>
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
              <Button colorScheme={accentColorScheme} onPress={() => setLogIn(true)}>
                {t("log_in")}
              </Button>
            </VStack>
          )}
          {sessionToken.length > 0 && (
            <VStack px={4} space={2} alignItems="center">
              <Pressable onPress={() => setLogOut(true)}>
                {({ isPressed }) => {
                  return (
                    <Skeleton
                      size={16}
                      rounded="full"
                      isLoaded={icon}
                      style={{
                        transform: [
                          {
                            scale: isPressed ? 0.96 : 1,
                          },
                        ],
                      }}
                    >
                      <Avatar
                        size="lg"
                        _dark={{ bg: "gray.700" }}
                        _light={{ bg: "gray.100" }}
                        source={{
                          uri: icon,
                        }}
                        style={{
                          transform: [
                            {
                              scale: isPressed ? 0.96 : 1,
                            },
                          ],
                        }}
                      />
                    </Skeleton>
                  );
                }}
              </Pressable>
              <HStack space={2} alignSelf="center">
                {level.length > 0 && <Badge colorScheme="green">{level}</Badge>}
                {rank.length > 0 && <Badge colorScheme="orange">{rank}</Badge>}
                {grade.length > 0 && <Badge colorScheme="amber">{grade}</Badge>}
              </HStack>
            </VStack>
          )}
          <ScheduleView t={t} accentColor={accentColor} schedules={schedules} />
          {friends && (
            <ScrollView horizontal w="100%" flexGrow="unset" showsHorizontalScrollIndicator="false">
              <HStack space={2} px={4}>
                {friends["data"]["friends"]["nodes"].map((friend) => {
                  return (
                    <Pressable key={friend["id"]}>
                      {({ isPressed }) => {
                        return (
                          <Avatar
                            size="md"
                            _dark={{ bg: "gray.700" }}
                            _light={{ bg: "gray.100" }}
                            source={{
                              uri: friend["userIcon"]["url"],
                            }}
                            borderColor={friendMark(friend["onlineState"])}
                            borderWidth={friend["onlineState"] !== "OFFLINE" ? 2 : 0}
                            style={{
                              transform: [
                                {
                                  scale: isPressed ? 0.96 : 1,
                                },
                              ],
                            }}
                          />
                        );
                      }}
                    </Pressable>
                  );
                })}
              </HStack>
            </ScrollView>
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
                  onPress={onLogInPress}
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
                  onPress={onLogOutPress}
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