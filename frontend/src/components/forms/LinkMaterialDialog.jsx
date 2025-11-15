import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Tab,
  Tabs,
  TextField,
} from "@mui/material";
import { useEffect, useState } from "react";

const newMaterialInitial = {
  name: "",
  code: "",
  unit: "",
  category: "",
};

export function LinkMaterialDialog({
  open,
  onClose,
  materials,
  onLinkExisting,
  onCreateMaterial,
}) {
  const [mode, setMode] = useState("existing");
  const [selectedMaterial, setSelectedMaterial] = useState("");
  const [newMaterial, setNewMaterial] = useState(newMaterialInitial);

  useEffect(() => {
    if (!open) {
      setMode("existing");
      setSelectedMaterial("");
      setNewMaterial(newMaterialInitial);
    }
  }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (mode === "existing") {
      await onLinkExisting({
        materialId: Number(selectedMaterial),
      });
    } else {
      const created = await onCreateMaterial(newMaterial);
      await onLinkExisting({ materialId: created.id });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Add Material to Project</DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <Tabs
          value={mode}
          onChange={(_, value) => setMode(value)}
          variant="fullWidth"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab value="existing" label="Existing Material" />
          <Tab value="new" label="Create New Material" />
        </Tabs>
        <DialogContent dividers>
          {mode === "existing" ? (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                select
                label="Select Material"
                value={selectedMaterial}
                onChange={(e) => setSelectedMaterial(e.target.value)}
                required
                fullWidth
              >
                {materials.map((material) => (
                  <MenuItem key={material.id} value={material.id}>
                    {material.name} ({material.code})
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <TextField
                label="Material Name"
                value={newMaterial.name}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, name: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="Drawing Part No."
                value={newMaterial.code}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, code: e.target.value }))}
                required
                fullWidth
              />
              <TextField
                label="UOM (Unit of Measure)"
                value={newMaterial.unit}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, unit: e.target.value }))}
                fullWidth
              />
              <TextField
                label="Line Type"
                value={newMaterial.category}
                onChange={(e) => setNewMaterial((prev) => ({ ...prev, category: e.target.value }))}
                fullWidth
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained">
            {mode === "existing" ? "Link Material" : "Create & Link"}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
