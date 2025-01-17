import withAndroidLocalizedName from "@mmomtchev/expo-android-localized-app-name";
import withAndroidLargeHeap from "./plugins/withAndroidLargeHeap";

const IS_DEV = process.env.APP_VARIANT === "development";

const config = {
  name: "Conch Bay",
  slug: "conch-bay",
  version: "2.2.0",
  orientation: "portrait",
  userInterfaceStyle: "automatic",
  icon: IS_DEV ? "./assets/icon-dev.png" : "./assets/icon.png",
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
  plugins: [
    withAndroidLargeHeap,
    withAndroidLocalizedName,
    "expo-localization",
    [
      "expo-build-properties",
      {
        ios: {
          deploymentTarget: "15.5",
        },
      },
    ],
    ["expo-sqlite"],
  ],
  splash: {
    image: "./assets/splash.png",
    backgroundColor: "#FAFAFA",
  },
  ios: {
    bundleIdentifier: IS_DEV ? "name.sketch.ConchBay.dev" : "name.sketch.ConchBay",
    buildNumber: "173",
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
    privacyManifests: {
      NSPrivacyAccessedAPITypes: [
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryDiskSpace",
          NSPrivacyAccessedAPITypeReasons: ["E174.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryFileTimestamp",
          NSPrivacyAccessedAPITypeReasons: ["DDA9.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategoryUserDefaults",
          NSPrivacyAccessedAPITypeReasons: ["1C8F.1"],
        },
        {
          NSPrivacyAccessedAPIType: "NSPrivacyAccessedAPICategorySystemBootTime",
          NSPrivacyAccessedAPITypeReasons: ["3D61.1"],
        },
      ],
    },
  },
  android: {
    package: IS_DEV ? "name.sketch.conch_bay.dev" : "name.sketch.conch_bay",
    versionCode: 173,
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: IS_DEV ? "#FFFFFF" : "#6B84F5",
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
  scheme: IS_DEV ? "conchbaydev" : "conchbay",
  extra: {
    eas: {
      projectId: "6dc18d15-fec6-4bb7-a5c3-b91f9137d933",
    },
  },
};

export default config;
