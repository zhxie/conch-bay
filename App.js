import AsyncStorage from "@react-native-async-storage/async-storage";
import * as WebBrowser from "expo-web-browser";
import {
  Avatar,
  Button,
  HStack,
  Modal,
  NativeBaseProvider,
  Pressable,
  ScrollView,
  Text,
  useColorModeValue,
  useToast,
  VStack,
  WarningIcon,
} from "native-base";
import React, { useCallback, useEffect, useState } from "react";
import { ScheduleBox } from "./components";
import t from "./i18n";
import {
  fetchSchedules,
  generateLogIn,
  getBulletToken,
  getSessionToken,
  getWebServiceToken,
} from "./utils/api";
import theme from "./utils/theme";

const App = () => {
  const colorScheme = useColorModeValue("blue", "yellow");
  const toast = useToast();

  const [logIn, setLogIn] = useState(false);
  const [loggingIn, setLoggingIn] = useState(false);
  const [logOut, setLogOut] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const [sessionToken, setSessionToken] = useState("");
  const [webServiceToken, setWebServiceToken] = useState("");
  const [bulletToken, setBulletToken] = useState("");
  const [icon, setIcon] = useState("");
  const [level, setLevel] = useState("");
  const [rank, setRank] = useState("");
  const [grade, setGrade] = useState("");

  const [schedules, setSchedules] = useState(undefined);

  useEffect(() => {
    loadPersistence().catch((e) => toast.show({ description: e.message }));
  }, [loadPersistence]);
  const loadPersistence = async () => {
    setSessionToken((await AsyncStorage.getItem("sessionToken")) ?? "");
    setWebServiceToken((await AsyncStorage.getItem("webServiceToken")) ?? "");
    setBulletToken((await AsyncStorage.getItem("bulletToken")) ?? "");
    setIcon((await AsyncStorage.getItem("icon")) ?? "");
    setLevel((await AsyncStorage.getItem("level")) ?? "");
    setRank((await AsyncStorage.getItem("rank")) ?? "");
    setGrade((await AsyncStorage.getItem("grade")) ?? "");
  };
  const savePersistence = async (persistence) => {
    for (let key of [
      "sessionToken",
      "webServiceToken",
      "bulletToken",
      "icon",
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const schedules = await fetchSchedules();
        setSchedules(schedules);
      } catch (e) {
        toast.show({ description: e.message });
      }
    };
    fetchData();
  }, [setSchedules]);
  const schedule = useCallback(
    (mode) => {
      if (schedules === undefined) {
        return undefined;
      }
      const nodes = schedules["data"][mode]["nodes"];
      if (nodes.length === 0) {
        return null;
      }
      return nodes[0];
    },
    [schedules]
  );
  const regularSchedule = schedule("regularSchedules");
  const anarchySchedule = schedule("bankaraSchedules");
  const shift = useCallback(
    (mode) => {
      if (schedules === undefined) {
        return undefined;
      }
      const nodes = schedules["data"]["coopGroupingSchedule"][mode]["nodes"];
      if (nodes.length === 0) {
        return null;
      }
      return nodes[0];
    },
    [schedules]
  );
  const regularShift = shift("regularSchedules");

  return (
    <NativeBaseProvider theme={theme}>
      <VStack flex={1} _dark={{ bg: "gray.900" }} _light={{ bg: "gray.50" }}>
        <ScrollView>
          <VStack space={4} alignItems="center" safeArea>
            {!sessionToken && (
              <VStack px={4} space={2} alignItems="center">
                <Button
                  colorScheme={colorScheme}
                  onPress={() => setLogIn(true)}
                >
                  {t("log_in")}
                </Button>
              </VStack>
            )}
            {sessionToken.length > 0 && (
              <VStack px={4} space={2} alignItems="center">
                <Pressable onPress={() => setLogOut(true)}>
                  <Avatar
                    size="lg"
                    _dark={{ bg: "gray.700" }}
                    _light={{ bg: "gray.100" }}
                  />
                </Pressable>
              </VStack>
            )}
            <ScrollView
              horizontal
              w={96}
              flexGrow="unset"
              showsHorizontalScrollIndicator="false"
            >
              <HStack space={2} px={4}>
                {regularSchedule !== null && (
                  <ScheduleBox
                    color="regular"
                    matchSetting={regularSchedule?.["regularMatchSetting"]}
                  />
                )}
                {anarchySchedule !== null && (
                  <ScheduleBox
                    color="anarchy"
                    matchSetting={anarchySchedule?.["bankaraMatchSettings"][0]}
                  />
                )}
                {anarchySchedule !== null && (
                  <ScheduleBox
                    color="anarchy"
                    matchSetting={anarchySchedule?.["bankaraMatchSettings"][1]}
                  />
                )}
                {regularShift !== null && (
                  <ScheduleBox
                    color="salmon"
                    title={t("salmon_run")}
                    coopSetting={regularShift?.["setting"]}
                  />
                )}
              </HStack>
            </ScrollView>
          </VStack>
        </ScrollView>
      </VStack>
      <Modal
        isOpen={logIn}
        onClose={() => {
          if (!loggingIn) {
            setLogIn(false);
          }
        }}
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
                  colorScheme={colorScheme}
                  variant="subtle"
                  onPress={() =>
                    WebBrowser.openBrowserAsync(
                      "https://github.com/JoneWang/imink/wiki/Privacy-Policy"
                    )
                  }
                >
                  {t("imink_privacy_policy")}
                </Button>
                <Button
                  colorScheme={colorScheme}
                  isLoading={loggingIn}
                  isLoadingText={t("logging_in")}
                  onPress={async () => {
                    try {
                      setLoggingIn(true);
                      const res = await generateLogIn();
                      WebBrowser.maybeCompleteAuthSession();
                      const res2 = await WebBrowser.openAuthSessionAsync(
                        res.url,
                        "npf71b963c1b7b6d119://"
                      );
                      if (res2.type !== "success") {
                        setLoggingIn(false);
                        return;
                      }

                      const res3 = await getSessionToken(res2.url, res.cv);
                      setSessionToken(res3);
                      await savePersistence({ sessionToken: res3 });

                      const res4 = await getWebServiceToken(res3);
                      setWebServiceToken(res4.webServiceToken);
                      const res5 = await getBulletToken(
                        res4.webServiceToken,
                        res4.country
                      );
                      setBulletToken(res5);
                      await savePersistence({
                        webServiceToken: res4.webServiceToken,
                        bulletToken: res5,
                      });

                      setLoggingIn(false);
                      setLogIn(false);
                    } catch (e) {
                      toast.show({ description: e.message });
                      setLoggingIn(false);
                    }
                  }}
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
        onClose={() => {
          if (!loggingOut) {
            setLogOut(false);
          }
        }}
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
                  colorScheme={colorScheme}
                  isLoading={loggingOut}
                  isLoadingText={t("logging_out")}
                  onPress={async () => {
                    try {
                      setLoggingOut(true);
                      await clearPersistence();
                      await loadPersistence();
                      setLoggingOut(false);
                      setLogOut(false);
                    } catch (e) {
                      toast.show({ description: e.message });
                      setLoggingOut(false);
                    }
                  }}
                >
                  {t("log_out_continue")}
                </Button>
              </VStack>
            </VStack>
          </Modal.Body>
        </Modal.Content>
      </Modal>
    </NativeBaseProvider>
  );
};

export default App;
