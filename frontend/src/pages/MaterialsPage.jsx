import {
  Box,
  Button,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createMaterial, listMaterials } from "../api/materials";
import { useNotification } from "../providers/NotificationProvider";

const initialForm = {
  name: "",
  code: "",
  unit: "",
  category: "",
  minimumStock: "",
  defaultLocation: "",
};

export function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...form,
        minimumStock: form.minimumStock ? Number(form.minimumStock) : null,
      };
      const material = await createMaterial(payload);
      notify(`Material "${material.name}" created`, "success");
      setForm(initialForm);
      await loadMaterials();
    } catch (error) {
      notify(error.message || "Failed to create material", "error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Materials Master
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Maintain global material definitions with minimum stock levels and storage defaults.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Create Material
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
                label="Material Code / SKU"
                required
                value={form.code}
                onChange={handleChange}
              />
              <TextField name="unit" label="Unit" value={form.unit} onChange={handleChange} />
              <TextField name="category" label="Category" value={form.category} onChange={handleChange} />
              <TextField
                name="minimumStock"
                label="Minimum Stock"
                type="number"
                value={form.minimumStock}
                onChange={handleChange}
              />
              <TextField
                name="defaultLocation"
                label="Default Store / Location"
                value={form.defaultLocation}
                onChange={handleChange}
              />
              <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
                <Button type="submit" variant="contained" disabled={submitting}>
                  Save Material
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
                  <TableCell>Code</TableCell>
                  <TableCell>Unit</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell align="right">Minimum Stock</TableCell>
                  <TableCell>Default Location</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4 }}>
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
                      <TableCell align="right">{material.minimumStock ?? 0}</TableCell>
                      <TableCell>{material.defaultLocation || "-"}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: "text.secondary" }}>
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
