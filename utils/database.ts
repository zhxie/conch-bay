import * as SQLite from "expo-sqlite";
import { LRUCache } from "lru-cache";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import weaponList from "../models/weapons.json";
import { decode64BattlePlayerId, decode64CoopPlayerId, decode64Index } from "./codec";
import { getBattleBrief, getCoopBrief } from "./stats";
import { getImageHash, getVsSelfPlayer } from "./ui";

let db: SQLite.SQLiteDatabase | undefined = undefined;

const VERSION = 13;

export const open = async () => {
  if (db) {
    return undefined;
  }
  db = await SQLite.openDatabaseAsync("conch-bay.db");

  // Initialize database.
  await db!.execAsync(
    "CREATE TABLE IF NOT EXISTS result ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, rule TEXT NOT NULL, weapon TEXT NOT NULL, players TEXT NOT NULL, detail TEXT NOT NULL )",
  );

  // Check database version.
  const record = (await db!.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))!;
  const version = record.user_version;
  if (version < VERSION) {
    return true;
  }
  if (version > VERSION) {
    throw new Error(`unexpected database version ${version}`);
  }

  return false;
};
export const upgrade = async () => {
  const record = (await db!.getFirstAsync<{ user_version: number }>("PRAGMA user_version"))!;
  const version = record.user_version;
  if (version < 1) {
    await beginTransaction();
    try {
      await db!.execAsync('ALTER TABLE result ADD COLUMN stage TEXT NOT NULL DEFAULT ""');
      for await (const row of db!.getEachAsync<{ id: string; mode: string; detail: string }>(
        `SELECT id, mode, detail FROM result`,
      )) {
        if (row.mode === "salmon_run") {
          await db!.runAsync(
            "UPDATE result SET stage = ? WHERE id = ?",
            (JSON.parse(row.detail) as CoopHistoryDetailResult).coopHistoryDetail!.coopStage.id,
            row.id,
          );
        } else {
          await db!.runAsync(
            "UPDATE result SET stage = ? WHERE id = ?",
            (JSON.parse(row.detail) as VsHistoryDetailResult).vsHistoryDetail!.vsStage.id,
            row.id,
          );
        }
      }
      await db!.execAsync("PRAGMA user_version=1");
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 2) {
    await beginTransaction();
    try {
      const statement = await db!.prepareAsync("UPDATE result SET weapon = ? WHERE id = ?");
      for await (const row of db!.getEachAsync<{
        id: string;
        time: number;
        mode: string;
        rule: string;
        players: string;
        detail: string;
        stage: string;
      }>('SELECT * FROM result WHERE mode = "salmon_run" AND weapon = ""')) {
        const detail = JSON.parse(row.detail) as CoopHistoryDetailResult;
        await statement.executeAsync(
          detail
            .coopHistoryDetail!.myResult.weapons.map((weapon) => getImageHash(weapon.image.url))
            .join(","),
          detail.coopHistoryDetail!.id,
        );
      }
      await statement.finalizeAsync();
      await db!.execAsync("PRAGMA user_version=2");
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 3) {
    await beginTransaction();
    try {
      await db!.execAsync('ALTER TABLE result ADD COLUMN stats TEXT NOT NULL DEFAULT ""');
      await db!.execAsync("PRAGMA user_version=3");
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 8) {
    await beginTransaction();
    try {
      const statement = await db!.prepareAsync("UPDATE result SET players = ? WHERE id = ?");
      for await (const row of db!.getEachAsync<{ id: string; mode: string; detail: string }>(
        `SELECT id, mode, detail FROM result`,
      )) {
        if (row.mode === "salmon_run") {
          const coop = JSON.parse(row.detail);
          let selfPlayer: string;
          try {
            selfPlayer = decode64CoopPlayerId(coop.coopHistoryDetail!.myResult.player.id);
          } catch {
            selfPlayer = "";
          }
          const players = coop
            .coopHistoryDetail!.memberResults.map((memberResult) => {
              try {
                return decode64CoopPlayerId(memberResult.player.id);
              } catch {
                return "";
              }
            })
            .concat(selfPlayer)
            .filter((player) => player);
          await statement.executeAsync(players.join(","), row.id);
        } else {
          const battle = JSON.parse(row.detail);
          const players = battle
            .vsHistoryDetail!.myTeam.players.map((player) => {
              try {
                return decode64BattlePlayerId(player.id);
              } catch {
                return "";
              }
            })
            .concat(
              battle
                .vsHistoryDetail!.otherTeams.map((otherTeam) =>
                  otherTeam.players.map((player) => {
                    try {
                      return decode64BattlePlayerId(player.id);
                    } catch {
                      return "";
                    }
                  }),
                )
                .flat(),
            )
            .filter((player) => player);
          await statement.executeAsync(players.join(","), row.id);
        }
      }
      await statement.finalizeAsync();
      await db!.execAsync("PRAGMA user_version=8");
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 9) {
    await beginTransaction();
    try {
      await db!.execAsync("ALTER TABLE result RENAME COLUMN stats TO brief");
      const statement = await db!.prepareAsync("UPDATE result SET brief = ? WHERE id = ?");
      for await (const row of db!.getEachAsync<{ id: string; mode: string; detail: string }>(
        `SELECT id, mode, detail FROM result`,
      )) {
        if (row.mode !== "salmon_run") {
          await statement.executeAsync(
            JSON.stringify(getBattleBrief(JSON.parse(row.detail))),
            row.id,
          );
        }
      }
      await statement.finalizeAsync();
      await db!.execAsync("PRAGMA user_version=9");
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
  }
  if (version < 10) {
    await beginTransaction();
    try {
      await db!.execAsync(
        "CREATE TABLE IF NOT EXISTS brief ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, rule TEXT NOT NULL, stage TEXT NOT NULL, weapon TEXT NOT NULL, players TEXT NOT NULL, brief TEXT NOT NULL )",
      );
      await db!.execAsync(
        "CREATE TABLE IF NOT EXISTS detail ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, detail TEXT NOT NULL )",
      );
      const briefStatement = await db!.prepareAsync(
        "INSERT INTO brief VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      );
      const detailStatement = await db!.prepareAsync("INSERT INTO detail VALUES (?, ?, ?, ?)");
      for await (const row of db!.getEachAsync<{
        id: string;
        time: number;
        mode: string;
        rule: string;
        weapon: string;
        players: string;
        detail: string;
        stage: string;
        brief: string;
      }>(`SELECT id, time, mode, rule, weapon, players, detail, stage, brief FROM result`)) {
        await briefStatement.executeAsync(
          row.id,
          row.time,
          row.mode,
          row.rule,
          row.stage,
          row.weapon,
          row.players,
          row.brief,
        );
        await detailStatement.executeAsync(row.id, row.time, row.mode, row.detail);
      }
      await briefStatement.finalizeAsync();
      await detailStatement.finalizeAsync();
      await db!.execAsync("DROP TABLE result");
      await db!.execAsync("PRAGMA user_version=10");
      await commit();
    } catch (e) {
      await rollback();
      throw e;
    }
    await db!.execAsync("VACUUM");
  }
  if (version < 13) {
    await beginTransaction();
    try {
      const statement = await db!.prepareAsync("UPDATE brief SET brief = ? WHERE id = ?");
      for await (const row of queryDetailEach()) {
        if (row.mode === "salmon_run") {
          await statement.executeAsync(
            JSON.stringify(getCoopBrief(JSON.parse(row.detail))),
            row.id,
          );
        }
      }
      await statement.finalizeAsync();
      await db!.execAsync("PRAGMA user_version=13");
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
const beginTransaction = async () => {
  await db!.execAsync("begin transaction");
};
const commit = async () => {
  await db!.execAsync("commit");
};
const rollback = async () => {
  await db!.execAsync("rollback");
};

export interface FilterProps {
  players?: string[];
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
  for (const group of ["players", "modes", "rules", "stages", "weapons"]) {
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

export const isFilterInclude = (parent?: FilterProps, child?: FilterProps) => {
  if (!parent && !child) {
    return true;
  }
  if (!parent) {
    return false;
  }
  if (!child) {
    return true;
  }
  for (const group of ["players", "modes", "rules", "stages", "weapons"]) {
    for (const item of child[group] ?? []) {
      if (!parent[group]?.includes(item)) {
        return false;
      }
    }
  }
  return true;
};

const convertFilter = (filter?: FilterProps, from?: number) => {
  const filters: string[] = [];
  if (filter) {
    if ((filter.players ?? []).length > 0) {
      filters.push(
        `(${(filter.players ?? [])
          .map((player) => {
            return `instr(players, '${player}') > 0`;
          })
          .join(" OR ")})`,
      );
    }
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
            const image = weaponList.weapons[weapon];
            if (image) {
              return `(weapon = '${weapon}') OR (instr(weapon, '${image}') > 0)`;
            }
            return `weapon = '${weapon}'`;
          })
          .join(" OR ")})`,
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

export const queryBrief = async (filter?: FilterProps) => {
  let condition: string = "";
  if (filter) {
    condition = convertFilter(filter);
  }
  const record = await db!.getAllAsync<{ id: string; mode: string; brief: string }>(
    `SELECT id, mode, brief FROM brief ${condition} ORDER BY time DESC`,
  );
  return record;
};
const details = new LRUCache<string, { mode: string; detail: string }>({ max: 100 });
export const queryDetail = (id: string) => {
  if (details.has(id)) {
    return details.get(id);
  }
  const record = db!.getFirstSync<{ mode: string; detail: string }>(
    "SELECT mode, detail FROM detail WHERE id = ?",
    id,
  );
  if (record) {
    details.set(id, record);
  }
  return record;
};
export const queryDetailEach = () => {
  return db!.getEachAsync<{ id: string; time: number; mode: string; detail: string }>(
    `SELECT id, time, mode, detail FROM detail`,
  );
};
export const queryLatestTime = async () => {
  const record = await db!.getFirstAsync<{ time: number }>(
    "SELECT time FROM brief ORDER BY time DESC",
  );
  return record?.time;
};
let filterOptions:
  | {
      modes: Set<string>;
      rules: Set<string>;
      stages: Set<string>;
      weapons: Set<string>;
    }
  | undefined = undefined;
export const queryFilterOptions = async () => {
  if (!filterOptions) {
    filterOptions = {
      modes: new Set<string>(),
      rules: new Set<string>(),
      stages: new Set<string>(),
      weapons: new Set<string>(),
    };

    const modeSql = "SELECT DISTINCT mode FROM brief";
    const ruleSql = "SELECT DISTINCT rule FROM brief";
    const stageSql = "SELECT DISTINCT stage FROM brief";
    const weaponSql = "SELECT DISTINCT weapon FROM brief";

    const [modeRecord, ruleRecord, stageRecord, weaponRecord] = await Promise.all([
      db!.getAllAsync<{ mode: string }>(modeSql),
      db!.getAllAsync<{ rule: string }>(ruleSql),
      db!.getAllAsync<{ stage: string }>(stageSql),
      db!.getAllAsync<{ weapon: string }>(weaponSql),
    ]);

    for (const record of modeRecord) {
      if (record.mode) {
        filterOptions.modes.add(record.mode);
      }
    }
    for (const record of ruleRecord) {
      if (record.rule) {
        filterOptions.rules.add(record.rule);
      }
    }
    for (const record of stageRecord) {
      if (record.stage) {
        filterOptions.stages.add(record.stage);
      }
    }
    for (const row of weaponRecord) {
      for (const weapon of row.weapon.split(",")) {
        if (weapon) {
          filterOptions.weapons.add(weaponList.images[weapon] ?? weapon);
        }
      }
    }
  }

  return {
    modes: Array.from(filterOptions.modes.values()).sort((a, b) => {
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
    rules: Array.from(filterOptions.rules.values()).sort((a, b) => {
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
    stages: Array.from(filterOptions.stages.values()).sort((a, b) => {
      // Move coop stages behind battle stages.
      if (a.startsWith("V") && b.startsWith("Q")) {
        return -1;
      }
      if (a.startsWith("Q") && b.startsWith("V")) {
        return 1;
      }
      return decode64Index(a) - decode64Index(b);
    }),
    weapons: Array.from(filterOptions.weapons.values()).sort((a, b) => {
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
  const record = (await db!.getFirstAsync<{ "COUNT(1)": number }>(
    `SELECT COUNT(1) FROM brief ${condition}`,
  ))!;
  return record["COUNT(1)"];
};
export const isExist = async (id: string) => {
  const record = await db!.getFirstAsync<{ id: string }>("SELECT id FROM brief WHERE id = ?", id);
  return record !== null;
};
export const add = async (
  id: string,
  time: number,
  mode: string,
  rule: string,
  stage: string,
  weapon: string,
  players: string[],
  brief: string,
  detail: string,
) => {
  if (filterOptions) {
    if (mode) {
      filterOptions.modes.add(mode);
    }
    if (rule) {
      filterOptions.rules.add(rule);
    }
    if (stage) {
      filterOptions.stages.add(stage);
    }
    for (const w of weapon.split(",")) {
      if (w) {
        filterOptions.weapons.add(weaponList.images[w] ?? w);
      }
    }
  }
  await db!.runAsync(
    "INSERT INTO brief VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
    id,
    time,
    mode,
    rule,
    stage,
    weapon,
    players.join(","),
    brief,
  );
  await db!.runAsync("INSERT INTO detail VALUES (?, ?, ?, ?)", id, time, mode, detail);
};
export const addBattle = async (battle: VsHistoryDetailResult) => {
  return await add(
    battle.vsHistoryDetail!.id,
    new Date(battle.vsHistoryDetail!.playedTime).valueOf(),
    battle.vsHistoryDetail!.vsMode.id,
    battle.vsHistoryDetail!.vsRule.id,
    battle.vsHistoryDetail!.vsStage.id,
    getVsSelfPlayer(battle).weapon.id,
    battle
      .vsHistoryDetail!.myTeam.players.map((player) => {
        try {
          return decode64BattlePlayerId(player.id);
        } catch {
          return "";
        }
      })
      .concat(
        battle
          .vsHistoryDetail!.otherTeams.map((otherTeam) =>
            otherTeam.players.map((player) => {
              try {
                return decode64BattlePlayerId(player.id);
              } catch {
                return "";
              }
            }),
          )
          .flat(),
      )
      .filter((player) => player),
    JSON.stringify(getBattleBrief(battle)),
    JSON.stringify(battle),
  );
};
export const addCoop = async (coop: CoopHistoryDetailResult) => {
  let selfPlayer: string;
  try {
    selfPlayer = decode64CoopPlayerId(coop.coopHistoryDetail!.myResult.player.id);
  } catch {
    selfPlayer = "";
  }
  return await add(
    coop.coopHistoryDetail!.id,
    new Date(coop.coopHistoryDetail!.playedTime).valueOf(),
    "salmon_run",
    coop.coopHistoryDetail!.rule,
    coop.coopHistoryDetail!.coopStage.id,
    coop
      .coopHistoryDetail!.myResult.weapons.map((weapon) => getImageHash(weapon.image.url))
      .join(","),
    coop
      .coopHistoryDetail!.memberResults.map((memberResult) => {
        try {
          return decode64CoopPlayerId(memberResult.player.id);
        } catch {
          return "";
        }
      })
      .concat(selfPlayer)
      .filter((player) => player),
    JSON.stringify(getCoopBrief(coop)),
    JSON.stringify(coop),
  );
};
export const remove = async (id: string) => {
  await db!.runAsync("DELETE FROM brief WHERE id = ?", id);
  await db!.runAsync("DELETE FROM detail WHERE id = ?", id);
};
export const clear = async () => {
  await db!.execAsync("DELETE FROM brief");
  await db!.execAsync("DELETE FROM detail");
  await db!.execAsync("VACUUM");
};
export const drop = async () => {
  await db!.execAsync("PRAGMA user_version=0");
  await db!.execAsync("DROP TABLE brief");
  await db!.execAsync("DROP TABLE detail");
};
