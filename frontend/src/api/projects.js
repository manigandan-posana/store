import { apiFetch } from "./client";

export function listProjects() {
  return apiFetch("/projects");
}

export function createProject(payload) {
  return apiFetch("/projects", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function getProject(projectId) {
  return apiFetch(`/projects/${projectId}`);
}

export function linkMaterial(projectId, payload) {
  return apiFetch(`/projects/${projectId}/materials`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function unlinkMaterial(projectId, materialId) {
  return apiFetch(`/projects/${projectId}/materials/${materialId}`, {
    method: "DELETE",
  });
}

export function getMaterialDetail(projectId, materialId) {
  return apiFetch(`/projects/${projectId}/materials/${materialId}`);
}
