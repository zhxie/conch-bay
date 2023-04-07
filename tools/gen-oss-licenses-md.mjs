import { createWriteStream } from "fs";
import { init } from "license-checker";

const licenseFile = createWriteStream("oss-licenses.md", "utf-8");

init({ start: ".", customFormat: { licenseText: "" } }, (_, ret) => {
  for (const name in ret) {
    const repository = ret[name]["repository"] ?? "";
    const licenseText = ret[name]["licenseText"] ?? "";
    licenseFile.write(`# [${name}](${repository})\n${licenseText}\n`);
  }
});
