import {
  CoopHistoryDetailQuery_379f0d9,
  CoopHistoryDetailQuery_3cc5f82,
  CoopHistoryDetailQuery_9ade2aa,
  CoopHistoryDetailQuery_f3799a0,
  VsHistoryDetailQuery_291295a,
  VsHistoryDetailQuery_2b08598,
  VsHistoryDetailQuery_cd82f2a,
} from "splatnet3-types/dist/generated/types";
import {
  Friend_friendList,
  MyOutfitCommonDataEquipmentsResult,
} from "splatnet3-types/dist/splatnet3";
import { Gear as ShopQuery, Schedules as SchedulesQuery } from "splatnet3-types/dist/splatoon3ink";

export {
  BankaraBattleHistoriesResult,
  CatalogResult,
  CoopHistoryDetailVariables,
  CoopHistoryResult,
  CoopRule,
  DragonMatchType,
  FestDragonCert,
  FriendListResult,
  FriendOnlineState,
  GraphQLSuccessResponse,
  HistoryRecordResult,
  Judgement,
  MyOutfitCommonDataEquipmentsResult,
  PrivateBattleHistoriesResult,
  RegularBattleHistoriesResult,
  RequestId,
  Species,
  VsHistoryDetailVariables,
  WeaponRecordResult,
  XBattleHistoriesResult,
} from "splatnet3-types/dist/splatnet3";
export { Gear as ShopQuery, Schedules as SchedulesQuery } from "splatnet3-types/dist/splatoon3ink";

export type NotNullable<T> = T extends null | undefined ? never : T;
export type Enum<T extends Record<string, any>> = T | keyof T;

export type BankaraMatchSetting =
  SchedulesQuery["data"]["bankaraSchedules"]["nodes"][0]["bankaraMatchSettings"][0];
export type CoopGroupingSchedule =
  | SchedulesQuery["data"]["coopGroupingSchedule"]["regularSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["coopGroupingSchedule"]["bigRunSchedules"]["nodes"][0];
export type CurrentFest = NotNullable<SchedulesQuery["data"]["currentFest"]>;
export type FestMatchSetting = NotNullable<
  SchedulesQuery["data"]["festSchedules"]["nodes"][0]["festMatchSetting"]
>;
export type RegularMatchSetting = NotNullable<
  SchedulesQuery["data"]["regularSchedules"]["nodes"][0]["regularMatchSetting"]
>;
export type Schedules = SchedulesQuery["data"];
export type Shop = ShopQuery["data"];
export type XMatchSetting = NotNullable<
  SchedulesQuery["data"]["xSchedules"]["nodes"][0]["xMatchSetting"]
>;

export type SaleGear =
  | ShopQuery["data"]["gesotown"]["pickupBrand"]["brandGears"][0]
  | ShopQuery["data"]["gesotown"]["limitedGears"][0];

export type Badge =
  | NotNullable<VsPlayer["nameplate"]>["badges"][0]
  | NotNullable<CoopPlayerResult["player"]["nameplate"]>["badges"][0];
export type CoopHistoryDetailResult =
  | CoopHistoryDetailQuery_379f0d9
  | CoopHistoryDetailQuery_3cc5f82
  | CoopHistoryDetailQuery_9ade2aa
  | CoopHistoryDetailQuery_f3799a0;
export type CoopMemberResult = NotNullable<
  CoopHistoryDetailResult["coopHistoryDetail"]
>["memberResults"][0];
export type CoopPlayerResult = NotNullable<
  CoopHistoryDetailResult["coopHistoryDetail"]
>["myResult"];
export type CoopSupplyWeapon = NotNullable<CoopGroupingSchedule["setting"]>["weapons"][0];
export type CoopStage =
  | NotNullable<CoopGroupingSchedule["setting"]>["coopStage"]
  | NotNullable<CoopHistoryDetailResult["coopHistoryDetail"]>["coopStage"];
export type CoopWaveResult = NotNullable<
  CoopHistoryDetailResult["coopHistoryDetail"]
>["waveResults"][0];
export type Friend = Friend_friendList;
export type Gear =
  | VsPlayer["headGear"]
  | VsPlayer["clothingGear"]
  | VsPlayer["shoesGear"]
  | SaleGear["gear"]
  | MyOutfitCommonDataEquipmentsResult["headGears"]["nodes"][0]
  | MyOutfitCommonDataEquipmentsResult["clothingGears"]["nodes"][0]
  | MyOutfitCommonDataEquipmentsResult["shoesGears"]["nodes"][0];
export type VsHistoryDetailResult =
  | VsHistoryDetailQuery_291295a
  | VsHistoryDetailQuery_2b08598
  | VsHistoryDetailQuery_cd82f2a;
export type VsMode = NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["vsMode"];
export type VsPlayer = VsTeam["players"][0];
export type VsSchedule =
  | SchedulesQuery["data"]["regularSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["bankaraSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["xSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["festSchedules"]["nodes"][0];
export type VsStage =
  | RegularMatchSetting["vsStages"][0]
  | BankaraMatchSetting["vsStages"][0]
  | XMatchSetting["vsStages"][0]
  | FestMatchSetting["vsStages"][0]
  | CurrentFest["tricolorStage"]
  | NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["vsStage"];
export type VsTeam =
  | NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["myTeam"]
  | NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["otherTeams"][0];
