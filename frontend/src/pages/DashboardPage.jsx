import {
  Box,
  Button,
  CircularProgress,
  Grid,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { fetchDashboard } from "../api/dashboard";
import { createProject } from "../api/projects";
import { DataCard } from "../components/common/DataCard";
import { MovementTable } from "../components/common/MovementTable";
import { CreateProjectDialog } from "../components/forms/CreateProjectDialog";
import { useNotification } from "../providers/NotificationProvider";

export function DashboardPage() {
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openProjectDialog, setOpenProjectDialog] = useState(false);
  const { notify } = useNotification();

  const loadDashboard = async (projectId) => {
    setLoading(true);
    try {
      const data = await fetchDashboard(projectId);
      setDashboard(data);
      if (!projectId && data?.selectedProject) {
        setSelectedProjectId(data.selectedProject.id);
      }
    } catch (error) {
      notify(error.message || "Failed to load dashboard", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard(selectedProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedProjectId]);

  const handleProjectCreated = async (values) => {
    try {
      const project = await createProject(values);
      notify(`Project "${project.name}" created`, "success");
      setOpenProjectDialog(false);
      await loadDashboard(project.id);
      setSelectedProjectId(project.id);
    } catch (error) {
      notify(error.message || "Failed to create project", "error");
    }
  };

  const materialTotals = useMemo(() => {
    if (!dashboard?.materialSummaries) return { totalIn: 0, totalOut: 0, currentStock: 0 };
    return dashboard.materialSummaries.reduce(
      (acc, item) => ({
        totalIn: acc.totalIn + item.totalIn,
        totalOut: acc.totalOut + item.totalOut,
        currentStock: acc.currentStock + item.currentStock,
      }),
      { totalIn: 0, totalOut: 0, currentStock: 0 }
    );
  }, [dashboard]);

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} justifyContent="space-between" alignItems="center" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Track project-wise inventory, batch movements, and FIFO outward usage in real time.
          </Typography>
        </Box>
        <Button variant="contained" onClick={() => setOpenProjectDialog(true)}>
          Create New Project
        </Button>
      </Stack>

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} gap={2} alignItems={{ xs: "flex-start", md: "center" }}>
          <Box>
            <Typography variant="subtitle2" color="text.secondary">
              Projects ({dashboard?.projectCount || 0})
            </Typography>
            <Select
              size="small"
              sx={{ minWidth: 260, mt: 1 }}
              value={selectedProjectId ?? ""}
              onChange={(event) => {
                const value = event.target.value;
                setSelectedProjectId(value === "" ? null : Number(value));
              }}
              displayEmpty
            >
              <MenuItem value="">
                <em>All Projects</em>
              </MenuItem>
              {dashboard?.projects?.map((project) => (
                <MenuItem value={project.id} key={project.id}>
                  {project.name} ({project.code})
                </MenuItem>
              ))}
            </Select>
          </Box>
          {dashboard?.selectedProject && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Selected Project
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {dashboard.selectedProject.name}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <Grid container spacing={2} mb={3}>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Total Projects"
                value={dashboard?.projectCount?.toLocaleString() || "0"}
                subtitle="Across the organisation"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Total Inward"
                value={materialTotals.totalIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                subtitle="Units received for selected project"
                color="success"
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <DataCard
                title="Total Outward"
                value={materialTotals.totalOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                subtitle="Units issued (FIFO)"
                color="error"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={7}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Material Stock Snapshot
                </Typography>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Material</TableCell>
                      <TableCell>Code</TableCell>
                      <TableCell align="right">Current Stock</TableCell>
                      <TableCell align="right">Stock (Tons)</TableCell>
                      <TableCell align="right">Stock (Units)</TableCell>
                      <TableCell align="right">Total In</TableCell>
                      <TableCell align="right">Total Out</TableCell>
                      <TableCell align="right">In (Tons)</TableCell>
                      <TableCell align="right">Out (Tons)</TableCell>
                      <TableCell align="right">In (Units)</TableCell>
                      <TableCell align="right">Out (Units)</TableCell>
                      <TableCell>Last In</TableCell>
                      <TableCell>Last Out</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dashboard?.materialSummaries?.length ? (
                      dashboard.materialSummaries.map((material) => (
                        <TableRow key={material.materialId}>
                          <TableCell>{material.materialName}</TableCell>
                          <TableCell>{material.materialCode}</TableCell>
                          <TableCell align="right">
                            {material.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right">
                            {material.currentStockTons !== null && material.currentStockTons !== undefined
                              ? material.currentStockTons.toLocaleString(undefined, { maximumFractionDigits: 2 })
                              : "-"}
                          </TableCell>
                          <TableCell align="right">
                            {material.currentUnits !== null && material.currentUnits !== undefined
                              ? material.currentUnits.toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell align="right">
                            {material.totalIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right">
                            {material.totalOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell align="right">
                            {material.totalInTons !== null && material.totalInTons !== undefined
                              ? material.totalInTons.toLocaleString(undefined, { maximumFractionDigits: 2 })
                              : "-"}
                          </TableCell>
                          <TableCell align="right">
                            {material.totalOutTons !== null && material.totalOutTons !== undefined
                              ? material.totalOutTons.toLocaleString(undefined, { maximumFractionDigits: 2 })
                              : "-"}
                          </TableCell>
                          <TableCell align="right">
                            {material.totalInUnits !== null && material.totalInUnits !== undefined
                              ? material.totalInUnits.toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell align="right">
                            {material.totalOutUnits !== null && material.totalOutUnits !== undefined
                              ? material.totalOutUnits.toLocaleString()
                              : "-"}
                          </TableCell>
                          <TableCell>
                            {material.lastInTime ? new Date(material.lastInTime).toLocaleString() : "-"}
                          </TableCell>
                          <TableCell>
                            {material.lastOutTime ? new Date(material.lastOutTime).toLocaleString() : "-"}
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={7} align="center" sx={{ py: 3, color: "text.secondary" }}>
                          No materials linked to this project yet.
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </Grid>
            <Grid item xs={12} md={5}>
              <MovementTable title="Recent Movements" movements={dashboard?.recentActivity || []} />
            </Grid>
          </Grid>
        </Box>
      )}

      <CreateProjectDialog
        open={openProjectDialog}
        onClose={() => setOpenProjectDialog(false)}
        onSubmit={handleProjectCreated}
      />
    </Box>
  );
}
