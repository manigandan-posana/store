import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import LaunchIcon from "@mui/icons-material/Launch";
import { useEffect, useMemo, useState } from "react";
import { Link as RouterLink, useParams } from "react-router-dom";
import { listMaterials, createMaterial } from "../api/materials";
import { getProject, linkMaterial, unlinkMaterial } from "../api/projects";
import { LinkMaterialDialog } from "../components/forms/LinkMaterialDialog";
import { useNotification } from "../providers/NotificationProvider";

export function ProjectDetailPage() {
  const { projectId } = useParams();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(false);
  const [linkDialogOpen, setLinkDialogOpen] = useState(false);
  const [allMaterials, setAllMaterials] = useState([]);
  const { notify } = useNotification();

  const loadProject = async () => {
    setLoading(true);
    try {
      const data = await getProject(projectId);
      setProject(data.project);
      setMaterials(data.materials || []);
    } catch (error) {
      notify(error.message || "Failed to load project", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProject();
    listMaterials()
      .then((data) => setAllMaterials(data))
      .catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  const totals = useMemo(() => {
    return materials.reduce(
      (acc, item) => ({
        totalIn: acc.totalIn + item.totalIn,
        totalOut: acc.totalOut + item.totalOut,
        stock: acc.stock + item.currentStock,
      }),
      { totalIn: 0, totalOut: 0, stock: 0 }
    );
  }, [materials]);

  const handleLinkMaterial = async ({ materialId, defaultLocationOverride }) => {
    try {
      await linkMaterial(projectId, { materialId, defaultLocationOverride });
      notify("Material linked to project", "success");
      setLinkDialogOpen(false);
      await loadProject();
    } catch (error) {
      notify(error.message || "Failed to link material", "error");
    }
  };

  const handleCreateMaterial = async (payload) => {
    try {
      const material = await createMaterial(payload);
      setAllMaterials((prev) => [...prev, material]);
      notify("Material created", "success");
      return material;
    } catch (error) {
      notify(error.message || "Failed to create material", "error");
      throw error;
    }
  };

  const handleUnlinkMaterial = async (materialId) => {
    if (!window.confirm("Are you sure you want to unlink this material from the project?")) {
      return;
    }
    try {
      await unlinkMaterial(projectId, materialId);
      notify("Material unlinked", "info");
      await loadProject();
    } catch (error) {
      notify(error.message || "Failed to unlink material", "error");
    }
  };

  return (
    <Box>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : project ? (
        <Box>
          <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" mb={3} gap={2}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {project.name}
              </Typography>
              <Typography variant="subtitle1" color="text.secondary">
                {project.description || "No description"}
              </Typography>
              <Stack direction={{ xs: "column", sm: "row" }} spacing={3} mt={2} color="text.secondary">
                <span>
                  <strong>Code:</strong> {project.code}
                </span>
                <span>
                  <strong>Client / Location:</strong> {project.clientLocation || "-"}
                </span>
                <span>
                  <strong>Status:</strong> {project.status || "In Progress"}
                </span>
              </Stack>
            </Box>
            <Button variant="contained" onClick={() => setLinkDialogOpen(true)}>
              Link Material
            </Button>
          </Stack>

          <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Project Inventory Summary
            </Typography>
            <Stack direction={{ xs: "column", sm: "row" }} spacing={4}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Inward Quantity
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {totals.totalIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Total Outward Quantity
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {totals.totalOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Current Stock
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  {totals.stock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </Box>
            </Stack>
          </Paper>

          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Material</TableCell>
                  <TableCell>Code</TableCell>
                  <TableCell align="right">Current Stock</TableCell>
                  <TableCell align="right">Total In</TableCell>
                  <TableCell align="right">Total Out</TableCell>
                  <TableCell>Last In</TableCell>
                  <TableCell>Last Out</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {materials.length ? (
                  materials.map((material) => (
                    <TableRow key={material.materialId} hover>
                      <TableCell>{material.materialName}</TableCell>
                      <TableCell>{material.materialCode}</TableCell>
                      <TableCell align="right">
                        {material.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {material.totalIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell align="right">
                        {material.totalOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                      </TableCell>
                      <TableCell>
                        {material.lastInTime ? new Date(material.lastInTime).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell>
                        {material.lastOutTime ? new Date(material.lastOutTime).toLocaleString() : "-"}
                      </TableCell>
                      <TableCell align="right">
                        <Stack direction="row" spacing={1} justifyContent="flex-end">
                          <IconButton
                            component={RouterLink}
                            to={`/projects/${project.id}/materials/${material.materialId}`}
                            size="small"
                            color="primary"
                          >
                            <LaunchIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleUnlinkMaterial(material.materialId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      No materials linked yet. Use "Link Material" to add from the master list.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      ) : (
        <Typography>No project found.</Typography>
      )}

      <LinkMaterialDialog
        open={linkDialogOpen}
        onClose={() => setLinkDialogOpen(false)}
        materials={allMaterials}
        onLinkExisting={handleLinkMaterial}
        onCreateMaterial={handleCreateMaterial}
      />
    </Box>
  );
}
