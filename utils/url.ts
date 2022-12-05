const getParam = (url: string, param: string) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  let params: Record<string, string> = {};
  let match;
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2];
  }
  return params[param];
};
const formUrlEncoded = (form: Record<string, string>) => {
  let body = [];
  for (let property in form) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(form[property]);
    body.push(`${encodedKey}=${encodedValue}`);
  }
  return body.join("&");
};

export { getParam, formUrlEncoded };
