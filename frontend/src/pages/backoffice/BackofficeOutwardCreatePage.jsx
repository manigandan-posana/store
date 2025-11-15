import {
  Autocomplete,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  IconButton,
  Stack,
  TextField,
  Typography,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listProjects, getProject, linkMaterial } from "../../api/projects";
import { recordOutward } from "../../api/inventory";
import { useNotification } from "../../providers/NotificationProvider";
import { MaterialQuickCreateDialog } from "../../components/MaterialQuickCreateDialog";

const EMPTY_ITEM = {
  material: null,
  quantity: "",
  weightTons: "",
  unitsCount: "",
  remarks: "",
};

const dateNowLocal = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
};

export function BackofficeOutwardCreatePage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null);
  const [projectMaterials, setProjectMaterials] = useState([]);
  const [items, setItems] = useState([EMPTY_ITEM]);
  const [saving, setSaving] = useState(false);
  const [materialDialogIndex, setMaterialDialogIndex] = useState(null);
  const [form, setForm] = useState({
    documentDate: dateNowLocal(),
    dcNo: "",
    issueType: "",
    issuedTo: "",
    store: "",
    vehicleType: "",
    vehicleNumber: "",
    remarks: "",
  });

  useEffect(() => {
    const load = async () => {
      try {
        const response = await listProjects();
        setProjects(response);
      } catch (error) {
        notify(error.message || "Failed to load projects", "error");
      }
    };
    load();
  }, [notify]);

  const loadProjectMaterials = useCallback(
    async (projectId) => {
      if (!projectId) {
        setProjectMaterials([]);
        return;
      }
      try {
        const detail = await getProject(projectId);
        const materials = (detail.materials || []).map((material) => ({
          id: material.materialId,
          name: material.materialName,
          code: material.materialCode,
          unit: material.unit,
          currentStock: material.currentStock,
        }));
        setProjectMaterials(materials);
        return materials;
      } catch (error) {
        notify(error.message || "Failed to load materials", "error");
        setProjectMaterials([]);
        return [];
      }
    },
    [notify]
  );

  const handleProjectChange = async (_, value) => {
    setSelectedProject(value || null);
    setItems([EMPTY_ITEM]);
    if (value) {
      await loadProjectMaterials(value.id);
    } else {
      setProjectMaterials([]);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              [field]: value,
            }
          : item
      )
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { ...EMPTY_ITEM }]);
  };

  const removeItem = (index) => {
    if (items.length === 1) {
      setItems([EMPTY_ITEM]);
      return;
    }
    setItems((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleMaterialCreated = async (material) => {
    if (!selectedProject) return;
    try {
      await linkMaterial(selectedProject.id, { materialId: material.id, defaultLocationOverride: null });
      const materials = await loadProjectMaterials(selectedProject.id);
      if (!materials) return;
      const option = materials.find((item) => item.id === material.id);
      if (option != null && materialDialogIndex != null) {
        setItems((prev) =>
          prev.map((item, idx) => (idx === materialDialogIndex ? { ...item, material: option } : item))
        );
      }
    } catch (error) {
      notify(error.message || "Failed to link material to project", "error");
    } finally {
      setMaterialDialogIndex(null);
    }
  };

  const parseNumber = (value) => {
    if (value === "" || value === null || value === undefined) return null;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const handleSubmit = async () => {
    if (!selectedProject) {
      notify("Select a project before saving", "warning");
      return;
    }
    if (!form.issuedTo.trim()) {
      notify("Issued to field is required", "warning");
      return;
    }
    const invalidItem = items.find((item) => !item.material || !parseNumber(item.quantity));
    if (invalidItem) {
      notify("Each item requires a material and quantity", "warning");
      return;
    }
    const overdrawn = items.find((item) => {
      const quantity = parseNumber(item.quantity);
      return quantity && item.material?.currentStock != null && quantity > item.material.currentStock + 1e-6;
    });
    if (overdrawn) {
      notify("Issued quantity cannot exceed available stock", "warning");
      return;
    }
    setSaving(true);
    try {
      const movementTime = form.documentDate ? new Date(form.documentDate).toISOString() : null;
      const baseRemarks = [
        form.issueType ? `Issue Type: ${form.issueType}` : null,
        form.store ? `Store: ${form.store}` : null,
        form.vehicleType ? `Vehicle Type: ${form.vehicleType}` : null,
        form.vehicleNumber ? `Vehicle No: ${form.vehicleNumber}` : null,
        form.remarks ? form.remarks.trim() : null,
      ].filter(Boolean);
      for (const item of items) {
        const itemRemarks = [...baseRemarks];
        if (item.remarks) {
          itemRemarks.push(item.remarks.trim());
        }
        await recordOutward(selectedProject.id, item.material.id, {
          quantity: parseNumber(item.quantity),
          weightTons: parseNumber(item.weightTons),
          unitsCount: parseNumber(item.unitsCount),
          movementTime,
          issuedTo: form.issuedTo.trim(),
          reference: form.dcNo ? form.dcNo.trim() : null,
          remarks: itemRemarks.length > 0 ? itemRemarks.join(" | ") : null,
        });
      }
      notify("Outward recorded successfully", "success");
      navigate("/backoffice/outwards");
    } catch (error) {
      notify(error.message || "Failed to record outward", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box pb={12}>
      <Stack spacing={3}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={700}>
                Outward Details
              </Typography>
              <Autocomplete
                value={selectedProject}
                onChange={handleProjectChange}
                options={projects}
                getOptionLabel={(option) => (option ? `${option.name} (${option.code})` : "")}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                renderInput={(params) => <TextField {...params} label="Project" placeholder="Select project" />}
              />
              <TextField
                label="Issue Date"
                type="datetime-local"
                name="documentDate"
                value={form.documentDate}
                onChange={handleFormChange}
                InputLabelProps={{ shrink: true }}
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="DC No"
                  name="dcNo"
                  value={form.dcNo}
                  onChange={handleFormChange}
                  fullWidth
                />
                <TextField
                  label="Issue Type"
                  name="issueType"
                  value={form.issueType}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Issued To"
                name="issuedTo"
                value={form.issuedTo}
                onChange={handleFormChange}
                fullWidth
                required
              />
              <TextField
                label="Store"
                name="store"
                value={form.store}
                onChange={handleFormChange}
                fullWidth
              />
              <Stack direction="row" spacing={2}>
                <TextField
                  label="Vehicle Type"
                  name="vehicleType"
                  value={form.vehicleType}
                  onChange={handleFormChange}
                  fullWidth
                />
                <TextField
                  label="Vehicle Number"
                  name="vehicleNumber"
                  value={form.vehicleNumber}
                  onChange={handleFormChange}
                  fullWidth
                />
              </Stack>
              <TextField
                label="Remarks"
                name="remarks"
                value={form.remarks}
                onChange={handleFormChange}
                fullWidth
                multiline
                minRows={2}
              />
            </Stack>
          </CardContent>
        </Card>

        <Stack spacing={2}>
          {items.map((item, index) => (
            <Card key={index} elevation={1} sx={{ borderRadius: 3 }}>
              <CardContent>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle1" fontWeight={700}>
                      Item {index + 1}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Button
                        size="small"
                        onClick={() => {
                          if (!selectedProject) {
                            notify("Select project before creating materials", "warning");
                            return;
                          }
                          setMaterialDialogIndex(index);
                        }}
                      >
                        New Material
                      </Button>
                      <IconButton aria-label="remove" onClick={() => removeItem(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Stack>
                  <Autocomplete
                    value={item.material}
                    onChange={(_, value) => handleItemChange(index, "material", value)}
                    options={projectMaterials}
                    getOptionLabel={(option) =>
                      option ? `${option.name}${option.code ? ` (${option.code})` : ""}` : ""
                    }
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => (
                      <TextField {...params} label="Material" placeholder="Select material" required />
                    )}
                    disabled={!selectedProject}
                  />
                  {item.material && (
                    <Chip
                      size="small"
                      color="info"
                      label={`Available ${item.material.currentStock.toLocaleString(undefined, {
                        maximumFractionDigits: 2,
                      })}${item.material.unit ? ` ${item.material.unit}` : ""}`}
                      sx={{ alignSelf: "flex-start" }}
                    />
                  )}
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Quantity"
                      type="number"
                      inputProps={{ min: 0, step: "any" }}
                      value={item.quantity}
                      onChange={(event) => handleItemChange(index, "quantity", event.target.value)}
                      fullWidth
                      required
                    />
                    <TextField
                      label="Weight (tons)"
                      type="number"
                      inputProps={{ min: 0, step: "any" }}
                      value={item.weightTons}
                      onChange={(event) => handleItemChange(index, "weightTons", event.target.value)}
                      fullWidth
                    />
                  </Stack>
                  <Stack direction="row" spacing={2}>
                    <TextField
                      label="Units Count"
                      type="number"
                      inputProps={{ min: 0 }}
                      value={item.unitsCount}
                      onChange={(event) => handleItemChange(index, "unitsCount", event.target.value)}
                      fullWidth
                    />
                    <TextField
                      label="Item Remarks"
                      value={item.remarks}
                      onChange={(event) => handleItemChange(index, "remarks", event.target.value)}
                      fullWidth
                    />
                  </Stack>
                </Stack>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={addItem}
            sx={{ alignSelf: "flex-start" }}
          >
            Add Item
          </Button>
        </Stack>
      </Stack>

      <Divider sx={{ my: 3 }} />

      <Box
        sx={{
          position: "sticky",
          bottom: 72,
          left: 0,
          right: 0,
          zIndex: 10,
          bgcolor: "background.paper",
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          py: 2,
        }}
      >
        <Button variant="contained" size="large" fullWidth onClick={handleSubmit} disabled={saving}>
          {saving ? "Saving..." : "Save Outward"}
        </Button>
      </Box>

      <MaterialQuickCreateDialog
        open={materialDialogIndex !== null}
        onClose={() => setMaterialDialogIndex(null)}
        onCreated={handleMaterialCreated}
      />
    </Box>
  );
}
