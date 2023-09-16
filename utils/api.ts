import axios from "axios";
import Constants, { AppOwnership } from "expo-constants";
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
import { encode64, encode64Url, getParam, parameterize } from "./codec";

const AXIOS_TIMEOUT = 10000;
const AXIOS_TOKEN_TIMEOUT = 15000;
const USER_AGENT = `ConchBay/${Constants.expoConfig!.version!}`;

export const fetchAppStoreVersion = async () => {
  const res = await axios.get("https://itunes.apple.com/lookup?id=1659268579", {
    timeout: AXIOS_TIMEOUT,
  });
  return res.data["results"][0]["version"];
};
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
export const fetchSplatfests = async () => {
  const res = await fetch("https://splatoon3.ink/data/festivals.json", {
    headers: { "User-Agent": USER_AGENT },
  });
  const json = await res.json();
  return (json as FestivalsQuery).US.data;
};

let NSO_VERSION = versions.NSO_VERSION;
let SPLATNET_VERSION = versions.SPLATNET_VERSION;

export interface WebServiceToken {
  accessToken: string;
  country: string;
  language: string;
}

export const updateNsoVersion = async () => {
  // HACK: use jsDelivr to avoid any network issue in China Mainland.
  const res = await axios.get(
    "https://cdn.jsdelivr.net/gh/nintendoapis/nintendo-app-versions/data/coral-google-play.json",
    {
      timeout: AXIOS_TIMEOUT,
    }
  );

  NSO_VERSION = res.data["version"];
};
export const updateSplatnetVersion = async () => {
  // HACK: use jsDelivr to avoid any network issue in China Mainland.
  const res = await axios.get(
    "https://cdn.jsdelivr.net/gh/nintendoapis/nintendo-app-versions/data/splatnet3-app.json",
    { timeout: AXIOS_TIMEOUT }
  );

  SPLATNET_VERSION = res.data["web_app_ver"];
};
export const getCurrentVersions = () => {
  return {
    NSO_VERSION,
    SPLATNET_VERSION,
  };
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
  const body = {
    client_id: "71b963c1b7b6d119",
    session_token_code: sessionTokenCode,
    session_token_code_verifier: cv,
  };
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
    }
  );
  return res.data["session_token"] as string;
};
export const getWebServiceToken = async (sessionToken: string) => {
  // Get tokens.
  const body = {
    client_id: "71b963c1b7b6d119",
    session_token: sessionToken,
    grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer-session-token",
  };
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
  });
  const { access_token: accessToken, id_token: idToken } = res.data;
  if (!accessToken || !idToken) {
    throw new Error(`/api/token: ${JSON.stringify(res.data)}`);
  }

  // Get user info.
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
  });
  const { birthday, language, country, id } = res2.data;
  if (!birthday || !language || !country || !id) {
    throw new Error(`/users/me: ${JSON.stringify(res2.data)}`);
  }

  const callApis = [callIminkFApi, callNxapiZncaApi];
  let error: unknown = undefined;
  for (const callApi of callApis) {
    try {
      // Get access token.
      const json = await callApi(1, idToken, id);
      const { f, request_id: requestId, timestamp } = json;
      if (!f || !requestId || !timestamp) {
        throw new Error(`/f: ${JSON.stringify(json)}`);
      }
      const body3 = {
        parameter: {
          f: f,
          language: language,
          naBirthday: birthday,
          naCountry: country,
          naIdToken: idToken,
          requestId: requestId,
          timestamp: timestamp,
        },
      };
      const res3 = await axios.post(
        "https://api-lp1.znc.srv.nintendo.net/v3/Account/Login",
        body3,
        {
          headers: {
            "Accept-Encoding": "gzip",
            "Content-Length": JSON.stringify(body3).length,
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": `com.nintendo.znca/${NSO_VERSION}(Android/11)`,
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

      // Get web service token.
      const json2 = await callApi(2, idToken2, id, coralUserId.toString());
      const { f: f2, request_id: requestId2, timestamp: timestamp2 } = json2;
      if (!f2 || !requestId2 || !timestamp2) {
        throw new Error(`/f: ${JSON.stringify(json)}`);
      }
      const body4 = {
        parameter: {
          f: f2,
          id: 4834290508791808,
          registrationToken: "",
          requestId: requestId2,
          timestamp: timestamp2,
        },
      };
      const res4 = await axios.post(
        "https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken",
        body4,
        {
          headers: {
            "Accept-Encoding": "gzip",
            Authorization: `Bearer ${idToken2}`,
            "Content-Length": JSON.stringify(body4).length,
            "Content-Type": "application/json; charset=utf-8",
            "User-Agent": `com.nintendo.znca/${NSO_VERSION}(Android/11)`,
            "X-Platform": "Android",
            "X-ProductVersion": NSO_VERSION,
          },
          timeout: AXIOS_TOKEN_TIMEOUT,
        }
      );
      if (!res4.data["result"]?.["accessToken"]) {
        throw new Error(`/Game/GetWebServiceToken: ${JSON.stringify(res4.data)}`);
      }
      const accessToken = res4.data["result"]["accessToken"];
      return { accessToken, country, language };
    } catch (e) {
      // Throw the first error which would be an error using imink f API.
      if (error === undefined) {
        error = e;
      } else {
        throw error;
      }
    }
  }
  throw new Error("unreachable");
};
export const getBulletToken = async (webServiceToken: WebServiceToken, language: string) => {
  if (Constants.appOwnership !== AppOwnership.Expo) {
    // HACK: dynamic import the library.
    const Cookies = await import("@react-native-cookies/cookies");
    await Cookies.default.clearAll();
    await Cookies.default.flush();
  }
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
    }
  );
  return res.data["bulletToken"] as string;
};

