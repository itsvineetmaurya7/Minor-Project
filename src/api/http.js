// Shared HTTP transport for backend requests; API methods use it instead of the mock adapter when connected.
// Future backend transport used by API methods that replace the mock adapter in src/api/index.js.
export const API_BASE = "http://localhost:8080/api";

// Reads the saved session token, sends JSON, and reports unsuccessful HTTP responses as errors.
export async function request(path, { method = "GET", body } = {}) {
  let token = null;
  try { token = JSON.parse(sessionStorage.getItem("session"))?.token; } catch {}
  const res = await fetch(API_BASE + path, {
    method,
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) throw (await res.text()) || "Request failed";
  return res.status === 204 ? null : res.json();
}
