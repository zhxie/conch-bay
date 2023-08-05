import * as Convert from "color-convert";
import { Color } from "../components";
import specialWeaponsCoop from "../models/specialWeaponsCoop.json";
import {
  VsMode,
  VsHistoryDetailResult,
  VsStage,
  CoopRule,
  Gear,
  Judgement,
  CoopHistoryDetailResult,
} from "../models/types";
import weaponList from "../models/weapons.json";
import { decode64Index } from "./codec";
import { getAuthorityAndPath } from "./url";

export const getImageExpires = (image: string) => {
  const regex = /Expires=(\d*)&/;
  const match = regex.exec(image);
  if (!match) {
    return null;
  }
  return match[1];
};
export const isImageExpired = (image: string) => {
  const expires = getImageExpires(image);
  if (expires && parseInt(expires) * 1000 < new Date().valueOf()) {
    return true;
  }
  return false;
};
export const getImageCacheKey = (image: string) => {
  const splitted = image.split("?")[0].split("/");
  return `${splitted[splitted.length - 2]}/${splitted[splitted.length - 1]}`;
};
export const getImageHash = (image: string) => {
  const splitted = image.split("?")[0].split("/");
  return splitted[splitted.length - 1].split("_")[0];
};
export const getImageCacheSource = (image: string) => {
  return {
    uri: image,
    cacheKey: getImageCacheKey(image),
  };
};
export const getUserIconCacheSource = (userIcon: string) => {
  return {
    uri: userIcon,
    cacheKey: userIcon,
  };
};

export const getColor = (color: { a: number; b: number; g: number; r: number }) => {
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(
    color.b * 255
  )}, ${Math.round(color.a * 255)})`;
};
export const getSolidColor = (color: { a: number; b: number; g: number; r: number }) => {
  const hex = Convert.rgb.hex(color.r * 255, color.g * 255, color.b * 255);
  return `#${hex}`;
};
export const burnColor = (color: string) => {
  const hsl = Convert.hex.hsl(color.replace("#", ""));
  const hex = Convert.hsl.hex([hsl[0], hsl[1], hsl[2] * 0.7]);
  return `#${hex}`;
};
export const dodgeColor = (color: string) => {
  const hsl = Convert.hex.hsl(color.replace("#", ""));
  const hex = Convert.hsl.hex([hsl[0], hsl[1], Math.min(hsl[2] * 1.3, 100)]);
  return `#${hex}`;
};

export const convertStageImageUrl = (stage: VsStage) => {
  const url = getAuthorityAndPath(stage.image.url);
  const pathComponents = url.split("/");
  const imageId = pathComponents[pathComponents.length - 1].split("_")[0];
  return `https://splatoon3.ink/assets/splatnet/v1/stage_img/icon/high_resolution/${imageId}_0.png`;
};

export const getVsModeColor = (mode: VsMode) => {
  switch (mode.id) {
    case "VnNNb2RlLTE=":
      return Color.RegularBattle;
    case "VnNNb2RlLTI=":
    case "VnNNb2RlLTUx":
      return Color.AnarchyBattle;
    case "VnNNb2RlLTM=":
      return Color.XBattle;
    case "VnNNb2RlLTQ=":
      return Color.Challenge;
    case "VnNNb2RlLTU=":
      return Color.PrivateBattle;
    case "VnNNb2RlLTY=":
    case "VnNNb2RlLTc=":
    case "VnNNb2RlLTg=":
      return Color.AccentColor;
  }
};
export const getCoopRuleColor = (rule: string) => {
  switch (rule) {
    case CoopRule.REGULAR:
      return Color.SalmonRun;
    case CoopRule.BIG_RUN:
      return Color.BigRun;
    case CoopRule.TEAM_CONTEST:
      return Color.EggstraWork;
  }
};

export const getGearPadding = (gears: Gear[]) => {
  return Math.max(...gears.map((gear) => gear.additionalGearPowers.length));
};

