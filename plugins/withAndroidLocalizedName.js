const fs = require("fs");
const path = require("path");
const { AndroidConfig, withStringsXml } = require("@expo/config-plugins");

const escapeXml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");

const formatLocaleQualifier = (locale) =>
  locale.includes("-") ? `b+${locale.replaceAll("-", "+")}` : locale;

module.exports = function withAndroidLocalizedName(config) {
  return withStringsXml(config, async (config) => {
    if (config.modRequest.introspect) {
      return config;
    }

    const projectRoot = config.modRequest.projectRoot;
    const resPath = await AndroidConfig.Paths.getResourceFolderAsync(projectRoot);
    const baseStrings = config.modResults.resources.string ?? [];

    for (const locale of Object.keys(config.locales ?? {})) {
      const json = await fs.promises.readFile(path.resolve(projectRoot, config.locales[locale]));
      const strings = JSON.parse(json);
      const resources = Object.keys(strings)
        .filter((key) =>
          baseStrings.find((item) => item.$.name === key && item.$.translatable !== false),
        )
        .map((key) => `  <string name="${escapeXml(key)}">${escapeXml(strings[key])}</string>`);

      if (resources.length) {
        const valuesPath = path.resolve(resPath, `values-${formatLocaleQualifier(locale)}`);
        await fs.promises.mkdir(valuesPath, { recursive: true });
        await fs.promises.writeFile(
          path.resolve(valuesPath, "strings.xml"),
          `<resources>\n${resources.join("\n")}\n</resources>`,
        );
      }
    }

    return config;
  });
};
