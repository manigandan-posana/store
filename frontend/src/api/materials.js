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
