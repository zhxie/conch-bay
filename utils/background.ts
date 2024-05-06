import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import t from "../i18n";
import {
  WebServiceToken,
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchLatestBattleHistories,
  fetchVsHistoryDetail,
  getBulletToken,
  getWebServiceToken,
  updateNsoVersion,
  updateSplatnetVersion,
} from "./api";
import { Key } from "./async-storage";
import { decode64String, encode64String } from "./codec";
import * as Database from "./database";
import { ok, sleep } from "./promise";

const BACKGROUND_REFRESH_RESULTS_TASK = "background-refresh-results";

TaskManager.defineTask(BACKGROUND_REFRESH_RESULTS_TASK, async ({ error }) => {
  if (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  try {
    // Update versions.
    await ok(Promise.all([updateNsoVersion(), updateSplatnetVersion()]));

    // Check previous token.
    const language = (await AsyncStorage.getItem(Key.Language)) || t("lang");
    let webServiceToken: WebServiceToken | undefined = undefined;
    let bulletToken = "";
    const webServiceTokenString = await AsyncStorage.getItem(Key.WebServiceToken);
    if (webServiceTokenString) {
      try {
        webServiceToken = JSON.parse(webServiceTokenString) as WebServiceToken;
        bulletToken = await getBulletToken(webServiceToken, language).catch(() => "");
      } catch {
        /* empty */
      }
    }

    // Reacquire tokens.
    if (bulletToken.length === 0) {
      const sessionToken = await AsyncStorage.getItem(Key.SessionToken);
      if (!sessionToken || sessionToken.length === 0) {
        throw new Error("no session token");
      }
      const newWebServiceToken = await getWebServiceToken(sessionToken).catch((e) => e as Error);
      if (newWebServiceToken instanceof Error) {
        throw new Error(`failed to acquire web service token ${newWebServiceToken.message}`);
      }
      webServiceToken = newWebServiceToken;
      await AsyncStorage.setItem(Key.WebServiceToken, JSON.stringify(webServiceToken));
      const newBulletToken = await getBulletToken(webServiceToken, language).catch(
        (e) => e as Error
      );
      if (newBulletToken instanceof Error) {
        throw new Error(`failed to acquire bullet token ${newBulletToken.message}`);
      }
      bulletToken = newBulletToken;
    }

    // Refresh results.
    const upgrade = await Database.open();
    if (upgrade !== undefined) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    const [battle, coop] = await Promise.all([
      fetchLatestBattleHistories(webServiceToken!, bulletToken, language)
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
                  continue;
              }
              ids.push(encodedId);
            }
          }

          const existed = await Promise.all(ids.map((id) => Database.isExist(id)));
          const newIds = ids.filter((_, i) => !existed[i]);
          let results = 0;
          await Promise.all(
            newIds.map((id, i) =>
              ok(
                sleep(i * 750)
                  .then(() => fetchVsHistoryDetail(webServiceToken!, bulletToken, language, id))
                  .then((detail) => Database.addBattle(detail))
                  .then(() => {
                    results += 1;
                  })
              )
            )
          );
          return results;
        })
        .catch((e) => {
          return e as Error;
        }),
      fetchCoopResult(webServiceToken!, bulletToken, language)
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
          let results = 0;
          await Promise.all(
            newIds.map((id, i) =>
              ok(
                sleep(i * 750)
                  .then(() => fetchCoopHistoryDetail(webServiceToken!, bulletToken, language, id))
                  .then((detail) => Database.addCoop(detail))
                  .then(() => {
                    results += 1;
                  })
              )
            )
          );
          return results;
        })
        .catch((e) => {
          return e as Error;
        }),
    ]);

    let total = 0;
    if (typeof battle === "number") {
      total += battle;
    }
    if (typeof coop === "number") {
      total += coop;
    }
    if ((await Notifications.getPermissionsAsync()).granted) {
      // Always set badge as unread result count.
      const playedTime = parseInt((await AsyncStorage.getItem(Key.PlayedTime)) || "0");
      let unread = await Database.count(undefined, playedTime);
      if (playedTime !== 0) {
        unread -= 1;
      }
      if (unread > 0) {
        Notifications.setBadgeCountAsync(unread);
      }

      // Notify unread if there is new result.
      if (total > 0) {
        Notifications.scheduleNotificationAsync({
          content: {
            title: t("new_results"),
            body: t("loaded_n_results_in_the_background", { n: unread }),
          },
          trigger: null,
          identifier: BACKGROUND_REFRESH_RESULTS_TASK,
        });
      }
    }
    if (battle instanceof Error) {
      throw new Error(`failed to load battles (${battle.message})`);
    }
    if (coop instanceof Error) {
      throw new Error(`failed to load coops (${coop.message})`);
    }
    if (total > 0) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  return await BackgroundFetch.registerTaskAsync(BACKGROUND_REFRESH_RESULTS_TASK, {
    minimumInterval: 15 * 60,
  });
};
export const unregisterBackgroundTask = async () => {
  return await BackgroundFetch.unregisterTaskAsync(BACKGROUND_REFRESH_RESULTS_TASK);
};
export const isBackgroundTaskRegistered = async () => {
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_REFRESH_RESULTS_TASK);
};
