function doFetch<T>(method: string, url: string, body?: T) {
  return fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const server = {
  get: (url: string) => fetch(url),
  put: <T>(url: string, body: T) => doFetch("PUT", url, body),
  post: <T>(url: string, body: T) => doFetch("POST", url, body),
  patch: (url: string) => fetch(url, { method: "PATCH" }),
  delete: (url: string) => fetch(url, { method: "DELETE" }),
};

export default server;
