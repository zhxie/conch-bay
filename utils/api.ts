import axios from "axios";
import { fromByteArray as encode64 } from "base64-js";
import * as Crypto from "expo-crypto";
import {
  BankaraBattleHistoriesResult,
  CatalogResult,
  CoopHistoryDetailResult,
  CoopHistoryDetailVariables,
  CoopHistoryResult,
  DetailVotingStatusResult,
  DetailVotingStatusVariables,
  EventBattleHistoriesResult,
  FestivalsQuery,
  FriendListResult,
  GraphQLSuccessResponse,
  HistoryRecordResult,
  MyOutfitCommonDataEquipmentsResult,
  PrivateBattleHistoriesResult,
  RegularBattleHistoriesResult,
  RequestId,
  SchedulesQuery,
  ShopQuery,
  VsHistoryDetailResult,
  VsHistoryDetailVariables,
  WeaponRecordResult,
  XBattleHistoriesResult,
} from "../models/types";
import { encode64Url } from "./codec";
import { getParam, parameterize } from "./url";

const AXIOS_TIMEOUT = 10000;
const AXIOS_IMINK_TIMEOUT = 15000;

export const fetchLatestVersion = async () => {
  const res = await axios.get("https://api.github.com/repos/zhxie/conch-bay/releases", {
    timeout: AXIOS_TIMEOUT,
  });
  return res.data.find((release) => !release["prerelease"])["tag_name"];
};

export const fetchSchedules = async () => {
  const res = await fetch("https://splatoon3.ink/data/schedules.json");
  const json = await res.json();
  return (json as SchedulesQuery).data;
};
export const fetchShop = async (language: string) => {
  const [res, locale] = await Promise.all([
    fetch("https://splatoon3.ink/data/gear.json"),
    fetch(`https://splatoon3.ink/data/locale/${language}.json`),
  ]);
  const [json, localeJson] = await Promise.all([res.json(), locale.json()]);
  const shop = (json as ShopQuery).data;
  shop.gesotown.pickupBrand.brandGears.forEach((gear) => {
    try {
      gear.gear.name = localeJson["gear"][gear.gear.__splatoon3ink_id]["name"];
    } catch {
      /* empty */
    }
  });
  shop.gesotown.limitedGears.forEach((gear) => {
    try {
      gear.gear.name = localeJson["gear"][gear.gear.__splatoon3ink_id]["name"];
    } catch {
      /* empty */
    }
  });
  return shop;
};
export const fetchSplatfests = async () => {
  const res = await fetch("https://splatoon3.ink/data/festivals.json");
  const json = await res.json();
  return (json as FestivalsQuery).US.data;
};

let NSO_VERSION = "2.5.1";
let SPLATNET_VERSION = "4.0.0-d5178440";

