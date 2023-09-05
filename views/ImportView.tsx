import { Buffer } from "buffer";
import dayjs from "dayjs";
import Constants, { AppOwnership } from "expo-constants";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as WebBrowser from "expo-web-browser";
import { useState } from "react";
import { StyleProp, ViewStyle } from "react-native";
import {
  BannerLevel,
  Button,
  Center,
  Color,
  Dialog,
  Marquee,
  Modal,
  ToolButton,
  ViewStyles,
  useBanner,
  useTheme,
} from "../components";
import t from "../i18n";
import backgroundList from "../models/backgrounds.json";
import badgeList from "../models/badges.json";
import coopSpecialWeaponList from "../models/coopSpecialWeapons.json";
import coopStageList from "../models/coopStages.json";
import salmonidList from "../models/salmonids.json";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import weaponList from "../models/weapons.json";
import workSuitList from "../models/workSuits.json";
import { decode64, encode64String } from "../utils/codec";
import { BATCH_SIZE } from "../utils/memory";
import { getImageHash } from "../utils/ui";

enum ImportStreamMode {
  Unknown,
  Battles = '"battles":[',
  Coops = '"coops":[',
  Images = '"images":[',
}
class ImportStreamParser {
  mode = ImportStreamMode.Unknown;
  drained = 0;
  buffer: number[] = [];

  parse = (bytes: Uint8Array) => {
    // For prefix position.
    let battlesPrefix = 0,
      coopsPrefix = 0,
      imagesPrefix = 0;
    // For result parsing.
    let bracket = 0,
      quote = false;
    let bracketPos = -1;
    const battles: number[] = [],
      coops: number[] = [],
      images: number[] = [];

    let drainable = 0;
    // HACK: avoid spread syntax which may cause stack oversize.
    for (const byte of bytes) {
      this.buffer.push(byte);
    }
    for (let i = 0; i < this.buffer.length; i++) {
      // No null is allowed.
      if (this.buffer[i] === 0) {
        throw new Error(`null character found at ${this.drained + i}`);
      }

      // Escape \ and its following character, which should be an ASCII character.
      if (this.buffer[i] === "\\".charCodeAt(0)) {
        i++;
        continue;
      }
      // Escape space, \r and \n.
      if (
        this.buffer[i] === " ".charCodeAt(0) ||
        this.buffer[i] === "\r".charCodeAt(0) ||
        this.buffer[i] === "\n".charCodeAt(0)
      ) {
        continue;
      }

      // Guess which mode is reading from.
      if (this.buffer[i] === ImportStreamMode.Battles.charCodeAt(battlesPrefix)) {
        battlesPrefix += 1;
      } else {
        battlesPrefix = 0;
      }
      if (this.buffer[i] === ImportStreamMode.Coops.charCodeAt(coopsPrefix)) {
        coopsPrefix += 1;
      } else {
        coopsPrefix = 0;
      }
      if (this.buffer[i] === ImportStreamMode.Images.charCodeAt(imagesPrefix)) {
        imagesPrefix += 1;
      } else {
        imagesPrefix = 0;
      }
      if (battlesPrefix === ImportStreamMode.Battles.length) {
        this.mode = ImportStreamMode.Battles;
        battlesPrefix = 0;
        coopsPrefix = 0;
        imagesPrefix = 0;
        drainable = i + 1;
      } else if (coopsPrefix === ImportStreamMode.Coops.length) {
        this.mode = ImportStreamMode.Coops;
        battlesPrefix = 0;
        coopsPrefix = 0;
        imagesPrefix = 0;
        drainable = i + 1;
      } else if (imagesPrefix === ImportStreamMode.Images.length) {
        this.mode = ImportStreamMode.Images;
        battlesPrefix = 0;
        coopsPrefix = 0;
        imagesPrefix = 0;
        drainable = i + 1;
      }

      // Parse results.
      switch (this.mode) {
        case ImportStreamMode.Unknown:
          break;
        case ImportStreamMode.Battles:
        case ImportStreamMode.Coops:
        case ImportStreamMode.Images:
          if (this.buffer[i] === '"'.charCodeAt(0)) {
            quote = !quote;
          }
          if (!quote) {
            if (this.buffer[i] === "{".charCodeAt(0)) {
              if (bracket === 0) {
                bracketPos = i;
              }
              bracket += 1;
            }
            if (this.buffer[i] === "}".charCodeAt(0)) {
              bracket -= 1;
              if (bracket === 0) {
                const result = this.buffer.slice(bracketPos, i + 1);
                switch (this.mode) {
                  case ImportStreamMode.Battles:
                    battles.push(",".charCodeAt(0));
                    for (const byte of result) {
                      battles.push(byte);
                    }
                    break;
                  case ImportStreamMode.Coops:
                    coops.push(",".charCodeAt(0));
                    for (const byte of result) {
                      coops.push(byte);
                    }
                    break;
                  case ImportStreamMode.Images:
                    images.push(",".charCodeAt(0));
                    for (const byte of result) {
                      images.push(byte);
                    }
                }
                drainable = i + 1;
              }
            }
          }
          break;
      }
    }
    this.buffer.splice(0, drainable);
    this.drained += drainable;

    if (battles.length === 0) {
      battles.push("[".charCodeAt(0));
    } else {
      battles[0] = "[".charCodeAt(0);
    }
    battles.push("]".charCodeAt(0));
    if (coops.length === 0) {
      coops.push("[".charCodeAt(0));
    } else {
      coops[0] = "[".charCodeAt(0);
    }
    coops.push("]".charCodeAt(0));
    if (images.length === 0) {
      images.push("[".charCodeAt(0));
    } else {
      images[0] = "[".charCodeAt(0);
    }
    images.push("]".charCodeAt(0));
    return {
      battles: JSON.parse(Buffer.from(battles).toString()),
      coops: JSON.parse(Buffer.from(coops).toString()),
      images: JSON.parse(Buffer.from(images).toString()),
    };
  };
}

