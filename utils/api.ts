import Cookies from "@react-native-cookies/cookies";
import axios, { AxiosResponse } from "axios";
import Constants from "expo-constants";
import * as Crypto from "expo-crypto";
import {
  BankaraBattleHistoriesResult,
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
import { decode64, encode64, encode64Url } from "./codec";
import { sleep } from "./promise";

const AXIOS_TIMEOUT = 10000;
const AXIOS_F_TIMEOUT = 60000;
const AXIOS_F_RETRY = 2;
const AXIOS_TOKEN_TIMEOUT = 15000;
const USER_AGENT = `ConchBay/${Constants.expoConfig!.version!}`;

export const fetchReleaseVersion = async () => {
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
export const fetchSplatfests = async (region: string) => {
  const res = await fetch("https://splatoon3.ink/data/festivals.json", {
    headers: { "User-Agent": USER_AGENT },
  });
  const json = await res.json();
  return (json as FestivalsQuery)[region].data;
};
export const fetchXRankings = async (id: string) => {
  const res = await fetch(`https://splat.top/api/player/u-${id}`, {
    headers: { "User-Agent": USER_AGENT },
  });
  const json = await res.json();
  return json.length > 0;
};

let SPLATNET_VERSION = versions.SPLATNET_VERSION;
let NXAPI_ZNCA_API_NSO_VERSION: string | undefined;
const NSO_CLIENT_VERSION = "3.0.2";

export interface WebServiceToken {
  accessToken: string;
  country: string;
  language: string;
}

export const updateSplatnetVersion = async () => {
  // HACK: use jsDelivr to avoid any network issue in China Mainland.
  const res = await axios.get(
    "https://cdn.jsdelivr.net/gh/nintendoapis/nintendo-app-versions/data/splatnet3-app.json",
    { timeout: AXIOS_TIMEOUT },
  );

  SPLATNET_VERSION = res.data["web_app_ver"];
};

const validateAllStatus = () => {
  return true;
};
const retry = async (req: () => Promise<AxiosResponse>, attempt: number) => {
  while (true) {
    try {
      const res = await req();
      if (res.status < 400) {
        return res;
      }
      if (attempt <= 0) {
        return res;
      }
      attempt--;
    } catch (e) {
      if (attempt <= 0) {
        throw e;
      }
      attempt--;
    }
  }
};

const callNxapiZncaApiAuthenticate = async () => {
  try {
    const body = {
      client_id: "dzZNtWfQxWR_xNFcVijXPQ",
      grant_type: "client_credentials",
      scope: "ca:gf ca:er ca:dr",
    };
    const res = await axios.post(
      "https://nxapi-auth.fancy.org.uk/api/oauth/token",
      new URLSearchParams(body),
      {
        headers: {
          "User-Agent": USER_AGENT,
        },
        timeout: AXIOS_TIMEOUT,
        validateStatus: validateAllStatus,
      },
    );
    const accessToken = res.data["access_token"];
    if (!accessToken) {
      throw new Error(`${res.status}: ${JSON.stringify(res.data)}`);
    }
    return accessToken as string;
  } catch (e) {
    throw new Error(`/f/token: ${(e as Error).message}`);
  }
};
const callNxapiZncaApiDecrypt = async (accessToken: string, data: Uint8Array) => {
  try {
    const body = { data: encode64(data) };
    const res = await retry(
      async () =>
        await axios.post("https://nxapi-znca-api.fancy.org.uk/api/znca/decrypt-response", body, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": USER_AGENT,
            "X-znca-Client-Version": NSO_CLIENT_VERSION,
            "X-znca-Platform": "Android",
            "X-znca-Version": NXAPI_ZNCA_API_NSO_VERSION,
          },
          timeout: AXIOS_F_TIMEOUT,
          validateStatus: validateAllStatus,
        }),
      AXIOS_F_RETRY,
    );
    if (res.status !== 200) {
      throw new Error(`${res.status}: ${JSON.stringify(res.data)}`);
    }
    return res.data as any;
  } catch (e) {
    throw new Error(`/f/decrypt: ${(e as Error).message}`);
  }
};
const callNxapiZncaApiF = async (
  accessToken: string,
  step: number,
  idToken: string,
  encryptTokenRequest: { url: string; parameter: any },
  naId: string,
  coralUserId?: string,
) => {
  if (!NXAPI_ZNCA_API_NSO_VERSION) {
    const res = await axios.get("https://nxapi-znca-api.fancy.org.uk/api/znca/config", {
      headers: {
        "User-Agent": USER_AGENT,
      },
      timeout: AXIOS_TIMEOUT,
    });
    NXAPI_ZNCA_API_NSO_VERSION = res.data["nso_version"];
  }
  const body = {
    hash_method: step,
    token: idToken,
    encrypt_token_request: encryptTokenRequest,
    na_id: naId,
  };
  if (coralUserId) {
    body["coral_user_id"] = coralUserId;
  }
  try {
    const res = await retry(
      async () =>
        await axios.post("https://nxapi-znca-api.fancy.org.uk/api/znca/f", body, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": USER_AGENT,
            "X-znca-Client-Version": NSO_CLIENT_VERSION,
            "X-znca-Platform": "Android",
            "X-znca-Version": NXAPI_ZNCA_API_NSO_VERSION,
          },
          timeout: AXIOS_F_TIMEOUT,
          validateStatus: validateAllStatus,
        }),
      AXIOS_F_RETRY,
    );
    const encryptedTokenRequest = res.data["encrypted_token_request"];
    if (!encryptedTokenRequest) {
      // { error: string; error_message: string; errors: { error: string; error_message: string }[]; warnings: { error: string; error_message: string }[]; }
      throw new Error(`${res.status}: ${JSON.stringify(res.data)}`);
    }
    return {
      version: NXAPI_ZNCA_API_NSO_VERSION,
      encryptedTokenRequest: decode64(encryptedTokenRequest),
    } as {
      version: string;
      encryptedTokenRequest: Uint8Array;
    };
  } catch (e) {
    throw new Error(`/f/${step}: ${(e as Error).message}`);
  }
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
  const url =
    "https://accounts.nintendo.com/connect/1.0.0/authorize?" + new URLSearchParams(body).toString();
  return {
    url: encodeURI(url),
    cv,
  };
};
export const getSessionToken = async (url: string, cv: string) => {
  const sessionTokenCode = new URL(url.replace("#", "?")).searchParams.get("session_token_code");
  if (!sessionTokenCode) {
    return undefined;
  }
  const body = {
    client_id: "71b963c1b7b6d119",
    session_token_code: sessionTokenCode,
    session_token_code_verifier: cv,
  };
  try {
    const res = await axios.post(
      "https://accounts.nintendo.com/connect/1.0.0/api/session_token",
      body,
      {
        headers: {
          Accept: "application/json",
          "Accept-Encoding": "gzip",
          Connection: "Keep-Alive",
          "Content-Length": JSON.stringify(body).length,
          "Content-Type": "application/x-www-form-urlencoded",
          Host: "accounts.nintendo.com",
          "User-Agent":
            "Dalvik/2.1.0 (Linux; U; Android 11; sdk_gphone_arm64 Build/RSR1.210722.013.A6)",
        },
        timeout: AXIOS_TOKEN_TIMEOUT,
        validateStatus: validateAllStatus,
      },
    );
    const sessionToken = res.data["session_token"];
    if (!sessionToken) {
      // { error: string; error_description: string; }
      throw new Error(`${res.status}: ${JSON.stringify(res.data)}`);
    }
    return sessionToken as string;
  } catch (e) {
    throw new Error(`/api/session_token: ${(e as Error).message}`);
  }
};
export const getWebServiceToken = async (sessionToken: string) => {
  // Get tokens.
  const body = {
    client_id: "71b963c1b7b6d119",
    session_token: sessionToken,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token",
  };
  let accessToken: any, idToken: string;
  try {
    const res = await axios.post("https://accounts.nintendo.com/connect/1.0.0/api/token", body, {
      headers: {
        Accept: "application/json",
        "Accept-Encoding": "gzip",
        "Content-Length": JSON.stringify(body).length,
        "Content-Type": "application/json",
        Host: "accounts.nintendo.com",
        "User-Agent":
          "Dalvik/2.1.0 (Linux; U; Android 11; sdk_gphone_arm64 Build/RSR1.210722.013.A6)",
      },
      timeout: AXIOS_TOKEN_TIMEOUT,
      validateStatus: validateAllStatus,
    });
    accessToken = res.data["access_token"];
    idToken = res.data["id_token"];
    if (!accessToken || !idToken) {
      // { error: string; error_description: string; }
      throw new Error(`${res.status}: ${JSON.stringify(res.data)}`);
    }
  } catch (e) {
    throw new Error(`/api/token: ${(e as Error).message}`);
  }

  // Get user info.
  let birthday: any, language: any, country: any, id: any;
  try {
    const res2 = await axios.get("https://api.accounts.nintendo.com/2.0.0/users/me", {
      headers: {
        "Accept-Encoding": "gzip",
        "Accept-Language": "en-US",
        Accept: "application/json",
        Authorization: `Bearer ${accessToken}`,
        Connection: "Keep-Alive",
        "Content-Type": "application/json",
        Host: "api.accounts.nintendo.com",
        "User-Agent": "NASDKAPI; Android",
      },
      timeout: AXIOS_TOKEN_TIMEOUT,
      validateStatus: validateAllStatus,
    });
    birthday = res2.data["birthday"];
    language = res2.data["language"];
    country = res2.data["country"];
    id = res2.data["id"];
    if (!birthday || !language || !country || !id) {
      // { type: string; detail: string; instance: string; title: string; errorCode: string; status: number; }
      throw new Error(`${res2.status}: ${JSON.stringify(res2.data)}`);
    }
  } catch (e) {
    throw new Error(`/users/me: ${(e as Error).message}`);
  }

  // Authenticate nxapi-znca-api.
  const nxapiZncaApiAccessToken = await callNxapiZncaApiAuthenticate();

  // Generate login f.
  const json = await callNxapiZncaApiF(
    nxapiZncaApiAccessToken,
    1,
    idToken,
    {
      url: "https://api-lp1.znc.srv.nintendo.net/v3/Account/Login",
      parameter: {
        f: "",
        language: language,
        naBirthday: birthday,
        naCountry: country,
        naIdToken: idToken,
        requestId: "",
        timestamp: 0,
      },
    },
    id,
  );
  const { version, encryptedTokenRequest } = json;

  // Get access token.
  let idToken2: any, coralUserId: any;
  try {
    const res3 = await axios.post(
      "https://api-lp1.znc.srv.nintendo.net/v3/Account/Login",
      encryptedTokenRequest,
      {
        headers: {
          "Accept-Encoding": "gzip",
          "Content-Length": encryptedTokenRequest.length,
          "Content-Type": "application/octet-stream",
          "User-Agent": `com.nintendo.znca/${version}(Android/11)`,
          "X-Platform": "Android",
          "X-ProductVersion": version,
        },
        responseType: "arraybuffer",
        timeout: AXIOS_TOKEN_TIMEOUT,
        validateStatus: validateAllStatus,
      },
    );
    const json = await callNxapiZncaApiDecrypt(nxapiZncaApiAccessToken, new Uint8Array(res3.data));
    idToken2 = json["result"]?.["webApiServerCredential"]?.["accessToken"];
    coralUserId = json["result"]?.["user"]?.["id"];
    if (!idToken2 || !coralUserId) {
      // { status: number; errorMessage: string; correlationId: string; }
      throw new Error(`${res3.status}: ${JSON.stringify(res3.data)}`);
    }
  } catch (e) {
    throw new Error(`/Account/Login: ${(e as Error).message}`);
  }

  // Generate web service f.
  const json2 = await callNxapiZncaApiF(
    nxapiZncaApiAccessToken,
    2,
    idToken2,
    {
      url: "https://api-lp1.znc.srv.nintendo.net/v4/Game/GetWebServiceToken",
      parameter: {
        f: "",
        registrationToken: "",
        id: 4834290508791808,
        requestId: "",
        timestamp: 0,
      },
    },
    id,
    coralUserId.toString(),
  );
  const { encryptedTokenRequest: encryptedTokenRequest2 } = json2;

  // Get web service token.
  try {
    const res4 = await axios.post(
      "https://api-lp1.znc.srv.nintendo.net/v4/Game/GetWebServiceToken",
      encryptedTokenRequest2,
      {
        headers: {
          "Accept-Encoding": "gzip",
          Authorization: `Bearer ${idToken2}`,
          "Content-Length": encryptedTokenRequest2.length,
          "Content-Type": "application/octet-stream",
          "User-Agent": `com.nintendo.znca/${version}(Android/11)`,
          "X-Platform": "Android",
          "X-ProductVersion": version,
        },
        responseType: "arraybuffer",
        timeout: AXIOS_TOKEN_TIMEOUT,
        validateStatus: validateAllStatus,
      },
    );
    const json = await callNxapiZncaApiDecrypt(nxapiZncaApiAccessToken, new Uint8Array(res4.data));
    const accessToken = json["result"]?.["accessToken"];
    if (!accessToken) {
      // { status: number; errorMessage: string; correlationId: string; }
      throw new Error(`${res4.status}: ${JSON.stringify(res4.data)}`);
    }
    return { accessToken, country, language };
  } catch (e) {
    throw new Error(`/Game/GetWebServiceToken: ${(e as Error).message}`);
  }
};
export const getBulletToken = async (webServiceToken: WebServiceToken, language: string) => {
  await Cookies.clearAll();
  await Cookies.flush();
  try {
    const res = await axios.post(
      "https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens",
      undefined,
      {
        headers: {
          Accept: "*/*",
          "Accept-Encoding": "gzip, deflate",
          "Accept-Language": language,
          "Content-Length": 0,
          "Content-Type": "application/json",
          Cookie: `_gtoken=${webServiceToken.accessToken}; _dnt=1`,
          Origin: "https://api.lp1.av5ja.srv.nintendo.net",
          Referer: `https://api.lp1.av5ja.srv.nintendo.net/?lang=${language}&na_country=${webServiceToken.country}&na_lang=${webServiceToken.language}`,
          "Sec-Fetch-Dest": "empty",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Site": "same-origin",
          "User-Agent":
            "Mozilla/5.0 (Linux; Android 11; sdk_gphone_arm64 Build/RSR1.210722.013.A6; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36",
          "X-NACOUNTRY": webServiceToken.country,
          "X-Requested-With": "com.nintendo.znca",
          "X-Web-View-Ver": SPLATNET_VERSION,
        },
        timeout: AXIOS_TOKEN_TIMEOUT,
        validateStatus: validateAllStatus,
      },
    );
    if (res.status >= 400) {
      throw new Error(res.status.toString());
    }
    return res.data["bulletToken"] as string;
  } catch (e) {
    throw new Error(`/api/bullet_tokens: ${(e as Error).message}`);
  }
};

