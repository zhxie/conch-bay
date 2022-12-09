export interface GraphQlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export interface VsRule {
  id: string;
}
export interface VsStage {
  image: {
    url: string;
  };
  id: string;
}
export type CoopStage = VsStage;
export interface CoopWeapon {
  image: {
    url: string;
  };
}

export interface MatchSetting {
  vsStages: VsStage[];
  vsRule: VsRule;
}
export interface Schedule {
  startTime: string;
  endTime: string;
}
export interface RegularMatchSetting extends MatchSetting {}
export interface RegularSchedule extends Schedule {
  regularMatchSetting: RegularMatchSetting | null;
}
export interface AnarchyMatchSetting extends MatchSetting {
  mode: "CHALLENGE" | "OPEN";
}
export interface AnarchySchedule extends Schedule {
  bankaraMatchSettings: AnarchyMatchSetting[] | null;
}
export interface XMatchSetting extends MatchSetting {}
export interface XSchedule extends Schedule {
  xMatchSetting: XMatchSetting | null;
}
export interface SplatfestMatchSetting extends MatchSetting {}
export interface SplatfestSchedule extends Schedule {
  festMatchSetting: SplatfestMatchSetting | null;
}
export interface Splatfest extends Schedule {
  tricolorStage: VsStage | null;
}
export interface ShiftSetting {
  coopStage: CoopStage;
  weapons: CoopWeapon[];
}
export interface Shift extends Schedule {
  setting: ShiftSetting;
}
export interface Schedules {
  regularSchedules: { nodes: RegularSchedule[] };
  bankaraSchedules: { nodes: AnarchySchedule[] };
  xSchedules: { nodes: XSchedule[] };
  coopGroupingSchedule: {
    regularSchedules: { nodes: Shift[] };
    bigRunSchedules: { nodes: Shift[] };
  };
  festSchedules: { nodes: SplatfestSchedule[] };
  currentFest: Splatfest | null;
}

export interface Friend {
  id: string;
  onlineState:
    | "VS_MODE_FIGHTING"
    | "VS_MODE_MATCHING"
    | "COOP_MODE_FIGHTING"
    | "COOP_MODE_MATCHING"
    | "ONLINE"
    | "OFFLINE";
  userIcon: {
    url: string;
  };
  vsMode: { id: string } | null;
  // TODO: the field has not been verified.
  coopRule: "REGULAR" | "BIG_RUN" | "PRIVATE_CUSTOM" | null;
}
export interface Friends {
  friends: {
    nodes: Friend[];
  };
}

export interface Player {
  userIcon: {
    url: string;
  };
}
export interface PlayHistory {
  rank: number;
  udemae: string;
}
export interface Summary {
  currentPlayer: Player;
  playHistory: PlayHistory;
}
