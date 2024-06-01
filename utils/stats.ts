import coopSpecialWeaponList from "../models/coopSpecialWeapons.json";
import {
  CoopHistoryDetailResult,
  CoopMemberResult,
  CoopRule,
  DragonMatchType,
  Judgement,
  VsHistoryDetailResult,
  VsPlayer,
} from "../models/types";
import weaponList from "../models/weapons.json";
import { decode64Index } from "./codec";
import { getImageHash, getVsPower } from "./ui";

interface BattlePlayerBrief {
  self: boolean;
  weapon: string;
  subWeapon: string;
  specialWeapon: string;
  turf: number;
  kill?: number;
  assist?: number;
  death?: number;
  special?: number;
  ultraSignal?: number;
}
interface BattlePlayerStats {
  turf: number;
  kill: number;
  assist: number;
  death: number;
  special: number;
}
export interface BattleBrief {
  id: string;
  result: Judgement;
  time: number;
  duration: number;
  mode: string;
  rule: string;
  challenge?: string;
  stage: string;
  power?: number;
  dragon?: DragonMatchType;
  myTeam: BattlePlayerBrief[];
  otherTeams: BattlePlayerBrief[][];
}
export interface BattleStats {
  count: number;
  win: number;
  lose: number;
  exempt: number;
  power: {
    count: number;
    total: number;
    max: number;
  };
  duration: number;
  self: BattlePlayerStats;
  teamMember: number;
  team: BattlePlayerStats;
  allMember: number;
  all: BattlePlayerStats;
  stages: {
    id: string;
    rules: {
      id: string;
      count: number;
      win: number;
    }[];
  }[];
  weapons: {
    id: string;
    rules: {
      id: string;
      count: number;
      win: number;
    }[];
  }[];
}