const fetchGraphQl = async <T>(
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string,
  hash: string,
  variables?: T
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
  language: string
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.HistoryRecordQuery
  );
  const summary = res.data as GraphQLSuccessResponse<HistoryRecordResult>;
  if (summary.errors) {
    throw new Error(summary.errors[0].message);
  }
  return summary.data;
};
export const fetchCatalog = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string
) => {
  const res = await fetchGraphQl(webServiceToken, bulletToken, language, RequestId.CatalogQuery);
  const catalog = res.data as GraphQLSuccessResponse<CatalogResult>;
  if (catalog.errors) {
    throw new Error(catalog.errors[0].message);
  }
  return catalog.data;
};

export const fetchWeaponRecords = async (
  webServiceToken: WebServiceToken,
  bulletToken: string,
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.WeaponRecordQuery
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.MyOutfitCommonDataEquipmentsQuery
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
  id: string
) => {
  const res = await fetchGraphQl<DetailVotingStatusVariables>(
    webServiceToken,
    bulletToken,
    language,
    RequestId.DetailVotingStatusQuery,
    {
      festId: id,
    }
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.LatestBattleHistoriesQuery
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.RegularBattleHistoriesQuery
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.BankaraBattleHistoriesQuery
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.XBattleHistoriesQuery
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.EventBattleHistoriesQuery
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.PrivateBattleHistoriesQuery
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
  id: string
) => {
  const res = await fetchGraphQl<VsHistoryDetailVariables>(
    webServiceToken,
    bulletToken,
    language,
    RequestId.VsHistoryDetailQuery,
    {
      vsResultId: id,
    }
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
  language: string
) => {
  const res = await fetchGraphQl(
    webServiceToken,
    bulletToken,
    language,
    RequestId.CoopHistoryQuery
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
  id: string
) => {
  const res = await fetchGraphQl<CoopHistoryDetailVariables>(
    webServiceToken,
    bulletToken,
    language,
    RequestId.CoopHistoryDetailQuery,
    {
      coopHistoryDetailId: id,
    }
  );
  const detail = res.data as GraphQLSuccessResponse<CoopHistoryDetailResult>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data;
};
