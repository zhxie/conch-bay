const { withAndroidManifest } = require("@expo/config-plugins");

module.exports = function androiManifestPlugin(config) {
  return withAndroidManifest(config, (config) => {
    let androidManifest = config.modResults.manifest;
    androidManifest.application[0].$["android:largeHeap"] = "true";
    return config;
  });
};