const getBattlePlayerBrief = (player: VsPlayer): BattlePlayerBrief => {
  return {
    self: player.isMyself,
    weapon: player.weapon.id,
    subWeapon: player.weapon.subWeapon.id,
    specialWeapon: player.weapon.specialWeapon.id,
    turf: player.paint,
    kill: player.result?.kill,
    assist: player.result?.assist,
    death: player.result?.death,
    special: player.result?.special,
    ultraSignal: player.result?.noroshiTry === null ? undefined : player.result?.noroshiTry,
  };
};
const addBattlePlayerStats = (
  stats: BattlePlayerStats,
  player: BattlePlayerBrief
): BattlePlayerStats => {
  return {
    turf: stats.turf + player.turf,
    kill: stats.kill + (player.kill ?? 0),
    assist: stats.assist + (player.assist ?? 0),
    death: stats.death + (player.death ?? 0),
    special: stats.special + (player.special ?? 0),
  };
};
export const getBattleBrief = (battle: VsHistoryDetailResult): BattleBrief => {
  const power = getVsPower(battle);

  return {
    id: battle.vsHistoryDetail!.id,
    result: battle.vsHistoryDetail!.judgement as Judgement,
    time: new Date(battle.vsHistoryDetail!.playedTime).valueOf(),
    duration: battle.vsHistoryDetail!.duration,
    mode: battle.vsHistoryDetail!.vsMode.id,
    rule: battle.vsHistoryDetail!.vsRule.id,
    challenge: battle.vsHistoryDetail!.leagueMatch?.leagueMatchEvent?.id,
    stage: battle.vsHistoryDetail!.vsStage.id,
    power: power === null ? undefined : power,
    dragon: battle.vsHistoryDetail!.festMatch?.dragonMatchType as DragonMatchType | undefined,
    myTeam: battle.vsHistoryDetail!.myTeam.players.map((player) => getBattlePlayerBrief(player)),
    otherTeams: battle.vsHistoryDetail!.otherTeams.map((team) =>
      team.players.map((player) => getBattlePlayerBrief(player))
    ),
  };
};
export const getSelfBattlePlayerBrief = (battle: BattleBrief) => {
  return battle.myTeam.find((player) => player.self)!;
};
export const getBattleStats = (...battles: BattleBrief[]): BattleStats => {
  let count = 0,
    win = 0,
    lose = 0,
    exempt = 0,
    powerCount = 0,
    powerTotal = 0,
    powerMax = 0,
    duration = 0,
    teamMember = 0,
    allMember = 0;
  let self = {
      turf: 0,
      kill: 0,
      assist: 0,
      death: 0,
      special: 0,
    },
    team = {
      turf: 0,
      kill: 0,
      assist: 0,
      death: 0,
      special: 0,
    },
    all = {
      turf: 0,
      kill: 0,
      assist: 0,
      death: 0,
      special: 0,
    };
  const stageMap = new Map<string, Map<string, { count: number; win: number }>>(),
    weaponMap = new Map<string, Map<string, { count: number; win: number }>>();
  for (const battle of battles) {
    count += 1;
    switch (battle.result) {
      case Judgement.WIN:
        win += 1;
        break;
      case Judgement.LOSE:
      case Judgement.DEEMED_LOSE:
      case Judgement.EXEMPTED_LOSE:
        lose += 1;
        break;
      case Judgement.DRAW:
        break;
    }
    let skip = false;
    if (
      (battle.result === Judgement.DEEMED_LOSE && battle.duration === 0) ||
      battle.result === Judgement.DRAW
    ) {
      skip = true;
      exempt += 1;
    }
    if (battle.power) {
      powerCount += 1;
      powerTotal += battle.power;
      powerMax = Math.max(powerMax, battle.power);
    }
    // Disconnected and draw should be skipped.
    if (skip) {
      continue;
    }
    duration += battle.duration;
    const selfPlayerBrief = getSelfBattlePlayerBrief(battle);
    self = addBattlePlayerStats(self, selfPlayerBrief);
    teamMember += battle.myTeam.length;
    team = battle.myTeam.reduce((prev, current) => addBattlePlayerStats(prev, current), team);
    allMember +=
      battle.myTeam.length + battle.otherTeams.reduce((prev, current) => prev + current.length, 0);
    all = battle.otherTeams
      .flat()
      .reduce((prev, current) => addBattlePlayerStats(prev, current), all);
    if (!stageMap.has(battle.stage)) {
      stageMap.set(battle.stage, new Map());
    }
    if (!stageMap.get(battle.stage)!.has(battle.rule)) {
      stageMap.get(battle.stage)!.set(battle.rule, { count: 0, win: 0 });
    }
    const stage = stageMap.get(battle.stage)!.get(battle.rule)!;
    stage.count += 1;
    stage.win += battle.result === Judgement.WIN ? 1 : 0;
    if (!weaponMap.has(selfPlayerBrief.weapon)) {
      weaponMap.set(selfPlayerBrief.weapon, new Map());
    }
    if (!weaponMap.get(selfPlayerBrief.weapon)!.has(battle.rule)) {
      weaponMap.get(selfPlayerBrief.weapon)!.set(battle.rule, { count: 0, win: 0 });
    }
    const weapon = weaponMap.get(selfPlayerBrief.weapon)!.get(battle.rule)!;
    weapon.count += 1;
    weapon.win += battle.result === Judgement.WIN ? 1 : 0;
  }
  const stages = Array.from(stageMap, (stage) => {
    const rules = Array.from(stage[1], (rule) => ({
      id: rule[0],
      count: rule[1].count,
      win: rule[1].win,
    }));
    rules.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
    return {
      id: stage[0],
      rules,
    };
  });
  stages.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
  const weapons = Array.from(weaponMap, (weapon) => {
    const rules = Array.from(weapon[1], (rule) => ({
      id: rule[0],
      count: rule[1].count,
      win: rule[1].win,
    }));
    rules.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
    return {
      id: weapon[0],
      rules,
    };
  });
  weapons.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));

  return {
    count,
    win,
    lose,
    exempt,
    power: { count: powerCount, total: powerTotal, max: powerMax },
    duration,
    self,
    teamMember,
    team,
    allMember,
    all,
    stages,
    weapons,
  };
};

