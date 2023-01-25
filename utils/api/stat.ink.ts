// https://github.com/spacemeowx2/s3si.ts/blob/main/src/exporters/stat.ink.ts.
import * as Application from "expo-application";
import { pack } from "msgpackr";
import { v5 as uuidV5 } from "uuid";
import { SplatNet, StatInk } from "../../models";
import { VsPlayer } from "../../models/splatnet";
import { BattlePlayer, ResponseError, UuidsError } from "../../models/stat.ink";
import { decode64Id, decode64Number } from "../codec";
import { fetchRetry } from "../fetch";
import { getHexColor, getVsSelfPlayer, getVsSelfPlayerIndex } from "../ui";

let uuids: StatInk.Uuids | undefined = undefined;
let abilities: StatInk.Ability[] | undefined = undefined;
let battleWeapons: StatInk.Weapon[] | undefined = undefined;
let salmonWeapons: StatInk.Weapon[] | undefined = undefined;
let stages: StatInk.Stage[] | undefined = undefined;

export const updateAbilities = async () => {
  const res = await fetchRetry("https://stat.ink/api/v3/ability?full=1");
  const json = await res.json();

  abilities = json as StatInk.Ability[];
};
export const updateBattleWeapons = async () => {
  const res = await fetchRetry("https://stat.ink/api/v3/weapon");
  const json = await res.json();

  battleWeapons = json as StatInk.Weapon[];
};
export const updateSalmonWeapons = async () => {
  const res = await fetchRetry("https://stat.ink/api/v3/salmon/weapon?full=1");
  const json = await res.json();

  salmonWeapons = json as StatInk.Weapon[];
};
export const updateStages = async () => {
  const res = await fetchRetry("https://stat.ink/api/v3/stage");
  const json = await res.json();

  stages = json as StatInk.Stage[];
};

export const updateUuids = async (apiKey: string) => {
  const res = await fetchRetry("https://stat.ink/api/v3/s3s/uuid-list", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const json = await res.json();
  if (json.message) {
    throw new Error((json as UuidsError).message);
  }

  const res2 = await fetchRetry("https://stat.ink/api/v3/salmon/uuid-list", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
    },
  });
  const json2 = await res2.json();
  if (json2.message) {
    throw new Error((json2 as UuidsError).message);
  }

  uuids = [...(json as StatInk.Uuids), ...(json2 as StatInk.Uuids)];
};

