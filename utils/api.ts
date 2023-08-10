import axios from "axios";
import Constants from "expo-constants";
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
  LatestBattleHistoriesResult,
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
import versions from "../models/versions.json";
import { encode64, encode64Url } from "./codec";
import { getParam, parameterize } from "./url";

const AXIOS_TIMEOUT = 10000;
const AXIOS_TOKEN_TIMEOUT = 15000;
const USER_AGENT = `ConchBay/${Constants.expoConfig!.version!}`;

export const fetchLatestVersion = async () => {
  const res = await axios.get("https://api.github.com/repos/zhxie/conch-bay/releases", {
    timeout: AXIOS_TIMEOUT,
  });
  return res.data.find((release) => !release["prerelease"])["tag_name"];
};

export const fetchSchedules = async () => {
  const res = await fetch("https://splatoon3.ink/data/schedules.json", {
    headers: { "User-Agent": USER_AGENT },
  });
  const json = await res.json();
  return (json as SchedulesQuery).data;
};
export const fetchShop = async () => {
  const res = await fetch("https://splatoon3.ink/data/gear.json", {
    headers: { "User-Agent": USER_AGENT },
  });
  const json = await res.json();
  return (json as ShopQuery).data;
};
export const fetchSplatfests = async () => {
  const res = await fetch("https://splatoon3.ink/data/festivals.json", {
    headers: { "User-Agent": USER_AGENT },
  });
  const json = await res.json();
  return (json as FestivalsQuery).US.data;
};

let NSO_VERSION = versions.NSO_VERSION;
let SPLATNET_VERSION = versions.SPLATNET_VERSION;

