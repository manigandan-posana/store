import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
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
  const [formOpen, setFormOpen] = useState(false);
  const { notify } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

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

  const closeForm = () => {
    resetForm();
    setFormOpen(false);
  };

  const openCreateForm = () => {
    resetForm();
    setFormOpen(true);
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
      closeForm();
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
    setFormOpen(true);
  };

  const handleDelete = async (material) => {
    if (!window.confirm(`Delete material "${material.name}"?`)) {
      return;
    }
    try {
      await deleteMaterial(material.id);
      notify("Material deleted", "info");
      if (editingMaterial?.id === material.id) {
        closeForm();
      }
      await loadMaterials();
    } catch (error) {
      notify(error.message || "Failed to delete material", "error");
    }
  };

  return (
    <Box
      sx={{
        backgroundImage: (theme) =>
          theme.palette.mode === "light"
            ? "linear-gradient(180deg, #f8fafc 0%, #eef2ff 100%)"
            : "linear-gradient(180deg, #0f172a 0%, #1e293b 100%)",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        minHeight: "100%",
        py: { xs: 4, md: 6 },
      }}
    >
      <Container maxWidth="lg">
        <Paper
          elevation={0}
          sx={{
            mb: 4,
            p: { xs: 3, md: 4 },
            borderRadius: 4,
            background:
              "linear-gradient(135deg, rgba(79,70,229,0.12) 0%, rgba(14,165,233,0.12) 100%)",
            border: "1px solid",
            borderColor: "divider",
            backdropFilter: "blur(6px)",
          }}
        >
          <Stack spacing={3} direction={{ xs: "column", md: "row" }} alignItems={{ md: "center" }}>
            <Box flex={1}>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                Materials Library
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Maintain an authoritative list of approved materials, drawing references, and line types for every
                project. Create new records or refine existing entries in a single, collaborative workspace.
              </Typography>
            </Box>
            <Stack spacing={2} alignItems={{ xs: "stretch", md: "flex-end" }}>
              <Paper
                elevation={0}
                sx={{
                  px: 3,
                  py: 2,
                  borderRadius: 3,
                  border: "1px solid",
                  borderColor: "divider",
                  bgcolor: "background.paper",
                  minWidth: { md: 220 },
                }}
              >
                <Typography variant="overline" color="text.secondary">
                  Total materials
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {materials.length.toString().padStart(2, "0")}
                </Typography>
                <Chip
                  color="primary"
                  variant="outlined"
                  size="small"
                  label="Live registry"
                  sx={{ mt: 1, fontWeight: 600 }}
                />
              </Paper>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={openCreateForm}
                size={isMobile ? "medium" : "large"}
                sx={{
                  borderRadius: 999,
                  px: { xs: 2.5, md: 4 },
                  py: 1.5,
                  boxShadow: "0px 10px 24px rgba(79,70,229,0.25)",
                }}
              >
                Create material
              </Button>
            </Stack>
          </Stack>
        </Paper>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Toolbar
            sx={{
              px: { xs: 2, md: 3 },
              py: { xs: 2, md: 2.5 },
              borderBottom: "1px solid",
              borderColor: "divider",
              flexWrap: "wrap",
              gap: 1.5,
              justifyContent: "space-between",
            }}
          >
            <Box>
              <Typography variant="h6" fontWeight={700}>
                Materials catalogue
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track drawing part numbers, UOM, and line allocations with quick edit controls.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={openCreateForm}
              sx={{ borderRadius: 999 }}
            >
              New material
            </Button>
          </Toolbar>

          <TableContainer sx={{ maxHeight: 520 }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Drawing No.</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>UOM</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Line Type</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 600 }}>
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                      <CircularProgress size={30} />
                    </TableCell>
                  </TableRow>
                ) : materials.length ? (
                  materials.map((material) => (
                    <TableRow
                      key={material.id}
                      hover
                      sx={{
                        transition: "background-color 0.2s ease, transform 0.15s ease",
                        "&:hover": {
                          bgcolor: "rgba(79,70,229,0.04)",
                          transform: "translateY(-1px)",
                        },
                      }}
                    >
                      <TableCell>
                        <Stack spacing={0.5}>
                          <Typography variant="subtitle2" fontWeight={700}>
                            {material.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            #{material.id?.slice?.(0, 8) || ""}
                          </Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>
                          {material.code}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={material.unit || "-"}
                          color="default"
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell>
                        {material.category ? (
                          <Chip
                            label={material.category}
                            size="small"
                            color="primary"
                            variant="outlined"
                            sx={{ fontWeight: 600, bgcolor: "rgba(79,70,229,0.08)" }}
                          />
                        ) : (
                          <Typography variant="body2" color="text.disabled">
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEdit(material)}
                            sx={{
                              bgcolor: "rgba(79,70,229,0.1)",
                              "&:hover": { bgcolor: "rgba(79,70,229,0.2)" },
                            }}
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDelete(material)}
                            sx={{
                              bgcolor: "rgba(239,68,68,0.1)",
                              "&:hover": { bgcolor: "rgba(239,68,68,0.2)" },
                            }}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 8 }}>
                      <Stack spacing={2} alignItems="center">
                        <Typography variant="h6" fontWeight={600}>
                          No materials yet
                        </Typography>
                        <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={360}>
                          Build your first entry to start linking drawing references with projects and track stock
                          movement effortlessly.
                        </Typography>
                        <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
                          Create your first material
                        </Button>
                      </Stack>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      </Container>

      <Dialog
        fullScreen={isMobile}
        open={formOpen}
        onClose={closeForm}
        PaperProps={{
          sx: {
            borderRadius: { xs: 0, sm: 3 },
            width: { sm: 480 },
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          {editingMaterial ? "Edit material" : "Create material"}
        </DialogTitle>
        <DialogContent dividers sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
          <Box component="form" id="material-form" onSubmit={handleSubmit} sx={{ display: "contents" }}>
            <TextField
              name="name"
              label="Material Name"
              required
              value={form.name}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="code"
              label="Drawing Part No."
              required
              value={form.code}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="unit"
              label="UOM (Unit of Measure)"
              value={form.unit}
              onChange={handleChange}
              fullWidth
            />
            <TextField
              name="category"
              label="Line Type"
              value={form.category}
              onChange={handleChange}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={closeForm} color="inherit" sx={{ mr: 1 }} disabled={submitting}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="material-form"
            variant="contained"
            disabled={submitting}
            sx={{ borderRadius: 999, px: 3 }}
          >
            {editingMaterial ? "Update material" : "Save material"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
