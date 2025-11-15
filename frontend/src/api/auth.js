import { apiFetch } from "./client";

export function login(credentials) {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
  });
}

export function fetchProfile() {
  return apiFetch("/auth/me", {
    method: "GET",
  });
}

export function changePassword(payload) {
  return apiFetch("/auth/change-password", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
