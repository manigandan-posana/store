import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
} from "@mui/material";
import { useState } from "react";
import { createMaterial } from "../api/materials";
import { useNotification } from "../providers/NotificationProvider";

const INITIAL_FORM = {
  name: "",
  code: "",
  unit: "",
  category: "",
};

export function MaterialQuickCreateDialog({ open, onClose, onCreated }) {
  const { notify } = useNotification();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const handleClose = () => {
    if (saving) return;
    setForm(INITIAL_FORM);
    onClose?.();
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.code.trim()) {
      notify("Material name and drawing number are required", "warning");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        code: form.code.trim(),
        unit: form.unit.trim() || null,
        category: form.category.trim() || null,
      };
      const material = await createMaterial(payload);
      notify(`Material ${material.name} created`, "success");
      setForm(INITIAL_FORM);
      onCreated?.(material);
      onClose?.();
    } catch (error) {
      notify(error.message || "Failed to create material", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm" component="form" onSubmit={handleSubmit}>
      <DialogTitle>Create Material</DialogTitle>
      <DialogContent>
        <Stack spacing={2} sx={{ mt: 1 }}>
          <TextField
            label="Material Name"
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField
            label="Drawing Part No."
            name="code"
            value={form.code}
            onChange={handleChange}
            required
            fullWidth
          />
          <TextField label="UOM (Unit of Measure)" name="unit" value={form.unit} onChange={handleChange} fullWidth />
          <TextField label="Line Type" name="category" value={form.category} onChange={handleChange} fullWidth />
        </Stack>
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={handleClose} disabled={saving}>
          Cancel
        </Button>
        <Button type="submit" variant="contained" disabled={saving}>
          {saving ? "Saving..." : "Create"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
