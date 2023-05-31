import { Buffer } from "buffer";
import { createHash } from "crypto";
import { createWriteStream } from "fs";
import { get } from "https";

const VERSION = "400";
const weaponsFile = createWriteStream("models/weapons.json", "utf-8");

get(
  `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoMain.json`,
  (res) => {
    let raw = "";

    res.on("data", (chunk) => {
      raw += chunk;
    });

    res.on("end", () => {
      const json = JSON.parse(raw);
      const weapons = {};
      for (const weapon of json) {
        const id = Buffer.from(`Weapon-${weapon["Id"]}`).toString("base64");
        const image = createHash("sha256").update(weapon["__RowId"]).digest("hex");
        weapons[id] = image;
      }
      weaponsFile.write(JSON.stringify(weapons, undefined, 2) + "\n");
    });
  }
);
