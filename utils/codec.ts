import { toByteArray as decode64 } from "base64-js";

export const encode64Url = (base64: string) => {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};
export const decode64Index = (base64: string) => {
  const data = decode64(base64);
  let result = 0;
  // TODO: findLastIndex may not be acceptable before es2023 target.
  let pos = data.length - 1;
  for (; pos >= 0; pos--) {
    if (data[pos] === "-".charCodeAt(0)) {
      break;
    }
  }
  for (let i = pos + 1; i < data.length; i++) {
    result *= 10;
    result += data[i] - "0".charCodeAt(0);
  }
  return result;
};
