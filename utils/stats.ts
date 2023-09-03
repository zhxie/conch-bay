import coopSpecialWeaponList from "../models/coopSpecialWeapons.json";
import {
  CoopHistoryDetailResult,
  CoopMemberResult,
  CoopRule,
  Judgement,
  VsHistoryDetailResult,
  VsPlayer,
} from "../models/types";
import weaponList from "../models/weapons.json";
import { decode64Index } from "./codec";
import { getImageHash, getVsPower, getVsSelfPlayer } from "./ui";

interface BattlePlayerStats {
  turf: number;
  kill: number;
  assist: number;
  death: number;
  special: number;
}
export interface BattleStats {
  time: number;
  win: boolean;
  lose: boolean;
  exempt: boolean;
  power?: number;
  duration: number;
  self: BattlePlayerStats;
  teamMember: number;
  team: BattlePlayerStats;
  allMember: number;
  all: BattlePlayerStats;
  rule: string;
  stage: string;
  weapon: string;
}
interface BattlesStats {
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

const countBattlePlayer = (player: VsPlayer): BattlePlayerStats => {
  return {
    turf: player.paint,
    kill: player.result?.kill ?? 0,
    assist: player.result?.assist ?? 0,
    death: player.result?.death ?? 0,
    special: player.result?.special ?? 0,
  };
};
const addBattlePlayerStats = (...players: BattlePlayerStats[]): BattlePlayerStats => {
  let turf = 0,
    kill = 0,
    assist = 0,
    death = 0,
    special = 0;
  for (const player of players) {
    turf += player.turf;
    kill += player.kill;
    assist += player.assist;
    death += player.death;
    special += player.special;
  }
  return { turf, kill, assist, death, special };
};
export const countBattle = (battle: VsHistoryDetailResult): BattleStats => {
  let win = false,
    lose = false;
  switch (battle.vsHistoryDetail!.judgement as Judgement) {
    case Judgement.WIN:
      win = true;
      break;
    case Judgement.LOSE:
    case Judgement.DEEMED_LOSE:
    case Judgement.EXEMPTED_LOSE:
      lose = true;
      break;
    case Judgement.DRAW:
      break;
  }
  const power = getVsPower(battle);
  // Disconnected and draw should be skipped.
  let exempt = false;
  if (
    (battle.vsHistoryDetail!.judgement === Judgement.DEEMED_LOSE &&
      battle.vsHistoryDetail!.duration === 0) ||
    battle.vsHistoryDetail!.judgement === Judgement.DRAW
  ) {
    exempt = true;
  }
  const selfPlayer = getVsSelfPlayer(battle);

  return {
    time: new Date(battle.vsHistoryDetail!.playedTime).valueOf(),
    win,
    lose,
    exempt,
    power: power === null ? undefined : power,
    duration: battle.vsHistoryDetail!.duration,
    self: countBattlePlayer(selfPlayer),
    teamMember: battle.vsHistoryDetail!.myTeam.players.length,
    team: battle
      .vsHistoryDetail!.myTeam.players.map((player) => countBattlePlayer(player))
      .reduce((prev, current) => addBattlePlayerStats(prev, current)),
    allMember: [battle.vsHistoryDetail!.myTeam, ...battle.vsHistoryDetail!.otherTeams]
      .map((team) => team.players.length)
      .reduce((prev, current) => prev + current),
    all: [battle.vsHistoryDetail!.myTeam, ...battle.vsHistoryDetail!.otherTeams]
      .map((team) =>
        team.players
          .map((player) => countBattlePlayer(player))
          .reduce((prev, current) => addBattlePlayerStats(prev, current))
      )
      .reduce((prev, current) => addBattlePlayerStats(prev, current)),
    rule: battle.vsHistoryDetail!.vsRule.id,
    stage: battle.vsHistoryDetail!.vsStage.id,
    weapon: selfPlayer.weapon.id,
  };
};
export const addBattleStats = (...battles: BattleStats[]): BattlesStats => {
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
    win += battle.win ? 1 : 0;
    lose += battle.lose ? 1 : 0;
    exempt += battle.exempt ? 1 : 0;
    if (battle.power) {
      powerCount += 1;
      powerTotal += battle.power;
      powerMax = Math.max(powerMax, battle.power);
    }
    if (battle.exempt) {
      continue;
    }
    duration += battle.duration;
    self = addBattlePlayerStats(self, battle.self);
    (teamMember += battle.teamMember), (team = addBattlePlayerStats(team, battle.team));
    allMember += battle.allMember;
    all = addBattlePlayerStats(all, battle.all);
    if (!stageMap.has(battle.stage)) {
      stageMap.set(battle.stage, new Map());
    }
    if (!stageMap.get(battle.stage)!.has(battle.rule)) {
      stageMap.get(battle.stage)!.set(battle.rule, { count: 0, win: 0 });
    }
    const stage = stageMap.get(battle.stage)!.get(battle.rule)!;
    stage.count += 1;
    stage.win += battle.win ? 1 : 0;
    if (!weaponMap.has(battle.weapon)) {
      weaponMap.set(battle.weapon, new Map());
    }
    if (!weaponMap.get(battle.weapon)!.has(battle.rule)) {
      weaponMap.get(battle.weapon)!.set(battle.rule, { count: 0, win: 0 });
    }
    const weapon = weaponMap.get(battle.weapon)!.get(battle.rule)!;
    weapon.count += 1;
    weapon.win += battle.win ? 1 : 0;
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
export interface CoopStats {
  time: number;
  exempt: boolean;
  clear: boolean;
  wave: number;
  hazardLevel: number;
  self: CoopPlayerStats;
  member: number;
  team: CoopPlayerStats;
  bosses: BossSalmonidStats[];
  king?: { id: string; defeat: boolean };
  scales?: {
    gold: number;
    silver: number;
    bronze: number;
  };
  waves: WaveStats[];
  stage: string;
  weapons: string[];
  specialWeapon?: string;
}
interface CoopsStats {
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
  scales: {
    gold: number;
    silver: number;
    bronze: number;
  };
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

const countCoopPlayer = (memberResult: CoopMemberResult): CoopPlayerStats => {
  return {
    defeat: memberResult.defeatEnemyCount,
    golden: memberResult.goldenDeliverCount,
    assist: memberResult.goldenAssistCount,
    power: memberResult.deliverCount,
    rescue: memberResult.rescueCount,
    rescued: memberResult.rescuedCount,
  };
};
const addCoopPlayerStats = (...players: CoopPlayerStats[]): CoopPlayerStats => {
  let defeat = 0,
    golden = 0,
    assist = 0,
    power = 0,
    rescue = 0,
    rescued = 0;
  for (const player of players) {
    defeat += player.defeat;
    golden += player.golden;
    assist += player.assist;
    power += player.power;
    rescue += player.rescue;
    rescued += player.rescued;
  }
  return { defeat, golden, assist, power, rescue, rescued };
};
export const countCoop = (coop: CoopHistoryDetailResult): CoopStats => {
  // Disconnected should be skipped.
  let exempt = false;
  if (coop.coopHistoryDetail!.resultWave < 0) {
    exempt = true;
  }
  let clear = false,
    wave = 0;
  if (coop.coopHistoryDetail!.resultWave >= 0) {
    if (coop.coopHistoryDetail!.resultWave === 0) {
      clear = true;
      // The maximum wave cleared is 3 in SplatNet, but we will fix it and have 5 in eggstra
      // works.
      wave = coop.coopHistoryDetail!.waveResults.length;
      switch (coop.coopHistoryDetail!.rule as CoopRule) {
        case CoopRule.REGULAR:
        case CoopRule.BIG_RUN:
          if (coop.coopHistoryDetail!.bossResult) {
            wave -= 1;
          }
          break;
        case CoopRule.TEAM_CONTEST:
          break;
      }
    } else {
      wave = coop.coopHistoryDetail!.resultWave - 1;
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

  let king: { id: string; defeat: boolean } | undefined = undefined;
  if (coop.coopHistoryDetail!.bossResult) {
    king = {
      id: coop.coopHistoryDetail!.bossResult.boss.id,
      defeat: coop.coopHistoryDetail!.bossResult.hasDefeatBoss,
    };
  }
  const bosses = Array.from(bossMap, (boss) => ({
    id: boss[0],
    appear: boss[1].appear,
    defeat: boss[1].defeat,
    defeatTeam: boss[1].defeat + boss[1].defeatTeam,
  }));
  bosses.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
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

  return {
    time: new Date(coop.coopHistoryDetail!.playedTime).valueOf(),
    exempt,
    clear,
    wave,
    hazardLevel: coop.coopHistoryDetail!.dangerRate,
    self: countCoopPlayer(coop.coopHistoryDetail!.myResult),
    member: coop.coopHistoryDetail!.memberResults.length + 1,
    team: [coop.coopHistoryDetail!.myResult, ...coop.coopHistoryDetail!.memberResults]
      .map((memberResult) => countCoopPlayer(memberResult))
      .reduce((prev, current) => addCoopPlayerStats(prev, current)),
    bosses,
    king,
    scales: coop.coopHistoryDetail!.scale
      ? {
          gold: coop.coopHistoryDetail!.scale!.gold,
          silver: coop.coopHistoryDetail!.scale!.silver,
          bronze: coop.coopHistoryDetail!.scale!.bronze,
        }
      : undefined,
    waves,
    stage: coop.coopHistoryDetail!.coopStage.id,
    weapons: coop.coopHistoryDetail!.myResult.weapons.map((weapon) =>
      getImageHash(weapon.image.url)
    ),
    specialWeapon: coop.coopHistoryDetail!.myResult.specialWeapon
      ? getImageHash(coop.coopHistoryDetail!.myResult.specialWeapon.image.url)
      : undefined,
  };
};
export const addCoopStats = (...coops: CoopStats[]): CoopsStats => {
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
    exempt += coop.exempt ? 1 : 0;
    if (coop.exempt) {
      continue;
    }
    clear += coop.clear ? 1 : 0;
    wave += coop.wave;
    hazardLevel += coop.hazardLevel;
    self = addCoopPlayerStats(self, coop.self);
    member += coop.member;
    team = addCoopPlayerStats(team, coop.team);
    for (const boss of coop.bosses) {
      if (!bossMap.has(boss.id)) {
        bossMap.set(boss.id, { appear: 0, defeat: 0, defeatTeam: 0 });
      }
      const currentBoss = bossMap.get(boss.id)!;
      currentBoss.appear += boss.appear;
      currentBoss.defeat += boss.defeat;
      currentBoss.defeatTeam += boss.defeatTeam;
    }
    if (coop.king) {
      if (!kingMap.has(coop.king.id)) {
        kingMap.set(coop.king.id, { appear: 0, defeat: 0 });
      }
      const king = kingMap.get(coop.king.id)!;
      king.appear += 1;
      king.defeat += coop.king.defeat ? 1 : 0;
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
    for (const weapon of coop.weapons) {
      if (!weaponMap.has(weapon)) {
        weaponMap.set(weapon, 0);
      }
      weaponMap.set(weapon, weaponMap.get(weapon)! + 1);
    }
    if (coop.specialWeapon) {
      if (!specialWeaponMap.has(coop.specialWeapon)) {
        specialWeaponMap.set(coop.specialWeapon, 0);
      }
      specialWeaponMap.set(coop.specialWeapon, specialWeaponMap.get(coop.specialWeapon)! + 1);
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
    defeatTeam: boss[1].defeat + boss[1].defeatTeam,
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

export interface StatsProps {
  battle?: BattleStats;
  coop?: CoopStats;
}
