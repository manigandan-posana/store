import {
  Box,
  Button,
  CircularProgress,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { useEffect, useState } from "react";
import { createMaterial, deleteMaterial, listMaterials, updateMaterial } from "../api/materials";
import { useNotification } from "../providers/NotificationProvider";
import { sanitizeMaterialPayload } from "../utils/materials";

const initialForm = {
  name: "",
  code: "",
  unit: "",
  category: "",
};

export function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const { notify } = useNotification();

  const loadMaterials = async () => {
    setLoading(true);
    try {
      const data = await listMaterials();
      setMaterials(data);
    } catch (error) {
      notify(error.message || "Failed to load materials", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMaterials();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingMaterial(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = sanitizeMaterialPayload(form);
      if (!payload.name || !payload.code) {
        notify("Material name and drawing number are required", "warning");
        return;
      }
      if (editingMaterial) {
        const updated = await updateMaterial(editingMaterial.id, payload);
        notify(`Material "${updated.name}" updated`, "success");
      } else {
        const created = await createMaterial(payload);
        notify(`Material "${created.name}" created`, "success");
      }
      resetForm();
      await loadMaterials();
    } catch (error) {
      notify(error.message || "Failed to save material", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (material) => {
    setEditingMaterial(material);
    setForm({
      name: material.name || "",
      code: material.code || "",
      unit: material.unit || "",
      category: material.category || "",
    });
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Delete material "${material.name}"?`)) {
      return;
    }
    try {
      await deleteMaterial(material.id);
      notify("Material deleted", "info");
      if (editingMaterial?.id === material.id) {
        resetForm();
      }
      await loadMaterials();
    } catch (error) {
      notify(error.message || "Failed to delete material", "error");
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Material Management
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Create, edit, or retire materials used across projects. Capture drawing numbers, UOM, and line types in a
        single registry.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              {editingMaterial ? "Edit Material" : "Create Material"}
            </Typography>
            <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                name="name"
                label="Material Name"
                required
                value={form.name}
                onChange={handleChange}
              />
              <TextField
                name="code"
                label="Drawing Part No."
                required
                value={form.code}
                onChange={handleChange}
              />
              <TextField
                name="unit"
                label="UOM (Unit of Measure)"
                value={form.unit}
                onChange={handleChange}
              />
              <TextField
                name="category"
                label="Line Type"
                value={form.category}
                onChange={handleChange}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2, gap: 1 }}>
                {editingMaterial && (
                  <Button variant="outlined" onClick={resetForm} disabled={submitting}>
                    Cancel
                  </Button>
                )}
                <Button type="submit" variant="contained" disabled={submitting}>
                  {editingMaterial ? "Update Material" : "Save Material"}
                </Button>
              </Box>
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={7}>
          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Drawing No.</TableCell>
                  <TableCell>UOM</TableCell>
                  <TableCell>Line Type</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                      <CircularProgress size={28} />
                    </TableCell>
                  </TableRow>
                ) : materials.length ? (
                  materials.map((material) => (
                    <TableRow key={material.id} hover>
                      <TableCell>
                        <Typography variant="subtitle2" fontWeight={600}>
                          {material.name}
                        </Typography>
                      </TableCell>
                      <TableCell>{material.code}</TableCell>
                      <TableCell>{material.unit || "-"}</TableCell>
                      <TableCell>{material.category || "-"}</TableCell>
                      <TableCell align="right">
                        <IconButton size="small" color="primary" onClick={() => handleEdit(material)}>
                          <EditIcon fontSize="small" />
                        </IconButton>
                        <IconButton
                          size="small"
                          color="error"
                          onClick={() => handleDelete(material)}
                          sx={{ ml: 1 }}
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No materials created yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
