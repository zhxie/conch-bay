import { createWriteStream } from "fs";
import { init } from "license-checker";

const licenseFile = createWriteStream("oss-licenses.md", "utf-8");

init({ start: ".", customFormat: { licenseText: "" } }, (_, ret) => {
  licenseFile.write(
    "*See the [raw](https://github.com/zhxie/conch-bay/wiki/OSS-Licenses.md) file if the page does not render.*\n\n",
  );
  for (const name in ret) {
    const repository = ret[name]["repository"] ?? "";
    const licenseText = ret[name]["licenseText"] ?? "";
    licenseFile.write(`# [${name}](${repository})\n\n~~~\n${licenseText}\n~~~\n\n`);
  }
});
