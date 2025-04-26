import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import { MMKV } from "react-native-mmkv";
import t from "../i18n";
import {
  fetchCoopHistoryDetail,
  fetchCoopResult,
  fetchLatestBattleHistories,
  fetchVsHistoryDetail,
  getBulletToken,
  getWebServiceToken,
  updateSplatnetVersion,
} from "./api";
import { decode64String, encode64String } from "./codec";
import * as Database from "./database";
import { Key } from "./mmkv";
import { ok, sleep } from "./promise";

const BACKGROUND_REFRESH_RESULTS_TASK = "background-refresh-results";

TaskManager.defineTask(BACKGROUND_REFRESH_RESULTS_TASK, async ({ error }) => {
  if (error) {
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
  try {
    // Update versions.
    await ok(updateSplatnetVersion());

    // Always generate new bullet token.
    const storage = new MMKV();
    const language = storage.getString(Key.Language) || t("lang");
    const sessionToken = storage.getString(Key.SessionToken);
    if (!sessionToken || sessionToken.length === 0) {
      throw new Error("no session token");
    }
    const webServiceToken = await getWebServiceToken(sessionToken).catch((e) => e as Error);
    if (webServiceToken instanceof Error) {
      throw new Error(`failed to acquire web service token ${webServiceToken.message}`);
    }
    storage.set(Key.WebServiceToken, JSON.stringify(webServiceToken));
    const bulletToken = await getBulletToken(webServiceToken, language).catch((e) => e as Error);
    if (bulletToken instanceof Error) {
      throw new Error(`failed to acquire bullet token ${bulletToken.message}`);
    }

    // Refresh results.
    const upgrade = await Database.open();
    if (upgrade) {
      return BackgroundFetch.BackgroundFetchResult.NoData;
    }
    const [battle, coop] = await Promise.all([
      fetchLatestBattleHistories(webServiceToken, bulletToken, language)
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
                  .then(() => fetchVsHistoryDetail(webServiceToken, bulletToken, language, id))
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
      fetchCoopResult(webServiceToken, bulletToken, language)
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
                  .then(() => fetchCoopHistoryDetail(webServiceToken, bulletToken, language, id))
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
      const playedTime = storage.getNumber(Key.PlayedTime) || 0;
      let unread = await Database.count(undefined, playedTime);
      if (playedTime !== 0) {
        unread -= 1;
      }
      if (unread > 0) {
        await Notifications.setBadgeCountAsync(unread);
      }

      // Notify unread if there is new result.
      if (total > 0) {
        await Notifications.scheduleNotificationAsync({
          content: {
            title: t("new_results"),
            body: t("loaded_n_results_in_the_background", { n: unread }),
          },
          trigger: null,
          identifier: BACKGROUND_REFRESH_RESULTS_TASK,
        });
      }
    }
    if (total > 0) {
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    if (battle instanceof Error) {
      throw new Error(`failed to load battles (${battle.message})`);
    }
    if (coop instanceof Error) {
      throw new Error(`failed to load coops (${coop.message})`);
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
