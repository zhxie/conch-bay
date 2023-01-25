// https://github.com/spacemeowx2/s3si.ts/blob/main/src/types.ts.

export interface UuidsError {
  message: string;
}
export type Uuids = string[];
export interface Ability {
  key: string;
  name: Record<string, string>;
  primary_only: boolean;
}
export interface Weapon {
  key: string;
  aliases: string[];
  name: Record<string, string>;
}
export interface Stage {
  key: string;
  aliases: string[];
}

export interface ResponseError {
  error?: unknown;
}

export type Lobby =
  | "regular"
  | "bankara_challenge"
  | "bankara_open"
  | "xmatch"
  | "splatfest_challenge"
  | "splatfest_open"
  | "private";
export type Rule = "nawabari" | "area" | "hoko" | "yagura" | "asari" | "tricolor";
export type Result = "win" | "lose" | "draw" | "exempted_lose";
export type Gear = {
  primary_ability: string;
  secondary_abilities: (string | null)[];
};
export type Gears = {
  headgear: Gear;
  clothing: Gear;
  shoes: Gear;
};
export type BattlePlayer = {
  me: "yes" | "no";
  rank_in_team: number;
  name: string;
  number: string | undefined;
  splashtag_title: string;
  weapon: string;
  inked: number;
  kill?: number;
  assist?: number;
  kill_or_assist?: number;
  death?: number;
  signal?: number;
  special?: number;
  gears?: Gears;
  crown: "yes" | "no";
  disconnected: "yes" | "no";
};
export type Battle = {
  test: "no";
  uuid: string;
  lobby: Lobby;
  rule: Rule;
  stage: string;
  weapon: string;
  result: Result;
  knockout?: "yes" | "no";
  rank_in_team: number;
  kill?: number;
  assist?: number;
  kill_or_assist?: number;
  death?: number;
  special?: number;
  signal?: number;
  inked: number;
  medals: string[];
  our_team_inked?: number;
  their_team_inked?: number;
  third_team_inked?: number;
  our_team_percent?: number;
  their_team_percent?: number;
  third_team_percent?: number;
  our_team_count?: number;
  their_team_count?: number;
  x_power_before?: number | null;
  fest_power?: number;
  fest_dragon?: "10x" | "decuple" | "100x" | "dragon" | "333x" | "double_dragon";
  our_team_color?: string;
  their_team_color?: string;
  third_team_color?: string;
  our_team_role?: "attacker" | "defender";
  their_team_role?: "attacker" | "defender";
  third_team_role?: "attacker" | "defender";
  our_team_theme?: string;
  their_team_theme?: string;
  third_team_theme?: string;
  our_team_players: BattlePlayer[];
  their_team_players: BattlePlayer[];
  third_team_players?: BattlePlayer[];
  agent: string;
  agent_version: string;
  automated: "yes";
  start_at: number;
  end_at: number;
};

export type SalmonWave = {
  tide: "low" | "normal" | "high";
  event?: string;
  golden_quota: number;
  golden_delivered: number;
  golden_appearances: number;
  special_uses?: Record<string, number>;
};
export type SalmonPlayer = {
  me: "yes" | "no";
  name: string;
  number: string;
  splashtag_title: string | null;
  uniform?: "orange" | "green" | "yellow" | "pink" | "blue" | "black" | "white";
  special?: string;
  weapons: (string | null)[];
  golden_eggs: number;
  golden_assist: number;
  power_eggs: number;
  rescue: number;
  rescued: number;
  defeat_boss: number;
  disconnected: "yes" | "no";
};
export type SalmonBoss = {
  appearances: number;
  defeated: number;
  defeated_by_me: number;
};
export type Salmon = {
  test?: "yes" | "no";
  uuid: string;
  private: "yes" | "no";
  big_run: "yes" | "no";
  stage: string;
  danger_rate: number;
  clear_waves: number;
  fail_reason?: null | "wipe_out" | "time_limit";
  king_smell?: number | null;
  king_salmonid?: string;
  clear_extra: "yes" | "no";
  title_before?: string;
  title_exp_before?: number;
  title_after?: string;
  title_exp_after: null | number;
  golden_eggs: number;
  power_eggs: number;
  gold_scale?: null | number;
  silver_scale?: null | number;
  bronze_scale?: null | number;
  job_point: null | number;
  job_score: null | number;
  job_rate: null | number;
  job_bonus: null | number;
  waves: SalmonWave[];
  players: SalmonPlayer[];
  bosses: Record<string, SalmonBoss>;
  note?: string;
  private_note?: string;
  link_url?: string;
  agent: string;
  agent_version: string;
  agent_variables: Record<string, string>;
  automated: "yes";
  start_at: number;
  end_at?: number;
};