const fetchGraphQl = async <T>(
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
  hash: string,
  variables?: T,
) => {
  const body = {
    extensions: {
      persistedQuery: {
        sha256Hash: hash,
        version: 1,
      },
    },
    variables: variables ?? {},
  };
  await sleep(Math.floor(Math.random() * 100));
  const res = await axios.post("https://api.lp1.av5ja.srv.nintendo.net/api/graphql", body, {
    headers: {
      Accept: "*/*",
      "Accept-Encoding": "gzip, deflate",
      "Accept-Language": language,
      Authorization: `Bearer ${bulletToken}`,
      "Content-Length": JSON.stringify(body).length,
      "Content-Type": "application/json",
      Cookie: `_gtoken=${webServiceToken.accessToken}; _dnt=1`,
      Origin: "https://api.lp1.av5ja.srv.nintendo.net",
      Referer: `https://api.lp1.av5ja.srv.nintendo.net/?lang=${language}&na_country=${webServiceToken.country}&na_lang=${webServiceToken.language}`,
      "Sec-Fetch-Dest": "empty",
      "Sec-Fetch-Mode": "cors",
      "Sec-Fetch-Site": "same-origin",
      "User-Agent":
        "Mozilla/5.0 (Linux; Android 11; sdk_gphone_arm64 Build/RSR1.210722.013.A6; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/91.0.4472.114 Mobile Safari/537.36",
      "X-Requested-With": "com.nintendo.znca",
      "X-Web-View-Ver": SPLATNET_VERSION,
    },
  });
  return res;
};
export const fetchFriends = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(webServiceToken, bulletToken, language, RequestId.FriendListQuery);
  const friends = res.data as GraphQLSuccessResponse<FriendListResult>;
  if (friends.errors) {
    throw new Error(friends.errors[0].message);
  }
  return friends.data;
};
export const fetchSummary = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.HistoryRecordQuery,
  );
  const summary = res.data as GraphQLSuccessResponse<HistoryRecordResult>;
  if (summary.errors) {
    throw new Error(summary.errors[0].message);
  }
  return summary.data;
};

