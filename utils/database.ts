import * as SQLite from "expo-sqlite";
import { CoopHistoryDetail, VsHistoryDetail } from "../models/types";
import { decode64Index } from "./codec";
import { getVsSelfPlayer } from "./ui";

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
    false
  );

  // Upgrade database.
  const record = await exec("PRAGMA user_version", true);
  const version = record.rows[0]["user_version"] as number;
  switch (version) {
    case 0:
      {
        await exec('ALTER TABLE result ADD COLUMN stage TEXT NOT NULL DEFAULT ""', false);
        const records = await queryAll(false);
        await Promise.all(
          records.map((record) => {
            if (record.mode === "salmon_run") {
              return exec(
                `UPDATE result SET stage = '${
                  (JSON.parse(record.detail) as CoopHistoryDetail).coopHistoryDetail.coopStage.id
                }' WHERE id = '${record.id}'`,
                false
              );
            }
            return exec(
              `UPDATE result SET stage = '${
                (JSON.parse(record.detail) as VsHistoryDetail).vsHistoryDetail.vsStage.id
              }' WHERE id = '${record.id}'`,
              false
            );
          })
        );
        await exec("PRAGMA user_version=1", false);
      }
      break;
    case 1:
      break;
    default:
      throw `unexpected database version ${version}`;
  }

  return db;
};
export const close = () => {
  db!.closeAsync();
};
const exec = async (sql: string, readonly: boolean): Promise<SQLite.ResultSet> => {
  return await new Promise((resolve, reject) => {
    db!.exec([{ sql: sql, args: [] }], readonly, (err, res) => {
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

const convertFilter = (filter: FilterProps) => {
  const filters: string[] = [];
  if (filter.modes.length > 0) {
    filters.push(`(${filter.modes.map((mode) => `mode = '${mode}'`).join(" OR ")})`);
  }
  if (filter.rules.length > 0) {
    filters.push(`(${filter.rules.map((rule) => `rule = '${rule}'`).join(" OR ")})`);
  }
  if (filter.weapons.length > 0) {
    filters.push(`(${filter.weapons.map((weapon) => `weapon = '${weapon}'`).join(" OR ")})`);
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
  const condition = filters.map((filter) => `(${filter})`).join(" AND ");
  if (!condition) {
    return "";
  }
  return `WHERE ${condition}`;
};

export const query = async (offset: number, limit: number, filter?: FilterProps) => {
  let condition: string | undefined = undefined;
  if (filter) {
    condition = convertFilter(filter);
  }
  const sql = `SELECT * FROM result ${condition} ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;
  const record = await exec(sql, true);
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
  const record = await exec("SELECT * FROM result" + (order ? " ORDER BY time" : ""), true);
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
export const queryFilterOptions = async () => {
  const modeSql = `SELECT DISTINCT mode FROM result`;
  const ruleSql = `SELECT DISTINCT rule FROM result`;
  const stageSql = `SELECT DISTINCT stage FROM result`;
  const weaponSql = `SELECT DISTINCT weapon FROM result`;

  const [modeRecord, ruleRecord, stageRecord, weaponRecord] = await Promise.all([
    exec(modeSql, true),
    exec(ruleSql, true),
    exec(stageSql, true),
    exec(weaponSql, true),
  ]);
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
        }
        return b.localeCompare(a);
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
    weapons: weaponRecord.rows
      .map((row) => row["weapon"])
      .filter((weapon) => weapon !== "")
      .sort((a, b) => decode64Index(a) - decode64Index(b)),
  };
};
export const count = async (filter?: FilterProps) => {
  let condition: string | undefined = undefined;
  if (filter) {
    condition = convertFilter(filter);
  }
  const sql = `SELECT COUNT(1) FROM result ${condition}`;
  const record = await exec(sql, true);
  return record.rows[0]["COUNT(1)"] as number;
};
export const isExist = async (id: string) => {
  const record = await exec(`SELECT * FROM result WHERE id = '${id}'`, true);
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
    `INSERT INTO result VALUES ('${id}', ${time}, '${mode}', '${rule}', '${weapon}', '${players.join(
      ","
    )}', '${detail.replaceAll("'", "''")}', '${stage}')`,
    false
  );
};
export const addBattle = (battle: VsHistoryDetail) => {
  return add(
    battle.vsHistoryDetail.id,
    new Date(battle.vsHistoryDetail.playedTime).valueOf(),
    battle.vsHistoryDetail.vsMode.id,
    battle.vsHistoryDetail.vsRule.id,
    getVsSelfPlayer(battle).weapon.id,
    battle.vsHistoryDetail.myTeam.players
      .map((player) => player.id)
      .concat(
        battle.vsHistoryDetail.otherTeams
          .map((otherTeam) => otherTeam.players.map((player) => player.id))
          .flat()
      ),
    JSON.stringify(battle),
    battle.vsHistoryDetail.vsStage.id
  );
};
export const addCoop = (coop: CoopHistoryDetail) => {
  return add(
    coop.coopHistoryDetail.id,
    new Date(coop.coopHistoryDetail.playedTime).valueOf(),
    "salmon_run",
    coop.coopHistoryDetail.rule,
    "",
    coop.coopHistoryDetail.memberResults
      .map((memberResult) => memberResult.player.id)
      .concat(coop.coopHistoryDetail.myResult.player.id),
    JSON.stringify(coop),
    coop.coopHistoryDetail.coopStage.id
  );
};
export const clear = async () => {
  await exec("DELETE FROM result", false);
  await exec("VACUUM result", false);
};
