import * as Localization from "expo-localization";
import { I18n, Scope, TranslateOptions } from "i18n-js";
import en from "./en";
import ja from "./ja";
import zhHans from "./zh-Hans";
import zhHant from "./zh-Hant";

interface ScopeWithDefaultValue {
  id: string;
  name: string;
}

const i18n = new I18n();
i18n.translations = {
  en,
  ja,
  zh: zhHans,
  "zh-Hans": zhHans,
  "zh-Hant": zhHant,
};
i18n.enableFallback = true;
i18n.defaultLocale = "en";
i18n.locale = Localization.getLocales()[0].languageTag;

const t = (f: Scope | null | undefined, options?: TranslateOptions) => {
  if (!f) {
    return "";
  }
  if (options) {
    const { defaultValue, ...rest } = options;

    return i18n.t(f, { defaultValue: defaultValue ?? f, ...rest });
  }
  return i18n.t(f, { defaultValue: f });
};

const td = (f: ScopeWithDefaultValue | null | undefined) => {
  if (!f) {
    return "";
  }
  return i18n.t(f.id, { defaultValue: f.name });
};

export default t;
export { ScopeWithDefaultValue, td };
