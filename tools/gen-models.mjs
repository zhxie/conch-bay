import { Buffer } from "buffer";
import { createHash } from "crypto";
import { createWriteStream } from "fs";

const VERSION = "410";

const writeOut = (path, obj) => {
  const file = createWriteStream(path, "utf-8");
  file.write(JSON.stringify(obj, undefined, 2) + "\n");
};

const getNsoVersion = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/nintendoapis/nintendo-app-versions/main/data/coral-google-play.json"
  );
  const json = await res.json();
  return json["version"];
};
const getSplatnetVersion = async () => {
  const res = await fetch(
    "https://raw.githubusercontent.com/nintendoapis/nintendo-app-versions/main/data/splatnet3-app.json"
  );
  const json = await res.json();
  return json["web_app_ver"];
};

const getWeaponMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoMain.json`
  );
  const json = await res.json();
  const weapons = {};
  const images = {};
  for (const weapon of json) {
    if (weapon["Type"] === "Versus" || (weapon["Type"] === "Coop" && weapon["IsCoopRare"])) {
      const id = Buffer.from(`Weapon-${weapon["Id"]}`).toString("base64");
      const image = createHash("sha256").update(weapon["__RowId"]).digest("hex");
      weapons[id] = image;
      images[image] = id;
    }
  }
  return { weapons, images };
};
const getCoopSpecialWeaponMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoSpecial.json`
  );
  const json = await res.json();
  const specialWeapons = {};
  const images = {};
  for (const specialWeapon of json) {
    if (specialWeapon["Type"] === "Coop") {
      const id = Buffer.from(`SpecialWeapon-${specialWeapon["Id"]}`).toString("base64");
      const image = createHash("sha256")
        .update(specialWeapon["__RowId"].replace("_Coop", ""))
        .digest("hex");
      specialWeapons[id] = image;
      images[image] = id;
    }
  }
  return { specialWeapons, images };
};

const [nso_version, splatnet_version] = await Promise.all([getNsoVersion(), getSplatnetVersion()]);
writeOut("models/versions.json", { NSO_VERSION: nso_version, SPLATNET_VERSION: splatnet_version });

const [weaponMap, coopSpecialWeaponMap] = await Promise.all([
  getWeaponMap(),
  getCoopSpecialWeaponMap(),
]);
writeOut("models/weapons.json", weaponMap);
writeOut("models/coopSpecialWeapons.json", coopSpecialWeaponMap);
