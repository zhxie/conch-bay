import * as Localization from "expo-localization";
import { StatusBar } from "expo-status-bar";
import { I18n } from "i18n-js";
import React from "react";
import { useColorScheme } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { ViewStyles } from "./components";
import { en, ja, zh } from "./i18n";
import { MainView } from "./views";

// Localization.
const i18n = new I18n();
i18n.translations = { en, ja, zh };
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = Localization.locale;

const App = () => {
  const colorScheme = useColorScheme();
  const statusBarStyle = colorScheme === "light" ? "dark" : "light";
  const backgroundStyle = colorScheme === "light" ? ViewStyles.light : ViewStyles.dark;

  const t = (f: string, params?: Record<string, any>) => {
    return i18n.t(f, params);
  };

  return (
    <SafeAreaProvider style={backgroundStyle}>
      <StatusBar style={statusBarStyle} />
      <MainView t={t} />
    </SafeAreaProvider>
  );
};

export default App;
