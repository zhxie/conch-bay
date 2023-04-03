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
  BankaraMatchSetting_schedule,
  CoopSchedule_schedule,
  CoopSetting_schedule,
  FestMatchSetting_schedule,
  Fest_schedule,
  Friend_friendList,
  GesotownResult,
  RegularMatchSetting_schedule,
  VsSchedule_bankara,
  VsSchedule_fest,
  VsSchedule_regular,
  VsSchedule_xMatch,
  XMatchSetting_schedule,
} from "splatnet3-types/dist/splatnet3";

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
  GesotownResult,
  GraphQLSuccessResponse,
  HistoryRecordResult,
  Judgement,
  MyOutfitCommonDataEquipmentsResult,
  PrivateBattleHistoriesResult,
  RegularBattleHistoriesResult,
  RequestId,
  StageScheduleResult,
  Species,
  VsHistoryDetailVariables,
  WeaponRecordResult,
  XBattleHistoriesResult,
} from "splatnet3-types/dist/splatnet3";

export type NotNullable<T> = T extends null | undefined ? never : T;
export type Enum<T extends Record<string, any>> = T | keyof T;

export type Badge =
  | NotNullable<VsPlayer["nameplate"]>["badges"][0]
  | NotNullable<CoopPlayerResult["player"]["nameplate"]>["badges"][0];
export type BankaraMatchSetting = BankaraMatchSetting_schedule;
export type CoopGroupingSchedule = CoopSchedule_schedule;
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
export type CoopSupplyWeapon = NotNullable<CoopSetting_schedule>["weapons"][0];
export type CoopStage =
  | NotNullable<CoopSetting_schedule>["coopStage"]
  | NotNullable<CoopHistoryDetailResult["coopHistoryDetail"]>["coopStage"];
export type CoopWaveResult = NotNullable<
  CoopHistoryDetailResult["coopHistoryDetail"]
>["waveResults"][0];
export type CurrentFest = Fest_schedule;
export type FestMatchSetting = FestMatchSetting_schedule;
export type Friend = Friend_friendList;
export type Gear =
  | VsPlayer["headGear"]
  | VsPlayer["clothingGear"]
  | VsPlayer["shoesGear"]
  | SaleGear["gear"];
export type RegularMatchSetting = RegularMatchSetting_schedule;
export type SaleGear =
  | GesotownResult["gesotown"]["pickupBrand"]["brandGears"][0]
  | GesotownResult["gesotown"]["limitedGears"][0];
export type VsHistoryDetailResult =
  | VsHistoryDetailQuery_291295a
  | VsHistoryDetailQuery_2b08598
  | VsHistoryDetailQuery_cd82f2a;
export type VsMode = NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["vsMode"];
export type VsPlayer = VsTeam["players"][0];
export type VsSchedule =
  | VsSchedule_regular
  | VsSchedule_bankara
  | VsSchedule_xMatch
  | VsSchedule_fest;
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
export type XMatchSetting = XMatchSetting_schedule;
