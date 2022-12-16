import * as Crypto from "expo-crypto";
import * as Random from "expo-random";
import JSSoup from "jssoup";
import {
  AnarchyBattleHistories,
  Catalog,
  CoopHistoryDetail,
  CoopResult,
  Friends,
  GraphQlResponse,
  PrivateBattleHistories,
  RegularBattleHistories,
  Schedules,
  Summary,
  VsHistoryDetail,
  XBattleHistories,
} from "../models";
import { base64, base64url } from "./encode";
import { formUrlEncoded, getParam } from "./url";

const USER_AGENT = "Conch Bay/0.1.0";

let NSOAPP_VERSION = "2.4.0";
let WEB_VIEW_VERSION = "2.0.0-bd36a652";

export const fetchSchedules = async () => {
  const res = await fetch("https://splatoon3.ink/data/schedules.json", {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });
  const json = await res.json();
  return (json as GraphQlResponse<Schedules>).data!;
};

export const updateNsoappVersion = async () => {
  const res = await fetch("https://apps.apple.com/us/app/nintendo-switch-online/id1234806557");
  const text = await res.text();

  const regex = />Version.+?([0-9|\.].+)</;
  const match = regex.exec(text)!;
  NSOAPP_VERSION = match[1];
};
export const updateWebViewVersion = async () => {
  const res = await fetch("https://api.lp1.av5ja.srv.nintendo.net");
  const text = await res.text();

  const soup = new JSSoup(text);
  const tags = soup.findAll("script");
  const src = tags.find((tag) => {
    if (typeof tag.attrs.src !== "string") {
      return false;
    }

    return tag.attrs.src.includes("static");
  }).attrs.src;

  const res2 = await fetch(`https://api.lp1.av5ja.srv.nintendo.net${src}`);
  const text2 = await res2.text();

  const regex = /([0-9a-f]{40}).*?revision_info_not_set.*?=`(.*?)-/;
  const match = regex.exec(text2)!;
  WEB_VIEW_VERSION = `${match[2]}-${match[1].substring(0, 8)}`;
};
const callIminkFApi = async (idToken: string, step: number) => {
  const res = await fetch("https://api.imink.app/f", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "User-Agent": USER_AGENT,
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
  const state = base64url(base64(Random.getRandomBytes(36)));
  const cv = base64url(base64(Random.getRandomBytes(32)));
  const cvHash = await Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, cv, {
    encoding: Crypto.CryptoEncoding.BASE64,
  });
  const codeChallenge = base64url(cvHash);

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
  const url = "https://accounts.nintendo.com/connect/1.0.0/authorize?" + new URLSearchParams(body);
  return {
    url: encodeURI(url),
    cv,
  };
};
export const getSessionToken = async (url: string, cv: string) => {
  const sessionTokenCode = getParam(url.replace("#", "?"), "session_token_code");
  const res = await fetch("https://accounts.nintendo.com/connect/1.0.0/api/session_token", {
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
  const res = await fetch("https://accounts.nintendo.com/connect/1.0.0/api/token", {
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
  const res2 = await fetch("https://api.accounts.nintendo.com/2.0.0/users/me", {
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
  const res4 = await fetch("https://api-lp1.znc.srv.nintendo.net/v3/Account/Login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": NSOAPP_VERSION,
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
  const res6 = await fetch("https://api-lp1.znc.srv.nintendo.net/v2/Game/GetWebServiceToken", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${idToken2}`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Platform": "Android",
      "X-ProductVersion": NSOAPP_VERSION,
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
  const res = await fetch("https://api.lp1.av5ja.srv.nintendo.net/api/bullet_tokens", {
    method: "POST",
    headers: {
      "Accept-Language": language ?? "*",
      Cookie: `_gtoken=${webServiceToken}`,
      "X-NACOUNTRY": country,
      "X-Web-View-Ver": WEB_VIEW_VERSION,
    },
  });
  const json = await res.json();
  return json["bulletToken"] as string;
};

