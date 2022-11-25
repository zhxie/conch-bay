import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import en from "./en";
import ja from "./ja";
import zh from "./zh";

const i18n = new I18n();
i18n.translations = { en, ja, zh };
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = Localization.locale;

const t = (scope, options) => {
  return i18n.t(scope, options);
};

export default t;
