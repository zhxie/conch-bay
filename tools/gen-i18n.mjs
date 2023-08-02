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

            getAll(
              `https://raw.githubusercontent.com/Leanny/splat3/main/data/language/USen_unicode.json`,
              (res) => {
                const locale = JSON.parse(res);
                const map = {};
                for (const head of heads) {
                  const image = createHash("sha256").update(head["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Head"][head["__RowId"].replace("Hed_", "")];
                  map[image] = name;
                }
                for (const cloth of clothes) {
                  const image = createHash("sha256").update(cloth["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Clothes"][cloth["__RowId"].replace("Clt_", "")];
                  map[image] = name;
                }
                for (const shoe of shoes) {
                  const image = createHash("sha256").update(shoe["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Shoes"][shoe["__RowId"].replace("Shs_", "")];
                  map[image] = name;
                }
                enFile.write(JSON.stringify(map, undefined, 2) + "\n");
              }
            );

            getAll(
              `https://raw.githubusercontent.com/Leanny/splat3/main/data/language/JPja_unicode.json`,
              (res) => {
                const locale = JSON.parse(res);
                const map = {};
                for (const head of heads) {
                  const image = createHash("sha256").update(head["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Head"][head["__RowId"].replace("Hed_", "")];
                  map[image] = name;
                }
                for (const cloth of clothes) {
                  const image = createHash("sha256").update(cloth["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Clothes"][cloth["__RowId"].replace("Clt_", "")];
                  map[image] = name;
                }
                for (const shoe of shoes) {
                  const image = createHash("sha256").update(shoe["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Shoes"][shoe["__RowId"].replace("Shs_", "")];
                  map[image] = name;
                }
                jaFile.write(JSON.stringify(map, undefined, 2) + "\n");
              }
            );

            getAll(
              `https://raw.githubusercontent.com/Leanny/splat3/main/data/language/CNzh_unicode.json`,
              (res) => {
                const locale = JSON.parse(res);
                const map = {};
                for (const head of heads) {
                  const image = createHash("sha256").update(head["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Head"][head["__RowId"].replace("Hed_", "")];
                  map[image] = name;
                }
                for (const cloth of clothes) {
                  const image = createHash("sha256").update(cloth["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Clothes"][cloth["__RowId"].replace("Clt_", "")];
                  map[image] = name;
                }
                for (const shoe of shoes) {
                  const image = createHash("sha256").update(shoe["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Shoes"][shoe["__RowId"].replace("Shs_", "")];
                  map[image] = name;
                }
                zhHansFile.write(JSON.stringify(map, undefined, 2) + "\n");
              }
            );

            getAll(
              `https://raw.githubusercontent.com/Leanny/splat3/main/data/language/TWzh_unicode.json`,
              (res) => {
                const locale = JSON.parse(res);
                const map = {};
                for (const head of heads) {
                  const image = createHash("sha256").update(head["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Head"][head["__RowId"].replace("Hed_", "")];
                  map[image] = name;
                }
                for (const cloth of clothes) {
                  const image = createHash("sha256").update(cloth["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Clothes"][cloth["__RowId"].replace("Clt_", "")];
                  map[image] = name;
                }
                for (const shoe of shoes) {
                  const image = createHash("sha256").update(shoe["__RowId"]).digest("hex");
                  const name =
                    locale["CommonMsg/Gear/GearName_Shoes"][shoe["__RowId"].replace("Shs_", "")];
                  map[image] = name;
                }
                zhHantFile.write(JSON.stringify(map, undefined, 2) + "\n");
              }
            );
          }
        );
      }
    );
  }
);
