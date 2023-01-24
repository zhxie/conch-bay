export const encode64Url = (base64: string) => {
  return base64.replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
};
