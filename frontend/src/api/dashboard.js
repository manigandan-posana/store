import { apiFetch } from "./client";

export function fetchDashboard(projectId) {
  const query = projectId ? `?projectId=${projectId}` : "";
  return apiFetch(`/dashboard${query}`);
}