export const updateNsoVersion = async () => {
  const res = await axios.get("https://itunes.apple.com/lookup?id=1234806557", {
    timeout: AXIOS_TIMEOUT,
  });

  NSO_VERSION = res.data["results"][0]["version"];
};
export const updateSplatnetVersion = async () => {
  const res = await axios.get(
    "https://cdn.jsdelivr.net/gh/nintendoapis/nintendo-app-versions/data/splatnet3-app.json",
    { timeout: AXIOS_TIMEOUT }
  );

  SPLATNET_VERSION = res.data["web_app_ver"];
};
const callIminkFApi = async (step: number, idToken: string, naId: string, coralUserId?: string) => {
  const body = {
    hash_method: step,
    token: idToken,
    na_id: naId,
  };
  if (coralUserId) {
    body["coral_user_id"] = coralUserId;
  }
  const res = await axios.post("https://api.imink.app/f", body, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
    timeout: AXIOS_IMINK_TIMEOUT,
  });
  return res.data as { f: string; request_id: string; timestamp: string };
};
export const generateLogIn = async () => {
  const state = encode64Url(encode64(Crypto.getRandomBytes(36)));
  const cv = encode64Url(encode64(Crypto.getRandomBytes(32)));
  const cvHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, cv, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
  const codeChallenge = encode64Url(cvHash);

  const body = {
    state: state,
    redirect_uri: "npf71b963c1b7b6d119://auth",
    client_id: "71b963c1b7b6d119",
    scope: "openid user user.birthday user.mii user.screenName",
    response_type: "session_token_code",
    session_token_code_challenge: codeChallenge,
    session_token_code_challenge_method: "S256",
    theme: "login_form",
  };
  const url = "https://accounts.nintendo.com/connect/1.0.0/authorize?" + parameterize(body);
  return {
    url: encodeURI(url),
    cv,
  };
};
export const getSessionToken = async (url: string, cv: string) => {
  const sessionTokenCode = getParam(url.replace("#", "?"), "session_token_code");
  if (!sessionTokenCode) {
    return undefined;
  }
  const res = await axios.post(
    "https://accounts.nintendo.com/connect/1.0.0/api/session_token",
    {
      client_id: "71b963c1b7b6d119",
      session_token_code: sessionTokenCode,
      session_token_code_verifier: cv,
    },
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Host: "accounts.nintendo.com",
      },
      timeout: AXIOS_TIMEOUT,
    }
  );
  return res.data["session_token"] as string;
};
export const getWebServiceToken = async (sessionToken: string) => {
  // Get tokens.
  const res = await axios.post(
    "https://accounts.nintendo.com/connect/1.0.0/api/token",
    {
      client_id: "71b963c1b7b6d119",
      session_token: sessionToken,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token",
    },
    {
      headers: {
        "Content-Type": "application/json",
        Host: "accounts.nintendo.com",
      },
      timeout: AXIOS_TIMEOUT,
    }
  );
  const { access_token: accessToken, id_token: idToken } = res.data;

  // Get user info.
  const res2 = await axios.get("https://api.accounts.nintendo.com/2.0.0/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Host: "api.accounts.nintendo.com",
    },
    timeout: AXIOS_TIMEOUT,
  });
  const { birthday, language, country, id } = res2.data;

  // Get access token.
  const json3 = await callIminkFApi(1, idToken, id);
  const { f, request_id: requestId, timestamp } = json3;
  const res4 = await axios.post(
    "https://api-lp1.znc.srv.nintendo.net/v3/Account/Login",
    {
      parameter: {
        f: f,
        language: language,
        naBirthday: birthday,
        naCountry: country,
        naIdToken: idToken,
        requestId: requestId,
        timestamp: timestamp,
      },
    },
    {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "X-Platform": "Android",
        "X-ProductVersion": NSO_VERSION,
      },
      timeout: AXIOS_TIMEOUT,
    }
  );
  const idToken2 = res4.data["result"]["webApiServerCredential"]["accessToken"];
  const coralUserId = res4.data["result"]["user"]["id"].toString();

  // Get web service token.
  const json5 = await callIminkFApi(2, idToken2, id, coralUserId);
  const { f: f2, request_id: requestId2, timestamp: timestamp2 } = json5;
  const res6 = await axios.post(
    "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken",
    {
      parameter: {
        f: f2,
        id: 4834290508791808,
        registrationToken: idToken2,
        requestId: requestId2,
        timestamp: timestamp2,
      },
    },
    {
      headers: {
        Authorization: `Bearer ${idToken2}`,
        "Content-Type": "application/json; charset=utf-8",
        "X-Platform": "Android",
        "X-ProductVersion": NSO_VERSION,
      },
      timeout: AXIOS_TIMEOUT,
    }
  );
  const webServiceToken = res6.data["result"]["accessToken"];
  return { webServiceToken, country, language };
};
export const getBulletToken = async (
  webServiceToken: string,
  country: string,
  language?: string
) => {
  const res = await axios.post(
    "https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens",
    undefined,
    {
      headers: {
        "Accept-Language": language ?? "*",
        Cookie: `_gtoken=${webServiceToken}`,
        "X-NACOUNTRY": country,
        "X-Web-View-Ver": SPLATNET_VERSION,
      },
      timeout: AXIOS_TIMEOUT,
    }
  );
  return res.data["bulletToken"] as string;
};

const fetchGraphQl = async <T>(
  bulletToken: string,
  hash: string,
  language?: string,
  variables?: T
) => {
  const res = await fetch("https://api.lp1.av5ja.srv.nintendo.net/api/graphql", {
    method: "POST",
    headers: {
      "Accept-Language": language || "*",
      Authorization: `Bearer ${bulletToken}`,
      "Content-Type": "application/json",
      "X-Web-View-Ver": SPLATNET_VERSION,
    },
    body: JSON.stringify({
      extensions: {
        persistedQuery: {
          sha256Hash: hash,
          version: 1,
        },
      },
      variables: variables ?? {},
    }),
  });
  return res;
};
export const fetchFriends = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.FriendListQuery, language);
  const json = await res.json();
  const friends = json as GraphQLSuccessResponse<FriendListResult>;
  if (friends.errors) {
    throw new Error(friends.errors[0].message);
  }
  return friends.data;
};
export const fetchSummary = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.HistoryRecordQuery, language);
  const json = await res.json();
  const summary = json as GraphQLSuccessResponse<HistoryRecordResult>;
  if (summary.errors) {
    throw new Error(summary.errors[0].message);
  }
  return summary.data;
};
export const fetchCatalog = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.CatalogQuery, language);
  const json = await res.json();
  const catalog = json as GraphQLSuccessResponse<CatalogResult>;
  if (catalog.errors) {
    throw new Error(catalog.errors[0].message);
  }
  return catalog.data;
};

