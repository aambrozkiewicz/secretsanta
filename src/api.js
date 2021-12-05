export const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export function api(path, method = "GET", body) {
  const options = {
    method,
  };

  if (body) {
    options["body"] = JSON.stringify(body);
  }

  if (body) {
    options["headers"] = {
      "Content-Type": "application/json",
      Accept: "application/json",
    };
  }

  return fetch(`${API_BASE_URL}/${path}`, options);
}
