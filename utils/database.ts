import * as SQLite from "expo-sqlite";

let db: SQLite.WebSQLDatabase | undefined = undefined;

export const open = async () => {
  db = SQLite.openDatabase("conch-bay.db");

  await exec(
    "CREATE TABLE IF NOT EXISTS result ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, rule TEXT NOT NULL, weapon TEXT NOT NULL, players TEXT NOT NULL, detail TEXT NOT NULL )",
    false
  );
  // const record = await exec(db, "PRAGMA user_version");
  // const version = record.rows[0]["user_version"] as number;

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

export const query = async (offset: number, limit: number) => {
  const record = await exec(
    `SELECT * FROM result ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`,
    true
  );
  return record.rows.map((row) => {
    return {
      id: row["id"],
      time: row["time"],
      mode: row["mode"],
      rule: row["rule"],
      weapon: row["weapon"],
      players: row["players"].split(","),
      detail: row["detail"],
    };
  });
};
export const queryAll = async () => {
  const record = await exec(`SELECT * FROM result ORDER BY time DESC`, true);
  return record.rows.map((row) => {
    return {
      id: row["id"],
      time: row["time"],
      mode: row["mode"],
      rule: row["rule"],
      weapon: row["weapon"],
      players: row["players"].split(","),
      detail: row["detail"],
    };
  });
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
  detail: string
) => {
  await exec(
    `INSERT INTO result VALUES ('${id}', ${time}, '${mode}', '${rule}', '${weapon}', '${players.join(
      ","
    )}', '${detail}')`,
    false
  );
};
export const clear = async () => {
  await exec("DELETE FROM result", false);
  await exec("VACUUM", false);
};
