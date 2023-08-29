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
const getModeLocales = (languages) => {
  const map = {
    Regular: 1,
    Bankara: 2,
    XMatch: 3,
    League: 4,
    Private: 5,
    FestRegular: 6,
    FestChallenge: 7,
    FestTriColor: 8,
    BankaraOpen: 51,
  };
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (let i = 0; i < languages.length; i++) {
    for (const mode of Object.keys(languages[i]["CommonMsg/MatchMode"])) {
      if (map[mode] !== undefined) {
        const id = Buffer.from(`VsMode-${map[mode]}`).toString("base64");
        const name = languages[i]["CommonMsg/MatchMode"][mode]
          .replace(/\[.*?\]/g, "")
          .replace("（", " (")
          .replace("）", ")");
        maps[i][id] = name;
      }
    }
  }
  return maps;
};
const genRuleLocales = (languages) => {
  const map = {
    Pnt: 0,
    Var: 1,
    Vlf: 2,
    Vgl: 3,
    Vcl: 4,
    Tcl: 5,
  };
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (let i = 0; i < languages.length; i++) {
    for (const rule of Object.keys(languages[i]["CommonMsg/VS/VSRuleName"])) {
      if (map[rule] !== undefined) {
        const id = Buffer.from(`VsRule-${map[rule]}`).toString("base64");
        const name = languages[i]["CommonMsg/VS/VSRuleName"][rule];
        maps[i][id] = name;
      }
    }
  }
  return maps;
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
const getBrandLocales = (languages) => {
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
const getAwardLocales = (languages) => {
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (let i = 0; i < languages.length; i++) {
    for (const award of Object.keys(languages[i]["CommonMsg/VS/VSAwardName"])) {
      const id = `Award-${award}`;
      const name = languages[i]["CommonMsg/VS/VSAwardName"][award];
      maps[i][id] = name;
    }
  }
  return maps;
};
const getGradeLocales = (languages) => {
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (let i = 0; i < languages.length; i++) {
    for (const grade of Object.keys(languages[i]["CommonMsg/Coop/CoopGrade"])) {
      if (grade.match(/Grade_\d\d/)) {
        const id = Buffer.from(
          `CoopGrade-${Number.parseInt(grade.replace("Grade_", ""))}`
        ).toString("base64");
        const name = languages[i]["CommonMsg/Coop/CoopGrade"][grade];
        maps[i][id] = name;
      }
    }
  }
  return maps;
};
const getEventLocales = async (languages) => {
  const map = {
    EventRush: 1,
    EventGeyser: 2,
    EventDozer: 3,
    EventHakobiya: 4,
    EventFog: 5,
    EventMissile: 6,
    EventRelay: 7,
    EventTamaire: 8,
  };
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/parameter/${VERSION}/misc/spl__CoopLevelsConfig.spl__CoopLevelsConfig.json`
  );
  const json = await res.json();
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const event of Object.keys(json["Levels"][0])) {
    if (map[event]) {
      const id = Buffer.from(`CoopEventWave-${map[event]}`).toString("base64");
      for (let i = 0; i < languages.length; i++) {
        const name = languages[i]["CommonMsg/Glossary"][`CoopEvent_${event.replace("Event", "")}`];
        maps[i][id] = name;
      }
    }
  }
  return maps;
};
const getSalmonidLocales = async (languages) => {
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
  const maps = [];
  for (let i = 0; i < languages.length; i++) {
    maps.push({});
  }
  for (const salmonid of json) {
    if (map[salmonid["Type"]]) {
      const id = Buffer.from(`CoopEnemy-${map[salmonid["Type"]]}`).toString("base64");
      for (let i = 0; i < languages.length; i++) {
        const name = languages[i]["CommonMsg/Coop/CoopEnemy"][salmonid["Type"]];
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

const languages = await Promise.all([
  getLanguage("USen"),
  getLanguage("JPja"),
  getLanguage("CNzh"),
  getLanguage("TWzh"),
]);
const [
  modeLocales,
  ruleLocales,
  challengeLocales,
  stageLocales,
  coopStageLocales,
  weaponLocales,
  coopSpecialWeaponLocales,
  brandLocales,
  headgearLocales,
  clothesLocales,
  shoesLocales,
  awardLocales,
  gradeLocales,
  eventLocales,
  salmonidLocales,
  workSuitLocales,
] = await Promise.all([
  getModeLocales(languages),
  genRuleLocales(languages),
  getChallengeLocales(languages),
  getStageLocales(languages),
  getCoopStageLocales(languages),
  getWeaponLocales(languages),
  getCoopSpecialWeaponLocales(languages),
  getBrandLocales(languages),
  getHeadgearLocales(languages),
  getClothesLocales(languages),
  getShoesLocales(languages),
  getGradeLocales(languages),
  getAwardLocales(languages),
  getEventLocales(languages),
  getSalmonidLocales(languages),
  getWorkSuitLocales(languages),
]);
const paths = ["i18n/en.json", "i18n/ja.json", "i18n/zh-Hans.json", "i18n/zh-Hant.json"];
for (let i = 0; i < paths.length; i++) {
  const locale = {
    ...modeLocales[i],
    ...ruleLocales[i],
    ...challengeLocales[i],
    ...stageLocales[i],
    ...coopStageLocales[i],
    ...weaponLocales[i],
    ...coopSpecialWeaponLocales[i],
    ...brandLocales[i],
    ...headgearLocales[i],
    ...clothesLocales[i],
    ...shoesLocales[i],
    ...awardLocales[i],
    ...gradeLocales[i],
    ...eventLocales[i],
    ...salmonidLocales[i],
    ...workSuitLocales[i],
  };
  writeOut(paths[i], locale);
}