interface CoopPlayerBrief {
  weapons: string[];
  specialWeapon?: string;
  defeat: number;
  golden: number;
  assist: number;
  power: number;
  rescue: number;
  rescued: number;
}
interface CoopPlayerStats {
  defeat: number;
  golden: number;
  assist: number;
  power: number;
  rescue: number;
  rescued: number;
}
interface BossSalmonidStats {
  id: string;
  appear: number;
  defeat: number;
  defeatTeam: number;
}
interface WaveStats {
  id: string;
  levels: {
    id: number;
    appear: number;
    clear: number;
  }[];
}
interface Scales {
  gold: number;
  silver: number;
  bronze: number;
}
export interface CoopBrief {
  id: string;
  result: number;
  time: number;
  private: boolean;
  rule: CoopRule;
  stage: string;
  suppliedWeapons: string[];
  hazardLevel: number;
  grade?: { id: string; point: number };
  players: CoopPlayerBrief[];
  waves: WaveStats[];
  bosses: BossSalmonidStats[];
  king?: {
    id: string;
    defeat: boolean;
  };
  kings: {
    id: string;
    defeat: boolean;
  }[];
  scales?: Scales;
}
export interface CoopStats {
  count: number;
  exempt: number;
  clear: number;
  wave: number;
  hazardLevel: number;
  self: CoopPlayerStats;
  member: number;
  team: CoopPlayerStats;
  bosses: BossSalmonidStats[];
  kings: {
    id: string;
    appear: number;
    defeat: number;
  }[];
  scales: Scales;
  waves: WaveStats[];
  stages: {
    id: string;
    count: number;
  }[];
  weapons: {
    id: string;
    count: number;
  }[];
  specialWeapons: {
    id: string;
    count: number;
  }[];
}

