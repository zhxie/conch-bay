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
export type RegularMatchSetting = MatchSetting;
export interface RegularSchedule extends Schedule {
  regularMatchSetting: RegularMatchSetting | null;
}
export interface AnarchyMatchSetting extends MatchSetting {
  mode: "CHALLENGE" | "OPEN";
}
export interface AnarchySchedule extends Schedule {
  bankaraMatchSettings: AnarchyMatchSetting[] | null;
}
export type XMatchSetting = MatchSetting;
export interface XSchedule extends Schedule {
  xMatchSetting: XMatchSetting | null;
}
export type SplatfestMatchSetting = MatchSetting;
export interface SplatfestSchedule extends Schedule {
  festMatchSetting: SplatfestMatchSetting | null;
}
export interface Splatfest extends Schedule {
  midtermTime: string;
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
  coopRule: "REGULAR" | "BIG_RUN" | null;
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

export interface CatalogProgress {
  level: number;
}
export interface Catalog {
  catalog: {
    progress: CatalogProgress | null;
  };
}

export interface WeaponRecord {
  image2d: {
    url: string;
  };
  id: string;
}
export interface WeaponRecords {
  weaponRecords: {
    nodes: WeaponRecord[];
  };
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

export interface VsWeapon {
  id: string;
  image2d: {
    url: string;
  };
}
export type Species = "INKLING" | "OCTOLING";
export interface VsPlayer {
  id: string;
  name: string;
  isMyself: boolean;
  weapon: VsWeapon;
  species: Species;
  paint: number;
  result: {
    kill: number;
    death: number;
    assist: number;
    special: number;
    noroshiTry: number | null;
  } | null;
}
export interface VsResult {
  paintRatio: number | null;
  score: number | null;
}
export interface VsTeam {
  color: {
    a: number;
    b: number;
    g: number;
    r: number;
  };
  result: VsResult | null;
  festTeamName: string | null;
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
    otherTeams: VsTeam[];
    playedTime: string;
  };
}

export interface CoopResultHistoryDetail {
  id: string;
}
export interface CoopResultHistoryGroup {
  historyDetails: {
    nodes: CoopResultHistoryDetail[];
  };
}
export interface CoopResult {
  coopResult: {
    regularGrade: CoopGrade | null;
    historyGroups: {
      nodes: CoopResultHistoryGroup[];
    };
  };
}

export interface CoopGrade {
  id: string;
}
export interface CoopPlayer {
  name: string;
  id: string;
  species: Species;
}
export interface CoopPlayerResult {
  player: CoopPlayer;
  weapons: CoopWeapon[];
  defeatEnemyCount: number;
  deliverCount: number;
  goldenAssistCount: number;
  goldenDeliverCount: number;
  rescueCount: number;
  rescuedCount: number;
}
export interface CoopBoss {
  id: string;
}
export interface CoopBossResult {
  hasDefeatBoss: boolean;
  boss: CoopBoss;
}
export interface CoopEnemy {
  id: string;
}
export interface CoopEnemyResult {
  defeatCount: number;
  teamDefeatCount: number;
  popCount: number;
  enemy: CoopEnemy;
}
export interface CoopEventWave {
  id: string;
}
export interface CoopWaveResult {
  waterLevel: number;
  eventWave: CoopEventWave | null;
  deliverNorm: number | null;
  goldenPopCount: number;
  teamDeliverCount: number | null;
}
export interface CoopHistoryDetail {
  coopHistoryDetail: {
    id: string;
    myResult: CoopPlayerResult;
    memberResults: CoopPlayerResult[];
    bossResult: CoopBossResult | null;
    enemyResults: CoopEnemyResult[];
    waveResults: CoopWaveResult[];
    resultWave: number;
    playedTime: string;
    rule: "REGULAR" | "BIG_RUN";
    coopStage: CoopStage;
    dangerRate: number;
  };
}
