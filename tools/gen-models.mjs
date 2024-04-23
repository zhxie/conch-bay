import { Buffer } from "buffer";
import { createHash } from "crypto";
import { createWriteStream } from "fs";

const VERSION = "720";

const writeOut = (path, obj) => {
  const file = createWriteStream(path, "utf-8");
  file.write(JSON.stringify(obj, undefined, 2) + "\n");
};
const buildTrie = (array) => {
  const trie = {};
  for (const obj of array) {
    let node = trie;
    for (const char of obj["key"]) {
      if (!node[char]) {
        node[char] = {};
      }
      node = node[char];
    }
    if (!node.tags) {
      node.tags = [];
    }
    node.tags.push(obj["value"]);
  }
  return trie;
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

const getCoopStageMap = async () => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopSceneInfo.json`
  );
  const json = await res.json();
  const coopStages = {};
  const bigRunStages = {};
  for (const stage of json) {
    const id = Buffer.from(`CoopStage-${stage["Id"]}`).toString("base64");
    const image = createHash("sha256").update(stage["__RowId"]).digest("hex");
    coopStages[id] = image;
    if (stage["Id"] >= 100) {
      bigRunStages[id] = image;
    }
  }
  return { coopStages, bigRunStages };
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
const getTitleMap = async () => {
  // TODO: need titles in languages with declension.
  const res = await Promise.all([
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/CNzh_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUen_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/JPja_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/KRko_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/TWzh_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/USen_unicode.json"),
  ]);
  const jsons = await Promise.all(res.map((r) => r.json()));
  const adjectives = [];
  const subjects = [];
  for (let i = 0; i < jsons.length; i++) {
    for (const key of Object.keys(jsons[i]["CommonMsg/Byname/BynameAdjective"])) {
      const id = `TitleAdjective-${key}`;
      adjectives.push({
        key: jsons[i]["CommonMsg/Byname/BynameAdjective"][key].replaceAll(/\[.+?\]/g, ""),
        value: {
          id,
          index: i,
        },
      });
    }
    const subject = {};
    for (const key of Object.keys(jsons[i]["CommonMsg/Byname/BynameSubject"])) {
      if (key.endsWith("_0")) {
        const neutralKey = key.replace("_0", "");
        const altKey = `${neutralKey}_1`;
        if (jsons[i]["CommonMsg/Byname/BynameSubject"][altKey].includes("group=0001")) {
          const id = `TitleSubject-${neutralKey}`;
          subject[jsons[i]["CommonMsg/Byname/BynameSubject"][key].replaceAll(/\[.+?\]/g, "")] = id;
        } else {
          const id = `TitleSubject-${key}`;
          subject[jsons[i]["CommonMsg/Byname/BynameSubject"][key].replaceAll(/\[.+?\]/g, "")] = id;
          const altId = `TitleSubject-${altKey}`;
          subject[jsons[i]["CommonMsg/Byname/BynameSubject"][altKey].replaceAll(/\[.+?\]/g, "")] =
            altId;
        }
      }
    }
    subjects.push(subject);
  }
  return { adjectives: buildTrie(adjectives), subjects };
};
const getAwardMap = async () => {
  const res = await Promise.all([
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/CNzh_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUde_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUen_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUes_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUfr_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUit_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUnl_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/EUru_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/JPja_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/KRko_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/TWzh_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/USen_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/USes_unicode.json"),
    fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/language/USfr_unicode.json"),
  ]);
  const jsons = await Promise.all(res.map((r) => r.json()));
  const awards = {};
  for (const json of jsons) {
    for (const key of Object.keys(json["CommonMsg/VS/VSAwardName"])) {
      if (!key.startsWith("Ref_")) {
        const id = `Award-${key}`;
        awards[json["CommonMsg/VS/VSAwardName"][key]] = id;
      }
    }
  }
  return { awards };
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
    SakeJaw: 25,
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
  coopStageMap,
  weaponMap,
  coopSpecialWeaponMap,
  backgroundMap,
  badgeMap,
  titleMap,
  awardMap,
  salmonidMap,
  workSuitMap,
] = await Promise.all([
  getCoopStageMap(),
  getWeaponMap(),
  getCoopSpecialWeaponMap(),
  getBackgroundMap(),
  getBadgeMap(),
  getTitleMap(),
  getAwardMap(),
  getSalmonidMap(),
  getWorkSuitMap(),
]);
writeOut("models/coopStages.json", coopStageMap);
writeOut("models/weapons.json", weaponMap);
writeOut("models/coopSpecialWeapons.json", coopSpecialWeaponMap);
writeOut("models/backgrounds.json", backgroundMap);
writeOut("models/badges.json", badgeMap);
writeOut("models/titles.json", titleMap);
writeOut("models/awards.json", awardMap);
writeOut("models/salmonids.json", salmonidMap);
writeOut("models/workSuits.json", workSuitMap);
