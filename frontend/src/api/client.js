const DEFAULT_BASE_URL = "http://localhost:8080/api";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || DEFAULT_BASE_URL;

let authToken = null;
let unauthorizedHandler = null;

export function setAuthToken(token) {
  authToken = token;
}

export function getAuthToken() {
  return authToken;
}

export function clearAuthToken() {
  authToken = null;
}

export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
}

export async function apiFetch(path, options = {}) {
  const url = path.startsWith("http") ? path : `${API_BASE_URL}${path}`;
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && options.body) {
    headers.set("Content-Type", "application/json");
  }
  if (authToken && !headers.has("Authorization")) {
    headers.set("Authorization", `Bearer ${authToken}`);
  }
  const response = await fetch(url, {
    ...options,
    headers,
  });
  if (!response.ok) {
    let errorMessage = response.statusText;
    try {
      const data = await response.json();
      if (data?.message) {
        errorMessage = Array.isArray(data.message)
          ? data.message.join(", ")
          : data.message;
      }
    } catch (err) {
      // ignore json parsing error
    }
    if (response.status === 401 && unauthorizedHandler) {
      unauthorizedHandler();
    }
    const error = new Error(errorMessage || "Request failed");
    error.status = response.status;
    throw error;
  }
  if (response.status === 204) {
    return null;
  }
  const text = await response.text();
  return text ? JSON.parse(text) : null;
}

export { API_BASE_URL };
