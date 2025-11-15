import { apiFetch } from "./client";

export function fetchBackofficeUsers() {
  return apiFetch("/admin/users", { method: "GET" });
}

export function createBackofficeUser(payload) {
  return apiFetch("/admin/users", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchInventoryAnalytics() {
  return apiFetch("/admin/analytics/inventory", { method: "GET" });
}

export function fetchInventoryMovementReport(projectId) {
  const query = projectId ? `?projectId=${projectId}` : "";
  return apiFetch(`/admin/analytics/movements${query}`, { method: "GET" });
}
