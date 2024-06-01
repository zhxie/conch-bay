import { Buffer } from "buffer";
import { createHash } from "crypto";
import { createWriteStream } from "fs";

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

const getVersion = async () => {
  const res = await fetch("https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/latest");
  return await res.text();
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

const getCoopStageMap = async (version) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/CoopSceneInfo.json`
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
const getWeaponMap = async (version) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/WeaponInfoMain.json`
  );
  const json = await res.json();
  const weapons = {};
  const images = {};
  const imagesRaw = {};
  const coopRareWeapons = [];
  for (const weapon of json) {
    if (weapon["Type"] === "Versus" || (weapon["Type"] === "Coop" && weapon["IsCoopRare"])) {
      const id = Buffer.from(`Weapon-${weapon["Id"]}`).toString("base64");
      const image = createHash("sha256").update(weapon["__RowId"]).digest("hex");
      weapons[id] = image;
      images[image] = id;
      imagesRaw[image] = weapon["Id"];
      if (weapon["IsCoopRare"]) {
        coopRareWeapons.push(id);
      }
    }
  }
  return { weapons, images, imagesRaw, coopRareWeapons };
};
const getCoopSpecialWeaponMap = async (version) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/WeaponInfoSpecial.json`
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
const getBackgroundMap = async (version) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/NamePlateBgInfo.json`
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
const getBadgeMap = async (version) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/BadgeInfo.json`
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
const getSalmonidMap = async (version) => {
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
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/CoopEnemyInfo.json`
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
const getWorkSuitMap = async (version) => {
  const res = await fetch(
    `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/CoopSkinInfo.json`
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
const getAbilityMap = () => {
  const map = {
    MainInk_Save: "ISM",
    SubInk_Save: "ISS",
    InkRecovery_Up: "IRU",
    HumanMove_Up: "RSU",
    SquidMove_Up: "SSU",
    SpecialIncrease_Up: "SCU",
    RespawnSpecialGauge_Save: "SS",
    SpecialSpec_Up: "SPU",
    RespawnTime_Save: "QR",
    JumpTime_Save: "QSJ",
    SubSpec_Up: "BRU",
    OpInkEffect_Reduction: "RES",
    SubEffect_Reduction: "SRU",
    Action_Up: "IA",
    StartAllUp: "OG",
    EndAllUp: "LDE",
    MinorityUp: "T",
    ComeBack: "CB",
    SquidMoveSpatter_Reduction: "NS",
    DeathMarking: "H",
    ThermalInk: "TI",
    Exorcist: "RP",
    ExSkillDouble: "AD",
    SuperJumpSign_Hide: "SJ",
    ObjectEffect_Up: "OS",
    SomersaultLanding: "DR",
    None: "U",
  };
  const images = {};
  for (const ability in map) {
    const image = createHash("sha256").update(ability).digest("hex");
    images[image] = map[ability];
  }
  return { images };
};

const getPlaceholderMap = async (version) => {
  const weaponMap = {
    0: "Shooters/Sploosh-o-matic",
    1: "Shooters/Neo Sploosh-o-matic",
    10: "Shooters/Splattershot Jr",
    11: "Shooters/Custom Splattershot Jr",
    20: "Shooters/Splash-o-matic",
    21: "Shooters/Neo Splash-o-matic",
    30: "Shooters/Aerospray MG",
    31: "Shooters/Aerospray RG",
    40: "Shooters/Splattershot",
    41: "Shooters/Tentatek Splattershot",
    45: "Shooters/Hero Shot Replica",
    46: "Shooters/Octo Shot Replica",
    47: "Shooters/Order Shooter Replica",
    50: "Shooters/52 Gal",
    51: "Shooters/52 Gal Deco",
    60: "Shooters/N-ZAP 85",
    61: "Shooters/N-ZAP 89",
    70: "Shooters/Splattershot Pro",
    71: "Shooters/Forge Splattershot Pro",
    80: "Shooters/96 Gal",
    81: "Shooters/96 Gal Deco",
    90: "Shooters/Jet Squelcher",
    91: "Shooters/Custom Jet Squelcher",
    100: "Shooters/Splattershot Nova",
    101: "Shooters/Annaki Splattershot Nova",
    200: "Blasters/Luna Blaster",
    201: "Blasters/Luna Blaster Neo",
    205: "Blasters/Order Blaster Replica",
    210: "Blasters/Blaster",
    211: "Blasters/Custom Blaster",
    220: "Blasters/Range Blaster",
    221: "Blasters/Custom Range Blaster",
    230: "Blasters/Clash Blaster",
    231: "Blasters/Clash Blaster Neo",
    240: "Blasters/Rapid Blaster",
    241: "Blasters/Rapid Blaster Deco",
    250: "Blasters/Rapid Blaster Pro",
    251: "Blasters/Rapid Blaster Pro Deco",
    260: "Blasters/S-BLAST '92",
    261: "Blasters/S-BLAST '91",
    300: "Shooters/L-3 Nozzlenose",
    301: "Shooters/L-3 Nozzlenose D",
    310: "Shooters/H-3 Nozzlenose",
    311: "Shooters/H-3 Nozzlenose D",
    400: "Shooters/Squeezer",
    401: "Shooters/Foil Squeezer",
    1000: "Rollers/Carbon Roller",
    1001: "Rollers/Carbon Roller Deco",
    1010: "Rollers/Splat Roller",
    1011: "Rollers/Krak-On Splat Roller",
    1015: "Rollers/Order Roller Replica",
    1020: "Rollers/Dynamo Roller",
    1021: "Rollers/Gold Dynamo Roller",
    1030: "Rollers/Flingza Roller",
    1031: "Rollers/Foil Flingza Roller",
    1040: "Rollers/Big Swig Roller",
    1041: "Rollers/Big Swig Roller Express",
    1100: "Brushes/Inkbrush",
    1101: "Brushes/Inkbrush Nouveau",
    1110: "Brushes/Octobrush",
    1111: "Brushes/Octobrush Nouveau",
    1115: "Brushes/Orderbrush Replica",
    1120: "Brushes/Painbrush",
    1121: "Brushes/Painbrush Nouveau",
    2000: "Chargers/Classic Squiffer",
    2001: "Chargers/New Squiffer",
    2010: "Chargers/Splat Charger",
    2011: "Chargers/Z F Splat Charger",
    2015: "Chargers/Order Charger Replica",
    2020: "Chargers/Splatterscope",
    2021: "Chargers/Z F Splatterscope",
    2030: "Chargers/E-Liter 4k",
    2031: "Chargers/Custom E-Liter 4k",
    2040: "Chargers/E-Liter 4k Scope",
    2041: "Chargers/Custom E-Liter 4k Scope",
    2050: "Chargers/Bamboozler",
    2051: "Chargers/Bamboozler 14 Mk II",
    2060: "Chargers/Goo Tuber",
    2061: "Chargers/Custom Goo Tuber",
    2070: "Chargers/Snipewriter 5H",
    2071: "Chargers/Snipewriter 5B",
    3000: "Sloshers/Slosher",
    3001: "Sloshers/Slosher Deco",
    3005: "Sloshers/Order Slosher Replica",
    3010: "Sloshers/Tri-Slosher",
    3011: "Sloshers/Tri-Slosher Nouveau",
    3020: "Sloshers/Sloshing Machine",
    3021: "Sloshers/Sloshing Machine Neo",
    3030: "Sloshers/Bloblobber",
    3031: "Sloshers/Bloblobber Deco",
    3040: "Sloshers/Explosher",
    3041: "Sloshers/Custom Explosher",
    3050: "Sloshers/Dread Wringer",
    3051: "Sloshers/Dread Wringer D",
    4000: "Splatlings/Mini Splatling",
    4001: "Splatlings/Zink Mini Splatling",
    4010: "Splatlings/Heavy Splatling",
    4011: "Splatlings/Heavy Splatling Deco",
    4015: "Splatlings/Order Splatling Replica",
    4020: "Splatlings/Hydra Splatling",
    4021: "Splatlings/Custom Hydra Splatling",
    4030: "Splatlings/Ballpoint Splatling",
    4031: "Splatlings/Ballpoint Splatling Nouveau",
    4040: "Splatlings/Nautilus 47",
    4041: "Splatlings/Nautilus 79",
    4050: "Splatlings/Heavy Edit Splatling",
    4051: "Splatlings/Heavy Edit Splatling Nouveau",
    5000: "Dualies/Dapple Dualies",
    5001: "Dualies/Dapple Dualies Nouveau",
    5010: "Dualies/Splat Dualies",
    5011: "Dualies/Enperry Splat Dualies",
    5015: "Dualies/Order Dualie Replicas",
    5020: "Dualies/Glooga Dualies",
    5021: "Dualies/Glooga Dualies Deco",
    5030: "Dualies/Squelcher Dualies",
    5031: "Dualies/Custom Squelcher Dualies",
    5040: "Dualies/Dark Tetra Dualies",
    5041: "Dualies/Light Tetra Dualies",
    5050: "Dualies/Douser Dualies FF",
    5051: "Dualies/Custom Douser Dualies FF",
    6000: "Brellas/Splat Brella",
    6001: "Brellas/Sorella Brella",
    6005: "Brellas/Order Brella Replica",
    6010: "Brellas/Tenta Brella",
    6011: "Brellas/Tenta Sorella Brella",
    6020: "Brellas/Undercover Brella",
    6021: "Brellas/Undercover Sorella Brella",
    6030: "Brellas/Recycled Brella 24 Mk I",
    6031: "Brellas/Recycled Brella 24 Mk II",
    7010: "Stringers/Tri-Stringer",
    7011: "Stringers/Inkline Tri-Stringer",
    7015: "Stringers/Order Stringer Replica",
    7020: "Stringers/REEF-LUX 450",
    7021: "Stringers/REEF-LUX 450 Deco",
    7030: "Stringers/Wellstring V",
    7031: "Stringers/Custom Wellstring V",
    8000: "Splatanas/Splatana Stamper",
    8001: "Splatanas/Splatana Stamper Nouveau",
    8005: "Splatanas/Order Splatana Replica",
    8010: "Splatanas/Splatana Wiper",
    8011: "Splatanas/Splatana Wiper Deco",
    8020: "Splatanas/Mint Decavitator",
    8021: "Splatanas/Charcoal Decavitator",
    20900: "Grizzco/Grizzco Blaster",
    21900: "Grizzco/Grizzco Roller",
    22900: "Grizzco/Grizzco Charger",
    23900: "Grizzco/Grizzco Slosher",
    25900: "Grizzco/Grizzco Dualies",
    26900: "Grizzco/Grizzco Brella",
    27900: "Grizzco/Grizzco Stringer",
    28900: "Grizzco/Grizzco Splatana",
  };
  const subWeaponMap = {
    0: "Splat Bomb",
    1: "Suction Bomb",
    2: "Burst Bomb",
    3: "Sprinkler",
    4: "Splash Wall",
    5: "Fizzy Bomb",
    6: "Curling Bomb",
    7: "Autobomb",
    8: "Beakon",
    9: "Point Sensor",
    10: "Ink Mine",
    11: "Toxic Mist",
    12: "Line Marker",
    13: "Torpedo",
  };
  const specialWeaponMap = {
    1: "Trizooka",
    2: "Big Bubbler",
    3: "Zipcaster",
    4: "Tenta Missles",
    5: "Ink Storm",
    6: "Booyah Bomb",
    7: "Wave Breaker",
    8: "Ink Vac",
    9: "Killer Way 5-0",
    10: "Inkjet",
    11: "Ultra Stamp",
    12: "Crab Tank",
    13: "Reefslider",
    14: "Triple Inkstrike",
    15: "Tacticooler",
    16: "Super Chump",
    17: "Kraken",
    18: "Triple Splashdown",
    19: "Splattercolor Screen",
  };
  const abilityMap = {
    MainInk_Save: "Main Saver",
    SubInk_Save: "Sub Saver",
    InkRecovery_Up: "Ink Recovery",
    HumanMove_Up: "Run Speed Up",
    SquidMove_Up: "Swim Speed Up",
    SpecialIncrease_Up: "Special Charge Up",
    RespawnSpecialGauge_Save: "Special Saver",
    SpecialSpec_Up: "Special Power Up",
    RespawnTime_Save: "Quick Respawn",
    JumpTime_Save: "Quick Super Jump",
    SubSpec_Up: "Sub Power Up",
    OpInkEffect_Reduction: "Ink Resist",
    SubEffect_Reduction: "Bomb Resist",
    Action_Up: "Intensify Action",
    StartAllUp: "Opening Gambit",
    EndAllUp: "Last Ditch Effort",
    MinorityUp: "Tenacity",
    ComeBack: "Comeback",
    SquidMoveSpatter_Reduction: "Ninja Squid",
    DeathMarking: "Haunt",
    ThermalInk: "Thermal Ink",
    Exorcist: "Respawn Punisher",
    ExSkillDouble: "2x Ability",
    SuperJumpSign_Hide: "Stealth Jump",
    ObjectEffect_Up: "Object Shredder",
    SomersaultLanding: "Drop Roller",
    None: "Unassigned",
  };
  const unknownMap = {
    "473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1":
      "Weapons/Grizzco/Random Rotation",
    "9d7272733ae2f2282938da17d69f13419a935eef42239132a02fcf37d8678f10":
      "Weapons/Grizzco/Golden Rotation",
  };
  const res = await Promise.all([
    fetch(
      `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/WeaponInfoMain.json`
    ),
    fetch(
      `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/WeaponInfoSub.json`
    ),
    fetch(
      `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${version}/WeaponInfoSpecial.json`
    ),
  ]);
  const jsons = await Promise.all(res.map((r) => r.json()));
  const result = {};
  for (const weapon of jsons[0]) {
    if (weapon["Type"] === "Versus" || (weapon["Type"] === "Coop" && weapon["IsCoopRare"])) {
      const name = weaponMap[weapon["Id"]];
      const image = createHash("sha256").update(weapon["__RowId"]).digest("hex");
      result[
        `/weapon_illust/${image}_0.png`
      ] = `require("@hacceuee/s3-pixel-icons/Weapons/${name}.png")`;
    }
  }
  for (const subWeapon of jsons[1]) {
    if (subWeapon["Type"] === "Versus") {
      const name = subWeaponMap[subWeapon["Id"]];
      const image = createHash("sha256").update(subWeapon["__RowId"]).digest("hex");
      result[
        `/sub_img/blue/${image}_0.png`
      ] = `require("@hacceuee/s3-pixel-icons/Subs & Specials/Sub - ${name}.png")`;
    }
  }
  for (const specialWeapon of jsons[2]) {
    if (specialWeapon["Type"] === "Versus" && specialWeapon["Id"] < 20) {
      const name = specialWeaponMap[specialWeapon["Id"]];
      const image = createHash("sha256").update(specialWeapon["__RowId"]).digest("hex");
      result[
        `/special_img/blue/${image}_0.png`
      ] = `require("@hacceuee/s3-pixel-icons/Subs & Specials/Special - ${name}.png")`;
    }
  }
  for (const ability in abilityMap) {
    const image = createHash("sha256").update(ability).digest("hex");
    result[
      `/skill_img/${image}_0.png`
    ] = `require("@hacceuee/s3-pixel-icons/Chunks Icons/No Frames/Chunk - ${abilityMap[ability]}.png")`;
  }
  for (const unknown in unknownMap) {
    result[
      `/ui_img/${unknown}_0.png`
    ] = `require("@hacceuee/s3-pixel-icons/${unknownMap[unknown]}.png")`;
  }
  return result;
};

const [nso_version, splatnet_version] = await Promise.all([getNsoVersion(), getSplatnetVersion()]);
writeOut("models/versions.json", { NSO_VERSION: nso_version, SPLATNET_VERSION: splatnet_version });

const version = await getVersion();
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
  abilityMap,
  placeholderMap,
] = await Promise.all([
  getCoopStageMap(version),
  getWeaponMap(version),
  getCoopSpecialWeaponMap(version),
  getBackgroundMap(version),
  getBadgeMap(version),
  getTitleMap(),
  getAwardMap(),
  getSalmonidMap(version),
  getWorkSuitMap(version),
  getAbilityMap(),
  getPlaceholderMap(version),
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
writeOut("models/abilities.json", abilityMap);

const file = createWriteStream("models/placeholders.ts", "utf-8");
file.write("const Placeholders = {\n");
for (const key in placeholderMap) {
  file.write(`  "${key}": ${placeholderMap[key]},\n`);
}
file.write("};\n\nexport default Placeholders;\n");
