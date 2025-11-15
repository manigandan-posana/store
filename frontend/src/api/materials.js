import { apiFetch } from "./client";

export function listMaterials() {
  return apiFetch("/materials");
}

export function createMaterial(payload) {
  return apiFetch("/materials", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateMaterial(materialId, payload) {
  return apiFetch(`/materials/${materialId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export function deleteMaterial(materialId) {
  return apiFetch(`/materials/${materialId}`, {
    method: "DELETE",
  });
}
