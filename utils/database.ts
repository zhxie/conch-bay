import * as SQLite from "@op-engineering/op-sqlite";
import * as FileSystem from "expo-file-system";
import { LRUCache } from "lru-cache";
import { CoopHistoryDetailResult, VsHistoryDetailResult } from "../models/types";
import weaponList from "../models/weapons.json";
import { decode64BattlePlayerId, decode64CoopPlayerId, decode64Index } from "./codec";
import { getBattleBrief, getCoopBrief } from "./stats";
import { getImageHash, getVsSelfPlayer } from "./ui";

let db: SQLite.OPSQLiteConnection | undefined = undefined;

const VERSION = 9;
const BATCH_SIZE = 4096;

export const open = async () => {
  if (db) {
    return undefined;
  }
  db = SQLite.open({
    name: "conch-bay.db",
    location: FileSystem.documentDirectory!.replace("file://", "") + "SQLite",
  });

  // Initialize database.
  await db.executeAsync(
    "CREATE TABLE IF NOT EXISTS result ( id TEXT PRIMARY KEY, time INT NOT NULL, mode TEXT NOT NULL, rule TEXT NOT NULL, weapon TEXT NOT NULL, players TEXT NOT NULL, detail TEXT NOT NULL )"
  );

  // Check database version.
  const record = await db.executeAsync("PRAGMA user_version");
  const version = record.rows!.item(0)["user_version"];
  if (version < VERSION) {
    return await count();
  }
  if (version > VERSION) {
    throw new Error(`unexpected database version ${version}`);
  }

  return undefined;
};
export const upgrade = async () => {
  const record = await db!.executeAsync("PRAGMA user_version");
  const version = record.rows!.item(0)["user_version"];
  let error: unknown = undefined;
  if (version < 1) {
    db!.transaction(async (tx) => {
      try {
        await tx.executeAsync('ALTER TABLE result ADD COLUMN stage TEXT NOT NULL DEFAULT ""');
        for await (const row of queryEach()) {
          if (row.mode === "salmon_run") {
            await tx.executeAsync("UPDATE result SET stage = ? WHERE id = ?", [
              (JSON.parse(row.detail) as CoopHistoryDetailResult).coopHistoryDetail!.coopStage.id,
              row.id,
            ]);
          } else {
            await tx.executeAsync("UPDATE result SET stage = ? WHERE id = ?", [
              (JSON.parse(row.detail) as VsHistoryDetailResult).vsHistoryDetail!.vsStage.id,
              row.id,
            ]);
          }
        }
        await tx.executeAsync("PRAGMA user_version=1");
      } catch (e) {
        error = e;
        throw e;
      }
    });
    if (error) {
      throw error;
    }
  }
  if (version < 2) {
    db!.transaction(async (tx) => {
      try {
        for await (const row of queryEach({ modes: ["salmon_run"] })) {
          const coop = JSON.parse(row["detail"]) as CoopHistoryDetailResult;
          await tx.executeAsync("UPDATE result SET weapon = ? WHERE id = ?", [
            coop
              .coopHistoryDetail!.myResult.weapons.map((weapon) => getImageHash(weapon.image.url))
              .join(","),
            row["id"],
          ]);
        }
        await tx.executeAsync("PRAGMA user_version=2");
      } catch (e) {
        error = e;
        throw e;
      }
    });
    if (error) {
      throw error;
    }
  }
  if (version < 3) {
    db!.transaction(async (tx) => {
      try {
        await tx.executeAsync('ALTER TABLE result ADD COLUMN stats TEXT NOT NULL DEFAULT ""');
        await tx.executeAsync("PRAGMA user_version=3");
      } catch (e) {
        error = e;
        throw e;
      }
    });
    if (error) {
      throw error;
    }
  }
  if (version < 8) {
    db!.transaction(async (tx) => {
      try {
        for await (const row of queryEach()) {
          let players: string[] = [];
          if (row["mode"] === "salmon_run") {
            const coop = JSON.parse(row["detail"]) as CoopHistoryDetailResult;
            let selfPlayer: string;
            try {
              selfPlayer = decode64CoopPlayerId(coop.coopHistoryDetail!.myResult.player.id);
            } catch {
              selfPlayer = "";
            }
            players = coop
              .coopHistoryDetail!.memberResults.map((memberResult) => {
                try {
                  return decode64CoopPlayerId(memberResult.player.id);
                } catch {
                  return "";
                }
              })
              .concat(selfPlayer)
              .filter((player) => player);
          } else {
            const battle = JSON.parse(row["detail"]) as VsHistoryDetailResult;
            players = battle
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
                    })
                  )
                  .flat()
              )
              .filter((player) => player);
          }
          await tx.executeAsync("UPDATE result SET players = ? WHERE id = ?", [
            players.join(","),
            row["id"],
          ]);
        }
        await tx.executeAsync("PRAGMA user_version=8");
      } catch (e) {
        error = e;
        throw e;
      }
    });
    if (error) {
      throw error;
    }
  }
  if (version < 9) {
    db!.transaction(async (tx) => {
      try {
        await tx.executeAsync('ALTER TABLE result ADD COLUMN stats TEXT NOT NULL DEFAULT ""');
        for await (const row of queryEach()) {
          let stats = "";
          if (row["mode"] === "salmon_run") {
            const coop = JSON.parse(row["detail"]) as CoopHistoryDetailResult;
            stats = JSON.stringify(getCoopBrief(coop));
          } else {
            const battle = JSON.parse(row["detail"]) as VsHistoryDetailResult;
            stats = JSON.stringify(getBattleBrief(battle));
          }
          await tx.executeAsync("UPDATE result SET stats = ? WHERE id = ?", [stats, row["id"]]);
        }
        await tx.executeAsync("PRAGMA user_version=3");
      } catch (e) {
        error = e;
        throw e;
      }
    });
    if (error) {
      throw error;
    }
  }
};
export const close = () => {
  db!.close();
};

