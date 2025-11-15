import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Collapse,
  Grid,
  Paper,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchDashboard } from "../api/dashboard";
import { createProject, getMaterialDetail, linkMaterial, unlinkMaterial } from "../api/projects";
import { listMaterials, createMaterial } from "../api/materials";
import { recordInward, recordOutward } from "../api/inventory";
import { DataCard } from "../components/common/DataCard";
import { MovementTable } from "../components/common/MovementTable";
import { CreateProjectDialog } from "../components/forms/CreateProjectDialog";
import { InwardForm } from "../components/forms/InwardForm";
import { OutwardForm } from "../components/forms/OutwardForm";
import { LinkMaterialDialog } from "../components/forms/LinkMaterialDialog";
import { useNotification } from "../providers/NotificationProvider";

export function DashboardPage() {
  const { notify } = useNotification();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [materialTab, setMaterialTab] = useState("overview");
  const [showInwardForm, setShowInwardForm] = useState(false);
  const [showOutwardForm, setShowOutwardForm] = useState(false);
  const [savingInward, setSavingInward] = useState(false);
  const [savingOutward, setSavingOutward] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [allMaterials, setAllMaterials] = useState([]);

  const loadDashboard = useCallback(
    async (projectId) => {
      setDashboardLoading(true);
      try {
        const data = await fetchDashboard(projectId);
        setDashboard(data);
        if (!projectId && data?.selectedProject) {
          setSelectedProjectId(data.selectedProject.id);
        }
        if (data?.materialSummaries?.length) {
          setSelectedMaterialId((prev) => {
            const exists = data.materialSummaries.some((item) => item.materialId === prev);
            return exists ? prev : data.materialSummaries[0].materialId;
          });
        } else {
          setSelectedMaterialId(null);
        }
      } catch (error) {
        notify(error.message || "Failed to load dashboard", "error");
      } finally {
        setDashboardLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    loadDashboard(selectedProjectId);
  }, [selectedProjectId, loadDashboard]);

  useEffect(() => {
    listMaterials()
      .then((data) => setAllMaterials(data))
      .catch(() => {});
  }, []);

  const loadMaterialDetail = useCallback(
    async (projectId, materialId) => {
      if (!projectId || !materialId) {
        setMaterialDetail(null);
        return;
      }
      setMaterialLoading(true);
      try {
        const detail = await getMaterialDetail(projectId, materialId);
        setMaterialDetail(detail);
      } catch (error) {
        notify(error.message || "Failed to load material detail", "error");
      } finally {
        setMaterialLoading(false);
      }
    },
    [notify]
  );

  useEffect(() => {
    loadMaterialDetail(selectedProjectId, selectedMaterialId);
  }, [selectedProjectId, selectedMaterialId, loadMaterialDetail]);

  useEffect(() => {
    setMaterialTab("overview");
    setShowInwardForm(false);
    setShowOutwardForm(false);
  }, [selectedMaterialId, selectedProjectId]);

  const projectTotals = useMemo(() => {
    if (!dashboard?.materialSummaries?.length) {
      return { totalIn: 0, totalOut: 0, currentStock: 0 };
    }
    return dashboard.materialSummaries.reduce(
      (acc, item) => ({
        totalIn: acc.totalIn + item.totalIn,
        totalOut: acc.totalOut + item.totalOut,
        currentStock: acc.currentStock + item.currentStock,
      }),
      { totalIn: 0, totalOut: 0, currentStock: 0 }
    );
  }, [dashboard]);

  const materialOptions = dashboard?.materialSummaries ?? [];

  const availableMaterials = useMemo(() => {
    const linkedIds = new Set(materialOptions.map((item) => item.materialId));
    return allMaterials.filter((material) => !linkedIds.has(material.id));
  }, [allMaterials, materialOptions]);

  const handleProjectCreated = async (values) => {
    try {
      const project = await createProject(values);
      notify(`Project "${project.name}" created`, "success");
      setProjectDialogOpen(false);
      setSelectedProjectId(project.id);
      await loadDashboard(project.id);
    } catch (error) {
      notify(error.message || "Failed to create project", "error");
    }
  };

  const handleLinkMaterial = async ({ materialId, defaultLocationOverride }) => {
    if (!selectedProjectId) {
      notify("Select a project first", "warning");
      return;
    }
    try {
      await linkMaterial(selectedProjectId, { materialId, defaultLocationOverride });
      notify("Material linked to project", "success");
      setMaterialDialogOpen(false);
      await loadDashboard(selectedProjectId);
      setSelectedMaterialId(materialId);
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
    if (!selectedProjectId) {
      return;
    }
    if (!window.confirm("Remove this material from the project?")) {
      return;
    }
    try {
      await unlinkMaterial(selectedProjectId, materialId);
      notify("Material unlinked", "info");
      if (selectedMaterialId === materialId) {
        setSelectedMaterialId(null);
      }
      await loadDashboard(selectedProjectId);
    } catch (error) {
      notify(error.message || "Failed to unlink material", "error");
    }
  };

  const handleInward = async (payload) => {
    if (!selectedProjectId || !selectedMaterialId) {
      notify("Select a material first", "warning");
      return;
    }
    setSavingInward(true);
    try {
      await recordInward(selectedProjectId, selectedMaterialId, payload);
      notify("Inward entry recorded", "success");
      await Promise.all([
        loadMaterialDetail(selectedProjectId, selectedMaterialId),
        loadDashboard(selectedProjectId),
      ]);
      setShowInwardForm(false);
    } catch (error) {
      notify(error.message || "Failed to record inward", "error");
    } finally {
      setSavingInward(false);
    }
  };

  const handleOutward = async (payload) => {
    if (!selectedProjectId || !selectedMaterialId) {
      notify("Select a material first", "warning");
      return;
    }
    setSavingOutward(true);
    try {
      await recordOutward(selectedProjectId, selectedMaterialId, payload);
      notify("Outward entry recorded", "success");
      await Promise.all([
        loadMaterialDetail(selectedProjectId, selectedMaterialId),
        loadDashboard(selectedProjectId),
      ]);
      setShowOutwardForm(false);
    } catch (error) {
      notify(error.message || "Failed to record outward", "error");
    } finally {
      setSavingOutward(false);
    }
  };

  const selectedProject = dashboard?.selectedProject || null;
  const selectedMaterialSummary = materialOptions.find((item) => item.materialId === selectedMaterialId) || null;

  return (
    <Box>
      <Stack direction={{ xs: "column", md: "row" }} spacing={2} justifyContent="space-between" alignItems="flex-start" mb={3}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Backoffice Console
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Link materials, capture invoice-based inwards, and issue stock with FIFO in a mobile-friendly workspace.
          </Typography>
        </Box>
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
          <Button variant="contained" onClick={() => setProjectDialogOpen(true)}>
            Create Project
          </Button>
          <Button
            variant="outlined"
            disabled={!selectedProjectId}
            onClick={() => setMaterialDialogOpen(true)}
          >
            Add Material
          </Button>
        </Stack>
      </Stack>

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2, mb: 3 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
          <Box flex={1}>
            <Typography variant="subtitle2" color="text.secondary" gutterBottom>
              Select Project
            </Typography>
            <Autocomplete
              options={dashboard?.projects ?? []}
              getOptionLabel={(option) => `${option.name} (${option.code})`}
              value={selectedProjectId ? dashboard?.projects?.find((p) => p.id === selectedProjectId) ?? null : null}
              onChange={(_, value) => setSelectedProjectId(value ? value.id : null)}
              isOptionEqualToValue={(option, value) => option.id === value.id}
              renderInput={(params) => <TextField {...params} placeholder="Search project..." size="small" />}
              loading={dashboardLoading && !(dashboard?.projects?.length > 0)}
            />
          </Box>
          {selectedProject && (
            <Box>
              <Typography variant="subtitle2" color="text.secondary">
                Current Project
              </Typography>
              <Typography variant="subtitle1" fontWeight={600}>
                {selectedProject.name}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {selectedProject.clientLocation || "–"} • {selectedProject.status || "In Progress"}
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      {dashboardLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : !selectedProject ? (
        <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
          Create your first project to start tracking materials.
        </Typography>
      ) : (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Linked Materials"
                value={materialOptions.length.toLocaleString()}
                subtitle="For selected project"
                color="primary"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Total Inward"
                value={projectTotals.totalIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                subtitle="Quantity received"
                color="success"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Total Outward"
                value={projectTotals.totalOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                subtitle="FIFO issued"
                color="error"
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DataCard
                title="Current Stock"
                value={projectTotals.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                subtitle="Available now"
                color="warning"
              />
            </Grid>
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} lg={4}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2, height: "100%" }}>
                <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
                  Materials ({materialOptions.length})
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxHeight: 420, overflowY: "auto", pr: 1 }}>
                  {materialOptions.length === 0 && (
                    <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
                      No materials linked yet. Use "Add Material" to connect from the master list.
                    </Typography>
                  )}
                  {materialOptions.map((material) => {
                    const selected = material.materialId === selectedMaterialId;
                    return (
                      <Paper
                        key={material.materialId}
                        variant="outlined"
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          borderColor: selected ? "primary.light" : "divider",
                          bgcolor: selected ? "primary.light" : "background.paper",
                          transition: "background-color 0.2s",
                        }}
                      >
                        <Stack spacing={1}>
                          <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {material.materialName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {material.materialCode} • UOM: {material.unit || "-"}
                              </Typography>
                            </Box>
                            <Stack spacing={0.5} textAlign="right">
                              <Typography variant="body1" fontWeight={700} color="primary.main">
                                {material.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                In {material.totalIn.toLocaleString(undefined, { maximumFractionDigits: 1 })} • Out {material.totalOut.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                              </Typography>
                            </Stack>
                          </Stack>
                          <Typography variant="caption" color="text.secondary">
                            Last In: {material.lastInTime ? new Date(material.lastInTime).toLocaleString() : "–"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Last Out: {material.lastOutTime ? new Date(material.lastOutTime).toLocaleString() : "–"}
                          </Typography>
                          <Stack direction="row" spacing={1} justifyContent="flex-end">
                            <Button
                              size="small"
                              variant={selected ? "contained" : "outlined"}
                              onClick={() => setSelectedMaterialId(material.materialId)}
                            >
                              {selected ? "Selected" : "View"}
                            </Button>
                            <Button size="small" color="error" onClick={() => handleUnlinkMaterial(material.materialId)}>
                              Remove
                            </Button>
                          </Stack>
                        </Stack>
                      </Paper>
                    );
                  })}
                </Box>
              </Paper>
            </Grid>

            <Grid item xs={12} lg={8}>
              <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                  <Box>
                    <Typography variant="h6" fontWeight={600}>
                      Material Detail
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Review stock position, batches, and FIFO history without leaving this screen.
                    </Typography>
                  </Box>
                  {selectedMaterialSummary && (
                    <Chip
                      label={`${selectedMaterialSummary.materialCode} • ${selectedMaterialSummary.unit || "-"}`}
                      color="primary"
                      variant="outlined"
                    />
                  )}
                </Stack>

                {materialLoading ? (
                  <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress size={32} />
                  </Box>
                ) : !materialDetail ? (
                  <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
                    Select a material to view detailed information.
                  </Typography>
                ) : (
                  <Box>
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      spacing={2}
                      sx={{ mb: 2 }}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {materialDetail.material.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {materialDetail.project.name} • {materialDetail.material.code} • UOM {materialDetail.material.unit || "-"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2}>
                        <Box textAlign="center">
                          <Typography variant="caption" color="text.secondary">
                            Current Stock
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {materialDetail.stats.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                          </Typography>
                        </Box>
                        <Box textAlign="center">
                          <Typography variant="caption" color="text.secondary">
                            Total In / Out
                          </Typography>
                          <Typography variant="h6" fontWeight={700}>
                            {materialDetail.stats.totalIn.toLocaleString(undefined, { maximumFractionDigits: 1 })} / {materialDetail.stats.totalOut.toLocaleString(undefined, { maximumFractionDigits: 1 })}
                          </Typography>
                        </Box>
                      </Stack>
                    </Stack>

                    <Tabs
                      value={materialTab}
                      onChange={(_, value) => setMaterialTab(value)}
                      textColor="primary"
                      indicatorColor="primary"
                      variant="scrollable"
                      scrollButtons="auto"
                      sx={{ mb: 2 }}
                    >
                      <Tab value="overview" label="Overview" />
                      <Tab value="inwards" label={`Inwards (${materialDetail.inwards.length})`} />
                      <Tab value="outwards" label={`Outwards (${materialDetail.outwards.length})`} />
                      <Tab value="history" label={`History (${materialDetail.history.length})`} />
                    </Tabs>

                    {materialTab === "overview" && (
                      <Stack spacing={2}>
                        <Grid container spacing={2}>
                          <Grid item xs={12} sm={4}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Default Location
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {materialDetail.material.defaultLocation || "–"}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Minimum Stock
                              </Typography>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {(materialDetail.material.minimumStock ?? 0).toLocaleString()} {materialDetail.material.unit || ""}
                              </Typography>
                            </Paper>
                          </Grid>
                          <Grid item xs={12} sm={4}>
                            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                              <Typography variant="caption" color="text.secondary">
                                Status
                              </Typography>
                              <Typography
                                variant="subtitle1"
                                fontWeight={600}
                                color={
                                  materialDetail.stats.currentStock < (materialDetail.material.minimumStock ?? 0)
                                    ? "error.main"
                                    : "success.main"
                                }
                              >
                                {materialDetail.stats.currentStock < (materialDetail.material.minimumStock ?? 0)
                                  ? "Below minimum"
                                  : "Healthy"}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>

                        <Stack direction={{ xs: "column", sm: "row" }} spacing={1}>
                          <Button
                            variant={showInwardForm ? "contained" : "outlined"}
                            onClick={() => setShowInwardForm((prev) => !prev)}
                          >
                            {showInwardForm ? "Hide Inward Form" : "Record Inward"}
                          </Button>
                          <Button
                            variant={showOutwardForm ? "contained" : "outlined"}
                            color="error"
                            onClick={() => setShowOutwardForm((prev) => !prev)}
                          >
                            {showOutwardForm ? "Hide Outward Form" : "Record Outward"}
                          </Button>
                        </Stack>

                        <Collapse in={showInwardForm} timeout="auto" unmountOnExit>
                          <InwardForm onSubmit={handleInward} loading={savingInward} />
                        </Collapse>
                        <Collapse in={showOutwardForm} timeout="auto" unmountOnExit>
                          <OutwardForm onSubmit={handleOutward} loading={savingOutward} />
                        </Collapse>
                      </Stack>
                    )}

                    {materialTab === "inwards" && (
                      <MovementTable title="Inward Batches" movements={materialDetail.inwards} />
                    )}

                    {materialTab === "outwards" && (
                      <MovementTable title="Outward Movements" movements={materialDetail.outwards} />
                    )}

                    {materialTab === "history" && (
                      <MovementTable title="Combined History" movements={materialDetail.history} />
                    )}
                  </Box>
                )}
              </Paper>
            </Grid>
          </Grid>
        </>
      )}

      <CreateProjectDialog
        open={projectDialogOpen}
        onClose={() => setProjectDialogOpen(false)}
        onSubmit={handleProjectCreated}
      />

      <LinkMaterialDialog
        open={materialDialogOpen}
        onClose={() => setMaterialDialogOpen(false)}
        materials={availableMaterials}
        onLinkExisting={handleLinkMaterial}
        onCreateMaterial={handleCreateMaterial}
      />
    </Box>
  );
}
