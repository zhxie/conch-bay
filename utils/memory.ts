import * as Device from "expo-device";
import { Platform } from "react-native";

export let BATCH_SIZE = Math.floor((Math.max(Device.totalMemory!) / 1024 / 1024 / 1024) * 150);
export let IMPORT_READ_SIZE = Math.floor((Device.totalMemory! / 1024) * 15);

export const requestMemory = async () => {
  if (Platform.OS === "android") {
    const maxMemory = await Device.getMaxMemoryAsync();
    BATCH_SIZE = Math.floor((maxMemory / 1024 / 1024 / 1024) * 150);
    IMPORT_READ_SIZE = Math.floor((maxMemory / 1024) * 15);
  }
};
