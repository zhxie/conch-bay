import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

// https://stackoverflow.com/a/65137974.
export const useAsyncStorage = (
  key: string,
  initialValue?: string
): [string, (value: string) => Promise<void>, () => Promise<void>, boolean] => {
  const [data, setData] = useState(initialValue || "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const value = await AsyncStorage.getItem(key);
        setData(value || initialValue || "");
        setReady(true);
      } catch (error) {
        console.error("useAsyncStorage getItem error:", error);
      }
    })();
  }, [key, initialValue]);

  const setNewData = async (value: string) => {
    try {
      await AsyncStorage.setItem(key, value);
      setData(value);
    } catch (error) {
      console.error("useAsyncStorage setItem error:", error);
    }
  };

  const clearData = async () => {
    try {
      await AsyncStorage.removeItem(key);
      setData(initialValue || "");
    } catch (error) {
      console.error("useAsyncStorage removeItem error:", error);
    }
  };

  return [data, setNewData, clearData, ready];
};