export const getVsPower = (battle: VsHistoryDetailResult) => {
  if (
    battle.vsHistoryDetail?.bankaraMatch &&
    battle.vsHistoryDetail.bankaraMatch["bankaraPower"] &&
    battle.vsHistoryDetail.bankaraMatch["bankaraPower"]["power"] !== undefined
  ) {
    return battle.vsHistoryDetail.bankaraMatch["bankaraPower"]["power"];
  }
  if (battle.vsHistoryDetail?.xMatch) {
    return battle.vsHistoryDetail!.xMatch!.lastXPower;
  }
  if (
    battle.vsHistoryDetail?.leagueMatch &&
    battle.vsHistoryDetail.leagueMatch["myLeaguePower"] !== undefined
  ) {
    return battle.vsHistoryDetail.leagueMatch["myLeaguePower"];
  }
  if (battle.vsHistoryDetail?.festMatch) {
    return battle.vsHistoryDetail.festMatch.myFestPower;
  }
  return undefined;
};
export const roundPower = (power: number) => {
  return (Math.floor(power * 10) / 10).toFixed(1);
};
export const getVsSelfPlayer = (battle: VsHistoryDetailResult) => {
  return battle.vsHistoryDetail!.myTeam.players.find((player) => player.isMyself)!;
};

export const rationalize = (n: number) => {
  if (Number.isNaN(n) || !Number.isFinite(n)) {
    return 0;
  }
  return n;
};

