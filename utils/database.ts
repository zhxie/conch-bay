import * as SQLite from "expo-sqlite";

export const open = async () => {
  const db = SQLite.openDatabase("conch-bay.db");

  await exec(
    db,
    "CREATE TABLE IF NOT EXISTS result ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, rule TEXT NOT NULL, overview TEXT NOT NULL, detail TEXT NOT NULL )",
    false
  );
  // const record = await exec(db, "PRAGMA user_version");
  // const version = record.rows[0]["user_version"] as number;

  return db;
};
export const close = async (connection: SQLite.WebSQLDatabase) => {
  connection.closeAsync();
};
const exec = async (
  connection: SQLite.WebSQLDatabase,
  sql: string,
  readonly: boolean
): Promise<SQLite.ResultSet> => {
  return await new Promise((resolve, reject) => {
    connection.exec([{ sql: sql, args: [] }], readonly, (err, res) => {
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

export const query = async (connection: SQLite.WebSQLDatabase, offset: number, limit: number) => {
  const record = await exec(
    connection,
    `SELECT * FROM result ORDER BY time DESC LIMIT ${limit} OFFSET ${offset}`,
    true
  );
  return record.rows.map((row) => {
    return {
      id: row["id"],
      time: row["time"],
      mode: row["mode"],
      rule: row["rule"],
      overview: row["overview"],
      detail: row["detail"],
    };
  });
};
export const isExist = async (connection: SQLite.WebSQLDatabase, id: string) => {
  const record = await exec(connection, `SELECT * FROM result WHERE id = '${id}'`, true);
  return record.rows.length > 0;
};
export const add = async (
  connection: SQLite.WebSQLDatabase,
  id: string,
  time: number,
  mode: string,
  rule: string,
  overview: string,
  detail: string
) => {
  await exec(
    connection,
    `INSERT INTO result VALUES ('${id}', ${time}, '${mode}', '${rule}', '${overview}', '${detail}')`,
    false
  );
};
export const clear = async (connection: SQLite.WebSQLDatabase) => {
  await exec(connection, "DELETE FROM result", false);
};
