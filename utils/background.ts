import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import t from "../i18n";
import {
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchLatestBattleHistories,
  fetchVsHistoryDetail,
  getBulletToken,
  getWebServiceToken,
} from "./api";
import { decode64String, encode64String } from "./codec";
import * as Database from "./database";
import { ok } from "./promise";

const BACKGROUND_REFRESH_RESULTS_TASK = "background-refresh-results";

const notify = async (title: string, body: string) => {
  await Notifications.scheduleNotificationAsync({
    content: {
      title,
      body,
    },
    trigger: {
      seconds: 1,
    },
  });
};

TaskManager.defineTask(BACKGROUND_REFRESH_RESULTS_TASK, async ({ error }) => {
  if (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  try {
    // Check previous token.
    let bulletToken = "";
    const webServiceToken = await AsyncStorage.getItem("webServiceToken");
    if (webServiceToken) {
      bulletToken = await getBulletToken(webServiceToken).catch((_) => "");
    }

    // Reacquire tokens.
    if (bulletToken.length === 0) {
      const sessionToken = await AsyncStorage.getItem("sessionToken");
      if (!sessionToken || sessionToken.length === 0) {
        throw new Error("no session token");
      }
      const res = await getWebServiceToken(sessionToken).catch((_) => undefined);
      if (!res) {
        throw new Error("failed to acquire web service token");
      }
      const newWebServiceToken = res.webServiceToken;
      await AsyncStorage.setItem("webServiceToken", newWebServiceToken);
      bulletToken = await getBulletToken(newWebServiceToken).catch((_) => "");
      if (bulletToken.length === 0) {
        throw new Error("failed to acquire bullet token");
      }
    }

    // Refresh results.
    const language = (await AsyncStorage.getItem("language")) || t("lang");
    await Database.open();
    const [battle, coop] = await Promise.all([
      fetchLatestBattleHistories(bulletToken)
        .then(async (battleHistories) => {
          // Fetch details.
          const ids: string[] = [];
          for (const historyGroup of battleHistories.latestBattleHistories.historyGroups.nodes) {
            for (const historyDetail of historyGroup.historyDetails.nodes) {
              const id = decode64String(historyDetail.id);
              let encodedId = "";
              switch (historyDetail.vsMode.id) {
                case "VnNNb2RlLTE=":
                case "VnNNb2RlLTY=":
                case "VnNNb2RlLTc=":
                case "VnNNb2RlLTg=":
                  encodedId = encode64String(id.replace("RECENT", "REGULAR"));
                  break;
                case "VnNNb2RlLTI=":
                case "VnNNb2RlLTUx":
                  encodedId = encode64String(id.replace("RECENT", "BANKARA"));
                  break;
                case "VnNNb2RlLTM=":
                  encodedId = encode64String(id.replace("RECENT", "XMATCH"));
                  break;
                case "VnNNb2RlLTQ=":
                  encodedId = encode64String(id.replace("RECENT", "LEAGUE"));
                  break;
                case "VnNNb2RlLTU=":
                  encodedId = encode64String(id.replace("RECENT", "PRIVATE"));
                  break;
                default:
                  throw new Error(`unexpected vsMode ${historyDetail.vsMode.id}`);
              }
              ids.push(encodedId);
            }
          }

          const existed = await Promise.all(ids.map((id) => Database.isExist(id)));
          const newIds = ids.filter((_, i) => !existed[i]);
          const results = await Promise.all(
            newIds.map((id) =>
              ok(
                fetchVsHistoryDetail(id, bulletToken, language).then(async (detail) => {
                  return await Database.addBattle(detail);
                })
              )
            )
          );
          return results.filter((result) => !result).length;
        })
        .catch((e) => {
          return e as Error;
        }),
      fetchCoopResult(bulletToken)
        .then(async (coopResult) => {
          // Fetch details.
          const ids: string[] = [];
          for (const historyGroup of coopResult.coopResult.historyGroups.nodes) {
            for (const historyDetail of historyGroup.historyDetails.nodes) {
              ids.push(historyDetail.id);
            }
          }

          const existed = await Promise.all(ids.map((id) => Database.isExist(id)));
          const newIds = ids.filter((_, i) => !existed[i]);
          const results = await Promise.all(
            newIds.map((id) =>
              ok(
                fetchCoopHistoryDetail(id, bulletToken, language).then(async (detail) => {
                  return await Database.addCoop(detail);
                })
              )
            )
          );
          return results.filter((result) => !result).length;
        })
        .catch((e) => {
          return e as Error;
        }),
    ]);

    if (battle instanceof Error) {
      throw new Error(`failed to load battles (${battle.message})`);
    }
    if (coop instanceof Error) {
      throw new Error(`failed to load coops (${coop.message})`);
    }
    if (battle + coop > 0) {
      await notify(t("new_results"), t("load_n_results_in_the_background", { n: battle + coop }));
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (_) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  return await BackgroundFetch.registerTaskAsync(BACKGROUND_REFRESH_RESULTS_TASK, {
    minimumInterval: 30 * 60,
  });
};
export const unregisterBackgroundTask = async () => {
  return await BackgroundFetch.unregisterTaskAsync(BACKGROUND_REFRESH_RESULTS_TASK);
};
export const isBackgroundTaskRegistered = async () => {
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_REFRESH_RESULTS_TASK);
};
