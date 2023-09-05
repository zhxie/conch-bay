import * as Device from "expo-device";
import * as SQLite from "expo-sqlite";
import { Platform } from "react-native";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import weaponList from "../models/weapons.json";
import { decode64Index } from "./codec";
import { countBattle, countCoop } from "./stats";
import { getImageHash, getVsSelfPlayer } from "./ui";

let db: SQLite.SQLiteDatabase | undefined = undefined;

const VERSION = 5;

export let BATCH_SIZE = Math.floor((Math.max(Device.totalMemory!) / 1024 / 1024 / 1024) * 150);
const requestBatchSize = async () => {
  if (Platform.OS === "android") {
    BATCH_SIZE = Math.floor(((await Device.getMaxMemoryAsync()) / 1024 / 1024 / 1024) * 150);
  }
};

export const open = async () => {
  if (db) {
    return 0;
  }
  await requestBatchSize();
  db = SQLite.openDatabase("conch-bay.db");

  // Initialize database.
  await exec(
    "CREATE TABLE IF NOT EXISTS result ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, rule TEXT NOT NULL, weapon TEXT NOT NULL, players TEXT NOT NULL, detail TEXT NOT NULL )",
    [],
    false
  );

  // Check database version.
  const record = await exec("PRAGMA user_version", [], true);
  const version = record.rows[0]["user_version"] as number;
  if (version < VERSION) {
    return await count();
  }
  if (version > VERSION) {
    throw new Error(`unexpected database version ${version}`);
  }

  return undefined;
};
export const upgrade = async () => {
  const record = await exec("PRAGMA user_version", [], true);
  const version = record.rows[0]["user_version"] as number;
  if (version < 1) {
    await beginTransaction();
    try {
      await exec('ALTER TABLE result ADD COLUMN stage TEXT NOT NULL DEFAULT ""', [], false);
      let batch = 0;
      while (true) {
        const records = await queryDetail(batch * BATCH_SIZE, BATCH_SIZE);
        await Promise.all(
          records.map((record) => {
            if (record.mode === "salmon_run") {
              return exec(
                "UPDATE result SET stage = ? WHERE id = ?",
                [
                  (JSON.parse(record.detail) as CoopHistoryDetailResult).coopHistoryDetail!
                    .coopStage.id,
                  record.id,
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
        if (records.length < BATCH_SIZE) {
          break;
        }
        batch += 1;
      }
      await exec("PRAGMA user_version=1", [], false);
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 2) {
    await beginTransaction();
    try {
      let batch = 0;
      while (true) {
        const records = await exec(
          `SELECT * FROM result WHERE mode = "salmon_run" AND weapon = "" LIMIT ${BATCH_SIZE} OFFSET ${
            batch * BATCH_SIZE
          }`,
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
                  .coopHistoryDetail!.myResult.weapons.map((weapon) =>
                    getImageHash(weapon.image.url)
                  )
                  .join(","),
                detail.coopHistoryDetail!.id,
              ],
              false
            );
          })
        );
        if (records.rows.length < BATCH_SIZE) {
          break;
        }
        batch += 1;
      }
      await exec("PRAGMA user_version=2", [], false);
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 3) {
    await beginTransaction();
    try {
      await exec('ALTER TABLE result ADD COLUMN stats TEXT NOT NULL DEFAULT ""', [], false);
      let batch = 0;
      while (true) {
        const records = await queryDetail(batch * BATCH_SIZE, BATCH_SIZE, {
          modes: ["salmon_run"],
          inverted: true,
        });
        await Promise.all(
          records.map((record) =>
            exec(
              "UPDATE result SET stats = ? WHERE id = ?",
              [JSON.stringify(countBattle(JSON.parse(record.detail))), record.id],
              false
            )
          )
        );
        if (records.length < BATCH_SIZE) {
          break;
        }
        batch += 1;
      }
      await exec("PRAGMA user_version=3", [], false);
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 5) {
    await beginTransaction();
    try {
      let batch = 0;
      while (true) {
        const records = await queryDetail(batch * BATCH_SIZE, BATCH_SIZE, {
          modes: ["salmon_run"],
        });
        await Promise.all(
          records.map((record) =>
            exec(
              "UPDATE result SET stats = ? WHERE id = ?",
              [JSON.stringify(countCoop(JSON.parse(record.detail))), record.id],
              false
            )
          )
        );
        if (records.length < BATCH_SIZE) {
          break;
        }
        batch += 1;
      }
      await exec("PRAGMA user_version=5", [], false);
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
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

export interface FilterProps {
  modes?: string[];
  rules?: string[];
  stages?: string[];
  weapons?: string[];
  inverted?: boolean;
}

export const isFilterEqual = (a?: FilterProps, b?: FilterProps) => {
  if (!a && !b) {
    return true;
  }
  if (!a || !b) {
    return false;
  }
  for (const group of ["modes", "rules", "stages", "weapons"]) {
    if ((a[group] ?? []).length !== (b[group] ?? []).length) {
      return false;
    }
    for (const item of a[group] ?? []) {
      if (!b[group]?.includes(item)) {
        return false;
      }
    }
  }
  return true;
};

const convertFilter = (filter?: FilterProps, from?: number) => {
  const filters: string[] = [];
  if (filter) {
    if ((filter.modes ?? []).length > 0) {
      filters.push(`(${(filter.modes ?? []).map((mode) => `mode = '${mode}'`).join(" OR ")})`);
    }
    if ((filter.rules ?? []).length > 0) {
      filters.push(`(${(filter.rules ?? []).map((rule) => `rule = '${rule}'`).join(" OR ")})`);
    }
    if ((filter.weapons ?? []).length > 0) {
      filters.push(
        `(${(filter.weapons ?? [])
          .map((weapon) => {
            const image = weaponList[weapon];
            if (image) {
              return `(weapon = '${weapon}') OR (instr(weapon, '${image}') > 0)`;
            }
            return `weapon = '${weapon}'`;
          })
          .join(" OR ")})`
      );
    }
    if ((filter.stages ?? []).length > 0) {
      filters.push(`(${(filter.stages ?? []).map((stage) => `stage = '${stage}'`).join(" OR ")})`);
    }
  }
  let condition = filters.map((filter) => `(${filter})`).join(" AND ");
  if (!!condition && filter?.inverted) {
    condition = `(NOT (${condition}))`;
  }
  if (from) {
    if (condition) {
      condition += `AND (time >= ${from})`;
    } else {
      condition += `time >= ${from}`;
    }
  }
  if (!condition) {
    return "";
  }
  return `WHERE ${condition}`;
};

export const queryDetail = async (offset: number, limit: number, filter?: FilterProps) => {
  let condition: string = "";
  if (filter) {
    condition = convertFilter(filter);
  }
  const sql = `SELECT id, mode, detail FROM result ${condition} ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;
  const record = await exec(sql, [], true);
  const result = record.rows.map((row) => ({
    id: row["id"],
    mode: row["mode"],
    detail: row["detail"],
  }));
  return result;
};
export const queryStats = async (filter?: FilterProps) => {
  let condition: string = "";
  if (filter) {
    condition = convertFilter(filter);
  }
  const sql = `SELECT id, mode, stats FROM result ${condition} ORDER BY time DESC`;
  const record = await exec(sql, [], true);
  const result = record.rows.map((row) => ({
    id: row["id"],
    mode: row["mode"],
    stats: row["stats"],
  }));
  return result;
};
export const queryLatestTime = async () => {
  const sql = `SELECT time FROM result ORDER BY time DESC LIMIT 1`;
  const record = await exec(sql, [], true);
  return record.rows[0]?.time;
};
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
    for (const w of weapon.split(",")) {
      if (w.length > 0) {
        weaponSet.add(weaponList.images[w] ?? w);
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
      let aid: number | undefined, bid: number | undefined;
      try {
        aid = decode64Index(a);
      } catch {
        /* empty */
      }
      try {
        bid = decode64Index(b);
      } catch {
        /* empty */
      }
      if (aid === undefined && bid === undefined) {
        return a.localeCompare(b);
      } else if (aid === undefined) {
        return 1;
      } else if (bid === undefined) {
        return -1;
      }
      return aid - bid;
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
  stage: string,
  stats: string
) => {
  await exec(
    "INSERT INTO result VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [id, time, mode, rule, weapon, players.join(","), detail, stage, stats],
    false
  );
};
export const addBattle = async (battle: VsHistoryDetailResult) => {
  return await add(
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
    battle.vsHistoryDetail!.vsStage.id,
    JSON.stringify(countBattle(battle))
  );
};
export const addCoop = async (coop: CoopHistoryDetailResult) => {
  return await add(
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
    coop.coopHistoryDetail!.coopStage.id,
    JSON.stringify(countCoop(coop))
  );
};
export const remove = async (id: string) => {
  await exec("DELETE FROM result WHERE id = ?", [id], false);
};
export const clear = async () => {
  await exec("DELETE FROM result", [], false);
  await exec("VACUUM result", [], false);
};
export const drop = async () => {
  await exec("PRAGMA user_version=0", [], false);
  await exec("DROP TABLE result", [], false);
};