export const countBattles = (battles: VsHistoryDetailResult[]) => {
  const result = {
    count: 0,
    win: 0,
    lose: 0,
    power: {
      count: 0,
      total: 0,
      max: 0,
    },
    duration: 0,
    self: {
      turf: 0,
      kill: 0,
      assist: 0,
      death: 0,
      special: 0,
    },
    team: {
      member: 0,
      turf: 0,
      kill: 0,
      assist: 0,
      death: 0,
      special: 0,
    },
    all: {
      member: 0,
      turf: 0,
      kill: 0,
      assist: 0,
      death: 0,
      special: 0,
    },
  };
  const stageMap = new Map<string, Map<string, { win: number; lose: number }>>(),
    weaponMap = new Map<string, Map<string, { win: number; lose: number }>>();
  for (const battle of battles) {
    result.count += 1;
    switch (battle.vsHistoryDetail!.judgement as Judgement) {
      case Judgement.WIN:
        result.win += 1;
        break;
      case Judgement.LOSE:
      case Judgement.DEEMED_LOSE:
      case Judgement.EXEMPTED_LOSE:
        result.lose += 1;
        break;
      case Judgement.DRAW:
        break;
    }
    const power = getVsPower(battle);
    if (power !== undefined && power !== null) {
      result.power.count += 1;
      result.power.total += power;
      result.power.max = Math.max(result.power.max, power);
    }
    // Disconnected and draw should be skipped.
    if (
      (battle.vsHistoryDetail!.judgement === Judgement.DEEMED_LOSE &&
        battle.vsHistoryDetail!.duration === 0) ||
      battle.vsHistoryDetail!.judgement === Judgement.DRAW
    ) {
      continue;
    }
    result.duration += battle.vsHistoryDetail!.duration;
    const selfPlayer = getVsSelfPlayer(battle);
    result.self.turf += selfPlayer.paint;
    result.self.kill += selfPlayer.result?.kill ?? 0;
    result.self.assist += selfPlayer.result?.assist ?? 0;
    result.self.death += selfPlayer.result?.death ?? 0;
    result.self.special += selfPlayer.result?.special ?? 0;
    for (const player of battle.vsHistoryDetail!.myTeam.players) {
      result.team.member += 1;
      result.team.turf += player.paint;
      result.team.kill += player.result?.kill ?? 0;
      result.team.assist += player.result?.assist ?? 0;
      result.team.death += player.result?.death ?? 0;
      result.team.special += player.result?.special ?? 0;
    }
    for (const team of [battle.vsHistoryDetail!.myTeam, ...battle.vsHistoryDetail!.otherTeams]) {
      for (const player of team.players) {
        result.all.member += 1;
        result.all.turf += player.paint;
        result.all.kill += player.result?.kill ?? 0;
        result.all.assist += player.result?.assist ?? 0;
        result.all.death += player.result?.death ?? 0;
        result.all.special += player.result?.special ?? 0;
      }
    }
    if (!stageMap.has(battle.vsHistoryDetail!.vsStage.id)) {
      stageMap.set(battle.vsHistoryDetail!.vsStage.id, new Map());
    }
    if (!stageMap.get(battle.vsHistoryDetail!.vsStage.id)!.has(battle.vsHistoryDetail!.vsRule.id)) {
      stageMap
        .get(battle.vsHistoryDetail!.vsStage.id)!
        .set(battle.vsHistoryDetail!.vsRule.id, { win: 0, lose: 0 });
    }
    if (!weaponMap.has(selfPlayer.weapon.id)) {
      weaponMap.set(selfPlayer.weapon.id, new Map());
    }
    if (!weaponMap.get(selfPlayer.weapon.id)!.has(battle.vsHistoryDetail!.vsRule.id)) {
      weaponMap
        .get(selfPlayer.weapon.id)!
        .set(battle.vsHistoryDetail!.vsRule.id, { win: 0, lose: 0 });
    }
    if (battle.vsHistoryDetail!.judgement === Judgement.WIN) {
      stageMap
        .get(battle.vsHistoryDetail!.vsStage.id)!
        .get(battle.vsHistoryDetail!.vsRule.id)!.win += 1;
      weaponMap.get(selfPlayer.weapon.id)!.get(battle.vsHistoryDetail!.vsRule.id)!.win += 1;
    } else {
      stageMap
        .get(battle.vsHistoryDetail!.vsStage.id)!
        .get(battle.vsHistoryDetail!.vsRule.id)!.lose += 1;
      weaponMap.get(selfPlayer.weapon.id)!.get(battle.vsHistoryDetail!.vsRule.id)!.lose += 1;
    }
  }
  const stages = Array.from(stageMap, (stage) => {
    const rules = Array.from(stage[1], (rule) => ({
      id: rule[0],
      win: rule[1].win,
      lose: rule[1].lose,
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
      win: rule[1].win,
      lose: rule[1].lose,
    }));
    rules.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
    return {
      id: weapon[0],
      rules,
    };
  });
  weapons.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));

  return { ...result, stages, weapons };
};
export const countCoops = (coops: CoopHistoryDetailResult[]) => {
  const result = {
    count: 0,
    deemed: 0,
    clear: 0,
    wave: 0,
    hazardLevel: 0,
    king: 0,
    self: {
      defeat: 0,
      golden: 0,
      assist: 0,
      power: 0,
      rescue: 0,
      rescued: 0,
    },
    team: {
      member: 0,
      defeat: 0,
      golden: 0,
      assist: 0,
      power: 0,
      rescue: 0,
      rescued: 0,
    },
  };
  const kingMap = new Map<string, { appear: number; defeat: number }>(),
    bossMap = new Map<string, { appear: number; defeat: number; defeatTeam: number }>();
  const stageMap = new Map<string, number>(),
    weaponMap = new Map<string, number>(),
    specialWeaponMap = new Map<string, number>();
  const waveMap = new Map<string, Map<number, { appear: number; clear: number }>>();
  for (const coop of coops) {
    result.count += 1;
    // Disconnected should be skipped.
    if (coop.coopHistoryDetail!.resultWave < 0) {
      result.deemed += 1;
      continue;
    }
    if (coop.coopHistoryDetail!.resultWave >= 0) {
      if (coop.coopHistoryDetail!.resultWave === 0) {
        result.clear += 1;
        // The maximum wave cleared is 3 in SplatNet, but we will fix it and have 5 in eggstra
        // works.
        result.wave += coop.coopHistoryDetail!.waveResults.length;
        switch (coop.coopHistoryDetail!.rule as CoopRule) {
          case CoopRule.REGULAR:
          case CoopRule.BIG_RUN:
            if (coop.coopHistoryDetail!.bossResult) {
              result.wave -= 1;
            }
            break;
          case CoopRule.TEAM_CONTEST:
            break;
        }
      } else {
        result.wave += coop.coopHistoryDetail!.resultWave - 1;
      }
    }
    result.hazardLevel += coop.coopHistoryDetail!.dangerRate;
    if (coop.coopHistoryDetail!.bossResult) {
      if (!kingMap.has(coop.coopHistoryDetail!.bossResult.boss.id)) {
        kingMap.set(coop.coopHistoryDetail!.bossResult.boss.id, {
          appear: 0,
          defeat: 0,
        });
      }
      kingMap.get(coop.coopHistoryDetail!.bossResult.boss.id)!.appear += 1;
      if (coop.coopHistoryDetail!.bossResult.hasDefeatBoss) {
        result.king += 1;
        kingMap.get(coop.coopHistoryDetail!.bossResult.boss.id)!.defeat += 1;
      }
    }
    result.self.defeat += coop.coopHistoryDetail!.myResult.defeatEnemyCount;
    result.self.golden += coop.coopHistoryDetail!.myResult.goldenDeliverCount;
    result.self.assist += coop.coopHistoryDetail!.myResult.goldenAssistCount;
    result.self.power += coop.coopHistoryDetail!.myResult.deliverCount;
    result.self.rescue += coop.coopHistoryDetail!.myResult.rescueCount;
    result.self.rescued += coop.coopHistoryDetail!.myResult.rescuedCount;
    for (const memberResult of coop.coopHistoryDetail!.memberResults) {
      result.team.member += 1;
      result.team.defeat += memberResult.defeatEnemyCount;
      result.team.golden += memberResult.goldenDeliverCount;
      result.team.assist += memberResult.goldenAssistCount;
      result.team.power += memberResult.deliverCount;
      result.team.rescue += memberResult.rescueCount;
      result.team.rescued += memberResult.rescuedCount;
    }
    for (const enemyResult of coop.coopHistoryDetail!.enemyResults) {
      if (!bossMap.has(enemyResult.enemy.id)) {
        bossMap.set(enemyResult.enemy.id, { appear: 0, defeat: 0, defeatTeam: 0 });
      }
      bossMap.get(enemyResult.enemy.id)!.appear += enemyResult.popCount;
      bossMap.get(enemyResult.enemy.id)!.defeat += enemyResult.defeatCount;
      bossMap.get(enemyResult.enemy.id)!.defeatTeam += enemyResult.teamDefeatCount;
    }
    stageMap.set(
      coop.coopHistoryDetail!.coopStage.id,
      (stageMap.get(coop.coopHistoryDetail!.coopStage.id) ?? 0) + 1
    );
    for (const weapon of coop.coopHistoryDetail!.myResult.weapons) {
      const hash = getImageHash(weapon.image.url);
      weaponMap.set(
        weaponList.images[hash] ?? hash,
        (weaponMap.get(weaponList.images[hash] ?? hash) ?? 0) + 1
      );
    }
    const specialWeaponHash = getImageHash(
      coop.coopHistoryDetail!.myResult.specialWeapon!.image.url
    );
    specialWeaponMap.set(
      specialWeaponsCoop.images[specialWeaponHash] ?? specialWeaponHash,
      (specialWeaponMap.get(specialWeaponsCoop.images[specialWeaponHash] ?? specialWeaponHash) ??
        0) + 1
    );
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
  }
  result.team.member += result.count;
  result.team.defeat += result.self.defeat;
  result.team.golden += result.self.golden;
  result.team.assist += result.self.assist;
  result.team.power += result.self.power;
  result.team.rescue += result.self.rescue;
  result.team.rescued += result.self.rescued;
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
  stages.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
  const weapons = Array.from(weaponMap, (weapon) => ({
    id: weapon[0],
    count: weapon[1],
  }));
  weapons.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
  const specialWeapons = Array.from(specialWeaponMap, (specialWeapon) => ({
    id: specialWeapon[0],
    count: specialWeapon[1],
  }));
  specialWeapons.sort((a, b) => decode64Index(a.id) - decode64Index(b.id));
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
  return { ...result, bosses, kings, waves, stages, weapons, specialWeapons };
};

