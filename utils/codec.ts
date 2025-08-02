import { toByteArray as decode64, fromByteArray as encode64 } from "base64-js";
import { Buffer } from "buffer";

export { toByteArray as decode64, fromByteArray as encode64 } from "base64-js";

export const parameterize = (params: Record<string, string>) => {
  const body: string[] = [];
  for (const param in params) {
    const key = param;
    const value = params[param];
    body.push(`${key}=${value}`);
  }
  return body.join("&");
};

export const encode64Url = (base64: string) => {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};
export const decode64Url = (base64: string) => {
  let result = base64.replaceAll("-", "+").replaceAll("_", "/");
  if (base64.length % 4 !== 0) {
    for (let i = 0; i < 4 - (base64.length % 4); i++) {
      result = result + "=";
    }
  }
  return result;
};

export const decode64String = (base64: string) => {
  const data = decode64(base64);
  return Buffer.from(data).toString();
};
export const encode64String = (s: string) => {
  const data = Buffer.from(s);
  return encode64(data);
};

export const decode64Index = (base64: string) => {
  const data = decode64(base64);
  const s = Buffer.from(data).toString();
  return parseInt(s.split("-")[1]);
};
export const decode64BattlePlayerId = (base64: string) => {
  const data = decode64(base64);
  const s = Buffer.from(data).toString();
  return s.split(":")[3].split("-")[1];
};
export const decode64CoopPlayerId = (base64: string) => {
  const data = decode64(base64);
  const s = Buffer.from(data).toString();
  return s.split(":")[2].split("-")[1];
};

export const deepCopy = <T>(obj: T): T => {
  return JSON.parse(JSON.stringify(obj));
};
