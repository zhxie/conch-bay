import { VsHistoryDetailQuery_2b08598 } from "splatnet3-types/graphql/2b085984f729cd51938fc069ceef784a";
import { CoopHistoryDetailQuery_3cc5f82 } from "splatnet3-types/graphql/3cc5f826a6646b85f3ae45db51bd0707";
import { CoopHistoryDetailQuery_9ade2aa } from "splatnet3-types/graphql/9ade2aa3656324870ccec023636aed32";
import { VsHistoryDetailQuery_9ee0099 } from "splatnet3-types/graphql/9ee0099fbe3d8db2a838a75cf42856dd";
import { CoopHistoryDetailQuery_379f0d9 } from "splatnet3-types/graphql/379f0d9b78b531be53044bcac031b34b";
import { VsHistoryDetailQuery_291295a } from "splatnet3-types/graphql/291295ad311b99a6288fc95a5c4cb2d2";
import { VsHistoryDetailQuery_cd82f2a } from "splatnet3-types/graphql/cd82f2ade8aca7687947c5f3210805a6";
import { CoopHistoryDetailQuery_f3799a0 } from "splatnet3-types/graphql/f3799a033f0a7ad4b1b396f9a3bafb1e";
import { Friend_friendList, MyOutfitCommonDataEquipmentsResult } from "splatnet3-types/splatnet3";
import { Gear as ShopQuery, Schedules as SchedulesQuery } from "splatnet3-types/splatoon3ink";

export {
  AwardRank,
  BankaraBattleHistoriesResult,
  BankaraMatchMode,
  CoopHistoryDetailVariables,
  CoopHistoryResult,
  CoopRule,
  DetailVotingStatusResult,
  DetailVotingStatusVariables,
  DragonMatchType,
  EventBattleHistoriesResult,
  FestDragonCert,
  FestMatchMode,
  FriendListResult,
  FriendOnlineState,
  GraphQLSuccessResponse,
  HistoryRecordResult,
  Judgement,
  LatestBattleHistoriesResult,
  MyOutfitCommonDataEquipmentsResult,
  PrivateBattleHistoriesResult,
  RegularBattleHistoriesResult,
  RequestId,
  Species,
  VsHistoryDetailVariables,
  WeaponRecordResult,
  XBattleHistoriesResult,
} from "splatnet3-types/splatnet3";
export {
  Festivals as FestivalsQuery,
  Gear as ShopQuery,
  Schedules as SchedulesQuery,
} from "splatnet3-types/splatoon3ink";

export type NotNullable<T> = T extends null | undefined ? never : T;
export type Enum<T extends Record<string, any>> = T | keyof T;

export type BankaraMatchSetting = NotNullable<
  SchedulesQuery["data"]["bankaraSchedules"]["nodes"][0]["bankaraMatchSettings"]
>[0];
export type EventMatchSetting = VsEventSchedule["leagueMatchSetting"];
export type EventMatchTimePeriod = VsEventSchedule["timePeriods"][0];
export type CoopGroupingSchedule =
  | SchedulesQuery["data"]["coopGroupingSchedule"]["regularSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["coopGroupingSchedule"]["bigRunSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["coopGroupingSchedule"]["teamContestSchedules"]["nodes"][0];
export type CurrentFest = NotNullable<SchedulesQuery["data"]["currentFest"]>;
export type FestMatchSetting = NotNullable<
  SchedulesQuery["data"]["festSchedules"]["nodes"][0]["festMatchSettings"]
>[0];
export type PickupBrand = ShopQuery["data"]["gesotown"]["pickupBrand"];
export type RegularMatchSetting = NotNullable<
  SchedulesQuery["data"]["regularSchedules"]["nodes"][0]["regularMatchSetting"]
>;
export type SaleGear =
  | PickupBrand["brandGears"][0]
  | ShopQuery["data"]["gesotown"]["limitedGears"][0];
export type Schedules = SchedulesQuery["data"];
export type Shop = ShopQuery["data"];
export type XMatchSetting = NotNullable<
  SchedulesQuery["data"]["xSchedules"]["nodes"][0]["xMatchSetting"]
>;
export type VsEventSchedule = SchedulesQuery["data"]["eventSchedules"]["nodes"][0];
export type VsSchedule =
  | SchedulesQuery["data"]["regularSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["bankaraSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["xSchedules"]["nodes"][0]
  | SchedulesQuery["data"]["festSchedules"]["nodes"][0];

export type Award = NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["awards"][0];
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
  | MyGear;
export type MyGear =
  | MyOutfitCommonDataEquipmentsResult["headGears"]["nodes"][0]
  | MyOutfitCommonDataEquipmentsResult["clothingGears"]["nodes"][0]
  | MyOutfitCommonDataEquipmentsResult["shoesGears"]["nodes"][0];
export type VsHistoryDetailResult =
  | VsHistoryDetailQuery_291295a
  | VsHistoryDetailQuery_2b08598
  | VsHistoryDetailQuery_9ee0099
  | VsHistoryDetailQuery_cd82f2a;
export type VsMode = NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["vsMode"];
export type VsPlayer = VsTeam["players"][0];
export type VsStage =
  | RegularMatchSetting["vsStages"][0]
  | BankaraMatchSetting["vsStages"][0]
  | XMatchSetting["vsStages"][0]
  | EventMatchSetting["vsStages"][0]
  | FestMatchSetting["vsStages"][0]
  | CurrentFest["tricolorStages"][0]
  | NotNullable<NotNullable<CurrentFest["timetable"]>[0]["festMatchSettings"]>[0]["vsStages"][0]
  | NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["vsStage"];
export type VsTeam =
  | NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["myTeam"]
  | NotNullable<VsHistoryDetailResult["vsHistoryDetail"]>["otherTeams"][0];
