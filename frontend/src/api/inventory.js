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

export function recordMaterialInward(materialId, payload) {
  return apiFetch(`/materials/${materialId}/inventory/inwards`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function recordMaterialOutward(materialId, payload) {
  return apiFetch(`/materials/${materialId}/inventory/outwards`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
