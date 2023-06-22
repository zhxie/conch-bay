import AsyncStorage from "@react-native-async-storage/async-storage";
import * as BackgroundFetch from "expo-background-fetch";
import * as Notifications from "expo-notifications";
import * as TaskManager from "expo-task-manager";
import t from "../i18n";
import {
  fetchCoopResult,
  fetchLatestBattleHistories,
  getBulletToken,
  getWebServiceToken,
} from "./api";
import { decode64Time } from "./codec";
import * as Database from "./database";

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
    await Database.open();
    const record = await Database.query(0, 1);
    let lastTime = 0;
    if (record.length > 0) {
      lastTime = record[0].time;
    }
    const [battle, coop] = await Promise.all([
      fetchLatestBattleHistories(bulletToken)
        .then((battleHistories) => {
          // Fetch details.
          const times: number[] = [];
          for (const historyGroup of battleHistories.latestBattleHistories.historyGroups.nodes) {
            for (const historyDetail of historyGroup.historyDetails.nodes) {
              times.push(decode64Time(historyDetail.id));
            }
          }
          return times.filter((time) => time > lastTime).length;
        })
        .catch((e) => {
          return e as Error;
        }),
      fetchCoopResult(bulletToken)
        .then((coopResult) => {
          // Fetch details.
          const times: number[] = [];
          for (const historyGroup of coopResult.coopResult.historyGroups.nodes) {
            for (const historyDetail of historyGroup.historyDetails.nodes) {
              times.push(decode64Time(historyDetail.id));
            }
          }
          return times.filter((time) => time > lastTime).length;
        })
        .catch((e) => {
          return e as Error;
        }),
    ]);

    if (battle instanceof Error) {
      throw new Error(`failed to check battles ${battle.message}`);
    }
    if (coop instanceof Error) {
      throw new Error(`failed to check coops ${coop.message}`);
    }
    if (battle + coop > 0) {
      await notify(t("new_results"), t("found_n_results_in_the_background", { n: battle + coop }));
      return BackgroundFetch.BackgroundFetchResult.NewData;
    }
    return BackgroundFetch.BackgroundFetchResult.NoData;
  } catch (_) {
    /* empty */
    return BackgroundFetch.BackgroundFetchResult.Failed;
  }
});

export const registerBackgroundTask = async () => {
  return await BackgroundFetch.registerTaskAsync(BACKGROUND_REFRESH_RESULTS_TASK, {
    minimumInterval: 60 * 60,
  });
};
export const unregisterBackgroundTask = async () => {
  return await BackgroundFetch.unregisterTaskAsync(BACKGROUND_REFRESH_RESULTS_TASK);
};
export const isBackgroundTaskRegistered = async () => {
  return await TaskManager.isTaskRegisteredAsync(BACKGROUND_REFRESH_RESULTS_TASK);
};
