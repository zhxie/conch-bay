import * as Crypto from "expo-crypto";
import * as Random from "expo-random";
import JSSoup from "jssoup";
import { base64, base64url } from "./encode";
import { formUrlEncoded, getParam } from "./url";

const USER_AGENT = "Conch Bay/0.1.0";

let NSOAPP_VERSION = "2.3.1";
let WEB_VIEW_VERSION = "1.0.0-5644e7a2";

const fetchSchedules = async () => {
  const res = await fetch("https://splatoon3.ink/data/schedules.json", {
    headers: {
      "User-Agent": USER_AGENT,
    },
  });
  const json = await res.json();
  return json;
};

const updateNsoappVersion = async () => {
  const res = await fetch("https://apps.apple.com/us/app/nintendo-switch-online/id1234806557");
  const text = await res.text();

  const soup = new JSSoup(text);
  const tag = soup.find("p", { class: "whats-new__latest__version" });
  NSOAPP_VERSION = tag.getText().replace("Version ", "").trim();
};
const updateWebViewVersion = async () => {
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
  const match = regex.exec(text2);
  WEB_VIEW_VERSION = `${match[2]}-${match[1].substring(0, 8)}`;
};
const callIminkFApi = async (idToken, step) => {
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
  return json;
};
const generateLogIn = async () => {
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
const getSessionToken = async (url, cv) => {
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
  return json["session_token"];
};
const getWebServiceToken = async (sessionToken) => {
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
const getBulletToken = async (webServiceToken, country, language) => {
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
  return json["bulletToken"];
};

const fetchGraphQl = async (bulletToken, hash, language) => {
  const res = await fetch("https://api.lp1.av5ja.srv.nintendo.net/api/graphql", {
    method: "POST",
    headers: {
      "Accept-Language": language ?? "*",
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
      variables: {},
    }),
  });
  return res;
};
const checkBulletToken = async (bulletToken, language) => {
  try {
    const res = await fetchGraphQl(bulletToken, "dba47124d5ec3090c97ba17db5d2f4b3", language);
    return res.ok;
  } catch {
    return false;
  }
};
const fetchFriends = async (bulletToken, language) => {
  const res = await fetchGraphQl(bulletToken, "aa2c979ad21a1100170ddf6afea3e2db", language);
  const json = await res.json();
  return json;
};
const fetchSummary = async (bulletToken, language) => {
  const res = await fetchGraphQl(bulletToken, "9d4ef9fba3f84d6933bb1f6f436f7200", language);
  const json = await res.json();
  return json;
};

export {
  fetchSchedules,
  updateNsoappVersion,
  updateWebViewVersion,
  generateLogIn,
  getSessionToken,
  getWebServiceToken,
  getBulletToken,
  checkBulletToken,
  fetchFriends,
  fetchSummary,
};
