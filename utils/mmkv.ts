import { useEffect, useState } from "react";
import { MMKV } from "react-native-mmkv";

export enum AsyncStorageKey {
  SessionToken = "sessionToken2",
  Language = "language",
  Region = "region",
  PlayedTime = "playedTime",
  BackgroundRefresh = "backgroundRefresh",
  SalmonRunFriendlyMode = "salmonRunFriendlyMode",
  AutoRefresh = "autoRefresh",
}

export enum Key {
  SessionToken = "sessionToken",
  WebServiceToken = "webServiceToken",
  BulletToken = "bulletToken",
  Language = "language",
  Region = "region",
  Icon = "icon",
  Level = "level",
  Rank = "rank",
  SplatZonesXPower = "splatZonesXPower",
  TowerControlXPower = "towerControlXPower",
  RainmakerXPower = "rainmakerXPower",
  ClamBlitzXPower = "clamBlitzXPower",
  Grade = "grade",
  PlayedTime = "playedTime",
  Filter = "filter",
  BackgroundRefresh = "backgroundRefresh",
  SalmonRunFriendlyMode = "salmonRunFriendlyMode",
  AutoRefresh = "autoRefresh",
  Migrated = "migrated",
  Tips = "tips",
}

export enum Tip {
  Welcome = "welcome",
}

const storage = new MMKV();

type UseMmkv<T> = [T, (value: T) => void, () => void, boolean];

export const useStringMmkv = (key: Key, initialValue?: string): UseMmkv<string> => {
  const [data, setData] = useState(initialValue || "");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const value = storage.getString(key);
    if (value !== undefined) {
      setData(value || initialValue || "");
    }
    setReady(true);
  }, [key, initialValue]);

  const setNewData = (value: string) => {
    storage.set(key, value);
    setData(value);
  };

  const clearData = () => {
    storage.delete(key);
    setData(initialValue || "");
  };

  return [data, setNewData, clearData, ready];
};

export const useNumberMmkv = (key: Key, initialValue?: number): UseMmkv<number> => {
  const [data, setData] = useState(initialValue || 0);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const value = storage.getNumber(key);
    if (value !== undefined) {
      setData(value || initialValue || 0);
    }
    setReady(true);
  }, [key, initialValue]);

  const setNewData = (value: number) => {
    storage.set(key, value);
    setData(value);
  };

  const clearData = () => {
    storage.delete(key);
    setData(initialValue || 0);
  };

  return [data, setNewData, clearData, ready];
};

export const useBooleanMmkv = (key: Key, initialValue?: boolean): UseMmkv<boolean> => {
  const [data, setData] = useState(initialValue || false);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const value = storage.getBoolean(key);
    if (value !== undefined) {
      setData(value || initialValue || false);
    }
    setReady(true);
  }, [key, initialValue]);

  const setNewData = (value: boolean) => {
    storage.set(key, value);
    setData(value);
  };

  const clearData = () => {
    storage.delete(key);
    setData(initialValue || false);
  };

  return [data, setNewData, clearData, ready];
};

type UseNullableMmkv<T> = [T | undefined, (value: T) => void, () => void, boolean];

export const useMmkv = <T>(key: Key, initialValue?: T): UseNullableMmkv<T> => {
  const [data, setData] = useState(initialValue);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const value = storage.getString(key);
    if (value !== undefined) {
      setData(JSON.parse(value));
    }
    setReady(true);
  }, [key, initialValue]);

  const setNewData = (value: T) => {
    storage.set(key, JSON.stringify(value));
    setData(value);
  };

  const clearData = () => {
    storage.delete(key);
    setData(initialValue);
  };

  return [data, setNewData, clearData, ready];
};
