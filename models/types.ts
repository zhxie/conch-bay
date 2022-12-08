export interface GraphQlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export interface VsMode {
  id: string;
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

export interface BattleHistoryDetail {
  id: string;
}
export interface BattleHistoryGroup {
  historyDetails: {
    nodes: BattleHistoryDetail[];
  };
}
export interface RegularBattleHistories {
  regularBattleHistories: {
    historyGroups: {
      nodes: BattleHistoryGroup[];
    };
  };
}
export interface AnarchyBattleHistories {
  bankaraBattleHistories: {
    historyGroups: {
      nodes: BattleHistoryGroup[];
    };
  };
}
export interface XBattleHistories {
  xBattleHistories: {
    historyGroups: {
      nodes: BattleHistoryGroup[];
    };
  };
}
export interface PrivateBattleHistories {
  privateBattleHistories: {
    historyGroups: {
      nodes: BattleHistoryGroup[];
    };
  };
}

export interface Weapon {
  image: {
    url: string;
  };
  id: string;
}
export interface VsPlayer {
  id: string;
  isMyself: boolean;
  weapon: Weapon;
  paint: number;
  result: {
    kill: number;
    death: number;
    assist: number;
    special: number;
  } | null;
}
export interface VsTeam {
  players: VsPlayer[];
}
export interface VsHistoryDetail {
  vsHistoryDetail: {
    id: string;
    vsRule: VsRule;
    vsMode: VsMode;
    judgement: "WIN" | "LOSE" | "DEEMED_LOSE" | "EXEMPTED_LOSE" | "DRAW";
    myTeam: VsTeam;
    vsStage: VsStage;
    otherTeams: VsTeam;
    playedTime: string;
  };
}
