import { toByteArray as decode64, fromByteArray as encode64 } from "base64-js";
import { Buffer } from "buffer";

export { toByteArray as decode64, fromByteArray as encode64 } from "base64-js";

export const encode64Url = (base64: string) => {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
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
