import * as Font from "expo-font";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastBannerProvider, ToastBannerPresenter } from "react-native-toast-banner";
import { CoopButtonContext, ViewStyles } from "./components";
import "./i18n";
import { MainView } from "./views";

const App = () => {
  const colorScheme = useColorScheme();
  const statusBarStyle = colorScheme === "light" ? "dark" : "light";
  const backgroundStyle = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;

  const [ready, setReady] = useState(false);
  const [grade, setGrade] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          Lucide: require("./assets/fonts/Lucide.ttf"),
          Splatfont: require("./assets/fonts/Splatfont.otf"),
        });
      } catch {
        /* empty */
      }
      setReady(true);
    })();
  });

  const changeGrade = () => {
    setGrade(!grade);
  };

  return (
    <SafeAreaProvider style={backgroundStyle}>
      <ToastBannerProvider>
        <CoopButtonContext.Provider value={{ grade, changeGrade }}>
          <StatusBar style={statusBarStyle} />
          {ready && <MainView />}
          <ToastBannerPresenter />
        </CoopButtonContext.Provider>
      </ToastBannerProvider>
    </SafeAreaProvider>
  );
};

export default App;