export const trimBattle = (battle: VsHistoryDetailResult) => {
  battle.vsHistoryDetail!.player.nameplate = null;
  for (const gear of [
    battle.vsHistoryDetail!.player.headGear,
    battle.vsHistoryDetail!.player.clothingGear,
    battle.vsHistoryDetail!.player.shoesGear,
  ]) {
    gear.image.url = "";
    gear.primaryGearPower.image.url = "";
    for (const gearPower of gear.additionalGearPowers) {
      gearPower.image.url = "";
    }
    gear.originalImage.url = "";
    gear.brand.image.url = "";
  }
  battle.vsHistoryDetail!.player.headGear = undefined as any;
  battle.vsHistoryDetail!.player.clothingGear = undefined as any;
  battle.vsHistoryDetail!.player.shoesGear = undefined as any;
  for (const team of [battle.vsHistoryDetail!.myTeam, ...battle.vsHistoryDetail!.otherTeams]) {
    for (const player of team.players) {
      player.weapon.image.url = "";
      player.weapon.specialWeapon.maskingImage.maskImageUrl = "";
      player.weapon.specialWeapon.maskingImage.overlayImageUrl = "";
      player.weapon.specialWeapon.image.url = "";
      player.weapon.image3d.url = "";
      player.weapon.image2d.url = "";
      player.weapon.image3dThumbnail.url = "";
      player.weapon.image2dThumbnail.url = "";
      player.weapon.subWeapon.image.url = "";
      player.nameplate = null;
      for (const gear of [player.headGear, player.clothingGear, player.shoesGear]) {
        gear.thumbnailImage.url = "";
        gear.primaryGearPower.image.url = "";
        for (const gearPower of gear.additionalGearPowers) {
          gearPower.image.url = "";
        }
        gear.originalImage.url = "";
        gear.brand.image.url = "";
      }
    }
  }
  battle.vsHistoryDetail!.vsStage.image.url = "";
  battle.vsHistoryDetail!.nextHistoryDetail = null;
  battle.vsHistoryDetail!.previousHistoryDetail = null;
};
export const trimCoop = (coop: CoopHistoryDetailResult) => {
  for (const memberResult of [
    coop.coopHistoryDetail!.myResult,
    ...coop.coopHistoryDetail!.memberResults,
  ]) {
    memberResult.player.nameplate = null;
    memberResult.player.uniform.image.url = "";
    for (const weapon of memberResult.weapons) {
      weapon.image.url = getImageCacheKey(weapon.image.url);
    }
    if (memberResult.specialWeapon) {
      memberResult.specialWeapon.image.url = getImageCacheKey(memberResult.specialWeapon.image.url);
    }
  }
  for (const enemyResult of coop.coopHistoryDetail!.enemyResults) {
    enemyResult.enemy.image.url = "";
  }
  for (const waveResult of coop.coopHistoryDetail!.waveResults) {
    for (const specialWeapon of waveResult.specialWeapons) {
      specialWeapon.image.url = getImageCacheKey(specialWeapon.image.url);
    }
  }
  coop.coopHistoryDetail!.coopStage.image.url = "";
  for (const weapon of coop.coopHistoryDetail!.weapons) {
    weapon.image.url = getImageCacheKey(weapon.image.url);
  }
  coop.coopHistoryDetail!.nextHistoryDetail = null;
  coop.coopHistoryDetail!.previousHistoryDetail = null;
};