const getCoopPlayerBrief = (memberResult: CoopMemberResult): CoopPlayerBrief => {
  return {
    weapons: memberResult.weapons.map((weapon) => getImageHash(weapon.image.url)),
    specialWeapon:
      memberResult.specialWeapon === null
        ? undefined
        : getImageHash(memberResult.specialWeapon.image.url),
    defeat: memberResult.defeatEnemyCount,
    golden: memberResult.goldenDeliverCount,
    assist: memberResult.goldenAssistCount,
    power: memberResult.deliverCount,
    rescue: memberResult.rescueCount,
    rescued: memberResult.rescuedCount,
  };
};
const addCoopPlayerStats = (stats: CoopPlayerStats, player: CoopPlayerBrief): CoopPlayerStats => {
  return {
    defeat: stats.defeat + player.defeat,
    golden: stats.golden + player.golden,
    assist: stats.assist + player.assist,
    power: stats.power + player.power,
    rescue: stats.rescue + player.rescue,
    rescued: stats.rescued + player.rescued,
  };
};
export const getCoopBrief = (coop: CoopHistoryDetailResult): CoopBrief => {
  const waveMap = new Map<string, Map<number, { appear: number; clear: number }>>();
  for (let i = 0; i < coop.coopHistoryDetail!.waveResults.length; i++) {
    const waveResult = coop.coopHistoryDetail!.waveResults[i];
    switch (coop.coopHistoryDetail!.rule as CoopRule) {
      case CoopRule.REGULAR:
      case CoopRule.BIG_RUN:
        // HACK: hardcoded the 4th wave is a king salmonid wave.
        if (i >= 3 && coop.coopHistoryDetail!.bossResult) {
          if (!waveMap.has(coop.coopHistoryDetail!.bossResult.boss.id)) {
            waveMap.set(coop.coopHistoryDetail!.bossResult.boss.id, new Map());
          }
          if (
            !waveMap.get(coop.coopHistoryDetail!.bossResult.boss.id)!.has(waveResult.waterLevel)
          ) {
            waveMap
              .get(coop.coopHistoryDetail!.bossResult.boss.id)!
              .set(waveResult.waterLevel, { appear: 0, clear: 0 });
          }
          waveMap
            .get(coop.coopHistoryDetail!.bossResult.boss.id)!
            .get(waveResult.waterLevel)!.appear += 1;
          if (coop.coopHistoryDetail!.bossResult.hasDefeatBoss) {
            waveMap
              .get(coop.coopHistoryDetail!.bossResult.boss.id)!
              .get(waveResult.waterLevel)!.clear += 1;
          }
          continue;
        }
        break;
      case CoopRule.TEAM_CONTEST:
        break;
    }
    if (!waveMap.has(coop.coopHistoryDetail!.waveResults[i].eventWave?.id ?? "-")) {
      waveMap.set(coop.coopHistoryDetail!.waveResults[i].eventWave?.id ?? "-", new Map());
    }
    if (
      !waveMap
        .get(coop.coopHistoryDetail!.waveResults[i].eventWave?.id ?? "-")!
        .has(waveResult.waterLevel)
    ) {
      waveMap
        .get(coop.coopHistoryDetail!.waveResults[i].eventWave?.id ?? "-")!
        .set(waveResult.waterLevel, { appear: 0, clear: 0 });
    }
    waveMap
      .get(coop.coopHistoryDetail!.waveResults[i].eventWave?.id ?? "-")!
      .get(waveResult.waterLevel)!.appear += 1;
    if (coop.coopHistoryDetail!.resultWave === 0 || coop.coopHistoryDetail!.resultWave > i + 1) {
      waveMap
        .get(coop.coopHistoryDetail!.waveResults[i].eventWave?.id ?? "-")!
        .get(waveResult.waterLevel)!.clear += 1;
    }
  }
  const bossMap = new Map<string, { appear: number; defeat: number; defeatTeam: number }>();
  for (const enemyResult of coop.coopHistoryDetail!.enemyResults) {
    if (!bossMap.has(enemyResult.enemy.id)) {
      bossMap.set(enemyResult.enemy.id, { appear: 0, defeat: 0, defeatTeam: 0 });
    }
    const boss = bossMap.get(enemyResult.enemy.id)!;
    boss.appear += enemyResult.popCount;
    boss.defeat += enemyResult.defeatCount;
    boss.defeatTeam += enemyResult.teamDefeatCount;
  }
  const waves = Array.from(waveMap, (wave) => {
    const levels = Array.from(wave[1], (level) => ({
      id: level[0],
      appear: level[1].appear,
      clear: level[1].clear,
    }));
    levels.sort((a, b) => a.id - b.id);
    return {
      id: wave[0],
      levels,
    };
  });
  waves.sort((a, b) => {
    if (a.id === "-") {
      return -1;
    }
    if (b.id === "-") {
      return 1;
    }
    // Move king salmonids behind events.
    if (a.id.startsWith("Q29vcEVu") && !b.id.startsWith("Q29vcEVu")) {
      return 1;
    }
    if (!a.id.startsWith("Q29vcEVu") && b.id.startsWith("Q29vcEVu")) {
      return -1;
    }
    return decode64Index(a.id) - decode64Index(b.id);
  });
  const bosses = Array.from(bossMap, (boss) => ({
    id: boss[0],
    appear: boss[1].appear,
    defeat: boss[1].defeat,
    defeatTeam: boss[1].defeatTeam,
  }));
  bosses.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));

  return {
    id: coop.coopHistoryDetail!.id,
    result: coop.coopHistoryDetail!.resultWave,
    time: new Date(coop.coopHistoryDetail!.playedTime).valueOf(),
    private: coop.coopHistoryDetail!.jobPoint === null,
    rule: coop.coopHistoryDetail!.rule as CoopRule,
    stage: coop.coopHistoryDetail!.coopStage.id,
    suppliedWeapons: coop.coopHistoryDetail!.weapons.map((weapon) =>
      getImageHash(weapon.image.url)
    ),
    hazardLevel: coop.coopHistoryDetail!.dangerRate,
    grade: coop.coopHistoryDetail!.afterGrade
      ? {
          id: coop.coopHistoryDetail!.afterGrade.id,
          point: coop.coopHistoryDetail!.afterGradePoint!,
        }
      : undefined,
    players: [getCoopPlayerBrief(coop.coopHistoryDetail!.myResult)].concat(
      ...coop.coopHistoryDetail!.memberResults.map((memberResult) =>
        getCoopPlayerBrief(memberResult)
      )
    ),
    waves,
    bosses,
    king: coop.coopHistoryDetail!.bossResult
      ? {
          id: coop.coopHistoryDetail!.bossResult.boss.id,
          defeat: coop.coopHistoryDetail!.bossResult.hasDefeatBoss,
        }
      : undefined,
    kings: coop.coopHistoryDetail!.bossResult
      ? [
          {
            id: coop.coopHistoryDetail!.bossResult.boss.id,
            defeat: coop.coopHistoryDetail!.bossResult.hasDefeatBoss,
          },
        ]
      : coop.coopHistoryDetail!["bossResults"]
      ? coop
          .coopHistoryDetail!["bossResults"].map((bossResult) => ({
            id: bossResult.boss.id,
            defeat: bossResult.hasDefeatBoss,
          }))
          .concat({
            id: coop.coopHistoryDetail!.bossResult!.boss.id,
            defeat: coop.coopHistoryDetail!.bossResult!.hasDefeatBoss,
          })
      : [],
    scales: coop.coopHistoryDetail!.scale
      ? {
          gold: coop.coopHistoryDetail!.scale!.gold,
          silver: coop.coopHistoryDetail!.scale!.silver,
          bronze: coop.coopHistoryDetail!.scale!.bronze,
        }
      : undefined,
  };
};
export const getCoopStats = (...coops: CoopBrief[]): CoopStats => {
  let count = 0,
    exempt = 0,
    clear = 0,
    wave = 0,
    hazardLevel = 0,
    member = 0,
    gold = 0,
    silver = 0,
    bronze = 0;
  let self = {
      defeat: 0,
      golden: 0,
      assist: 0,
      power: 0,
      rescue: 0,
      rescued: 0,
    },
    team = {
      defeat: 0,
      golden: 0,
      assist: 0,
      power: 0,
      rescue: 0,
      rescued: 0,
    };
  const bossMap = new Map<string, { appear: number; defeat: number; defeatTeam: number }>(),
    kingMap = new Map<string, { appear: number; defeat: number }>(),
    waveMap = new Map<string, Map<number, { appear: number; clear: number }>>(),
    stageMap = new Map<string, number>(),
    weaponMap = new Map<string, number>(),
    specialWeaponMap = new Map<string, number>();
  for (const coop of coops) {
    count += 1;
    const skip = coop.result < 0;
    exempt += skip ? 1 : 0;
    // Disconnected should be skipped.
    if (skip) {
      continue;
    }
    clear += coop.result === 0 ? 1 : 0;
    if (coop.result === 0) {
      // The maximum wave cleared is 3 in SplatNet, but we will fix it and have 5 in Eggstra Works.
      switch (coop.rule) {
        case CoopRule.REGULAR:
        case CoopRule.BIG_RUN:
          wave += 3;
          break;
        case CoopRule.TEAM_CONTEST:
          wave += 5;
          break;
      }
    } else {
      wave += coop.result - 1;
    }
    hazardLevel += coop.hazardLevel;
    self = addCoopPlayerStats(self, coop.players[0]);
    member += coop.players.length;
    team = coop.players.reduce((prev, current) => addCoopPlayerStats(prev, current), team);
    for (const boss of coop.bosses) {
      if (!bossMap.has(boss.id)) {
        bossMap.set(boss.id, { appear: 0, defeat: 0, defeatTeam: 0 });
      }
      const currentBoss = bossMap.get(boss.id)!;
      currentBoss.appear += boss.appear;
      currentBoss.defeat += boss.defeat;
      currentBoss.defeatTeam += boss.defeatTeam;
    }
    for (const king of coop.kings) {
      if (!kingMap.has(king.id)) {
        kingMap.set(king.id, { appear: 0, defeat: 0 });
      }
      const currentKing = kingMap.get(king.id)!;
      currentKing.appear += 1;
      currentKing.defeat += king.defeat ? 1 : 0;
    }
    gold += coop.scales?.gold ?? 0;
    silver += coop.scales?.silver ?? 0;
    bronze += coop.scales?.bronze ?? 0;
    for (const wave of coop.waves) {
      if (!waveMap.has(wave.id)) {
        waveMap.set(wave.id, new Map());
      }
      const currentWave = waveMap.get(wave.id)!;
      for (const level of wave.levels) {
        if (!currentWave.has(level.id)) {
          currentWave.set(level.id, { appear: 0, clear: 0 });
        }
        const currentLevel = currentWave.get(level.id)!;
        currentLevel.appear += level.appear;
        currentLevel.clear += level.clear;
      }
    }
    if (!stageMap.has(coop.stage)) {
      stageMap.set(coop.stage, 0);
    }
    stageMap.set(coop.stage, stageMap.get(coop.stage)! + 1);
    for (const weapon of coop.players[0].weapons) {
      if (!weaponMap.has(weapon)) {
        weaponMap.set(weapon, 0);
      }
      weaponMap.set(weapon, weaponMap.get(weapon)! + 1);
    }
    if (coop.players[0].specialWeapon) {
      if (!specialWeaponMap.has(coop.players[0].specialWeapon)) {
        specialWeaponMap.set(coop.players[0].specialWeapon, 0);
      }
      specialWeaponMap.set(
        coop.players[0].specialWeapon,
        specialWeaponMap.get(coop.players[0].specialWeapon)! + 1
      );
    }
  }
  const kings = Array.from(kingMap, (king) => ({
    id: king[0],
    appear: king[1].appear,
    defeat: king[1].defeat,
  }));
  kings.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
  const bosses = Array.from(bossMap, (boss) => ({
    id: boss[0],
    appear: boss[1].appear,
    defeat: boss[1].defeat,
    defeatTeam: boss[1].defeatTeam,
  }));
  bosses.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
  const stages = Array.from(stageMap, (stage) => ({
    id: stage[0],
    count: stage[1],
  }));
  const waves = Array.from(waveMap, (wave) => {
    const levels = Array.from(wave[1], (level) => ({
      id: level[0],
      appear: level[1].appear,
      clear: level[1].clear,
    }));
    levels.sort((a, b) => a.id - b.id);
    return {
      id: wave[0],
      levels,
    };
  });
  waves.sort((a, b) => {
    if (a.id === "-") {
      return -1;
    }
    if (b.id === "-") {
      return 1;
    }
    // Move king salmonids behind events.
    if (a.id.startsWith("Q29vcEVu") && !b.id.startsWith("Q29vcEVu")) {
      return 1;
    }
    if (!a.id.startsWith("Q29vcEVu") && b.id.startsWith("Q29vcEVu")) {
      return -1;
    }
    return decode64Index(a.id) - decode64Index(b.id);
  });
  stages.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
  const weapons = Array.from(weaponMap, (weapon) => ({
    id: weaponList.images[weapon[0]] ?? weapon[0],
    count: weapon[1],
  }));
  weapons.sort((a, b) => {
    let aid: number | undefined, bid: number | undefined;
    try {
      aid = decode64Index(a.id);
    } catch {
      /* empty */
    }
    try {
      bid = decode64Index(b.id);
    } catch {
      /* empty */
    }
    if (aid === undefined && bid === undefined) {
      return a.id.localeCompare(b.id);
    } else if (aid === undefined) {
      return 1;
    } else if (bid === undefined) {
      return -1;
    }
    return aid - bid;
  });
  const specialWeapons = Array.from(specialWeaponMap, (specialWeapon) => ({
    id: coopSpecialWeaponList.images[specialWeapon[0]] ?? specialWeapon[0],
    count: specialWeapon[1],
  }));
  specialWeapons.sort((a, b) => {
    let aid: number | undefined, bid: number | undefined;
    try {
      aid = decode64Index(a.id);
    } catch {
      /* empty */
    }
    try {
      bid = decode64Index(b.id);
    } catch {
      /* empty */
    }
    if (aid === undefined && bid === undefined) {
      return a.id.localeCompare(b.id);
    } else if (aid === undefined) {
      return 1;
    } else if (bid === undefined) {
      return -1;
    }
    return decode64Index(a.id) - decode64Index(b.id);
  });
  return {
    count,
    exempt,
    clear,
    wave,
    hazardLevel,
    self,
    member,
    team,
    bosses,
    kings,
    scales: {
      gold,
      silver,
      bronze,
    },
    waves,
    stages,
    weapons,
    specialWeapons,
  };
};

export interface Brief {
  battle?: BattleBrief;
  coop?: CoopBrief;
}
export interface Stats {
  battle?: BattleStats;
  coop?: CoopStats;
}