const parseFleece = (bytes: number[], sharedKeys?: string[], index?: number, wide?: boolean) => {
  if (index === undefined) {
    index = bytes.length - 2;
  }

  if (bytes[index] < 0b10000) {
    // Small integer [0000iiii iiiiiiii].
    const symbol = (bytes[index] & 0b1000) >> 3 ? true : false;
    const comp = ((bytes[index] & 0b111) << 8) + bytes[index + 1];
    if (symbol) {
      return -((comp ^ 0b111_11111111) + 1);
    }
    return comp;
  } else if (bytes[index] < 0b100000) {
    // Long integer [0001uccc iiiiiiii...].
    const unsigned = (bytes[index] & 0b1000) >> 3 ? true : false;
    const count = (bytes[index] & 0b111) + 1;
    let value = 0;
    for (let i = 0; i < count; i++) {
      if (!unsigned && i === count - 1) {
        const symbol = (bytes[index + 1 + i] & 10000000) >> 7 ? true : false;
        value += (bytes[index + 1 + i] & 0b1111111) << (8 * i);
        if (symbol) {
          throw new Error("long integer with symbol set is not supported");
        }
      } else {
        value += bytes[index + 1 + i] << (8 * i);
      }
    }
    return value;
  } else if (bytes[index] < 0b110000) {
    // Floating point [0010s--- --------...].
    const single = (bytes[index] & 0b1000) >> 3 ? false : true;
    if (single) {
      const buffer = new ArrayBuffer(4);
      const view = new DataView(buffer);
      for (let j = 0; j < 4; j++) {
        view.setUint8(j, bytes[index + 2 + j]);
      }
      return view.getFloat32(0, true);
    } else {
      const buffer = new ArrayBuffer(8);
      const view = new DataView(buffer);
      for (let j = 0; j < 8; j++) {
        view.setUint8(j, bytes[index + 2 + j]);
      }
      return view.getFloat64(0, true);
    }
  } else if (bytes[index] < 0b1000000) {
    // Special [0011ss-- --------].
    const sign = (bytes[index] & 0b1100) >> 2;
    switch (sign) {
      case 0:
        return null;
      case 1:
        return false;
      case 2:
        return true;
      case 3:
        return undefined;
    }
  } else if (bytes[index] < 0b1010000) {
    // String [0100cccc ssssssss...].
    const count = bytes[index] & 0b1111;
    if (count === 0b1111) {
      let varlen = 0;
      let count = 0;
      while (true) {
        const end = (bytes[index + 1 + varlen] & 0b10000000) >> 7 === 0;
        count += (bytes[index + 1 + varlen] & 0b1111111) << (7 * varlen);
        varlen += 1;
        if (end) {
          break;
        }
      }
      return Buffer.from(bytes.slice(index + 1 + varlen, index + 1 + varlen + count)).toString();
    }
    return Buffer.from(bytes.slice(index + 1, index + 1 + count)).toString();
  } else if (bytes[index] < 0b1100000) {
    // Binary data [0101cccc dddddddd...].
    throw new Error("binary data are not supported");
  } else if (bytes[index] < 0b1110000) {
    // Array [0110wccc cccccccc...].
    const wide = (bytes[index] & 0b1000) >> 3 === 1;
    const count = ((bytes[index] & 0b111) << 8) + bytes[index + 1];
    if (count == 0b111_11111111) {
      throw new Error("array with varlen is not supported");
    }
    const values: any[] = [];
    for (let i = 0; i < count; i++) {
      values.push(parseFleece(bytes, sharedKeys, index + 2 + (wide ? 4 : 2) * i, wide));
    }
    return values;
  } else if (bytes[index] < 0b10000000) {
    // Dictionary [0111wccc cccccccc...].
    const wide = (bytes[index] & 0b1000) >> 3 === 1;
    const count = ((bytes[index] & 0b111) << 8) + bytes[index + 1];
    if (count == 0b111_11111111) {
      throw new Error("dictionary with varlen is not supported");
    }
    const values = {};
    for (let i = 0; i < count; i++) {
      let key = parseFleece(bytes, sharedKeys, index + 2 + (wide ? 8 : 4) * i, wide);
      if (typeof key === "number") {
        key = sharedKeys![key];
      }
      values[key] = parseFleece(
        bytes,
        sharedKeys,
        index + 2 + (wide ? 8 : 4) * i + (wide ? 4 : 2),
        wide
      );
    }
    return values;
  } else {
    // Pointer [1ooooooo oooooooo].
    let offset: number;
    if (wide) {
      offset =
        2 *
        (((bytes[index] & 0b1111111) << 24) +
          (bytes[index + 1] << 16) +
          (bytes[index + 2] << 8) +
          bytes[index + 3]);
    } else {
      offset = 2 * (((bytes[index] & 0b1111111) << 8) + bytes[index + 1]);
    }
    return parseFleece(bytes, sharedKeys, index - offset, true);
  }
};

