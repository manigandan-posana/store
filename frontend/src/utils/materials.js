export const sanitizeMaterialPayload = (data = {}) => {
  const name = data.name?.trim() ?? "";
  const code = data.code?.trim() ?? "";
  const unit = data.unit?.trim() ?? "";
  const category = data.category?.trim() ?? "";

  return {
    name,
    code,
    unit: unit || null,
    category: category || null,
  };
};
