import { apiFetch } from "./client";

export function fetchDashboard(projectId) {
  const hasProject = projectId !== undefined && projectId !== null;
  const query = hasProject ? `?projectId=${projectId}` : "";
  return apiFetch(`/dashboard${query}`);
}
