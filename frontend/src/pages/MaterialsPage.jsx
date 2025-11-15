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
  InputAdornment,
  Pagination,
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
import SearchIcon from "@mui/icons-material/Search";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { createMaterial, deleteMaterial, listMaterials, updateMaterial } from "../api/materials";
import { recordMaterialInward, recordMaterialOutward } from "../api/inventory";
import { useNotification } from "../providers/NotificationProvider";
import { sanitizeMaterialPayload } from "../utils/materials";

const initialForm = {
  name: "",
  code: "",
  unit: "",
  category: "",
  initialQuantity: "",
};

export function MaterialsPage() {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [activeMaterial, setActiveMaterial] = useState(null);
  const [inwardDialogOpen, setInwardDialogOpen] = useState(false);
  const [outwardDialogOpen, setOutwardDialogOpen] = useState(false);
  const [savingInward, setSavingInward] = useState(false);
  const [savingOutward, setSavingOutward] = useState(false);
  const { notify } = useNotification();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pageSize = isMobile ? 6 : 20;

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

  useEffect(() => {
    setPage(1);
  }, [search, isMobile, materials.length]);

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) {
      return materials;
    }
    return materials.filter((material) => {
      const values = [material.name, material.code, material.category, material.unit];
      return values.some((value) => value?.toLowerCase?.().includes(query));
    });
  }, [materials, search]);

  const pageCount = filteredMaterials.length ? Math.ceil(filteredMaterials.length / pageSize) : 0;

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

  const paginatedMaterials = useMemo(() => {
    if (!filteredMaterials.length) {
      return [];
    }
    const start = (page - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, page, pageSize]);

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
      if (editingMaterial) {
        delete payload.initialQuantity;
      }
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
      initialQuantity: "",
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

  const openInwardDialog = (material) => {
    setActiveMaterial(material);
    setInwardDialogOpen(true);
  };

  const openOutwardDialog = (material) => {
    setActiveMaterial(material);
    setOutwardDialogOpen(true);
  };

  const closeInwardDialog = () => {
    if (savingInward) return;
    setInwardDialogOpen(false);
    setActiveMaterial(null);
  };

  const closeOutwardDialog = () => {
    if (savingOutward) return;
    setOutwardDialogOpen(false);
    setActiveMaterial(null);
  };

  const handleRecordInward = async (payload) => {
    if (!activeMaterial) {
      notify("Select a material to record inward movement", "warning");
      return;
    }
    setSavingInward(true);
    try {
      await recordMaterialInward(activeMaterial.id, payload);
      notify("Inward entry recorded", "success");
      setInwardDialogOpen(false);
      setActiveMaterial(null);
      await loadMaterials();
    } catch (error) {
      notify(error.message || "Failed to record inward", "error");
    } finally {
      setSavingInward(false);
    }
  };

  const handleRecordOutward = async (payload) => {
    if (!activeMaterial) {
      notify("Select a material to record outward movement", "warning");
      return;
    }
    setSavingOutward(true);
    try {
      await recordMaterialOutward(activeMaterial.id, payload);
      notify("Outward entry recorded", "success");
      setOutwardDialogOpen(false);
      setActiveMaterial(null);
      await loadMaterials();
    } catch (error) {
      notify(error.message || "Failed to record outward", "error");
    } finally {
      setSavingOutward(false);
    }
  };

  return (
    <Box sx={{ bgcolor: "background.default", py: { xs: 3, md: 5 } }}>
      <Container maxWidth="lg">
        <Stack spacing={3}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            justifyContent="space-between"
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Box>
              <Typography variant="h4" fontWeight={700}>
                Material Management
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Maintain drawing references, units, and live on-hand balances for every tracked item.
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={openCreateForm}
              size={isMobile ? "medium" : "large"}
              sx={{ borderRadius: 999 }}
            >
              Create material
            </Button>
          </Stack>

          <Paper elevation={0} sx={{ borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
            <Toolbar
              sx={{
                px: { xs: 2, md: 3 },
                py: { xs: 2, md: 2.5 },
                borderBottom: "1px solid",
                borderColor: "divider",
                flexWrap: "wrap",
                gap: 2,
                justifyContent: "space-between",
              }}
            >
              <Box>
                <Typography variant="subtitle1" fontWeight={700}>
                  Materials catalogue
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {materials.length.toLocaleString()} items • real-time availability at a glance.
                </Typography>
              </Box>
              <TextField
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                size="small"
                placeholder="Search material or drawing number"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon fontSize="small" />
                    </InputAdornment>
                  ),
                }}
                sx={{ width: { xs: "100%", sm: 320 } }}
              />
            </Toolbar>

            {isMobile ? (
              <Box sx={{ px: { xs: 2, md: 3 }, py: 2 }}>
                {loading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                    <CircularProgress size={28} />
                  </Box>
                ) : filteredMaterials.length === 0 ? (
                  <Stack spacing={2} alignItems="center" textAlign="center">
                    <Typography variant="h6" fontWeight={600}>
                      No materials found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" maxWidth={360}>
                      Adjust your search or add a new material to keep the registry up to date.
                    </Typography>
                    <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
                      Create material
                    </Button>
                  </Stack>
                ) : (
                  <Stack spacing={2}>
                    {paginatedMaterials.map((material) => (
                      <Paper key={material.id} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                        <Stack spacing={2}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle1" fontWeight={700}>
                                {material.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                #{material.id?.toString?.() ?? material.id}
                              </Typography>
                            </Box>
                            <Box textAlign="right">
                              <Typography variant="caption" color="text.secondary">
                                On hand
                              </Typography>
                              <Typography variant="h6" fontWeight={700}>
                                {material.onHandQuantity?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "0"}
                              </Typography>
                            </Box>
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {material.code && <Chip label={material.code} size="small" variant="outlined" />}
                            {material.unit && <Chip label={`UOM: ${material.unit}`} size="small" variant="outlined" />}
                            {material.category ? (
                              <Chip label={material.category} size="small" color="primary" variant="outlined" />
                            ) : (
                              <Chip label="Line type —" size="small" variant="outlined" />
                            )}
                          </Stack>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            <Button
                              size="small"
                              variant="contained"
                              color="success"
                              onClick={() => openInwardDialog(material)}
                            >
                              Record Inward
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              color="error"
                              onClick={() => openOutwardDialog(material)}
                            >
                              Record Outward
                            </Button>
                            <Button size="small" variant="outlined" onClick={() => handleEdit(material)}>
                              Edit
                            </Button>
                            <Button size="small" variant="text" color="error" onClick={() => handleDelete(material)}>
                              Delete
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    ))}
                  </Stack>
                )}
              </Box>
            ) : (
              <TableContainer sx={{ maxHeight: 520 }}>
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Material</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Drawing No.</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>UOM</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Line Type</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        On hand
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600 }}>
                        Actions
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 6 }}>
                          <CircularProgress size={30} />
                        </TableCell>
                      </TableRow>
                    ) : filteredMaterials.length ? (
                      paginatedMaterials.map((material) => (
                        <TableRow
                          key={material.id}
                          hover
                          sx={{
                            transition: "background-color 0.2s ease",
                            "&:hover": { bgcolor: "action.hover" },
                          }}
                        >
                          <TableCell>
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2" fontWeight={700}>
                                {material.name}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                #{material.id?.toString?.() ?? material.id}
                              </Typography>
                            </Stack>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight={600}>
                              {material.code}
                            </Typography>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={material.unit || "-"} variant="outlined" sx={{ fontWeight: 600 }} />
                          </TableCell>
                          <TableCell>
                            {material.category ? (
                              <Chip label={material.category} size="small" color="primary" variant="outlined" />
                            ) : (
                              <Typography variant="body2" color="text.disabled">
                                —
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="body2" fontWeight={700}>
                              {material.onHandQuantity?.toLocaleString(undefined, { maximumFractionDigits: 2 }) ?? "0"}
                            </Typography>
                          </TableCell>
                          <TableCell align="right">
                            <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                              <Button
                                size="small"
                                variant="outlined"
                                color="success"
                                onClick={() => openInwardDialog(material)}
                              >
                                Inward
                              </Button>
                              <Button
                                size="small"
                                variant="outlined"
                                color="error"
                                onClick={() => openOutwardDialog(material)}
                              >
                                Outward
                              </Button>
                              <IconButton size="small" color="primary" onClick={() => handleEdit(material)}>
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton size="small" color="error" onClick={() => handleDelete(material)}>
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Stack>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={6} align="center" sx={{ py: 8 }}>
                          <Stack spacing={2} alignItems="center">
                            <Typography variant="h6" fontWeight={600}>
                              No materials found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" textAlign="center" maxWidth={360}>
                              Adjust your search or add a new material to keep the registry up to date.
                            </Typography>
                            <Button variant="contained" startIcon={<AddIcon />} onClick={openCreateForm}>
                              Create material
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {!loading && filteredMaterials.length > 0 && pageCount > 1 && (
              <Box sx={{ display: "flex", justifyContent: "center", px: { xs: 2, md: 3 }, pb: { xs: 2, md: 3 } }}>
                <Pagination
                  count={pageCount}
                  page={page}
                  onChange={(_, value) => setPage(value)}
                  shape="rounded"
                  color="primary"
                />
              </Box>
            )}
          </Paper>
        </Stack>
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
            {!editingMaterial && (
              <TextField
                name="initialQuantity"
                label="In-hand Quantity"
                type="number"
                inputProps={{ min: 0, step: "0.01" }}
                value={form.initialQuantity}
                onChange={handleChange}
                fullWidth
              />
            )}
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

      <Dialog
        open={inwardDialogOpen}
        onClose={closeInwardDialog}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Record inward – {activeMaterial?.name || "Material"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Entries captured here are tracked against the general store (not linked to a project).
          </Typography>
          <InwardForm onSubmit={handleRecordInward} loading={savingInward} card={false} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={closeInwardDialog} color="inherit" disabled={savingInward}>
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={outwardDialogOpen}
        onClose={closeOutwardDialog}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle sx={{ fontWeight: 700 }}>
          Record outward – {activeMaterial?.name || "Material"}
        </DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Handover entries reduce stock from the general store for this material.
          </Typography>
          <OutwardForm onSubmit={handleRecordOutward} loading={savingOutward} card={false} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2.5 }}>
          <Button onClick={closeOutwardDialog} color="inherit" disabled={savingOutward}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
