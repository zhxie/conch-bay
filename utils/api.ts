import { fromByteArray as encode64 } from "base64-js";
import * as Crypto from "expo-crypto";
import pRetry from "p-retry";
import {
  BankaraBattleHistoriesResult,
  CatalogResult,
  CoopHistoryDetailResult,
  CoopHistoryDetailVariables,
  CoopHistoryResult,
  FriendListResult,
  GraphQLSuccessResponse,
  HistoryRecordResult,
  MyOutfitCommonDataEquipmentsResult,
  PrivateBattleHistoriesResult,
  RegularBattleHistoriesResult,
  RequestId,
  StageScheduleResult,
  VsHistoryDetailResult,
  VsHistoryDetailVariables,
  WeaponRecordResult,
  XBattleHistoriesResult,
} from "../models/types";
import { encode64Url } from "./codec";
import { formUrlEncoded, getParam, parameterize } from "./url";

let NSO_VERSION = "2.5.0";
let SPLATNET_VERSION = "3.0.0-0742bda0";

// https://stackoverflow.com/a/54208009.
const fetchTimeout = async (input: RequestInfo, init: RequestInit | undefined, timeout: number) => {
  return Promise.race([
    fetch(input, init),
    new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout)),
  ]);
};
const fetchRetry = async (input: RequestInfo, init?: RequestInit) => {
  return await pRetry(
    async () => {
      // TODO: the timeout should be tuned since it is too long to wait for.
      return await fetchTimeout(input, init, 60000);
    },
    { retries: 3 }
  );
};
export const fetchSchedules = async () => {
  const res = await fetchRetry("https://splatoon3.ink/data/schedules.json", {});
  const json = await res.json();
  return (json as GraphQLSuccessResponse<StageScheduleResult>).data;
};

export const updateNsoVersion = async () => {
  const res = await fetchRetry("https://itunes.apple.com/lookup?id=1234806557");
  const json = await res.json();

  NSO_VERSION = json["results"][0]["version"];
};
export const updateSplatnetVersion = async () => {
  const res = await fetchRetry(
    "https://raw.fastgit.org/nintendoapis/nintendo-app-versions/main/data/splatnet3-app.json"
  );
  const json = await res.json();

  SPLATNET_VERSION = json["web_app_ver"];
};
const callIminkFApi = async (idToken: string, step: number) => {
  const res = await fetchRetry("https://api.imink.app/f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
    body: JSON.stringify({
      token: idToken,
      hashMethod: step,
    }),
  });
  const json = await res.json();
  return json as { f: string; request_id: string; timestamp: string };
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
  const res = await fetchRetry("https://accounts.nintendo.com/connect/1.0.0/api/session_token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Host: "accounts.nintendo.com",
    },
    body: formUrlEncoded({
      client_id: "71b963c1b7b6d119",
      session_token_code: sessionTokenCode,
      session_token_code_verifier: cv,
    }),
  });
  const json = await res.json();
  return json["session_token"] as string;
};
export const getWebServiceToken = async (sessionToken: string) => {
  // Get tokens.
  const res = await fetchRetry("https://accounts.nintendo.com/connect/1.0.0/api/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Host: "accounts.nintendo.com",
    },
    body: JSON.stringify({
      client_id: "71b963c1b7b6d119",
      session_token: sessionToken,
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token",
    }),
  });
  const json = await res.json();
  const { access_token: accessToken, id_token: idToken } = json;

  // Get user info.
  const res2 = await fetchRetry("https://api.accounts.nintendo.com/2.0.0/users/me", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      Host: "api.accounts.nintendo.com",
    },
  });
  const json2 = await res2.json();
  const { birthday, language, country } = json2;

  // Get access token.
  const json3 = await callIminkFApi(idToken, 1);
  const { f, request_id: requestId, timestamp } = json3;
  const res4 = await fetchRetry("https://api-lp1.znc.srv.nintendo.net/v3/Account/Login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": NSO_VERSION,
    },
    body: JSON.stringify({
      parameter: {
        f: f,
        language: language,
        naBirthday: birthday,
        naCountry: country,
        naIdToken: idToken,
        requestId: requestId,
        timestamp: timestamp,
      },
    }),
  });
  const json4 = await res4.json();
  const idToken2 = json4["result"]["webApiServerCredential"]["accessToken"];

  // Get web service token.
  const json5 = await callIminkFApi(idToken2, 2);
  const { f: f2, request_id: requestId2, timestamp: timestamp2 } = json5;
  const res6 = await fetchRetry("https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken2}`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": NSO_VERSION,
    },
    body: JSON.stringify({
      parameter: {
        f: f2,
        id: 4834290508791808,
        registrationToken: idToken2,
        requestId: requestId2,
        timestamp: timestamp2,
      },
    }),
  });
  const json6 = await res6.json();
  const webServiceToken = json6["result"]["accessToken"];
  return { webServiceToken, country, language };
};
export const getBulletToken = async (
  webServiceToken: string,
  country: string,
  language?: string
) => {
  const res = await fetchRetry("https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens", {
    method: "POST",
    headers: {
      "Accept-Language": language ?? "*",
      Cookie: `_gtoken=${webServiceToken}`,
      "X-NACOUNTRY": country,
      "X-Web-View-Ver": SPLATNET_VERSION,
    },
  });
  const json = await res.json();
  return json["bulletToken"] as string;
};

const fetchGraphQl = async <T>(
  bulletToken: string,
  hash: string,
  language?: string,
  variables?: T
) => {
  const res = await fetchRetry("https://api.lp1.av5ja.srv.nintendo.net/api/graphql", {
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

export const fetchBattleHistories = async (bulletToken: string, language?: string) => {
  const [regularRes, anarchyRes, xRes, privateRes] = await Promise.all([
    fetchGraphQl(bulletToken, RequestId.RegularBattleHistoriesQuery, language),
    fetchGraphQl(bulletToken, RequestId.BankaraBattleHistoriesQuery, language),
    fetchGraphQl(bulletToken, RequestId.XBattleHistoriesQuery, language),
    fetchGraphQl(bulletToken, RequestId.PrivateBattleHistoriesQuery, language),
  ]);
  const [regularJson, anarchyJson, xJson, privateJson] = await Promise.all([
    regularRes.json(),
    anarchyRes.json(),
    xRes.json(),
    privateRes.json(),
  ]);
  const histories = {
    regular: regularJson as GraphQLSuccessResponse<RegularBattleHistoriesResult>,
    anarchy: anarchyJson as GraphQLSuccessResponse<BankaraBattleHistoriesResult>,
    x: xJson as GraphQLSuccessResponse<XBattleHistoriesResult>,
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
