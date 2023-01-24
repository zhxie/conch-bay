import { Color } from "../components";
import { SplatNet } from "../models";
import { getAuthorityAndPath } from "./url";

export const getImageCacheKey = (image: string) => {
  const regex = /\/([0-9|a-f]{64}_\d)\./;
  const match = regex.exec(image)!;
  return match[1];
};
export const getImageCacheSource = (image: string) => {
  return {
    uri: image,
    cacheKey: getImageCacheKey(image),
  };
};
export const getUserIconCacheKey = (userIcon: string) => {
  const components = userIcon.split("/");
  return components[components.length - 1];
};
export const getUserIconCacheSource = (userIcon: string) => {
  return {
    uri: userIcon,
    cacheKey: getUserIconCacheKey(userIcon),
  };
};
export const getColor = (color: { a: number; b: number; g: number; r: number }) => {
  return `rgba(${Math.round(color.r * 255)}, ${Math.round(color.g * 255)}, ${Math.round(
    color.b * 255
  )}, ${Math.round(color.a * 255)})`;
};
export const convertStageImageUrl = (stage: SplatNet.VsStage) => {
  const url = getAuthorityAndPath(stage.image.url);
  const pathComponents = url.split("/");
  const imageId = pathComponents[pathComponents.length - 1].split("_")[0];
  return `https://splatoon3.ink/assets/splatnet/stage_img/icon/high_resolution/${imageId}_0.png`;
};

export const getMatchSetting = (schedule: SplatNet.Schedule, index?: number) => {
  const regularMatchSetting = schedule["regularMatchSetting"];
  if (regularMatchSetting !== undefined) {
    return regularMatchSetting as SplatNet.RegularMatchSetting | null;
  }
  const anarchyMatchSettings = schedule["bankaraMatchSettings"];
  if (anarchyMatchSettings !== undefined) {
    if (anarchyMatchSettings === null) {
      return null;
    }
    return (anarchyMatchSettings as SplatNet.BankaraMatchSetting[])[index ?? 0];
  }
  const xMatchSetting = schedule["xMatchSetting"];
  if (xMatchSetting !== undefined) {
    return xMatchSetting as SplatNet.XMatchSetting | null;
  }
  const splatfestMatchSetting = schedule["festMatchSetting"];
  if (splatfestMatchSetting !== undefined) {
    return splatfestMatchSetting as SplatNet.SplatfestMatchSetting | null;
  }
  throw "unexpected match setting";
};
export const getShiftSetting = (shift: SplatNet.Shift) => {
  return shift.setting;
};
export const isScheduleStarted = (schedule: SplatNet.Schedule) => {
  const now = new Date().getTime();
  const date = new Date(schedule.startTime);
  const timestamp = date.getTime();
  return timestamp <= now;
};
export const isSplatfestStarted = (splatfest: SplatNet.Splatfest) => {
  const now = new Date().getTime();
  const date = new Date(splatfest.midtermTime);
  const timestamp = date.getTime();
  return timestamp <= now;
};

export const getSplatfestStage = (splatfest: SplatNet.Splatfest) => {
  return splatfest.tricolorStage!;
};
export const getSplatfestStageId = (splatfest: SplatNet.Splatfest) => {
  const stage = getSplatfestStage(splatfest);
  return stage.id;
};
export const getVsStages = (schedule: SplatNet.Schedule, index?: number) => {
  const setting = getMatchSetting(schedule, index)!;
  return setting.vsStages;
};
export const getVsStageIds = (schedule: SplatNet.Schedule, index?: number) => {
  const stages = getVsStages(schedule, index);
  return stages.map((stage) => stage.id);
};
export const getCoopStage = (shift: SplatNet.Shift) => {
  const setting = getShiftSetting(shift);
  return setting["coopStage"];
};
export const getCoopStageId = (shift: SplatNet.Shift) => {
  const stage = getCoopStage(shift);
  return stage["id"];
};
export const getCoopWeapons = (shift: SplatNet.Shift) => {
  const setting = getShiftSetting(shift);
  return setting.weapons;
};

export const getVsModeColor = (mode: SplatNet.VsMode) => {
  switch (mode.id) {
    case "VnNNb2RlLTE=":
      return Color.RegularBattle;
    case "VnNNb2RlLTI=":
    case "VnNNb2RlLTUx":
      return Color.AnarchyBattle;
    case "VnNNb2RlLTM=":
      return Color.XBattle;
    case "VnNNb2RlLTU=":
      return Color.PrivateBattle;
    case "VnNNb2RlLTY=":
    case "VnNNb2RlLTc=":
    case "VnNNb2RlLTg=":
      return Color.AccentColor;
  }
};
export const getVsRuleId = (schedule: SplatNet.Schedule, index?: number) => {
  const setting = getMatchSetting(schedule, index)!;
  return setting.vsRule.id;
};
export const getCoopRuleColor = (rule: string) => {
  switch (rule) {
    case "REGULAR":
      return Color.SalmonRun;
    case "BIG_RUN":
      return Color.BigRun;
  }
};

export const getFriendColor = (friend: SplatNet.Friend) => {
  switch (friend.onlineState) {
    case "VS_MODE_FIGHTING":
    case "VS_MODE_MATCHING":
      return getVsModeColor(friend.vsMode!);
    case "COOP_MODE_FIGHTING":
    case "COOP_MODE_MATCHING":
      return getCoopRuleColor(friend.coopRule!);
    case "ONLINE":
      return Color.Online;
    case "OFFLINE":
      return "transparent";
  }
};

export const isVsAnnotation = (battle: SplatNet.VsHistoryDetail) => {
  switch (battle.vsHistoryDetail.judgement) {
    case "WIN":
    case "LOSE":
      return false;
    case "DEEMED_LOSE":
    case "EXEMPTED_LOSE":
    case "DRAW":
      return true;
  }
};
export const getVsSelfPlayer = (battle: SplatNet.VsHistoryDetail) => {
  return battle.vsHistoryDetail.myTeam.players.find((player) => player.isMyself)!;
};
export const getMaxAdditionalGearPowerCount = (player: SplatNet.VsPlayer) => {
  return Math.max(
    player.headGear.additionalGearPowers.length,
    player.clothingGear.additionalGearPowers.length,
    player.shoesGear.additionalGearPowers.length
  );
};
export const isCoopAnnotation = (coop: SplatNet.CoopHistoryDetail) => {
  return coop.coopHistoryDetail.resultWave === -1;
};
export const getCoopIsClear = (coop: SplatNet.CoopHistoryDetail) => {
  if (coop.coopHistoryDetail.resultWave === 0) {
    if (coop.coopHistoryDetail.bossResult) {
      return coop.coopHistoryDetail.bossResult.hasDefeatBoss;
    }
    return true;
  }
  return false;
};
export const getCoopIsWaveClear = (coop: SplatNet.CoopHistoryDetail, wave: number) => {
  if (coop.coopHistoryDetail.resultWave === 0) {
    return true;
  }
  return wave + 1 < coop.coopHistoryDetail.resultWave;
};
export const getCoopPowerEgg = (coop: SplatNet.CoopHistoryDetail) => {
  return coop.coopHistoryDetail.memberResults.reduce(
    (sum, result) => sum + result.deliverCount,
    coop.coopHistoryDetail.myResult.deliverCount
  );
};
export const getCoopGoldenEgg = (coop: SplatNet.CoopHistoryDetail) => {
  return coop.coopHistoryDetail.memberResults.reduce(
    (sum, result) => sum + result.goldenDeliverCount,
    coop.coopHistoryDetail.myResult.goldenDeliverCount
  );
};
