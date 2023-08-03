import { Buffer } from "buffer";
import { createHash } from "crypto";
import { createWriteStream } from "fs";
import { get } from "https";

const VERSION = "410";

const enFile = createWriteStream("i18n/en.json", "utf-8");
const jaFile = createWriteStream("i18n/ja.json", "utf-8");
const zhHansFile = createWriteStream("i18n/zh-Hans.json", "utf-8");
const zhHantFile = createWriteStream("i18n/zh-Hant.json", "utf-8");

function getAll(url, callback) {
  return get(url, (res) => {
    let raw = "";

    res.on("data", (chunk) => {
      raw += chunk;
    });

    res.on("end", () => {
      callback(raw);
    });
  });
}

getAll(
  `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/VersusSceneInfo.json`,
  (res) => {
    const stages = JSON.parse(res);
    getAll(
      `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopSceneInfo.json`,
      (res) => {
        const coopStages = JSON.parse(res);
        getAll(
          `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoMain.json`,
          (res) => {
            const weapons = JSON.parse(res);
            getAll(
              `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/WeaponInfoSpecial.json`,
              (res) => {
                const specialWeapons = JSON.parse(res);
                getAll(
                  `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/CoopSkinInfo.json`,
                  (res) => {
                    const workSuits = JSON.parse(res);
                    getAll(
                      `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/LeagueTypeInfo.json`,
                      (res) => {
                        const challenges = JSON.parse(res);
                        getAll(
                          `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/GearInfoHead.json`,
                          (res) => {
                            const heads = JSON.parse(res);
                            getAll(
                              `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/GearInfoClothes.json`,
                              (res) => {
                                const clothes = JSON.parse(res);
                                getAll(
                                  `https://raw.githubusercontent.com/Leanny/splat3/main/data/mush/${VERSION}/GearInfoShoes.json`,
                                  (res) => {
                                    const shoes = JSON.parse(res);

                                    for (const locale of [
                                      { language: "USen", file: enFile },
                                      { language: "JPja", file: jaFile },
                                      { language: "CNzh", file: zhHansFile },
                                      { language: "TWzh", file: zhHantFile },
                                    ]) {
                                      getAll(
                                        `https://raw.githubusercontent.com/Leanny/splat3/main/data/language/${locale.language}_unicode.json`,
                                        (res) => {
                                          const language = JSON.parse(res);
                                          const map = {};
                                          for (const challenge of challenges) {
                                            const id = Buffer.from(
                                              `LeagueMatchEvent-${challenge["__RowId"]}`
                                            ).toString("base64");
                                            const name =
                                              language["CommonMsg/Manual/ManualEventMatch"][
                                                `EventMatch_${challenge["__RowId"]}_Title`
                                              ];
                                            map[id] = name;
                                          }
                                          for (const stage of stages) {
                                            const id = Buffer.from(
                                              `VsStage-${stage["Id"]}`
                                            ).toString("base64");
                                            const name =
                                              language["CommonMsg/VS/VSStageName"][
                                                stage["__RowId"].match(/Vss_([a-zA-Z]+)/)[1]
                                              ];
                                            map[id] = name;
                                          }
                                          for (const coopStage of coopStages) {
                                            const id = Buffer.from(
                                              `CoopStage-${coopStage["Id"]}`
                                            ).toString("base64");
                                            const name =
                                              language["CommonMsg/Coop/CoopStageName"][
                                                coopStage["__RowId"].match(/Cop_([a-zA-Z]+)/)[1]
                                              ];
                                            map[id] = name;
                                          }
                                          for (const weapon of weapons) {
                                            if (
                                              weapon["Type"] === "Mission" ||
                                              weapon["Type"] === "Other" ||
                                              (weapon["Type"] === "Coop" && !weapon["IsCoopRare"])
                                            ) {
                                              continue;
                                            }
                                            const id = Buffer.from(
                                              `Weapon-${weapon["Id"]}`
                                            ).toString("base64");
                                            const name =
                                              language["CommonMsg/Weapon/WeaponName_Main"][
                                                weapon["__RowId"]
                                              ];
                                            map[id] = name;
                                          }
                                          for (const specialWeapon of specialWeapons) {
                                            if (specialWeapon["Type"] === "Coop") {
                                              const id = Buffer.from(
                                                `SpecialWeapon-${specialWeapon["Id"]}`
                                              ).toString("base64");
                                              const name =
                                                language["CommonMsg/Weapon/WeaponName_Special"][
                                                  specialWeapon["__RowId"]
                                                ];
                                              map[id] = name;
                                            }
                                          }
                                          for (const workSuit of workSuits) {
                                            const id = Buffer.from(
                                              `CoopUniform-${workSuit["Id"]}`
                                            ).toString("base64");
                                            const name =
                                              language["CommonMsg/Coop/CoopSkinName"][
                                                workSuit["__RowId"]
                                              ];
                                            map[id] = name;
                                          }
                                          for (const brand of Object.keys(
                                            language["CommonMsg/Gear/GearBrandName"]
                                          )) {
                                            const id = Buffer.from(
                                              `Brand-${Number.parseInt(brand.replace("B", ""))}`
                                            ).toString("base64");
                                            const name =
                                              language["CommonMsg/Gear/GearBrandName"][brand];
                                            map[id] = name;
                                          }
                                          for (const head of heads) {
                                            const image = createHash("sha256")
                                              .update(head["__RowId"])
                                              .digest("hex");
                                            const name =
                                              language["CommonMsg/Gear/GearName_Head"][
                                                head["__RowId"].replace("Hed_", "")
                                              ];
                                            map[image] = name;
                                          }
                                          for (const cloth of clothes) {
                                            const image = createHash("sha256")
                                              .update(cloth["__RowId"])
                                              .digest("hex");
                                            const name =
                                              language["CommonMsg/Gear/GearName_Clothes"][
                                                cloth["__RowId"].replace("Clt_", "")
                                              ];
                                            map[image] = name;
                                          }
                                          for (const shoe of shoes) {
                                            const image = createHash("sha256")
                                              .update(shoe["__RowId"])
                                              .digest("hex");
                                            const name =
                                              language["CommonMsg/Gear/GearName_Shoes"][
                                                shoe["__RowId"].replace("Shs_", "")
                                              ];
                                            map[image] = name;
                                          }
                                          locale.file.write(
                                            JSON.stringify(map, undefined, 2) + "\n"
                                          );
                                        }
                                      );
                                    }
                                  }
                                );
                              }
                            );
                          }
                        );
                      }
                    );
                  }
                );
              }
            );
          }
        );
      }
    );
  }
);
