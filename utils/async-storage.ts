import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";

type UseAsyncStorage<T> = [T, (value: T) => Promise<void>, () => Promise<void>, boolean];

// https://stackoverflow.com/a/65137974.
export const useStringAsyncStorage = (
  key: string,
  initialValue?: string
): UseAsyncStorage<string> => {
  const [data, setData] = useState(initialValue || "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem(key);
      if (value) {
        setData(value || initialValue || "");
      }
      setReady(true);
    })();
  }, [key, initialValue]);

  const setNewData = async (value: string) => {
    await AsyncStorage.setItem(key, value);
    setData(value);
  };

  const clearData = async () => {
    await AsyncStorage.removeItem(key);
    setData(initialValue || "");
  };

  return [data, setNewData, clearData, ready];
};

export const useBooleanAsyncStorage = (
  key: string,
  initialValue?: boolean
): UseAsyncStorage<boolean> => {
  const [data, setNewData, clearData, ready] = useStringAsyncStorage(key, initialValue ? "1" : "");

  const setNewBooleanData = async (value: boolean) => {
    await setNewData(value ? "1" : "");
  };

  return [data === "1" ? true : false, setNewBooleanData, clearData, ready];
};

type UseNullableAsyncStorage<T> = [
  T | undefined,
  (value: T) => Promise<void>,
  () => Promise<void>,
  boolean
];

export const useAsyncStorage = <T>(key: string, initialValue?: T): UseNullableAsyncStorage<T> => {
  const [data, setData] = useState(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      const value = await AsyncStorage.getItem(key);
      setData(value ? JSON.parse(value) : initialValue);
      setReady(true);
    })();
  }, [key, initialValue]);

  const setNewData = async (value: T) => {
    setData(value);
    await AsyncStorage.setItem(key, JSON.stringify(value));
  };

  const clearData = async () => {
    setData(initialValue);
    await AsyncStorage.removeItem(key);
  };

  return [data, setNewData, clearData, ready];
};
