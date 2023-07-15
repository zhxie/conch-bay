import withAndroidLocalizedName from "@mmomtchev/expo-android-localized-app-name";

const config = {
  name: "Conch Bay",
  slug: "conch-bay",
  version: "1.7.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: "./assets/icon.png",
  updates: {
    fallbackToCacheTimeout: 0,
  },
  locales: {
    en: "./i18n/locales/en.json",
    ja: "./i18n/locales/ja.json",
    "zh-Hans": "./i18n/locales/zh-Hans.json",
    "zh-Hant": "./i18n/locales/zh-Hant.json",
  },
  assetBundlePatterns: ["**/*"],
  plugins: [withAndroidLocalizedName],
  splash: {
    image: "./assets/splash.png",
    backgroundColor: "#FAFAFA",
  },
  ios: {
    bundleIdentifier: "name.sketch.ConchBay",
    buildNumber: "93",
    config: {
      usesNonExemptEncryption: false,
    },
    supportsTablet: true,
    infoPlist: {
      CFBundleAllowMixedLocalizations: true,
      UIBackgroundModes: ["fetch"],
    },
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#FAFAFA",
      dark: {
        image: "./assets/splash.png",
        backgroundColor: "#18181B",
      },
    },
  },
  android: {
    package: "name.sketch.conch_bay",
    versionCode: 93,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#6B84F5",
    },
    splash: {
      image: "./assets/splash.png",
      backgroundColor: "#FAFAFA",
      dark: {
        image: "./assets/splash.png",
        backgroundColor: "#18181B",
      },
    },
    intentFilters: [
      {
        autoVerify: true,
        action: "VIEW",
        data: { scheme: "npf71b963c1b7b6d119" },
        category: ["BROWSABLE", "DEFAULT"],
      },
    ],
  },
  extra: {
    eas: {
      projectId: "6dc18d15-fec6-4bb7-a5c3-b91f9137d933",
    },
  },
};

export default config;