const SALMONIA3_PLUS_SALMONID_MAP = [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17, 20];
const SALMONIA3_PLUS_UNKNOWN_MAP = {
  "-1": "473fffb2442075078d8bb7125744905abdeae651b6a5b7453ae295582e45f7d1",
  "-2": "9d7272733ae2f2282938da17d69f13419a935eef42239132a02fcf37d8678f10",
};

interface ImportResult {
  skip: number;
  fail: number;
  error?: Error;
}
interface ImportViewProps {
  disabled: boolean;
  style?: StyleProp<ViewStyle>;
  onBegin: () => void;
  onResults: (
    battles: VsHistoryDetailResult[],
    coops: CoopHistoryDetailResult[],
    images: string[]
  ) => Promise<ImportResult>;
  onComplete: (n: number) => void;
}

const ImportView = (props: ImportViewProps) => {
  const theme = useTheme();

  const showBanner = useBanner();

  const [import_, setImport] = useState(false);
  const [ikawidget3, setIkawidget3] = useState(false);
  const [salmdroidnw, setSalmdroidnw] = useState(false);
  const [salmonia3Plus, setSalmonia3Plus] = useState(false);
  const [uri, setUri] = useState("");
  const [importing, setImporting] = useState(false);

  const showResultBanner = (n: number, skip: number, fail: number, error?: Error) => {
    if (fail > 0 && skip > 0) {
      showBanner(
        BannerLevel.Warn,
        t("loaded_n_results_skip_skipped_fail_failed", { n, skip, fail, error })
      );
    } else if (fail > 0) {
      showBanner(BannerLevel.Warn, t("loaded_n_results_fail_failed", { n, fail, error }));
    } else if (skip > 0) {
      showBanner(BannerLevel.Success, t("loaded_n_results_skip_skipped", { n, skip }));
    } else {
      showBanner(BannerLevel.Success, t("loaded_n_results", { n }));
    }
  };

  const importDirectly = async (uri: string) => {
    let imported = 0;
    try {
      props.onBegin();
      const results = JSON.parse(await FileSystem.readAsStringAsync(uri));
      const n = results["battles"].length + results["coops"].length;
      showBanner(BannerLevel.Info, t("loading_n_results", { n }));
      const { skip, fail, error } = await props.onResults(
        results["battles"],
        results["coops"],
        results["images"] ?? []
      );
      showResultBanner(n, skip, fail, error);
      imported = n - fail - skip;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      imported = -1;
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    props.onComplete(imported);
    setImporting(false);
    if (imported >= 0) {
      setImport(false);
    }
  };
  const splitAndImport = async (uri: string) => {
    let imported = 0;
    try {
      props.onBegin();
      const importReadSize = Math.floor((BATCH_SIZE / 10) * 1024 * 1024);
      const parser = new ImportStreamParser();
      let n = 0,
        skip = 0,
        fail = 0;
      let error: Error | undefined;
      let batch = 0;
      while (true) {
        const encoded = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
          length: importReadSize,
          position: importReadSize * batch,
        });
        const text = decode64(encoded);
        const results = parser.parse(text);
        n += results.battles.length + results.coops.length;
        const result = await props.onResults(results.battles, results.coops, results.images);
        skip += result.skip;
        fail += result.fail;
        if (!error && result.error) {
          error = result.error;
        }

        if (text.length < importReadSize) {
          break;
        }
        batch += 1;
      }
      showResultBanner(n, skip, fail, error);
      imported = n - skip - fail;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
      imported = -1;
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    props.onComplete(imported);
    setImporting(false);
    if (imported >= 0) {
      setImport(false);
    }
  };

  const formatSalmdroidnwImageUrl = (image: any, path: string, useSplatoon3ink?: boolean) => {
    const file = image["url"];
    if (useSplatoon3ink) {
      image["url"] = `https://splatoon3.ink/assets/splatnet/v2/${path}/${file}`;
    } else {
      image["url"] = `https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/${path}/${file}`;
    }
  };
  const formatSalmonia3PlusId = (
    path: string,
    nplnUserId: string,
    playedTime: string,
    uuid: string,
    suffix?: string
  ) => {
    const timeStr = dayjs(playedTime).utc().format("YYYYMMDDTHHmmss");
    return encode64String(
      `${path}-u-${nplnUserId}:${timeStr}_${uuid.toLowerCase()}${
        suffix !== undefined ? suffix : ""
      }`
    );
  };
  const formatSalmonia3PlusObject = (
    path: string,
    id: number,
    name: boolean,
    image?: {
      images: Record<string, string>;
      path: string;
      useSplatoon3ink?: boolean;
    },
    ignoreId?: boolean
  ) => {
    const encoded = encode64String(`${path}-${id}`);
    const obj: any = {};
    if (!ignoreId) {
      obj["id"] = encoded;
    }
    if (name) {
      if (id === -1 || id === -2) {
        obj["name"] = t("random");
      } else {
        obj["name"] = t(encoded);
      }
    }
    if (image) {
      let url: string;
      if (id < 0) {
        url = `https://splatoon3.ink/assets/splatnet/v2/ui_img/${SALMONIA3_PLUS_UNKNOWN_MAP[id]}_0.png`;
      } else {
        if (image.useSplatoon3ink) {
          url = `https://splatoon3.ink/assets/splatnet/v2/${image.path}/${image.images[encoded]}_0.png`;
        } else {
          url = `https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v2/${image.path}/${image.images[encoded]}_0.png`;
        }
      }
      obj["image"] = { url };
    }
    return obj;
  };

  const onImportPress = () => {
    setImport(true);
  };
  const onImportClose = () => {
    if (!importing) {
      setImport(false);
    }
  };
  const onConvertS3sOutputsPress = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay#import-data-from-s3s");
  };
  const onConvertStatInkSalmonRunJsonPress = () => {
    WebBrowser.openBrowserAsync(
      "https://github.com/zhxie/conch-bay#import-salmon-run-data-from-statink"
    );
  };
  const onImportIkawidget3Ikax3Press = () => {
    setIkawidget3(true);
  };
  const onImportIkawidget3Ikax3Close = () => {
    setIkawidget3(false);
  };
  const onImportIkawidget3Ikax3ContinuePress = async () => {
    setImporting(true);
    let uri = "";
    let imported = 0;
    try {
      const doc = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (doc.canceled) {
        setImporting(false);
        return;
      }
      uri = doc.assets[0].uri;

      setIkawidget3(false);
      props.onBegin();
      const Zip = await import("react-native-zip-archive");
      await Zip.unzip(uri, `${FileSystem.cacheDirectory!}/ikawidget3`);
      const account = JSON.parse(
        await FileSystem.readAsStringAsync(`${FileSystem.cacheDirectory}/ikawidget3/account.json`)
      );
      const accountId = account["id"];
      await Promise.all([
        FileSystem.copyAsync({
          from: `${FileSystem.cacheDirectory!}/ikawidget3/${accountId}/vsResult.cblite2/db.sqlite3`,
          to: `${FileSystem.documentDirectory!}ikawidget3-battle.db`,
        }),
        FileSystem.copyAsync({
          from: `${FileSystem.cacheDirectory!}/ikawidget3/${accountId}/coopResult.cblite2/db.sqlite3`,
          to: `${FileSystem.documentDirectory!}ikawidget3-coop.db`,
        }),
      ]);
      const SQLite = await import("react-native-quick-sqlite");

      const battleDb = SQLite.open({ name: "ikawidget3-battle.db" });
      const coopDb = SQLite.open({ name: "ikawidget3-coop.db" });
      const counts = await Promise.all([
        battleDb.executeAsync("SELECT COUNT(1) FROM kv_default"),
        coopDb.executeAsync("SELECT COUNT(1) FROM kv_default"),
      ]);
      const n = counts[0].rows!.item(0)["COUNT(1)"] + counts[1].rows!.item(0)["COUNT(1)"];
      showBanner(BannerLevel.Info, t("loading_n_results", { n }));
      let batch = 0;
      let skip = 0,
        fail = 0;
      let error: Error | undefined;
      const battleInfo = await battleDb.executeAsync("SELECT body FROM kv_info WHERE `key` = ?", [
        "SharedKeys",
      ]);
      const battleSharedKeys = parseFleece(battleInfo.rows!.item(0)["body"]);
      while (true) {
        const battles: VsHistoryDetailResult[] = [];
        const record = await battleDb.executeAsync(
          `SELECT body FROM kv_default LIMIT ${BATCH_SIZE} OFFSET ${BATCH_SIZE * batch}`
        );
        const results = record.rows!._array;
        for (const row of results) {
          const result = parseFleece(row["body"], battleSharedKeys);
          battles.push({ vsHistoryDetail: result });
        }
        const result = await props.onResults(battles, [], []);
        skip += result.skip;
        fail += result.fail;
        if (!error) {
          error = result.error;
        }
        if (results.length < BATCH_SIZE) {
          break;
        }
        batch += 1;
      }
      const coopInfo = await coopDb.executeAsync("SELECT body FROM kv_info WHERE `key` = ?", [
        "SharedKeys",
      ]);
      const coopSharedKeys = parseFleece(coopInfo.rows!.item(0)["body"]);
      while (true) {
        const coops: CoopHistoryDetailResult[] = [];
        const record = await coopDb.executeAsync(
          `SELECT body FROM kv_default LIMIT ${BATCH_SIZE} OFFSET ${BATCH_SIZE * batch}`
        );
        const results = record.rows!._array;
        for (const row of results) {
          const result = parseFleece(row["body"], coopSharedKeys);
          coops.push({ coopHistoryDetail: result });
        }
        const result = await props.onResults([], coops, []);
        skip += result.skip;
        fail += result.fail;
        if (!error) {
          error = result.error;
        }
        if (results.length < BATCH_SIZE) {
          break;
        }
        batch += 1;
      }
      showResultBanner(n, skip, fail, error);
      imported = n - fail - skip;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    await Promise.all([
      FileSystem.deleteAsync(uri, { idempotent: true }),
      FileSystem.deleteAsync(`${FileSystem.cacheDirectory!}/ikawidget3`, { idempotent: true }),
      FileSystem.deleteAsync(`${FileSystem.documentDirectory!}ikawidget3-battle.db`, {
        idempotent: true,
      }),
      FileSystem.deleteAsync(`${FileSystem.documentDirectory!}ikawidget3-battle.db-shm`, {
        idempotent: true,
      }),
      FileSystem.deleteAsync(`${FileSystem.documentDirectory!}ikawidget3-battle.db-wal`, {
        idempotent: true,
      }),
      FileSystem.deleteAsync(`${FileSystem.documentDirectory!}ikawidget3-coop.db`, {
        idempotent: true,
      }),
      FileSystem.deleteAsync(`${FileSystem.documentDirectory!}ikawidget3-coop.db-shm`, {
        idempotent: true,
      }),
      FileSystem.deleteAsync(`${FileSystem.documentDirectory!}ikawidget3-coop.db-wal`, {
        idempotent: true,
      }),
    ]);
    props.onComplete(imported);
    setImporting(false);
  };
  const onImportSalmdroidnwBackupPress = () => {
    setSalmdroidnw(true);
  };
  const onImportSalmdroidnwBackupClose = () => {
    setSalmdroidnw(false);
  };
  const onImportSalmdroidnwBackupContinuePress = async () => {
    setImporting(true);
    let uri = "";
    let imported = 0;
    try {
      const doc = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (doc.canceled) {
        setImporting(false);
        return;
      }
      uri = doc.assets[0].uri;

      setSalmdroidnw(false);
      props.onBegin();
      const coops: CoopHistoryDetailResult[] = [];
      const Zip = await import("react-native-zip-archive");
      await Zip.unzip(uri, `${FileSystem.cacheDirectory!}/salmdroidNW`);
      const data = JSON.parse(
        await FileSystem.readAsStringAsync(`${FileSystem.cacheDirectory!}/salmdroidNW/1`)
      );
      const results = JSON.parse(data["results"]);
      const n = results.length;
      showBanner(BannerLevel.Info, t("loading_n_results", { n }));
      for (const result of results) {
        const coop = {
          coopHistoryDetail: JSON.parse(result["coopHistory"]),
        } as CoopHistoryDetailResult;
        for (const memberResult of [
          coop.coopHistoryDetail!.myResult,
          ...coop.coopHistoryDetail!.memberResults,
        ]) {
          for (const badge of memberResult.player.nameplate!.badges) {
            if (badge) {
              formatSalmdroidnwImageUrl(badge.image, "badge_img");
            }
          }
          formatSalmdroidnwImageUrl(memberResult.player.nameplate!.background.image, "npl_img");
          formatSalmdroidnwImageUrl(memberResult.player.uniform.image, "coop_skin_img");
          for (const weapon of memberResult.weapons) {
            let useSplatoon3ink = true;
            const id = weaponList.images[getImageHash(weapon.image.url)];
            if (weaponList.coopRareWeapons.find((w) => w === id)) {
              useSplatoon3ink = false;
            }
            formatSalmdroidnwImageUrl(weapon.image, "weapon_illust", useSplatoon3ink);
          }
          if (memberResult.specialWeapon) {
            if (!coopSpecialWeaponList.images[getImageHash(memberResult.specialWeapon.image.url)]) {
              formatSalmdroidnwImageUrl(memberResult.specialWeapon.image, "ui_img", true);
            } else {
              formatSalmdroidnwImageUrl(memberResult.specialWeapon.image, "special_img/blue");
            }
          }
        }
        if (coop.coopHistoryDetail!.bossResult) {
          formatSalmdroidnwImageUrl(
            coop.coopHistoryDetail!.bossResult.boss.image,
            "coop_enemy_img"
          );
        }
        for (const enemyResult of coop.coopHistoryDetail!.enemyResults) {
          formatSalmdroidnwImageUrl(enemyResult.enemy.image, "coop_enemy_img");
        }
        for (const waveResult of coop.coopHistoryDetail!.waveResults) {
          for (const specialWeapon of waveResult.specialWeapons) {
            formatSalmdroidnwImageUrl(specialWeapon.image, "special_img/blue");
          }
        }
        formatSalmdroidnwImageUrl(
          coop.coopHistoryDetail!.coopStage.image,
          "stage_img/banner/high_resolution",
          false
        );
        for (const weapon of coop.coopHistoryDetail!.weapons) {
          if (!weaponList.images[getImageHash(weapon.image.url)]) {
            formatSalmdroidnwImageUrl(weapon.image, "ui_img", true);
          } else {
            formatSalmdroidnwImageUrl(weapon.image, "weapon_illust", true);
          }
        }
        coops.push(coop);
      }
      const { skip, fail, error } = await props.onResults([], coops, []);
      showResultBanner(n, skip, fail, error);
      imported = n - fail - skip;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    await Promise.all([
      FileSystem.deleteAsync(uri, { idempotent: true }),
      FileSystem.deleteAsync(`${FileSystem.cacheDirectory!}/salmdroidNW`, { idempotent: true }),
    ]);
    props.onComplete(imported);
    setImporting(false);
    if (imported >= 0) {
      setImport(false);
    }
  };
  const onImportSalmonia3PlusBackupPress = () => {
    setSalmonia3Plus(true);
  };
  const onImportSalmonia3PlusBackupClose = () => {
    setSalmonia3Plus(false);
  };
  const onImportSalmonia3PlusBackupContinuePress = async () => {
    setImporting(true);
    let uri = "";
    let imported = 0;
    try {
      const doc = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (doc.canceled) {
        setImporting(false);
        return;
      }
      uri = doc.assets[0].uri;

      setSalmonia3Plus(false);
      props.onBegin();
      const coops: CoopHistoryDetailResult[] = [];
      const data = JSON.parse(await FileSystem.readAsStringAsync(uri));
      const n = data["schedules"].reduce((prev, current) => prev + current["results"].length, 0);
      showBanner(BannerLevel.Info, t("loading_n_results", { n }));
      for (const schedule of data["schedules"]) {
        for (const result of schedule["results"]) {
          const memberResults = result["players"].map((player) => {
            const background = formatSalmonia3PlusObject(
              "NameplateBackground",
              player["background"],
              false,
              {
                images: backgroundList.backgrounds,
                path: "npl_img",
              }
            );
            return {
              player: {
                __isPlayer: "CoopPlayer",
                byname: player["byname"],
                name: player["name"],
                nameId: player["name_id"],
                nameplate: {
                  badges: player["badges"].map((badge) => {
                    if (!badge) {
                      return null;
                    }
                    return formatSalmonia3PlusObject("Badge", badge, false, {
                      images: badgeList.badges,
                      path: "badge_img",
                    });
                  }),
                  background: {
                    ...background,
                    textColor: {
                      a: player["text_color"][3],
                      b: player["text_color"][2],
                      g: player["text_color"][1],
                      r: player["text_color"][0],
                    },
                  },
                },
                uniform: formatSalmonia3PlusObject("CoopUniform", player["uniform"], true, {
                  images: workSuitList.workSuits,
                  path: "coop_skin_img",
                }),
                id: formatSalmonia3PlusId(
                  "CoopPlayer",
                  result["npln_user_id"],
                  result["play_time"],
                  result["uuid"],
                  `u-${player["npln_user_id"]}`
                ),
                species: player["species"],
              },
              weapons: player["weapon_list"].map((weapon) =>
                formatSalmonia3PlusObject(
                  "Weapon",
                  weapon,
                  true,
                  {
                    images: weaponList.weapons,
                    path: "weapon_illust",
                    useSplatoon3ink: !weaponList.coopRareWeapons.find(
                      (w) => w === encode64String(`Weapon-${weapon}`)
                    ),
                  },
                  true
                )
              ),
              specialWeapon:
                player["special_id"] !== null
                  ? {
                      ...formatSalmonia3PlusObject(
                        "SpecialWeapon",
                        player["special_id"],
                        true,
                        {
                          images: coopSpecialWeaponList.specialWeapons,
                          path: "special_img/blue",
                        },
                        true
                      ),
                      weaponId: player["special_id"],
                    }
                  : null,
              defeatEnemyCount: player["boss_kill_counts_total"],
              deliverCount: player["ikura_num"],
              goldenAssistCount: player["golden_ikura_assist_num"],
              goldenDeliverCount: player["golden_ikura_num"],
              rescueCount: player["help_count"],
              rescuedCount: player["dead_count"],
            };
          });
          coops.push({
            coopHistoryDetail: {
              __typename: "CoopHistoryDetail",
              id: formatSalmonia3PlusId(
                "CoopHistoryDetail",
                result["npln_user_id"],
                result["play_time"],
                result["uuid"]
              ),
              afterGrade:
                result["grade_id"] !== null
                  ? formatSalmonia3PlusObject("CoopGrade", result["grade_id"], true)
                  : null,
              myResult: memberResults[0],
              memberResults: memberResults.slice(1),
              bossResult:
                result["boss_id"] !== null
                  ? {
                      boss: formatSalmonia3PlusObject("CoopEnemy", result["boss_id"], true, {
                        images: salmonidList.salmonids,
                        path: "coop_enemy_img",
                      }),
                      hasDefeatBoss: result["is_boss_defeated"],
                    }
                  : null,
              enemyResults: result["boss_counts"]
                .map((count, i) => {
                  if (count === 0) {
                    return undefined;
                  }
                  return {
                    defeatCount: result["players"][0]["boss_kill_counts"][i],
                    teamDefeatCount: result["boss_kill_counts"][i],
                    popCount: count,
                    enemy: formatSalmonia3PlusObject(
                      "CoopEnemy",
                      SALMONIA3_PLUS_SALMONID_MAP[i],
                      true,
                      {
                        images: salmonidList.salmonids,
                        path: "coop_enemy_img",
                      }
                    ),
                  };
                })
                .filter((enemyResult) => enemyResult),
              waveResults: result["waves"].map((wave, i) => {
                // HACK: for simplicity only.
                const specialWeapons: any[] = [];
                for (const player of result["players"]) {
                  for (let j = 0; j < player["special_counts"][i]; j++) {
                    specialWeapons.push(
                      formatSalmonia3PlusObject("SpecialWeapon", player["special_id"], true, {
                        images: coopSpecialWeaponList.specialWeapons,
                        path: "special_img/blue",
                      })
                    );
                  }
                }
                return {
                  waveNumber: wave["id"],
                  waterLevel: wave["water_level"],
                  eventWave:
                    wave["event_type"] !== 0
                      ? formatSalmonia3PlusObject("CoopEventWave", wave["event_type"], true)
                      : null,
                  deliverNorm: wave["quota_num"],
                  goldenPopCount: wave["golden_ikura_pop_num"],
                  teamDeliverCount: wave["golden_ikura_num"],
                  specialWeapons,
                };
              }),
              resultWave: result["failure_wave"] ?? 0,
              playedTime: result["play_time"],
              rule: schedule["rule"],
              coopStage: formatSalmonia3PlusObject("CoopStage", schedule["stage_id"], true, {
                images: coopStageList.coopStages,
                path: "stage_img/banner/high_resolution",
              }),
              dangerRate: result["danger_rate"],
              scenarioCode: result["scenario_code"],
              smellMeter: result["smell_meter"],
              weapons: schedule["weapon_list"].map((weapon) =>
                formatSalmonia3PlusObject(
                  "Weapon",
                  weapon,
                  true,
                  {
                    images: weaponList.weapons,
                    path: "weapon_illust",
                    useSplatoon3ink: true,
                  },
                  true
                )
              ),
              afterGradePoint: result["grade_point"],
              scale:
                result["scale"][0] !== null
                  ? {
                      gold: result["scale"][2],
                      silver: result["scale"][1],
                      bronze: result["scale"][0],
                    }
                  : null,
              jobPoint: result["kuma_point"],
              jobScore: result["job_score"],
              jobRate: result["job_rate"],
              jobBonus: result["job_bonus"],
              nextHistoryDetail: null,
              previousHistoryDetail: null,
            },
          });
        }
      }
      const { skip, fail, error } = await props.onResults([], coops, []);
      showResultBanner(n, skip, fail, error);
      imported = n - fail - skip;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    props.onComplete(imported);
    setImporting(false);
    if (imported >= 0) {
      setImport(false);
    }
  };
  const onImportContinuePress = async () => {
    setImporting(true);
    let uri = "";
    try {
      const doc = await DocumentPicker.getDocumentAsync({ copyToCacheDirectory: true });
      if (doc.canceled) {
        setImporting(false);
        return;
      }
      uri = doc.assets[0].uri;
      const info = await FileSystem.getInfoAsync(uri, { size: true });
      const importReadSize = Math.floor((BATCH_SIZE / 10) * 1024 * 1024);
      if (info["size"] > importReadSize) {
        setUri(uri);
      } else {
        importDirectly(uri);
      }
      return;
    } catch (e) {
      showBanner(BannerLevel.Error, e);
    }

    // Clean up.
    await FileSystem.deleteAsync(uri, { idempotent: true });
    setImporting(false);
  };
  const onImportContinueContinuePress = () => {
    setUri("");
    importDirectly(uri);
  };
  const onSplitAndImportPress = () => {
    setUri("");
    splitAndImport(uri);
  };

  return (
    <Center style={props.style}>
      <ToolButton icon="download" title={t("import")} onPress={onImportPress} />
      <Modal isVisible={import_} onClose={onImportClose} style={ViewStyles.modal1d}>
        <Dialog icon="download" text={t("import_notice")}>
          <Button
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertS3sOutputsPress}
          >
            <Marquee>{t("convert_s3s_outputs")}</Marquee>
          </Button>
          <Button
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertStatInkSalmonRunJsonPress}
          >
            <Marquee>{t("convert_stat_ink_salmon_run_json")}</Marquee>
          </Button>
          <Button
            disabled={
              Constants.appOwnership === AppOwnership.Expo || (props.disabled && !importing)
            }
            loading={importing}
            loadingText={t("importing")}
            style={[ViewStyles.mb2, ViewStyles.accent]}
            textStyle={theme.reverseTextStyle}
            onPress={onImportIkawidget3Ikax3Press}
          >
            <Marquee style={theme.reverseTextStyle}>{t("import_ikawidget3_ikax3")}</Marquee>
          </Button>
          <Button
            disabled={props.disabled && !importing}
            loading={importing}
            loadingText={t("importing")}
            style={[ViewStyles.mb2, ViewStyles.accent]}
            textStyle={theme.reverseTextStyle}
            onPress={onImportSalmdroidnwBackupPress}
          >
            <Marquee style={theme.reverseTextStyle}>{t("import_salmdroidnw_backup")}</Marquee>
          </Button>
          <Button
            disabled={props.disabled && !importing}
            loading={importing}
            loadingText={t("importing")}
            style={[ViewStyles.mb2, ViewStyles.accent]}
            textStyle={theme.reverseTextStyle}
            onPress={onImportSalmonia3PlusBackupPress}
          >
            <Marquee style={theme.reverseTextStyle}>{t("import_salmonia3+_backup")}</Marquee>
          </Button>
          <Button
            disabled={props.disabled && !importing}
            loading={importing}
            loadingText={t("importing")}
            style={ViewStyles.accent}
            textStyle={theme.reverseTextStyle}
            onPress={onImportContinuePress}
          >
            <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
          </Button>
        </Dialog>
        <Modal
          isVisible={ikawidget3}
          onClose={onImportIkawidget3Ikax3Close}
          style={ViewStyles.modal1d}
        >
          <Dialog icon="info" text={t("import_ikawidget3_ikax3_notice")}>
            <Button
              disabled={Constants.appOwnership === AppOwnership.Expo || importing}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onImportIkawidget3Ikax3ContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
        <Modal
          isVisible={salmdroidnw}
          onClose={onImportSalmdroidnwBackupClose}
          style={ViewStyles.modal1d}
        >
          <Dialog icon="info" text={t("import_salmdroidnw_backup_notice")}>
            <Button
              disabled={Constants.appOwnership === AppOwnership.Expo || importing}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onImportSalmdroidnwBackupContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
        <Modal
          isVisible={salmonia3Plus}
          onClose={onImportSalmonia3PlusBackupClose}
          style={ViewStyles.modal1d}
        >
          <Dialog icon="info" text={t("import_salmonia3+_backup_notice")}>
            <Button
              disabled={importing}
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onImportSalmonia3PlusBackupContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
        <Modal isVisible={uri.length > 0} style={ViewStyles.modal1d}>
          <Dialog icon="alert-circle" text={t("split_and_import_notice")}>
            <Button
              style={[ViewStyles.mb2, ViewStyles.accent]}
              textStyle={theme.reverseTextStyle}
              onPress={onImportContinueContinuePress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("import")}</Marquee>
            </Button>
            <Button
              style={ViewStyles.accent}
              textStyle={theme.reverseTextStyle}
              onPress={onSplitAndImportPress}
            >
              <Marquee style={theme.reverseTextStyle}>{t("split_and_import")}</Marquee>
            </Button>
          </Dialog>
        </Modal>
      </Modal>
    </Center>
  );
};

export default ImportView;
