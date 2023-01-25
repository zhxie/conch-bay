import { toByteArray as decode64 } from "base64-js";

export const encode64Url = (base64: string) => {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};

export const decode64Id = (id: string) => {
  const text = new TextDecoder().decode(decode64(id));
  const regex = /VsHistoryDetail-[a-z0-9-]+:\w+:(\d{8}T\d{6})_([0-9a-f-]{36})/;
  const match = regex.exec(text)!;
  return { timestamp: match[1], uuid: match[2] };
};
export const decode64Number = (id: string) => {
  const text = new TextDecoder().decode(decode64(id));
  const n = text.split("-")[1];
  return parseInt(n);
};
