import dayjs from "dayjs";
import {
  AnarchyMatchSetting,
  CoopHistoryDetail,
  Friend,
  RegularMatchSetting,
  Schedule,
  Shift,
  Splatfest,
  SplatfestMatchSetting,
  VsHistoryDetail,
  VsMode,
  VsStage,
  VsTeam,
  XMatchSetting,
} from "../models/types";
import { getAuthorityAndPath } from "./url";
import { Color } from "../components";

export const getMatchSetting = (schedule: Schedule, index?: number) => {
  const regularMatchSetting = schedule["regularMatchSetting"];
  if (regularMatchSetting !== undefined) {
    return regularMatchSetting as RegularMatchSetting | null;
  }
  const anarchyMatchSettings = schedule["bankaraMatchSettings"];
  if (anarchyMatchSettings !== undefined) {
    if (anarchyMatchSettings === null) {
      return null;
    }
    return (anarchyMatchSettings as AnarchyMatchSetting[])[index ?? 0];
  }
  const xMatchSetting = schedule["xMatchSetting"];
  if (xMatchSetting !== undefined) {
    return xMatchSetting as XMatchSetting | null;
  }
  const splatfestMatchSetting = schedule["festMatchSetting"];
  if (splatfestMatchSetting !== undefined) {
    return splatfestMatchSetting as SplatfestMatchSetting | null;
  }
  throw "unexpected match setting";
};
export const getShiftSetting = (shift: Shift) => {
  return shift.setting;
};
export const isScheduleStarted = (schedule: Schedule) => {
  const now = new Date().getTime();
  const date = new Date(schedule.startTime);
  const timestamp = date.getTime();
  return timestamp <= now;
};
export const isSplatfestStarted = (splatfest: Splatfest) => {
  const now = new Date().getTime();
  const date = new Date(splatfest.midtermTime);
  const timestamp = date.getTime();
  return timestamp <= now;
};
export const getScheduleTimeRange = (schedule: Schedule, withDate: boolean) => {
  let format = "HH:mm";
  if (withDate) {
    format = "M/DD HH:mm";
  }

  const startTime = dayjs(schedule.startTime).format(format);
  const endTime = dayjs(schedule.endTime).format(format);

  return `${startTime} - ${endTime}`;
};
export const getSplatfestTimeRange = (splatfest: Splatfest, withDate: boolean) => {
  let format = "HH:mm";
  if (withDate) {
    format = "M/DD HH:mm";
  }

  const startTime = dayjs(splatfest.midtermTime).format(format);
  const endTime = dayjs(splatfest.endTime).format(format);

  return `${startTime} - ${endTime}`;
};

export const getSplatfestStage = (splatfest: Splatfest) => {
  return splatfest.tricolorStage!;
};
export const getSplatfestStageId = (splatfest: Splatfest) => {
  const stage = getSplatfestStage(splatfest);
  return stage.id;
};
export const getVsStages = (schedule: Schedule, index?: number) => {
  const setting = getMatchSetting(schedule, index)!;
  return setting.vsStages;
};
export const getVsStageIds = (schedule: Schedule, index?: number) => {
  const stages = getVsStages(schedule, index);
  return stages.map((stage) => stage.id);
};
export const getCoopStage = (shift: Shift) => {
  const setting = getShiftSetting(shift);
  return setting["coopStage"];
};
export const getCoopStageId = (shift: Shift) => {
  const stage = getCoopStage(shift);
  return stage["id"];
};
export const getCoopWeapons = (shift: Shift) => {
  const setting = getShiftSetting(shift);
  return setting.weapons;
};
export const getImageCacheKey = (image: string) => {
  const regex = /\/([0-9|a-f]{64}_\d)\./;
  const match = regex.exec(image)!;
  return match[1];
};

export const getVsModeColor = (mode: VsMode, accentColor: string) => {
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
      return accentColor;
  }
};
export const getVsRuleId = (schedule: Schedule, index?: number) => {
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

export const getFriendColor = (friend: Friend, accentColor: string) => {
  switch (friend.onlineState) {
    case "VS_MODE_FIGHTING":
    case "VS_MODE_MATCHING":
      return getVsModeColor(friend.vsMode!, accentColor);
    case "COOP_MODE_FIGHTING":
    case "COOP_MODE_MATCHING":
      return getCoopRuleColor(friend.coopRule!);
    case "ONLINE":
      return Color.Online;
    case "OFFLINE":
      return "transparent";
  }
};
export const getUserIconCacheKey = (userIcon: string) => {
  const components = userIcon.split("/");
  return components[components.length - 1];
};

export const convertStageImageUrl = (stage: VsStage) => {
  const url = getAuthorityAndPath(stage.image.url);
  const pathComponents = url.split("/");
  const imageId = pathComponents[pathComponents.length - 1].split("_")[0];
  return `https://splatoon3.ink/assets/splatnet/stage_img/icon/high_resolution/${imageId}_0.png`;
};
export const isVsAnnotation = (battle: VsHistoryDetail) => {
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
export const getVsSelfPlayer = (battle: VsHistoryDetail) => {
  return battle.vsHistoryDetail.myTeam.players.find((player) => player.isMyself)!;
};
export const getTeamColor = (team: VsTeam) => {
  return `rgba(${Math.round(team.color.r * 255)}, ${Math.round(team.color.g * 255)}, ${Math.round(
    team.color.b * 255
  )}, ${Math.round(team.color.a * 255)})`;
};
export const isCoopAnnotation = (coop: CoopHistoryDetail) => {
  return coop.coopHistoryDetail.resultWave === -1;
};
export const getCoopIsClear = (coop: CoopHistoryDetail) => {
  if (coop.coopHistoryDetail.resultWave === 0) {
    if (coop.coopHistoryDetail.bossResult) {
      return coop.coopHistoryDetail.bossResult.hasDefeatBoss;
    }
    return true;
  }
  return false;
};
export const getCoopIsWaveClear = (coop: CoopHistoryDetail, wave: number) => {
  if (coop.coopHistoryDetail.resultWave === 0) {
    return true;
  }
  return wave + 1 < coop.coopHistoryDetail.resultWave;
};
export const getCoopPowerEgg = (coop: CoopHistoryDetail) => {
  return coop.coopHistoryDetail.memberResults.reduce(
    (sum, result) => sum + result.deliverCount,
    coop.coopHistoryDetail.myResult.deliverCount
  );
};
export const getCoopGoldenEgg = (coop: CoopHistoryDetail) => {
  return coop.coopHistoryDetail.memberResults.reduce(
    (sum, result) => sum + result.goldenDeliverCount,
    coop.coopHistoryDetail.myResult.goldenDeliverCount
  );
};
