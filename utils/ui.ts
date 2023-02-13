import { Color } from "../components";
import { Friend, VsHistoryDetail, VsMode, VsStage } from "../models/types";
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

export const convertStageImageUrl = (stage: VsStage) => {
  const url = getAuthorityAndPath(stage.image.url);
  const pathComponents = url.split("/");
  const imageId = pathComponents[pathComponents.length - 1].split("_")[0];
  return `https://splatoon3.ink/assets/splatnet/stage_img/icon/high_resolution/${imageId}_0.png`;
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
    case "REGULAR":
      return Color.SalmonRun;
    case "BIG_RUN":
      return Color.BigRun;
  }
};

export const getFriendColor = (friend: Friend) => {
  switch (friend.onlineState) {
    case "VS_MODE_FIGHTING":
      return getVsModeColor(friend.vsMode!);
    case "COOP_MODE_FIGHTING":
      return getCoopRuleColor(friend.coopRule!);
    case "VS_MODE_MATCHING":
    case "COOP_MODE_MATCHING":
    case "ONLINE":
      return undefined;
    case "OFFLINE":
      return "transparent";
  }
};
export const getFriendOutline = (friend: Friend) => {
  switch (friend.onlineState) {
    case "VS_MODE_MATCHING":
      return getVsModeColor(friend.vsMode!);
    case "COOP_MODE_MATCHING":
      return getCoopRuleColor(friend.coopRule!);
    case "ONLINE":
      return Color.Online;
    case "VS_MODE_FIGHTING":
    case "COOP_MODE_FIGHTING":
    case "OFFLINE":
      return "transparent";
  }
};

export const getVsSelfPlayer = (battle: VsHistoryDetail) => {
  return battle.vsHistoryDetail.myTeam.players.find((player) => player.isMyself)!;
};
