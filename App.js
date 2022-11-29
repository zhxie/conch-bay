import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import { extendTheme, NativeBaseProvider } from "native-base";
import React from "react";
import { en, ja, zh } from "./i18n";
import MainView from "./views/MainView";

// Use system color mode.
const config = {
  useSystemColorMode: true,
};
const theme = extendTheme({ config: config });

// Localization.
const i18n = new I18n();
i18n.translations = { en, ja, zh };
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = Localization.locale;

const App = () => {
  const t = (scope, options) => {
    return i18n.t(scope, options);
  };

  return (
    <NativeBaseProvider theme={theme}>
      <MainView t={t} />
    </NativeBaseProvider>
  );
};

export default App;