export const fetchWeaponRecords = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.WeaponRecordQuery,
  );
  const weaponRecords = res.data as GraphQLSuccessResponse<WeaponRecordResult>;
  if (weaponRecords.errors) {
    throw new Error(weaponRecords.errors[0].message);
  }
  return weaponRecords.data;
};
export const fetchEquipments = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.MyOutfitCommonDataEquipmentsQuery,
  );
  const gears = res.data as GraphQLSuccessResponse<MyOutfitCommonDataEquipmentsResult>;
  if (gears.errors) {
    throw new Error(gears.errors[0].message);
  }
  return gears.data;
};

export const fetchDetailVotingStatus = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
  id: string,
) => {
  const res = await fetchGraphQl<DetailVotingStatusVariables>(
    webServiceToken,
    bulletToken,
    language,
    RequestId.DetailVotingStatusQuery,
    {
      festId: id,
    },
  );
  const detail = res.data as GraphQLSuccessResponse<DetailVotingStatusResult>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data;
};

export const fetchLatestBattleHistories = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.LatestBattleHistoriesQuery,
  );
  const result = res.data as GraphQLSuccessResponse<LatestBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchRegularBattleHistories = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.RegularBattleHistoriesQuery,
  );
  const result = res.data as GraphQLSuccessResponse<RegularBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchAnarchyBattleHistories = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.BankaraBattleHistoriesQuery,
  );
  const result = res.data as GraphQLSuccessResponse<BankaraBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchXBattleHistories = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.XBattleHistoriesQuery,
  );
  const result = res.data as GraphQLSuccessResponse<XBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchChallengeHistories = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.EventBattleHistoriesQuery,
  );
  const result = res.data as GraphQLSuccessResponse<EventBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchPrivateBattleHistories = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.PrivateBattleHistoriesQuery,
  );
  const result = res.data as GraphQLSuccessResponse<PrivateBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchVsHistoryDetail = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
  id: string,
) => {
  const res = await fetchGraphQl<VsHistoryDetailVariables>(
    webServiceToken,
    bulletToken,
    language,
    RequestId.VsHistoryDetailQuery,
    {
      vsResultId: id,
    },
  );
  const detail = res.data as GraphQLSuccessResponse<VsHistoryDetailResult>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data;
};
export const fetchCoopResult = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.CoopHistoryQuery,
  );
  const result = res.data as GraphQLSuccessResponse<CoopHistoryResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchCoopHistoryDetail = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
  id: string,
) => {
  const res = await fetchGraphQl<CoopHistoryDetailVariables>(
    webServiceToken,
    bulletToken,
    language,
    RequestId.CoopHistoryDetailQuery,
    {
      coopHistoryDetailId: id,
    },
  );
  const detail = res.data as GraphQLSuccessResponse<CoopHistoryDetailResult>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data;
};