export const updateNsoVersion = async () => {
  // TODO: use Google Play version instead since f API is built upon Android apps.
  const res = await axios.get("https://itunes.apple.com/lookup?id=1234806557", {
    timeout: AXIOS_TIMEOUT,
  });

  NSO_VERSION = res.data["results"][0]["version"];
};
export const updateSplatnetVersion = async () => {
  // HACK: use jsDelivr to avoid any network issues in China Mainland.
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
    headers: { "Content-Type": "application/json; charset=utf-8", "User-Agent": USER_AGENT },
    timeout: AXIOS_TOKEN_TIMEOUT,
  });
  return res.data as { f: string; request_id: string; timestamp: string };
};
const callNxapiZncaApi = async (
  step: number,
  idToken: string,
  naId: string,
  coralUserId?: string
) => {
  const body = {
    hash_method: step,
    token: idToken,
    na_id: naId,
  };
  if (coralUserId) {
    body["coral_user_id"] = coralUserId;
  }
  const res = await axios.post("https://nxapi-znca-api.fancy.org.uk/api/znca/f", body, {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": USER_AGENT,
      "X-znca-Platform": "Android",
      "X-znca-Version": NSO_VERSION,
    },
    timeout: AXIOS_TOKEN_TIMEOUT,
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
      timeout: AXIOS_TOKEN_TIMEOUT,
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
      timeout: AXIOS_TOKEN_TIMEOUT,
    }
  );
  const { access_token: accessToken, id_token: idToken } = res.data;
  if (!accessToken || !idToken) {
    throw new Error(`/api/token: ${JSON.stringify(res.data)}`);
  }

  // Get user info.
  const res2 = await axios.get("https://api.accounts.nintendo.com/2.0.0/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Host: "api.accounts.nintendo.com",
    },
    timeout: AXIOS_TOKEN_TIMEOUT,
  });
  const { birthday, language, country, id } = res2.data;
  if (!birthday || !language || !country || !id) {
    throw new Error(`/users/me: ${JSON.stringify(res2.data)}`);
  }

  const callApis = [callIminkFApi, callNxapiZncaApi];
  let f = "",
    requestId = "",
    timestamp = "";
  let error: unknown = undefined;
  for (const callApi of callApis) {
    try {
      const json = await callApi(1, idToken, id);
      f = json["f"];
      requestId = json["request_id"];
      timestamp = json["timestamp"];
      if (!f || !requestId || !timestamp) {
        f = "";
        requestId = "";
        timestamp = "";
        throw new Error(`/f: ${JSON.stringify(json)}`);
      }
      break;
    } catch (e) {
      // Throw the first error which would be an error using imink f API.
      if (error === undefined) {
        error = e;
      } else {
        throw error;
      }
    }
  }

  // Get access token.
  const res3 = await axios.post(
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
      timeout: AXIOS_TOKEN_TIMEOUT,
    }
  );
  const idToken2 = res3.data["result"]?.["webApiServerCredential"]?.["accessToken"];
  const coralUserId = res3.data["result"]?.["user"]?.["id"];
  if (!idToken2 || !coralUserId) {
    throw new Error(`/Account/Login: ${JSON.stringify(res3.data)}`);
  }

  let f2 = "",
    requestId2 = "",
    timestamp2 = "";
  error = undefined;
  for (const callApi of callApis) {
    try {
      const json = await callApi(2, idToken2, id, coralUserId.toString());
      f2 = json["f"];
      requestId2 = json["request_id"];
      timestamp2 = json["timestamp"];
      if (!f2 || !requestId2 || !timestamp2) {
        f2 = "";
        requestId2 = "";
        timestamp2 = "";
        throw new Error(`/f: ${JSON.stringify(json)}`);
      }
      break;
    } catch (e) {
      // Throw the first error which would be an error using imink f API.
      if (error === undefined) {
        error = e;
      } else {
        throw error;
      }
    }
  }

  // Get web service token.
  const res4 = await axios.post(
    "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken",
    {
      parameter: {
        f: f2,
        id: 4834290508791808,
        registrationToken: "",
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
      timeout: AXIOS_TOKEN_TIMEOUT,
    }
  );
  if (!res4.data["result"]?.["accessToken"]) {
    throw new Error(`/Game/GetWebServiceToken: ${JSON.stringify(res4.data)}`);
  }
  const webServiceToken = res4.data["result"]["accessToken"];
  return { webServiceToken, country, language };
};
export const getBulletToken = async (webServiceToken: string, language?: string) => {
  const res = await axios.post(
    "https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens",
    undefined,
    {
      headers: {
        "Accept-Language": language ?? "*",
        Cookie: `_gtoken=${webServiceToken}`,
        "X-Web-View-Ver": SPLATNET_VERSION,
      },
      timeout: AXIOS_TOKEN_TIMEOUT,
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

export const fetchLatestBattleHistories = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.LatestBattleHistoriesQuery, language);
  const json = await res.json();
  const result = json as GraphQLSuccessResponse<LatestBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchRegularBattleHistories = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.RegularBattleHistoriesQuery, language);
  const json = await res.json();
  const result = json as GraphQLSuccessResponse<RegularBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchAnarchyBattleHistories = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.BankaraBattleHistoriesQuery, language);
  const json = await res.json();
  const result = json as GraphQLSuccessResponse<BankaraBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchXBattleHistories = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.XBattleHistoriesQuery, language);
  const json = await res.json();
  const result = json as GraphQLSuccessResponse<XBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchChallengeHistories = async (bulletToken: string, language?: string) => {
  // HACK: update query to 4.0.0-22ddb0fd.
  const res = await fetchGraphQl(bulletToken, "e7bbaf1fa255305d607351da434b2d0f", language);
  const json = await res.json();
  const result = json as GraphQLSuccessResponse<EventBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchPrivateBattleHistories = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, RequestId.PrivateBattleHistoriesQuery, language);
  const json = await res.json();
  const result = json as GraphQLSuccessResponse<PrivateBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
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
  // HACK: update query to 4.0.0-22ddb0fd.
  const res = await fetchGraphQl(bulletToken, "01fb9793ad92f91892ea713410173260", language);
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
