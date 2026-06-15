async function request<TResponse>(
  method: string,
  url: string,
  body?: any,
): Promise<TResponse> {
  const res = await fetch(url, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    ...(body !== undefined && {
      body: JSON.stringify(body),
    }),
  });

  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }

  const contentLength = res.headers.get("content-length");
  if (contentLength === "0") {
    return;
  }

  return res.json();
}

const api = {
  get: <T>(url: string) => request<T>("GET", url),

  post: <T>(url: string, body: any) => request<T>("POST", url, body),

  put: <T>(url: string, body: any) => request<T>("PUT", url, body),

  patch: <T>(url: string, body?: any) => request<T>("PATCH", url, body),

  delete: <T>(url: string) => request<T>("DELETE", url),
};

export default api;
