import { Buffer } from "buffer";
import dayjs from "dayjs";
import * as Device from "expo-device";
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
import { getImageHash } from "../utils/ui";

const IMPORT_READ_SIZE = Math.floor((Device.totalMemory! / 1024) * 15);

enum ImportStreamMode {
  Unknown,
  Battles = '"battles":[',
  Coops = '"coops":[',
}

class ImportStreamParser {
  mode = ImportStreamMode.Unknown;
  drained = 0;
  buffer: number[] = [];

  parse = (bytes: Uint8Array) => {
    // For prefix position.
    let battlesPrefix = 0,
      coopsPrefix = 0;
    // For result parsing.
    let bracket = 0,
      quote = false;
    let bracketPos = -1;
    const battles: number[] = [],
      coops: number[] = [];

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
      if (battlesPrefix === ImportStreamMode.Battles.length) {
        this.mode = ImportStreamMode.Battles;
        battlesPrefix = 0;
        coopsPrefix = 0;
        drainable = i + 1;
      } else if (coopsPrefix === ImportStreamMode.Coops.length) {
        this.mode = ImportStreamMode.Coops;
        battlesPrefix = 0;
        coopsPrefix = 0;
        drainable = i + 1;
      }

      // Parse results.
      switch (this.mode) {
        case ImportStreamMode.Unknown:
          break;
        case ImportStreamMode.Battles:
        case ImportStreamMode.Coops:
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
    return {
      battles: JSON.parse(Buffer.from(battles).toString()),
      coops: JSON.parse(Buffer.from(coops).toString()),
    };
  };
}

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
    coops: CoopHistoryDetailResult[]
  ) => Promise<ImportResult>;
  onComplete: (n: number) => void;
}

const ImportView = (props: ImportViewProps) => {
  const theme = useTheme();

  const showBanner = useBanner();

  const [import_, setImport] = useState(false);
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
      const { skip, fail, error } = await props.onResults(results["battles"], results["coops"]);
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
      const parser = new ImportStreamParser();
      let n = 0,
        skip = 0,
        fail = 0;
      let error: Error | undefined;
      let batch = 0;
      while (true) {
        const encoded = await FileSystem.readAsStringAsync(uri, {
          encoding: "base64",
          length: IMPORT_READ_SIZE,
          position: IMPORT_READ_SIZE * batch,
        });
        const text = decode64(encoded);
        const results = parser.parse(text);
        n += results.battles.length + results.coops.length;
        const result = await props.onResults(results.battles, results.coops);
        skip += result.skip;
        fail += result.fail;
        if (!error && result.error) {
          error = result.error;
        }

        if (text.length < IMPORT_READ_SIZE) {
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
      image["url"] = `https://splatoon3.ink/assets/splatnet/v1/${path}/${file}`;
    } else {
      image["url"] = `https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v1/${path}/${file}`;
    }
  };
  const formatSalmonia3PlusId = (
    path: string,
    nplnUserId: string,
    playedTime: string,
    uuid: string,
    suffix?: string
  ) => {
    const timeStr = dayjs(playedTime).format("YYYYMMDDTHHmmss");
    return encode64String(`${path}-u-${nplnUserId}:${timeStr}_${uuid.toLowerCase()}${suffix}`);
  };
  const formatSalmonia3Object = (
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
      obj["name"] = t(encoded);
    }
    if (image) {
      let url: string;
      if (id < 0) {
        url = `https://splatoon3.ink/assets/splatnet/v1/ui_img/${SALMONIA3_PLUS_UNKNOWN_MAP[id]}_0.png`;
      } else {
        if (image.useSplatoon3ink) {
          url = `https://splatoon3.ink/assets/splatnet/v1/${image.path}/${image.images[encoded]}_0.png`;
        } else {
          url = `https://api.lp1.av5ja.srv.nintendo.net/resources/prod/v1/${image.path}/${image.images[encoded]}_0.png`;
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
  const onConvertIkawidget3Ikax3Press = () => {
    WebBrowser.openBrowserAsync("https://github.com/zhxie/conch-bay#import-data-from-ikawidget3");
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
      const data = JSON.parse(await FileSystem.readAsStringAsync(uri));
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
          "stage_img/icon/high_resolution",
          true
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
      const { skip, fail, error } = await props.onResults([], coops);
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
            const background = formatSalmonia3Object(
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
                    return formatSalmonia3Object("Badge", badge, false, {
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
                uniform: formatSalmonia3Object("CoopUniform", player["uniform"], true, {
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
              weapons: player["weapon_list"].map((weapon) => {
                return formatSalmonia3Object(
                  "Weapon",
                  weapon,
                  true,
                  {
                    images: weaponList.weapons,
                    path: "weapon_illust",
                    useSplatoon3ink: !!weaponList.coopRareWeapons.find(
                      (w) => w === encode64String(`Weapon-${weapon}`)
                    ),
                  },
                  true
                );
              }),
              specialWeapon:
                player["special_id"] !== null
                  ? {
                      ...formatSalmonia3Object(
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
                  ? formatSalmonia3Object("CoopGrade", result["grade_id"], true)
                  : null,
              myResult: memberResults[0],
              memberResults: memberResults.slice(1),
              bossResult:
                result["boss_id"] !== null
                  ? {
                      boss: formatSalmonia3Object("CoopEnemy", result["boss_id"], true, {
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
                    enemy: formatSalmonia3Object(
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
                      formatSalmonia3Object("SpecialWeapon", player["special_id"], true, {
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
                      ? formatSalmonia3Object("CoopEventWave", wave["event_type"], true)
                      : null,
                  deliverNorm: wave["quota_num"],
                  goldenPopCount: wave["golden_ikura_pop_num"],
                  teamDeliverCount: wave["golden_ikura_num"],
                  specialWeapons,
                };
              }),
              resultWave: result["failure_wave"] ?? 0,
              playedTime: result["play_time"],
              rule: schedule["mode"] === "LIMITED" ? "TEAM_CONTEST" : schedule["mode"],
              coopStage: formatSalmonia3Object("CoopStage", schedule["stage_id"], true, {
                images: coopStageList.coopStages,
                path: "stage_img/icon/high_resolution",
                useSplatoon3ink: true,
              }),
              dangerRate: result["danger_rate"],
              scenarioCode: result["scenario_code"],
              smellMeter: result["smell_meter"],
              weapons: schedule["weapon_list"].map((weapon) =>
                formatSalmonia3Object(
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
      const { skip, fail, error } = await props.onResults([], coops);
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
      if (info["size"] > IMPORT_READ_SIZE) {
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
      <ToolButton
        icon="download"
        title={t("import")}
        style={ViewStyles.mr2}
        onPress={onImportPress}
      />
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
            style={[
              ViewStyles.mb2,
              { borderColor: Color.AccentColor, borderWidth: 1.5 },
              theme.backgroundStyle,
            ]}
            onPress={onConvertIkawidget3Ikax3Press}
          >
            <Marquee>{t("convert_ikawidget3_ikax3")}</Marquee>
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
          isVisible={salmdroidnw}
          onClose={onImportSalmdroidnwBackupClose}
          style={ViewStyles.modal1d}
        >
          <Dialog icon="info" text={t("import_salmdroidnw_backup_notice")}>
            <Button
              disabled={importing}
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
