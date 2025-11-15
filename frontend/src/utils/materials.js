export const sanitizeMaterialPayload = (data = {}) => {
  const name = data.name?.trim() ?? "";
  const code = data.code?.trim() ?? "";
  const unit = data.unit?.trim() ?? "";
  const category = data.category?.trim() ?? "";
  const initialQuantityRaw = data.initialQuantity;
  let initialQuantity = null;
  if (initialQuantityRaw !== undefined && initialQuantityRaw !== "" && initialQuantityRaw !== null) {
    const parsed = Number.parseFloat(initialQuantityRaw);
    if (!Number.isNaN(parsed) && parsed >= 0) {
      initialQuantity = parsed;
    }
  }

  const payload = {
    name,
    code,
    unit: unit || null,
    category: category || null,
  };
  if (initialQuantity !== null) {
    payload.initialQuantity = initialQuantity;
  }
  return payload;
};
