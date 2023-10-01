import axios from "axios";
import Constants, { AppOwnership } from "expo-constants";
import {
  BankaraBattleHistoriesResult,
  CatalogResult,
  CoopHistoryDetailResult,
  CoopHistoryDetailVariables,
  CoopHistoryResult,
  EventBattleHistoriesResult,
  GraphQLSuccessResponse,
  HistoryRecordResult,
  LatestBattleHistoriesResult,
  PrivateBattleHistoriesResult,
  RegularBattleHistoriesResult,
  RequestId,
  SchedulesQuery,
  ShopQuery,
  VsHistoryDetailResult,
  VsHistoryDetailVariables,
  XBattleHistoriesResult,
} from "../models/types";
import { sleep } from "./promise";

const AXIOS_TIMEOUT = 10000;
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

export const clearCookies = async () => {
  if (Constants.appOwnership !== AppOwnership.Expo) {
    // HACK: dynamic import the library.
    const Cookies = await import("@react-native-cookies/cookies");
    await Cookies.default.clearAll();
    await Cookies.default.flush();
  }
};

const fetchGraphQl = async <T>(headers: Record<string, string>, hash: string, variables?: T) => {
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
    headers,
  });
  return res;
};
export const fetchSummary = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.HistoryRecordQuery);
  const summary = res.data as GraphQLSuccessResponse<HistoryRecordResult>;
  if (summary.errors) {
    throw new Error(summary.errors[0].message);
  }
  return summary.data;
};
export const fetchCatalog = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.CatalogQuery);
  const catalog = res.data as GraphQLSuccessResponse<CatalogResult>;
  if (catalog.errors) {
    throw new Error(catalog.errors[0].message);
  }
  return catalog.data;
};

export const fetchLatestBattleHistories = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.LatestBattleHistoriesQuery);
  const result = res.data as GraphQLSuccessResponse<LatestBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchRegularBattleHistories = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.RegularBattleHistoriesQuery);
  const result = res.data as GraphQLSuccessResponse<RegularBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchAnarchyBattleHistories = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.BankaraBattleHistoriesQuery);
  const result = res.data as GraphQLSuccessResponse<BankaraBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchXBattleHistories = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.XBattleHistoriesQuery);
  const result = res.data as GraphQLSuccessResponse<XBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchChallengeHistories = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.EventBattleHistoriesQuery);
  const result = res.data as GraphQLSuccessResponse<EventBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchPrivateBattleHistories = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.PrivateBattleHistoriesQuery);
  const result = res.data as GraphQLSuccessResponse<PrivateBattleHistoriesResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchVsHistoryDetail = async (headers: Record<string, string>, id: string) => {
  const res = await fetchGraphQl<VsHistoryDetailVariables>(
    headers,
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
export const fetchCoopResult = async (headers: Record<string, string>) => {
  const res = await fetchGraphQl(headers, RequestId.CoopHistoryQuery);
  const result = res.data as GraphQLSuccessResponse<CoopHistoryResult>;
  if (result.errors) {
    throw new Error(result.errors[0].message);
  }
  return result.data;
};
export const fetchCoopHistoryDetail = async (headers: Record<string, string>, id: string) => {
  const res = await fetchGraphQl<CoopHistoryDetailVariables>(
    headers,
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
