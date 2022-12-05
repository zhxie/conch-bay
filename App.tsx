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
const theme = extendTheme({
  config: config,
  components: {
    Button: {
      variants: {
        default: ({ colorScheme }: Record<string, any>) => {
          return {
            _text: {
              color: `${colorScheme}.900`,
            },
            _icon: {
              color: `${colorScheme}.900`,
            },
            _spinner: {
              color: `${colorScheme}.900`,
            },
            bg: `${colorScheme}.100`,
            _hover: {
              bg: `${colorScheme}.200`,
            },
            _pressed: {
              bg: `${colorScheme}.300`,
            },

            _dark: {
              _text: {
                color: `${colorScheme}.300`,
              },
              _icon: {
                color: `${colorScheme}.300`,
              },
              _spinner: {
                color: `${colorScheme}.300`,
              },
              bg: `${colorScheme}.700`,
              _hover: {
                bg: `${colorScheme}.600`,
              },
              _pressed: {
                bg: `${colorScheme}.500`,
              },
            },
          };
        },
      },
    },
  },
});

// Localization.
const i18n = new I18n();
i18n.translations = { en, ja, zh };
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = Localization.locale;

const App = () => {
  const t = (str: string) => {
    return i18n.t(str);
  };

  return (
    <NativeBaseProvider theme={theme}>
      <MainView t={t} />
    </NativeBaseProvider>
  );
};

export default App;
