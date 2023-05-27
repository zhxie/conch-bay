import { MPLUSRounded1c_800ExtraBold } from "@expo-google-fonts/m-plus-rounded-1c";
import * as Font from "expo-font";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastBannerProvider, ToastBannerPresenter } from "react-native-toast-banner";
import { CoopButtonContext, SplashtagContext, ViewStyles } from "./components";
import "./i18n";
import { ok } from "./utils/promise";
import { MainView } from "./views";

const App = () => {
  const colorScheme = useColorScheme();
  const statusBarStyle = colorScheme === "light" ? "dark" : "light";
  const backgroundStyle = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;

  const [ready, setReady] = useState(false);
  const [grade, setGrade] = useState(false);
  const [splatfont, setSplatfont] = useState(false);

  useEffect(() => {
    ok(
      Font.loadAsync({
        Lucide: require("./assets/fonts/Lucide.ttf"),
        MPLUSRounded1cExtraBold: MPLUSRounded1c_800ExtraBold,
      })
    ).then(() => {
      setReady(true);
    });
    ok(
      Font.loadAsync({
        Splatfont:
          "https://cdn.jsdelivr.net/gh/frozenpandaman/frozenpandaman.github.io/Splatoon1.otf",
      })
    ).then((res) => {
      setSplatfont(res);
    });
  });

  const changeGrade = () => {
    setGrade(!grade);
  };

  return (
    <SafeAreaProvider style={backgroundStyle}>
      <ToastBannerProvider>
        <CoopButtonContext.Provider value={{ grade, changeGrade }}>
          <SplashtagContext.Provider value={{ splatfont }}>
            <StatusBar style={statusBarStyle} />
            {ready && <MainView />}
            <ToastBannerPresenter />
          </SplashtagContext.Provider>
        </CoopButtonContext.Provider>
      </ToastBannerProvider>
    </SafeAreaProvider>
  );
};

export default App;
