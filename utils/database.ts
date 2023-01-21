import * as SQLite from "expo-sqlite";
import { CoopHistoryDetail, VsHistoryDetail } from "../models/types";
import { getVsSelfPlayer } from "./ui";

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
        const records = await queryAll();
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

export const query = async (offset: number, limit: number, condition?: string) => {
  let sql: string;
  if (condition) {
    sql = `SELECT * FROM result WHERE ${condition} ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;
  } else {
    sql = `SELECT * FROM result ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`;
  }
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
export const count = async () => {
  const record = await exec(`SELECT COUNT(1) FROM result`, true);
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
export const addBattle = async (battle: VsHistoryDetail) => {
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
export const addCoop = async (coop: CoopHistoryDetail) => {
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
