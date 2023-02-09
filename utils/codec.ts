import { toByteArray as decode64 } from "base64-js";

export const encode64Url = (base64: string) => {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};
export const decode64Index = (base64: string) => {
  const data = decode64(base64);
  let result = 0;
  for (let i = data.findLastIndex((code) => code === "-".charCodeAt(0)) + 1; i < data.length; i++) {
    result *= 10;
    result += data[i] - "0".charCodeAt(0);
  }
  return result;
};
