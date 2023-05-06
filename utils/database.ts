import * as SQLite from "expo-sqlite";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import weapons from "../models/weapons.json";
import { decode64Index } from "./codec";
import { getImageHash, getVsSelfPlayer } from "./ui";

export interface FilterProps {
  modes: string[];
  rules: string[];
  stages: string[];
  weapons: string[];
}

let db: SQLite.WebSQLDatabase | undefined = undefined;

export const open = async () => {
  if (db) {
    return;
  }
  db = SQLite.openDatabase("conch-bay.db");

  // Initialize database.
  await exec(
    "CREATE TABLE IF NOT EXISTS result ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, rule TEXT NOT NULL, weapon TEXT NOT NULL, players TEXT NOT NULL, detail TEXT NOT NULL )",
    [],
    false
  );

  // Upgrade database.
  const record = await exec("PRAGMA user_version", [], true);
  let version = record.rows[0]["user_version"] as number;
  if (version < 1) {
    await beginTransaction();
    try {
      await exec('ALTER TABLE result ADD COLUMN stage TEXT NOT NULL DEFAULT ""', [], false);
      const records = await queryAll(false);
      await Promise.all(
        records.map((record) => {
          if (record.mode === "salmon_run") {
            return exec(
              "UPDATE result SET stage = ? WHERE id = ?",
              [
                (JSON.parse(record.detail) as CoopHistoryDetailResult).coopHistoryDetail!.coopStage
                  .id,
              ],
              false
            );
          }
          return exec(
            "UPDATE result SET stage = ? WHERE id = ?",
            [
              (JSON.parse(record.detail) as VsHistoryDetailResult).vsHistoryDetail!.vsStage.id,
              record.id,
            ],
            false
          );
        })
      );
      await exec("PRAGMA user_version=1", [], false);
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
    version = 1;
  }
  if (version < 2) {
    await beginTransaction();
    try {
      const records = await exec(
        'SELECT * FROM result WHERE mode = "salmon_run" AND weapon = ""',
        [],
        true
      );
      await Promise.all(
        records.rows.map((row) => {
          const detail = JSON.parse(row["detail"]) as CoopHistoryDetailResult;
          return exec(
            "UPDATE result SET weapon = ? WHERE id = ?",
            [
              detail
                .coopHistoryDetail!.myResult.weapons.map((weapon) => getImageHash(weapon.image.url))
                .join(","),
              detail.coopHistoryDetail!.id,
            ],
            false
          );
        })
      );
      await exec("PRAGMA user_version=2", [], false);
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
    version = 2;
  }
  if (version != 2) {
    throw new Error(`unexpected database version ${version}`);
  }

  return db;
};
export const close = () => {
  db!.closeAsync();
};
const exec = async (sql: string, args: any[], readonly: boolean): Promise<SQLite.ResultSet> => {
  return await new Promise((resolve, reject) => {
    db!.exec([{ sql: sql, args: args }], readonly, (err, res) => {
      if (err) {
        return reject(err);
      }
      if (res![0]["error"]) {
        return reject(res![0]["error"]);
      }
      resolve(res![0] as SQLite.ResultSet);
    });
  });
};
const beginTransaction = async () => {
  return await exec("begin transaction", [], false);
};
const commit = async () => {
  return await exec("commit", [], false);
};
const rollback = async () => {
  return await exec("rollback", [], false);
};

const convertFilter = (filter?: FilterProps, from?: number) => {
  const filters: string[] = [];
  if (filter) {
    if (filter.modes.length > 0) {
      filters.push(`(${filter.modes.map((mode) => `mode = '${mode}'`).join(" OR ")})`);
    }
    if (filter.rules.length > 0) {
      filters.push(`(${filter.rules.map((rule) => `rule = '${rule}'`).join(" OR ")})`);
    }
    if (filter.weapons.length > 0) {
      filters.push(
        `(${filter.weapons
          .map((weapon) => {
            const image = weapons[weapon];
            if (image) {
              return `(weapon = '${weapon}') OR (instr(weapon, '${image}') > 0)`;
            }
            return `weapon = '${weapon}'`;
          })
          .join(" OR ")})`
      );
    }
    if (filter.stages.length > 0) {
      filters.push(
        `(${filter.stages
          .map((stage) => {
            // Includes Big Run stages.
            if (stage === "VnNTdGFnZS0xNg==") {
              return "stage = 'VnNTdGFnZS0xNg==' OR stage = 'Q29vcFN0YWdlLTEwMA=='";
            }
            return `stage = '${stage}'`;
          })
          .join(" OR ")})`
      );
    }
  }
  if (from) {
    filters.push(`(time >= ${from})`);
  }
  const condition = filters.map((filter) => `(${filter})`).join(" AND ");
  if (!condition) {
    return "";
  }
  return `WHERE ${condition}`;
};

export const query = async (offset: number, limit: number, filter?: FilterProps) => {
  let condition: string = "";
  if (filter) {
    condition = convertFilter(filter);
  }
  const sql = `SELECT * FROM result ${condition} ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;
  const record = await exec(sql, [], true);
  return record.rows.map((row) => ({
    id: row["id"],
    time: row["time"],
    mode: row["mode"],
    rule: row["rule"],
    weapon: row["weapon"],
    players: row["players"].split(","),
    detail: row["detail"],
    stage: row["stage"],
  }));
};
export const queryAll = async (order: boolean) => {
  const record = await exec("SELECT * FROM result" + (order ? " ORDER BY time" : ""), [], true);
  return record.rows.map((row) => ({
    id: row["id"],
    time: row["time"],
    mode: row["mode"],
    rule: row["rule"],
    weapon: row["weapon"],
    players: row["players"].split(","),
    detail: row["detail"],
    stage: row["stage"],
  }));
};
const WEAPON_IMAGE_MAP = new Map<string, string>();
export const queryFilterOptions = async () => {
  const modeSql = "SELECT DISTINCT mode FROM result";
  const ruleSql = "SELECT DISTINCT rule FROM result";
  const stageSql = "SELECT DISTINCT stage FROM result";
  const weaponSql = "SELECT DISTINCT weapon FROM result";

  const [modeRecord, ruleRecord, stageRecord, weaponRecord] = await Promise.all([
    exec(modeSql, [], true),
    exec(ruleSql, [], true),
    exec(stageSql, [], true),
    exec(weaponSql, [], true),
  ]);
  const weaponSet = new Set<string>();
  for (const row of weaponRecord.rows) {
    const weapon = row["weapon"];
    if (WEAPON_IMAGE_MAP.size === 0) {
      for (const weapon in weapons) {
        WEAPON_IMAGE_MAP.set(weapons[weapon], weapon);
      }
    }
    for (const w of weapon.split(",")) {
      if (w.length > 0) {
        weaponSet.add(WEAPON_IMAGE_MAP.get(w) ?? w);
      }
    }
  }
  return {
    modes: modeRecord.rows
      .map((row) => row["mode"])
      .filter((mode) => mode !== "")
      .sort((a, b) => {
        // Move coop to the last.
        if (a === "salmon_run") {
          return 1;
        }
        if (b === "salmon_run") {
          return -1;
        }
        // Move anarchy battle open behind anarchy battle series.
        let aId = decode64Index(a);
        if (aId === 51) {
          aId = 2.5;
        }
        let bId = decode64Index(b);
        if (bId === 51) {
          bId = 2.5;
        }
        return aId - bId;
      }),
    rules: ruleRecord.rows
      .map((row) => row["rule"])
      .filter((rule) => rule !== "")
      .sort((a, b) => {
        // Move coop rules behind battle rules.
        if (a.startsWith("V") && b.startsWith("V")) {
          return decode64Index(a) - decode64Index(b);
        } else if (a.startsWith("V")) {
          return -1;
        } else if (b.startsWith("V")) {
          return 1;
        }
        // Sort coop rules as REGULAR, BIG_RUN and TEAM_CONTEST.
        const coopRuleMap = {
          REGULAR: 1,
          BIG_RUN: 2,
          TEAM_CONTEST: 3,
        };
        const aSeq = coopRuleMap[a];
        const bSeq = coopRuleMap[b];
        if (aSeq && bSeq) {
          return aSeq - bSeq;
        }
        return a.localeCompare(b);
      }),
    stages: stageRecord.rows
      .map((row) => row["stage"])
      .filter((stage) => stage !== "")
      // Escape Big Run stages.
      .filter((stage) => stage !== "Q29vcFN0YWdlLTEwMA==")
      .sort((a, b) => {
        // Move coop stages behind battle stages.
        if (a.startsWith("V") && b.startsWith("Q")) {
          return -1;
        }
        if (a.startsWith("Q") && b.startsWith("V")) {
          return 1;
        }
        return decode64Index(a) - decode64Index(b);
      }),
    weapons: Array.from(weaponSet.values()).sort((a, b) => {
      // Move grizzco weapons behind regular weapons.
      if (a.startsWith("V") && b.startsWith("V")) {
        return decode64Index(a) - decode64Index(b);
      } else if (a.startsWith("V")) {
        return -1;
      } else if (b.startsWith("V")) {
        return 1;
      }
      // Sort grizzco weapons in the order.
      const grizzcoMap = {
        grizzco_blaster: 1,
        grizzco_brella: 2,
        grizzco_charger: 3,
        grizzco_slosher: 4,
        grizzco_stringer: 5,
        grizzco_splatana: 6,
      };
      const aSeq = grizzcoMap[a];
      const bSeq = grizzcoMap[b];
      if (aSeq && bSeq) {
        return aSeq - bSeq;
      }
      return a.localeCompare(b);
    }),
  };
};
export const count = async (filter?: FilterProps, from?: number) => {
  let condition: string = "";
  if (filter || from) {
    condition = convertFilter(filter, from);
  }
  const sql = `SELECT COUNT(1) FROM result ${condition}`;
  const record = await exec(sql, [], true);
  return record.rows[0]["COUNT(1)"] as number;
};
export const isExist = async (id: string) => {
  const record = await exec("SELECT * FROM result WHERE id = ?", [id], true);
  return record.rows.length > 0;
};
export const add = async (
  id: string,
  time: number,
  mode: string,
  rule: string,
  weapon: string,
  players: string[],
  detail: string,
  stage: string
) => {
  await exec(
    "INSERT INTO result VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    [id, time, mode, rule, weapon, players.join(","), detail, stage],
    false
  );
};
export const addBattle = (battle: VsHistoryDetailResult) => {
  return add(
    battle.vsHistoryDetail!.id,
    new Date(battle.vsHistoryDetail!.playedTime).valueOf(),
    battle.vsHistoryDetail!.vsMode.id,
    battle.vsHistoryDetail!.vsRule.id,
    getVsSelfPlayer(battle).weapon.id,
    battle
      .vsHistoryDetail!.myTeam.players.map((player) => player.id)
      .concat(
        battle
          .vsHistoryDetail!.otherTeams.map((otherTeam) =>
            otherTeam.players.map((player) => player.id)
          )
          .flat()
      ),
    JSON.stringify(battle),
    battle.vsHistoryDetail!.vsStage.id
  );
};
export const addCoop = (coop: CoopHistoryDetailResult) => {
  return add(
    coop.coopHistoryDetail!.id,
    new Date(coop.coopHistoryDetail!.playedTime).valueOf(),
    "salmon_run",
    coop.coopHistoryDetail!.rule,
    coop
      .coopHistoryDetail!.myResult.weapons.map((weapon) => getImageHash(weapon.image.url))
      .join(","),
    coop
      .coopHistoryDetail!.memberResults.map((memberResult) => memberResult.player.id)
      .concat(coop.coopHistoryDetail!.myResult.player.id),
    JSON.stringify(coop),
    coop.coopHistoryDetail!.coopStage.id
  );
};
export const clear = async () => {
  await exec("DELETE FROM result", [], false);
  await exec("VACUUM result", [], false);
};
export const drop = async () => {
  await exec("PRAGMA user_version=0", [], false);
  await exec("DROP TABLE result", [], false);
};
