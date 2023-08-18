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

const getBackgroundMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/NamePlateBgInfo.json`
  );
  const json = await res.json();
  const backgrounds = {};
  for (const background of json) {
    const id = Buffer.from(`NameplateBackground-${background["Id"]}`).toString("base64");
    const image = createHash("sha256").update(background["__RowId"]).digest("hex");
    backgrounds[id] = image;
  }
  return { backgrounds };
};
const getBadgeMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/BadgeInfo.json`
  );
  const json = await res.json();
  const badges = {};
  for (const badge of json) {
    const id = Buffer.from(`Badge-${badge["Id"]}`).toString("base64");
    const image = createHash("sha256").update(badge["Name"]).digest("hex");
    badges[id] = image;
  }
  return { badges };
};
const getCoopStageMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopSceneInfo.json`
  );
  const json = await res.json();
  const coopStages = {};
  for (const stage of json) {
    const id = Buffer.from(`CoopStage-${stage["Id"]}`).toString("base64");
    const image = createHash("sha256").update(stage["__RowId"]).digest("hex");
    coopStages[id] = image;
  }
  return { coopStages };
};
const getWeaponMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoMain.json`
  );
  const json = await res.json();
  const weapons = {};
  const images = {};
  const coopRareWeapons = [];
  for (const weapon of json) {
    if (weapon["Type"] === "Versus" || (weapon["Type"] === "Coop" && weapon["IsCoopRare"])) {
      const id = Buffer.from(`Weapon-${weapon["Id"]}`).toString("base64");
      const image = createHash("sha256").update(weapon["__RowId"]).digest("hex");
      weapons[id] = image;
      images[image] = id;
      if (weapon["IsCoopRare"]) {
        coopRareWeapons.push(id);
      }
    }
  }
  return { weapons, images, coopRareWeapons };
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
const getSalmonidMap = async () => {
  const map = {
    SakelienBomber: 4,
    SakelienCupTwins: 5,
    SakelienShield: 6,
    SakelienSnake: 7,
    SakelienTower: 8,
    Sakediver: 9,
    Sakerocket: 10,
    SakePillar: 11,
    SakeDolphin: 12,
    SakeArtillery: 13,
    SakeSaucer: 14,
    SakelienGolden: 15,
    Sakedozer: 17,
    SakeBigMouth: 20,
    SakelienGiant: 23,
    SakeRope: 24,
  };
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopEnemyInfo.json`
  );
  const json = await res.json();
  const salmonids = {};
  for (const salmonid of json) {
    if (map[salmonid["Type"]]) {
      const id = Buffer.from(`CoopEnemy-${map[salmonid["Type"]]}`).toString("base64");
      const image = createHash("sha256").update(salmonid["Type"]).digest("hex");
      salmonids[id] = image;
    }
  }
  return { salmonids };
};
const getWorkSuitMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopSkinInfo.json`
  );
  const json = await res.json();
  const workSuits = {};
  for (const workSuit of json) {
    const id = Buffer.from(`CoopUniform-${workSuit["Id"]}`).toString("base64");
    const image = createHash("sha256").update(workSuit["__RowId"]).digest("hex");
    workSuits[id] = image;
  }
  return { workSuits };
};

const [nso_version, splatnet_version] = await Promise.all([getNsoVersion(), getSplatnetVersion()]);
writeOut("models/versions.json", { NSO_VERSION: nso_version, SPLATNET_VERSION: splatnet_version });

const [
  backgroundMap,
  badgeMap,
  coopStageMap,
  weaponMap,
  coopSpecialWeaponMap,
  salmonidMap,
  workSuitMap,
] = await Promise.all([
  getBackgroundMap(),
  getBadgeMap(),
  getCoopStageMap(),
  getWeaponMap(),
  getCoopSpecialWeaponMap(),
  getSalmonidMap(),
  getWorkSuitMap(),
]);
writeOut("models/backgrounds.json", backgroundMap);
writeOut("models/badges.json", badgeMap);
writeOut("models/coopStages.json", coopStageMap);
writeOut("models/weapons.json", weaponMap);
writeOut("models/coopSpecialWeapons.json", coopSpecialWeaponMap);
writeOut("models/salmonids.json", salmonidMap);
writeOut("models/workSuits.json", workSuitMap);
