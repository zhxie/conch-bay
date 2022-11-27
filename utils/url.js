const getParam = (url, param) => {
  const regex = /[?&]([^=#]+)=([^&#]*)/g;
  let params = {};
  let match;
  while ((match = regex.exec(url))) {
    params[match[1]] = match[2];
  }
  return params[param];
};
const formUrlEncoded = (form) => {
  let body = [];
  for (let property in form) {
    let encodedKey = encodeURIComponent(property);
    let encodedValue = encodeURIComponent(form[property]);
    body.push(`${encodedKey}=${encodedValue}`);
  }
  return body.join("&");
};

export { getParam, formUrlEncoded };