const fetchGraphQl = async (
  bulletToken: string,
  hash: string,
  language?: string,
  variables?: Record<string, string>
) => {
  const res = await fetch("https://api.lp1.av5ja.srv.nintendo.net/api/graphql", {
    method: "POST",
    headers: {
      "Accept-Language": language || "*",
      Authorization: `Bearer ${bulletToken}`,
      "Content-Type": "application/json",
      "X-Web-View-Ver": WEB_VIEW_VERSION,
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
export const checkBulletToken = async (bulletToken: string, language?: string) => {
  try {
    const res = await fetchGraphQl(bulletToken, "dba47124d5ec3090c97ba17db5d2f4b3", language);
    return res.ok;
  } catch {
    return false;
  }
};
export const fetchFriends = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, "aa2c979ad21a1100170ddf6afea3e2db", language);
  const json = await res.json();
  const friends = json as GraphQlResponse<Friends>;
  if (friends.errors) {
    throw new Error(friends.errors[0].message);
  }
  return friends.data!;
};
export const fetchSummary = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, "32b6771f94083d8f04848109b7300af5", language);
  const json = await res.json();
  const summary = json as GraphQlResponse<Summary>;
  if (summary.errors) {
    throw new Error(summary.errors[0].message);
  }
  return summary.data!;
};
export const fetchCatalog = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, "52504060c81ff2f2d618c4e5377e6e7c", language);
  const json = await res.json();
  const catalog = json as GraphQlResponse<Catalog>;
  if (catalog.errors) {
    throw new Error(catalog.errors[0].message);
  }
  return catalog.data!;
};

export const fetchBattleHistories = async (bulletToken: string, language?: string) => {
  const [regularRes, anarchyRes, xRes, privateRes] = await Promise.all([
    fetchGraphQl(bulletToken, "d5b795d09e67ce153e622a184b7e7dfa", language),
    fetchGraphQl(bulletToken, "de4754588109b77dbcb90fbe44b612ee", language),
    fetchGraphQl(bulletToken, "45c74fefb45a49073207229ca65f0a62", language),
    fetchGraphQl(bulletToken, "1d6ed57dc8b801863126ad4f351dfb9a", language),
  ]);
  const [regularJson, anarchyJson, xJson, privateJson] = await Promise.all([
    regularRes.json(),
    anarchyRes.json(),
    xRes.json(),
    privateRes.json(),
  ]);
  const histories = {
    regular: regularJson as GraphQlResponse<RegularBattleHistories>,
    anarchy: anarchyJson as GraphQlResponse<AnarchyBattleHistories>,
    x: xJson as GraphQlResponse<XBattleHistories>,
    private: privateJson as GraphQlResponse<PrivateBattleHistories>,
  };
  Object.values(histories).forEach((history) => {
    if (history.errors) {
      throw new Error(history.errors[0].message);
    }
  });
  return {
    regular: histories.regular.data!,
    anarchy: histories.anarchy.data!,
    x: histories.x.data!,
    private: histories.private.data!,
  };
};
export const fetchVsHistoryDetail = async (id: string, bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, "291295ad311b99a6288fc95a5c4cb2d2", language, {
    vsResultId: id,
  });
  const json = await res.json();
  const detail = json as GraphQlResponse<VsHistoryDetail>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data!;
};
export const fetchCoopResult = async (bulletToken: string, language?: string) => {
  const res = await fetchGraphQl(bulletToken, "2fd21f270d381ecf894eb975c5f6a716", language);
  const json = await res.json();
  const result = json as GraphQlResponse<CoopResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data!;
};
export const fetchCoopHistoryDetail = async (
  id: string,
  bulletToken: string,
  language?: string
) => {
  const res = await fetchGraphQl(bulletToken, "9ade2aa3656324870ccec023636aed32", language, {
    coopHistoryDetailId: id,
  });
  const json = await res.json();
  const detail = json as GraphQlResponse<CoopHistoryDetail>;
  if (detail.errors) {
    throw new Error(detail.errors[0].message);
  }
  return detail.data!;
};
