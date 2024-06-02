import * as Convert from "color-convert";
import { Color } from "../components";
import { VsHistoryDetailResult, CoopRule, Gear } from "../models/types";
import { getAuthorityAndPath } from "./codec";

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
  const path = getAuthorityAndPath(image);
  // HACK: we only take SplatNet 3 and Splatoon3.ink into consideration now.
  const splitted = path.split(/prod|splatnet|v\d*/g);
  return splitted[splitted.length - 1];
};
export const getImageHash = (image: string) => {
  const path = getAuthorityAndPath(image);
  const splitted = path.split("/");
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

export const getSplatoon3InkStageSource = (image: string) => {
  const bannerCacheKey = getImageCacheKey(image);
  const iconCacheKey = bannerCacheKey
    .replace("banner/low_resolution", "icon/high_resolution")
    .replace("_3.png", "_0.png");
  const bannerPath = getAuthorityAndPath(image);
  const bannerSplitted = bannerPath.split(/prod|splatnet/g);
  const bannerSuffix = bannerSplitted[bannerSplitted.length - 1];
  const iconSuffix = bannerSuffix
    .replace("banner/low_resolution", "icon/high_resolution")
    .replace("_3.png", "_0.png");
  return {
    uri: `https://splatoon3.ink/assets/splatnet${iconSuffix}`,
    cacheKey: iconCacheKey,
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

export const getVsModeColor = (mode: string) => {
  switch (mode) {
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
    return battle.vsHistoryDetail.bankaraMatch["bankaraPower"]["power"] as number;
  }
  if (battle.vsHistoryDetail?.xMatch) {
    return battle.vsHistoryDetail!.xMatch!.lastXPower as number;
  }
  if (
    battle.vsHistoryDetail?.leagueMatch &&
    battle.vsHistoryDetail.leagueMatch["myLeaguePower"] !== undefined
  ) {
    return battle.vsHistoryDetail.leagueMatch["myLeaguePower"] as number;
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
