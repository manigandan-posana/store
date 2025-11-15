import { apiFetch } from "./client";

export function recordInward(projectId, materialId, payload) {
  return apiFetch(`/projects/${projectId}/materials/${materialId}/inwards`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function recordOutward(projectId, materialId, payload) {
  return apiFetch(`/projects/${projectId}/materials/${materialId}/outwards`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