export async function* executeAsyncEach(
  db: SQLite.OPSQLiteConnection,
  query: string,
  params?: any[]
) {
  let offset = 0;
  while (true) {
    const record = await db!.executeAsync(`${query} LIMIT ${BATCH_SIZE} OFFSET ${offset}`, params);
    for (const row of record.rows!._array) {
      yield row;
    }
    if (record.rows!.length < BATCH_SIZE) {
      break;
    }
    offset += BATCH_SIZE;
  }
}

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

const convertFilter = (filter?: FilterProps, from?: number) => {
  const filters: string[] = [];
  if (filter) {
    if ((filter.players ?? []).length > 0) {
      filters.push(
        `(${(filter.players ?? [])
          .map((player) => {
            return `instr(players, '${player}') > 0`;
          })
          .join(" OR ")})`
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

export async function* queryEach(filter?: FilterProps) {
  let condition: string = "";
  if (filter) {
    condition = convertFilter(filter);
  }
  for await (const row of executeAsyncEach(
    db!,
    `SELECT id, time, mode, detail FROM result ${condition} ORDER BY time DESC`
  )) {
    yield row as { id: string; time: number; mode: string; detail: string };
  }
}
export const queryBrief = async (filter?: FilterProps) => {
  let condition: string = "";
  if (filter) {
    condition = convertFilter(filter);
  }
  const record = await db!.executeAsync(
    `SELECT id, mode, brief FROM result ${condition} ORDER BY time DESC`
  );
  return record.rows!._array as { id: string; mode: string; brief: string }[];
};
const details = new LRUCache<string, { mode: string; detail: string }>({ max: 100 });
export const queryDetail = (id: string) => {
  if (details.has(id)) {
    return details.get(id);
  }
  const record = db!.execute("SELECT mode, detail FROM result WHERE id = ?", [id]);
  if (record.rows!.item(0)) {
    details.set(id, record.rows!.item(0));
  }
  return record.rows!.item(0) as { mode: string; detail: string };
};
export const queryLatestTime = async () => {
  const record = await db!.executeAsync("SELECT time FROM result ORDER BY time DESC LIMIT 1");
  if (record.rows!.length === 0) {
    return undefined;
  }
  return record.rows!.item(0)["time"] as number;
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

    const modeSql = "SELECT DISTINCT mode FROM result";
    const ruleSql = "SELECT DISTINCT rule FROM result";
    const stageSql = "SELECT DISTINCT stage FROM result";
    const weaponSql = "SELECT DISTINCT weapon FROM result";

    const [modeRecord, ruleRecord, stageRecord, weaponRecord] = await Promise.all([
      db!.executeAsync(modeSql),
      db!.executeAsync(ruleSql),
      db!.executeAsync(stageSql),
      db!.executeAsync(weaponSql),
    ]);

    for (const record of modeRecord.rows!._array) {
      if (record["mode"]) {
        filterOptions.modes.add(record["mode"]);
      }
    }
    for (const record of ruleRecord.rows!._array) {
      if (record["rule"]) {
        filterOptions.rules.add(record["rule"]);
      }
    }
    for (const record of stageRecord.rows!._array) {
      if (record["stage"]) {
        filterOptions.stages.add(record["stage"]);
      }
    }
    for (const row of weaponRecord.rows!._array) {
      for (const weapon of row["weapon"].split(",")) {
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
  const record = await db!.executeAsync(`SELECT COUNT(1) FROM result ${condition}`);
  return record.rows!.item(0)["COUNT(1)"] as number;
};
export const isExist = async (id: string) => {
  const record = await db!.executeAsync("SELECT id FROM result WHERE id = ?", [id]);
  return record.rows!.length > 0;
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
  brief: string
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
        filterOptions.weapons.add(w);
      }
    }
  }
  await db!.executeAsync("INSERT INTO result VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)", [
    id,
    time,
    mode,
    rule,
    weapon,
    players.join(","),
    detail,
    stage,
    brief,
  ]);
};
export const addBattle = async (battle: VsHistoryDetailResult) => {
  return await add(
    battle.vsHistoryDetail!.id,
    new Date(battle.vsHistoryDetail!.playedTime).valueOf(),
    battle.vsHistoryDetail!.vsMode.id,
    battle.vsHistoryDetail!.vsRule.id,
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
            })
          )
          .flat()
      )
      .filter((player) => player),
    JSON.stringify(battle),
    battle.vsHistoryDetail!.vsStage.id,
    JSON.stringify(getBattleBrief(battle))
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
    JSON.stringify(coop),
    coop.coopHistoryDetail!.coopStage.id,
    JSON.stringify(getCoopBrief(coop))
  );
};
export const remove = async (id: string) => {
  await db!.executeAsync("DELETE FROM result WHERE id = ?", [id]);
};
export const clear = async () => {
  await db!.executeAsync("DELETE FROM result");
  // await db!.executeAsync("VACUUM result");
};
export const drop = async () => {
  await db!.executeAsync("PRAGMA user_version=0");
  await db!.executeAsync("DROP TABLE result");
};
