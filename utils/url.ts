export const getAuthorityAndPath = (url: string) => {
  url.split("?")[0];
  return url.split("?")[0];
};
export const getParam = (url: string, param: string) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  const params: Record<string, string> = {};
  let match: string[] | null;
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2];
  }
  return params[param];
};
export const parameterize = (params: Record<string, string>) => {
  const body: string[] = [];
  for (const param in params) {
    const key = param;
    const value = params[param];
    body.push(`${key}=${value}`);
  }
  return body.join("&");
};
export const formUrlEncoded = (form: Record<string, string>) => {
  const body: string[] = [];
  for (const property in form) {
    const encodedKey = encodeURIComponent(property);
    const encodedValue = encodeURIComponent(form[property]);
    body.push(`${encodedKey}=${encodedValue}`);
  }
  return body.join("&");
};
