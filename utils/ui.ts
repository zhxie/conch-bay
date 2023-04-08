import { Color } from "../components";
import { VsMode, VsHistoryDetailResult, VsStage, CoopRule, Gear } from "../models/types";
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
  return image.split("?")[0];
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
  }
};

export const getGearPadding = (gears: Gear[]) => {
  return Math.max(...gears.map((gear) => gear.additionalGearPowers.length));
};

export const getVsSelfPlayer = (battle: VsHistoryDetailResult) => {
  return battle.vsHistoryDetail!.myTeam.players.find((player) => player.isMyself)!;
};