export const postBattle = async (apiKey: string, battle: SplatNet.VsHistoryDetail) => {
  // UUID.
  const decodedId = decode64Id(battle.vsHistoryDetail.id);
  const uuid = uuidV5(
    new TextEncoder().encode(`${decodedId.timestamp}_${decodedId.uuid}`),
    "b3a2dbf5-2c09-4792-b78c-00b548b70aeb"
  );

  // Lobby.
  let lobby: StatInk.Lobby;
  switch (battle.vsHistoryDetail.vsMode.id) {
    case "VnNNb2RlLTE=":
      lobby = "regular";
      break;
    case "VnNNb2RlLTI=":
      lobby = "bankara_challenge";
      break;
    case "VnNNb2RlLTM=":
      lobby = "xmatch";
      break;
    case "VnNNb2RlLTU=":
      lobby = "private";
      break;
    case "VnNNb2RlLTY=":
    case "VnNNb2RlLTg=":
      lobby = "splatfest_open";
      break;
    case "VnNNb2RlLTc=":
      lobby = "splatfest_challenge";
      break;
    case "VnNNb2RlLTUx":
      lobby = "bankara_open";
      break;
    default:
      throw `unexpected VS mode ID ${battle.vsHistoryDetail.vsMode.id}`;
  }

  // Rule.
  let rule: StatInk.Rule;
  switch (battle.vsHistoryDetail.vsRule.id) {
    case "VnNSdWxlLTA=":
      rule = "nawabari";
      break;
    case "VnNSdWxlLTE=":
      rule = "area";
      break;
    case "VnNSdWxlLTI=":
      rule = "yagura";
      break;
    case "VnNSdWxlLTM=":
      rule = "hoko";
      break;
    case "VnNSdWxlLTQ=":
      rule = "asari";
      break;
    case "VnNSdWxlLTU=":
      rule = "tricolor";
      break;
    default:
      throw `unexpected VS rule ID ${battle.vsHistoryDetail.vsRule.id}`;
  }

  // Stage.
  const stageId = String(decode64Number(battle.vsHistoryDetail.vsStage.id));
  const stage = stages!.find((stage) => stage.aliases.find((alias) => alias === stageId))!.key;

  // Weapon.
  const selfPlayer = getVsSelfPlayer(battle);
  const formatWeapon = (weapon: SplatNet.VsWeapon) => {
    const weaponId = String(decode64Number(weapon.id));
    return battleWeapons!.find((weapon) => weapon.aliases.find((alias) => alias === weaponId))!.key;
  };
  const weapon = formatWeapon(selfPlayer.weapon);

  // Result.
  let result: StatInk.Result;
  switch (battle.vsHistoryDetail.judgement) {
    case "WIN":
      result = "win";
      break;
    case "LOSE":
    case "DEEMED_LOSE":
      result = "lose";
      break;
    case "EXEMPTED_LOSE":
      result = "exempted_lose";
      break;
    case "DRAW":
      result = "draw";
      break;
  }

  // Player.
  const formatPlayer = (player: VsPlayer, i: number) => {
    const battlePlayer: BattlePlayer = {
      me: player.isMyself ? "yes" : "no",
      rank_in_team: i + 1,
      name: player.name,
      number: player.nameId,
      splashtag_title: player.byname,
      weapon: formatWeapon(player.weapon),
      inked: player.paint,
      kill: player.result ? player.result.kill - player.result.assist : undefined,
      assist: player.result?.assist,
      kill_or_assist: player.result?.kill,
      death: player.result?.death,
      signal: player.result?.noroshiTry ?? undefined,
      special: player.result?.special,
      crown: player.crown ? "yes" : "no",
      disconnected: player.result ? "no" : "yes",
    };
    return battlePlayer;
  };

  let body: StatInk.Battle = {
    uuid,
    lobby,
    rule,
    stage,
    weapon,
    result,
    knockout: [battle.vsHistoryDetail.myTeam, ...battle.vsHistoryDetail.otherTeams].find(
      (team) => team.result?.score === 100
    )
      ? "yes"
      : "no",
    rank_in_team: getVsSelfPlayerIndex(battle) + 1,
    kill: selfPlayer.result ? selfPlayer.result.kill - selfPlayer.result.assist : undefined,
    assist: selfPlayer.result?.assist,
    kill_or_assist: selfPlayer.result?.kill,
    death: selfPlayer.result?.death,
    special: selfPlayer.result?.special,
    signal: selfPlayer.result?.noroshiTry ?? undefined,
    inked: selfPlayer.paint,
    medals: battle.vsHistoryDetail.awards.map((award) => award.name),

    our_team_color: getHexColor(battle.vsHistoryDetail.myTeam.color).slice(1),
    their_team_color: getHexColor(battle.vsHistoryDetail.otherTeams[0].color).slice(1),
    third_team_color:
      battle.vsHistoryDetail.otherTeams.length > 1
        ? getHexColor(battle.vsHistoryDetail.otherTeams[1].color).slice(1)
        : undefined,

    our_team_players: battle.vsHistoryDetail.myTeam.players.map(formatPlayer),
    their_team_players: battle.vsHistoryDetail.otherTeams[0].players.map(formatPlayer),
    third_team_players:
      battle.vsHistoryDetail.otherTeams.length > 1
        ? battle.vsHistoryDetail.otherTeams[0].players.map(formatPlayer)
        : undefined,
    agent: "Conch Bay",
    agent_version: Application.nativeApplicationVersion!,
    automated: "yes",
    start_at: Math.floor(new Date(battle.vsHistoryDetail.playedTime).getTime() / 1000),
    end_at:
      Math.floor(new Date(battle.vsHistoryDetail.playedTime).getTime() / 1000) +
      battle.vsHistoryDetail.duration,
  };

  const res = await fetchRetry("https://stat.ink/api/v3/battle", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/x-msgpack",
    },
    body: pack(body),
  });
  const json = await res.json();
  if ((json as ResponseError).error) {
    throw "";
  }
};
