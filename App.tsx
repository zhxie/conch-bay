import dayjs from "dayjs";
import duration from "dayjs/plugin/duration";
import quarterOfYear from "dayjs/plugin/quarterOfYear";
import utc from "dayjs/plugin/utc";
import * as Font from "expo-font";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import ErrorBoundary from "react-native-error-boundary";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ToastBannerProvider, ToastBannerPresenter } from "react-native-toast-banner";
import { SplashtagContext, useTheme } from "./components";
import "./i18n";
import { ok } from "./utils/promise";
import { ErrorView, MainView } from "./views";

dayjs.extend(duration);
dayjs.extend(quarterOfYear);
dayjs.extend(utc);

const App = () => {
  const theme = useTheme();

  const [ready, setReady] = useState(false);
  const [splatfont, setSplatfont] = useState(false);

  useEffect(() => {
    ok(
      Font.loadAsync({
        Lucide: require("lucide-static/font/lucide.ttf"),
        MPLUSRounded1cExtraBold: require("@expo-google-fonts/m-plus-rounded-1c/MPLUSRounded1c_800ExtraBold.ttf"),
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

  return (
    <SafeAreaProvider style={theme.backgroundStyle}>
      <ToastBannerProvider>
        <SplashtagContext.Provider value={{ splatfont }}>
          <StatusBar style={theme.colorScheme === "light" ? "dark" : "light"} />
          <ErrorBoundary FallbackComponent={ErrorView}>
            {ready && <MainView />}
            <ToastBannerPresenter />
          </ErrorBoundary>
        </SplashtagContext.Provider>
      </ToastBannerProvider>
    </SafeAreaProvider>
  );
};

export default App;