export const fetchWeaponRecords = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.WeaponRecordQuery, language);
  const json = await res.json();
  const weaponRecords = json as GraphQLSuccessResponse<WeaponRecordResult>;
  if (weaponRecords.errors) {
    throw new Error(weaponRecords.errors[0].message);
  }
  return weaponRecords.data;
};
export const fetchEquipments = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(
    bulletToken,
    RequestId.MyOutfitCommonDataEquipmentsQuery,
    language
  );
  const json = await res.json();
  const gears = json as GraphQLSuccessResponse<MyOutfitCommonDataEquipmentsResult>;
  if (gears.errors) {
    throw new Error(gears.errors[0].message);
  }
  return gears.data;
};

export const fetchDetailVotingStatus = async (
  id: string,
  bulletToken: string,
  language?: string
) => {
  const res = await fetchGraphQl<DetailVotingStatusVariables>(
    bulletToken,
    RequestId.DetailVotingStatusQuery,
    language,
    {
      festId: id,
    }
  );
  const json = await res.json();
  const detail = json as GraphQLSuccessResponse<DetailVotingStatusResult>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data;
};

export const fetchBattleHistories = async (bulletToken: string, language?: string) => {
  const [regularRes, anarchyRes, xRes, challengeRes, privateRes] = await Promise.all([
    fetchGraphQl(bulletToken, RequestId.RegularBattleHistoriesQuery, language),
    fetchGraphQl(bulletToken, RequestId.BankaraBattleHistoriesQuery, language),
    fetchGraphQl(bulletToken, RequestId.XBattleHistoriesQuery, language),
    fetchGraphQl(bulletToken, RequestId.EventBattleHistoriesQuery, language),
    fetchGraphQl(bulletToken, RequestId.PrivateBattleHistoriesQuery, language),
  ]);
  const [regularJson, anarchyJson, xJson, challengeJson, privateJson] = await Promise.all([
    regularRes.json(),
    anarchyRes.json(),
    xRes.json(),
    challengeRes.json(),
    privateRes.json(),
  ]);
  const histories = {
    regular: regularJson as GraphQLSuccessResponse<RegularBattleHistoriesResult>,
    anarchy: anarchyJson as GraphQLSuccessResponse<BankaraBattleHistoriesResult>,
    x: xJson as GraphQLSuccessResponse<XBattleHistoriesResult>,
    challenge: challengeJson as GraphQLSuccessResponse<EventBattleHistoriesResult>,
    private: privateJson as GraphQLSuccessResponse<PrivateBattleHistoriesResult>,
  };
  Object.values(histories).forEach((history) => {
    if (history.errors) {
      throw new Error(history.errors[0].message);
    }
  });
  return {
    regular: histories.regular.data,
    anarchy: histories.anarchy.data,
    x: histories.x.data,
    challenge: histories.challenge.data,
    private: histories.private.data,
  };
};
export const fetchVsHistoryDetail = async (id: string, bulletToken: string, language?: string) => {
  const res = await fetchGraphQl<VsHistoryDetailVariables>(
    bulletToken,
    RequestId.VsHistoryDetailQuery,
    language,
    {
      vsResultId: id,
    }
  );
  const json = await res.json();
  const detail = json as GraphQLSuccessResponse<VsHistoryDetailResult>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data;
};
export const fetchCoopResult = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.CoopHistoryQuery, language);
  const json = await res.json();
  const result = json as GraphQLSuccessResponse<CoopHistoryResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchCoopHistoryDetail = async (
  id: string,
  bulletToken: string,
  language?: string
) => {
  const res = await fetchGraphQl<CoopHistoryDetailVariables>(
    bulletToken,
    RequestId.CoopHistoryDetailQuery,
    language,
    {
      coopHistoryDetailId: id,
    }
  );
  const json = await res.json();
  const detail = json as GraphQLSuccessResponse<CoopHistoryDetailResult>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data;
};
