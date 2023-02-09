export interface GraphQlResponse<T> {
  data?: T;
  errors?: { message: string }[];
}

export interface VsMode {
  id: string;
}
export interface VsRule {
  name: string;
  id: string;
}
export interface VsStage {
  name: string;
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
export interface BankaraMatchSetting extends MatchSetting {
  mode: "CHALLENGE" | "OPEN";
}
export interface BankaraSchedule extends Schedule {
  bankaraMatchSettings: BankaraMatchSetting[] | null;
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
  bankaraSchedules: { nodes: BankaraSchedule[] };
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
export interface Badge {
  image: {
    url: string;
  };
}
export interface PlayHistory {
  rank: number;
  udemae: string;
  allBadges: Badge[];
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

export interface SubWeaponRecord {
  image: {
    url: string;
  };
}
export interface SpecialWeaponRecord {
  image: {
    url: string;
  };
}
export interface WeaponRecord {
  subWeapon: SubWeaponRecord;
  specialWeapon: SpecialWeaponRecord;
  image2d: {
    url: string;
  };
}
export interface WeaponRecords {
  weaponRecords: {
    nodes: WeaponRecord[];
  };
}

export interface Brand {
  image: {
    url: string;
  };
}
export interface GearPower {
  image: {
    url: string;
  };
}
export interface Gear {
  image: {
    url: string;
  };
  brand: Brand;
  primaryGearPower: GearPower;
  additionalGearPowers: GearPower[];
}
export interface Equipments {
  clothingGears: {
    nodes: Gear[];
  };
  headGears: {
    nodes: Gear[];
  };
  shoesGears: {
    nodes: Gear[];
  };
}

export interface PlayerBadge {
  image: {
    url: string;
  };
}
export interface Nameplate {
  badges: (PlayerBadge | null)[];
  background: {
    textColor: {
      a: number;
      b: number;
      g: number;
      r: number;
    };
    image: {
      url: string;
    };
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
export interface BankaraBattleHistories {
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

export interface VsSpecialWeapon {
  image: {
    url: string;
  };
}
export interface VsSubWeapon {
  image: {
    url: string;
  };
}
export interface VsWeapon {
  name: string;
  specialWeapon: VsSpecialWeapon;
  id: string;
  image2d: {
    url: string;
  };
  subWeapon: VsSubWeapon;
}
export type Species = "INKLING" | "OCTOLING";
export interface VsBrand {
  image: {
    url: string;
  };
}
export interface VsGear {
  name: string;
  primaryGearPower: GearPower;
  additionalGearPowers: GearPower[];
  originalImage: {
    url: string;
  };
  brand: VsBrand;
}
export type FestDragonCert = "NONE" | "DRAGON" | "DOUBLE_DRAGON";
export interface VsPlayer {
  id: string;
  name: string;
  isMyself: boolean;
  byname: string;
  weapon: VsWeapon;
  species: Species;
  nameId: string;
  nameplate: Nameplate;
  headGear: VsGear;
  clothingGear: VsGear;
  shoesGear: VsGear;
  paint: number;
  result: {
    kill: number;
    death: number;
    assist: number;
    special: number;
    noroshiTry: number | null;
  } | null;
  crown?: boolean;
  festDragonCert: FestDragonCert;
}
export interface VsResult {
  paintRatio: number | null;
  score: number | null;
  noroshi: number | null;
}
export interface VsTeam {
  color: {
    a: number;
    b: number;
    g: number;
    r: number;
  };
  result: VsResult | null;
  tricolorRole: null | "DEFENSE" | "ATTACK1" | "ATTACK2";
  judgement: "WIN" | "LOSE" | "DRAW";
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
  name: string;
  id: string;
}
export interface Uniform {
  name: string;
  image: {
    url: string;
  };
  id: string;
}
export interface CoopPlayer {
  byname: string;
  name: string;
  nameId: string;
  nameplate: Nameplate;
  uniform: Uniform;
  id: string;
  species: Species;
}
export interface CoopSpecialWeapon {
  name: string;
  image: {
    url: string;
  };
}
export interface CoopPlayerResult {
  player: CoopPlayer;
  weapons: CoopWeapon[];
  specialWeapon: CoopSpecialWeapon | null;
  defeatEnemyCount: number;
  deliverCount: number;
  goldenAssistCount: number;
  goldenDeliverCount: number;
  rescueCount: number;
  rescuedCount: number;
}
export interface CoopBoss {
  name: string;
  id: string;
}
export interface CoopBossResult {
  hasDefeatBoss: boolean;
  boss: CoopBoss;
}
export interface CoopEnemy {
  id: string;
  name: string;
}
export interface CoopEnemyResult {
  defeatCount: number;
  teamDefeatCount: number;
  popCount: number;
  enemy: CoopEnemy;
}
export interface CoopEventWave {
  name: string;
  id: string;
}
export interface CoopWaveSpecialWeapon {
  name: string;
}
export interface CoopWaveResult {
  waterLevel: number;
  eventWave: CoopEventWave | null;
  deliverNorm: number | null;
  goldenPopCount: number;
  teamDeliverCount: number | null;
  specialWeapons: CoopWaveSpecialWeapon[];
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
    scale: { gold: number; silver: number; bronze: number } | null;
  };
}
