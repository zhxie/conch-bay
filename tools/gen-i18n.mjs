import { Buffer } from "buffer";
import { createHash } from "crypto";
import { createWriteStream } from "fs";

const VERSION = "410";

const writeOut = (path, obj) => {
  const file = createWriteStream(path, "utf-8");
  file.write(JSON.stringify(obj, undefined, 2) + "\n");
};

const getLanguage = async (language) => {
  const res = fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/language/${language}_unicode.json`
  );
  const json = (await res).json();
  return json;
};
const getChallengeLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/LeagueTypeInfo.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const challenge of json) {
    const id = Buffer.from(`LeagueMatchEvent-${challenge["__RowId"]}`).toString("base64");
    for (let i = 0; i < languages.length; i++) {
      const name =
        languages[i]["CommonMsg/Manual/ManualEventMatch"][
          `EventMatch_${challenge["__RowId"]}_Title`
        ];
      maps[i][id] = name;
    }
  }
  return maps;
};
const getStageLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/VersusSceneInfo.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const stage of json) {
    const id = Buffer.from(`VsStage-${stage["Id"]}`).toString("base64");
    for (let i = 0; i < languages.length; i++) {
      const name =
        languages[i]["CommonMsg/VS/VSStageName"][stage["__RowId"].match(/Vss_([a-zA-Z]+)/)[1]];
      maps[i][id] = name;
    }
  }
  return maps;
};
const getCoopStageLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopSceneInfo.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const stage of json) {
    const id = Buffer.from(`CoopStage-${stage["Id"]}`).toString("base64");
    for (let i = 0; i < languages.length; i++) {
      const name =
        languages[i]["CommonMsg/Coop/CoopStageName"][stage["__RowId"].match(/Cop_([a-zA-Z]+)/)[1]];
      maps[i][id] = name;
    }
  }
  return maps;
};
const getWeaponLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoMain.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const weapon of json) {
    if (weapon["Type"] === "Versus" || (weapon["Type"] === "Coop" && weapon["IsCoopRare"])) {
      const id = Buffer.from(`Weapon-${weapon["Id"]}`).toString("base64");
      for (let i = 0; i < languages.length; i++) {
        const name = languages[i]["CommonMsg/Weapon/WeaponName_Main"][weapon["__RowId"]];
        maps[i][id] = name;
      }
    }
  }
  return maps;
};
const getCoopSpecialWeaponLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoSpecial.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const specialWeapon of json) {
    if (specialWeapon["Type"] === "Coop") {
      const id = Buffer.from(`SpecialWeapon-${specialWeapon["Id"]}`).toString("base64");
      for (let i = 0; i < languages.length; i++) {
        const name = languages[i]["CommonMsg/Weapon/WeaponName_Special"][specialWeapon["__RowId"]];
        maps[i][id] = name;
      }
    }
  }
  return maps;
};
const getWorkSuitLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopSkinInfo.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const workSuit of json) {
    const id = Buffer.from(`CoopUniform-${workSuit["Id"]}`).toString("base64");
    for (let i = 0; i < languages.length; i++) {
      const name = languages[i]["CommonMsg/Coop/CoopSkinName"][workSuit["__RowId"]];
      maps[i][id] = name;
    }
  }
  return maps;
};
const getBrandLocales = async (languages) => {
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (let i = 0; i < languages.length; i++) {
    for (const brand of Object.keys(languages[i]["CommonMsg/Gear/GearBrandName"])) {
      const id = Buffer.from(`Brand-${Number.parseInt(brand.replace("B", ""))}`).toString("base64");
      const name = languages[i]["CommonMsg/Gear/GearBrandName"][brand];
      maps[i][id] = name;
    }
  }
  return maps;
};
const getHeadgearLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/GearInfoHead.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const head of json) {
    const image = createHash("sha256").update(head["__RowId"]).digest("hex");
    for (let i = 0; i < languages.length; i++) {
      const name =
        languages[i]["CommonMsg/Gear/GearName_Head"][head["__RowId"].replace("Hed_", "")];
      maps[i][image] = name;
    }
  }
  return maps;
};
const getClothesLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/GearInfoClothes.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const cloth of json) {
    const image = createHash("sha256").update(cloth["__RowId"]).digest("hex");
    for (let i = 0; i < languages.length; i++) {
      const name =
        languages[i]["CommonMsg/Gear/GearName_Clothes"][cloth["__RowId"].replace("Clt_", "")];
      maps[i][image] = name;
    }
  }
  return maps;
};
const getShoesLocales = async (languages) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/GearInfoShoes.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const shoe of json) {
    const image = createHash("sha256").update(shoe["__RowId"]).digest("hex");
    for (let i = 0; i < languages.length; i++) {
      const name =
        languages[i]["CommonMsg/Gear/GearName_Shoes"][shoe["__RowId"].replace("Shs_", "")];
      maps[i][image] = name;
    }
  }
  return maps;
};

const languages = await Promise.all([
  getLanguage("USen"),
  getLanguage("JPja"),
  getLanguage("CNzh"),
  getLanguage("TWzh"),
]);
const [
  challengeLocales,
  stageLocales,
  coopStageLocales,
  weaponLocales,
  coopSpecialWeaponLocales,
  workSuitLocales,
  brandLocales,
  headgearLocales,
  clothesLocales,
  shoesLocales,
] = await Promise.all([
  getChallengeLocales(languages),
  getStageLocales(languages),
  getCoopStageLocales(languages),
  getWeaponLocales(languages),
  getCoopSpecialWeaponLocales(languages),
  getWorkSuitLocales(languages),
  getBrandLocales(languages),
  getHeadgearLocales(languages),
  getClothesLocales(languages),
  getShoesLocales(languages),
]);
const paths = ["i18n/en.json", "i18n/ja.json", "i18n/zh-Hans.json", "i18n/zh-Hant.json"];
for (let i = 0; i < paths.length; i++) {
  const locale = {
    ...challengeLocales[i],
    ...stageLocales[i],
    ...coopStageLocales[i],
    ...weaponLocales[i],
    ...coopSpecialWeaponLocales[i],
    ...workSuitLocales[i],
    ...brandLocales[i],
    ...headgearLocales[i],
    ...clothesLocales[i],
    ...shoesLocales[i],
  };
  writeOut(paths[i], locale);
}
