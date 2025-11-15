import {
  Autocomplete,
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Pagination,
  Paper,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTheme } from "@mui/material/styles";
import { fetchDashboard } from "../api/dashboard";
import { createProject, getMaterialDetail, linkMaterial, unlinkMaterial } from "../api/projects";
import { listMaterials, createMaterial } from "../api/materials";
import { recordInward, recordOutward } from "../api/inventory";
import { CreateProjectDialog } from "../components/forms/CreateProjectDialog";
import { InwardForm } from "../components/forms/InwardForm";
import { OutwardForm } from "../components/forms/OutwardForm";
import { LinkMaterialDialog } from "../components/forms/LinkMaterialDialog";
import { useNotification } from "../providers/NotificationProvider";
import { sanitizeMaterialPayload } from "../utils/materials";

const PAGE_SIZE_DESKTOP = 6;
const PAGE_SIZE_MOBILE = 4;

const formatNumber = (value) => {
  if (value == null || Number.isNaN(Number(value))) {
    return "0";
  }
  return Number(value).toLocaleString(undefined, { maximumFractionDigits: 2 });
};

const formatDate = (value) => {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleDateString();
};

const formatDateTime = (value) => {
  if (!value) return "–";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString();
};

const getLastActivityTime = (summary) => {
  const candidates = [];
  if (summary?.lastInTime) {
    const time = new Date(summary.lastInTime).getTime();
    if (!Number.isNaN(time)) {
      candidates.push(time);
    }
  }
  if (summary?.lastOutTime) {
    const time = new Date(summary.lastOutTime).getTime();
    if (!Number.isNaN(time)) {
      candidates.push(time);
    }
  }
  if (!candidates.length) {
    return null;
  }
  return Math.max(...candidates);
};

function StatCard({ label, value, helper }) {
  return (
    <Paper
      variant="outlined"
      sx={{
        px: 2.5,
        py: 2,
        borderRadius: 3,
        flex: 1,
        minWidth: 160,
        background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(79,70,229,0.04) 100%)",
      }}
    >
      <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, letterSpacing: 0.4 }}>
        {label}
      </Typography>
      <Typography variant="h6" fontWeight={700} sx={{ mt: 0.5 }}>
        {value}
      </Typography>
      {helper && (
        <Typography variant="caption" color="text.secondary">
          {helper}
        </Typography>
      )}
    </Paper>
  );
}

function MovementList({ title, movements, emptyMessage, unit }) {
  return (
    <Stack spacing={1.5}>
      <Typography variant="subtitle1" fontWeight={700}>
        {title}
      </Typography>
      {movements.length === 0 ? (
        <Paper variant="outlined" sx={{ p: 3, borderRadius: 3, textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary">
            {emptyMessage}
          </Typography>
        </Paper>
      ) : (
        <Stack spacing={1.5}>
          {movements.map((movement) => {
            const isInward = movement.type === "IN";
            const primaryDate = movement.movementTime
              ? formatDateTime(movement.movementTime)
              : isInward
              ? formatDate(movement.receiveDate || movement.invoiceDate)
              : formatDate(movement.handoverDate);
            return (
              <Paper key={`${movement.type}-${movement.id}`} variant="outlined" sx={{ p: 2.5, borderRadius: 3 }}>
                <Stack spacing={1.25}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Chip
                      size="small"
                      color={isInward ? "success" : "error"}
                      label={isInward ? "Inward" : "Outward"}
                      sx={{ fontWeight: 600 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {primaryDate}
                    </Typography>
                  </Stack>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {formatNumber(movement.quantity)} {unit || ""}
                  </Typography>
                  <Stack spacing={0.5}>
                    {isInward ? (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          Invoice #: {movement.invoiceNumber || "–"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Vehicle #: {movement.vehicleNumber || "–"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Supplier: {movement.supplierName || "–"}
                        </Typography>
                      </>
                    ) : (
                      <>
                        <Typography variant="caption" color="text.secondary">
                          Handover: {movement.handoverName || "–"}
                          {movement.handoverDesignation ? ` (${movement.handoverDesignation})` : ""}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Store Incharge: {movement.storeInchargeName || "–"}
                        </Typography>
                      </>
                    )}
                    {movement.batchSummary && (
                      <Typography variant="caption" color="text.secondary">
                        {movement.batchSummary}
                      </Typography>
                    )}
                    {movement.remarks && (
                      <Typography variant="caption" color="text.secondary">
                        Remarks: {movement.remarks}
                      </Typography>
                    )}
                  </Stack>
                </Stack>
              </Paper>
            );
          })}
        </Stack>
      )}
    </Stack>
  );
}

function MaterialCard({ summary, selected, onSelect, onInward, onOutward, onUnlink }) {
  const handleSelect = () => {
    onSelect(summary.materialId);
  };

  const lastActivity = getLastActivityTime(summary);

  return (
    <Paper
      onClick={handleSelect}
      variant="outlined"
      sx={{
        p: 2.5,
        borderRadius: 3,
        borderWidth: selected ? 2 : 1,
        borderColor: selected ? "primary.main" : "divider",
        backgroundColor: selected ? "rgba(99,102,241,0.08)" : "background.paper",
        boxShadow: selected ? 4 : 0,
        transition: "border-color 0.2s ease, box-shadow 0.2s ease",
        cursor: "pointer",
      }}
    >
      <Stack spacing={2}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          spacing={1.5}
        >
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              {summary.materialName}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              {summary.materialCode && <Chip size="small" label={summary.materialCode} variant="outlined" />}
              {summary.unit && <Chip size="small" label={`UOM: ${summary.unit}`} variant="outlined" />}
            </Stack>
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5 }}>
              Last activity: {lastActivity ? new Date(lastActivity).toLocaleString() : "–"}
            </Typography>
          </Box>
          <Box textAlign={{ xs: "left", sm: "right" }}>
            <Typography variant="caption" color="text.secondary">
              Stock in hand
            </Typography>
            <Typography
              variant="h5"
              fontWeight={700}
              color={summary.currentStock > 0 ? "primary.main" : "error.main"}
            >
              {formatNumber(summary.currentStock)} {summary.unit || ""}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              In {formatNumber(summary.totalIn)} • Out {formatNumber(summary.totalOut)}
            </Typography>
          </Box>
        </Stack>

        <Divider />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} flexWrap="wrap">
          <Button
            size="small"
            variant="contained"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(summary.materialId);
              onInward();
            }}
          >
            Record inward
          </Button>
          <Button
            size="small"
            variant="outlined"
            color="error"
            onClick={(event) => {
              event.stopPropagation();
              onSelect(summary.materialId);
              onOutward();
            }}
          >
            Record outward
          </Button>
          <Button
            size="small"
            variant="text"
            color="inherit"
            onClick={(event) => {
              event.stopPropagation();
              onUnlink(summary.materialId);
            }}
          >
            Remove from project
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}

export function DashboardPage() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const pageSize = isMobile ? PAGE_SIZE_MOBILE : PAGE_SIZE_DESKTOP;

  const { notify } = useNotification();
  const [dashboard, setDashboard] = useState(null);
  const [dashboardLoading, setDashboardLoading] = useState(true);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [selectedMaterialId, setSelectedMaterialId] = useState(null);
  const [materialDetail, setMaterialDetail] = useState(null);
  const [materialLoading, setMaterialLoading] = useState(false);
  const [showInwardForm, setShowInwardForm] = useState(false);
  const [showOutwardForm, setShowOutwardForm] = useState(false);
  const [savingInward, setSavingInward] = useState(false);
  const [savingOutward, setSavingOutward] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [materialDialogOpen, setMaterialDialogOpen] = useState(false);
  const [allMaterials, setAllMaterials] = useState([]);
  const [search, setSearch] = useState("");
  const [movementFilter, setMovementFilter] = useState("all");
  const [stockFilter, setStockFilter] = useState("all");
  const [sortOption, setSortOption] = useState("activity");
  const [page, setPage] = useState(1);

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
            if (prev && data.materialSummaries.some((item) => item.materialId === prev)) {
              return prev;
            }
            return data.materialSummaries[0].materialId;
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
    setShowInwardForm(false);
    setShowOutwardForm(false);
  }, [selectedMaterialId, selectedProjectId]);

  const materialOptions = dashboard?.materialSummaries ?? [];

  const sortedMaterials = useMemo(() => {
    const items = [...materialOptions];
    switch (sortOption) {
      case "name":
        items.sort((a, b) => a.materialName.localeCompare(b.materialName));
        break;
      case "stockDesc":
        items.sort((a, b) => b.currentStock - a.currentStock);
        break;
      case "stockAsc":
        items.sort((a, b) => a.currentStock - b.currentStock);
        break;
      default: {
        items.sort((a, b) => {
          const aTime = getLastActivityTime(a) ?? 0;
          const bTime = getLastActivityTime(b) ?? 0;
          return bTime - aTime;
        });
        break;
      }
    }
    return items;
  }, [materialOptions, sortOption]);

  const filteredMaterials = useMemo(() => {
    const query = search.trim().toLowerCase();
    return sortedMaterials.filter((item) => {
      const matchesSearch =
        !query || [item.materialName, item.materialCode, item.unit].filter(Boolean).some((value) => value.toLowerCase().includes(query));
      if (!matchesSearch) {
        return false;
      }
      const matchesMovement =
        movementFilter === "all"
        || (movementFilter === "in" && item.totalIn > 0)
        || (movementFilter === "out" && item.totalOut > 0);
      if (!matchesMovement) {
        return false;
      }
      const matchesStock =
        stockFilter === "all"
        || (stockFilter === "available" && item.currentStock > 0)
        || (stockFilter === "out" && item.currentStock <= 0);
      return matchesStock;
    });
  }, [sortedMaterials, search, movementFilter, stockFilter]);

  useEffect(() => {
    setPage(1);
  }, [search, movementFilter, stockFilter, sortOption, pageSize, selectedProjectId]);

  useEffect(() => {
    if (!filteredMaterials.length) {
      setSelectedMaterialId(null);
      return;
    }
    setSelectedMaterialId((prev) => {
      if (prev && filteredMaterials.some((item) => item.materialId === prev)) {
        return prev;
      }
      return filteredMaterials[0].materialId;
    });
  }, [filteredMaterials]);

  const pageCount = filteredMaterials.length ? Math.ceil(filteredMaterials.length / pageSize) : 0;
  const paginatedMaterials = useMemo(() => {
    if (!filteredMaterials.length) {
      return [];
    }
    const start = (page - 1) * pageSize;
    return filteredMaterials.slice(start, start + pageSize);
  }, [filteredMaterials, page, pageSize]);

  useEffect(() => {
    if (page > pageCount && pageCount > 0) {
      setPage(pageCount);
    }
  }, [page, pageCount]);

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

  const handleCreateMaterial = async (payload) => {
    const sanitized = sanitizeMaterialPayload(payload);
    if (!sanitized.name || !sanitized.code) {
      const validationError = new Error("Material name and drawing number are required");
      notify(validationError.message, "warning");
      throw validationError;
    }
    try {
      const material = await createMaterial(sanitized);
      setAllMaterials((prev) => [...prev, material]);
      notify("Material created", "success");
      return material;
    } catch (error) {
      notify(error.message || "Failed to create material", "error");
      throw error;
    }
  };

  const handleLinkMaterial = async ({ materialId }) => {
    if (!selectedProjectId) {
      notify("Select a project first", "warning");
      return;
    }
    try {
      await linkMaterial(selectedProjectId, { materialId });
      notify("Material linked to project", "success");
      setMaterialDialogOpen(false);
      await loadDashboard(selectedProjectId);
      setSelectedMaterialId(materialId);
    } catch (error) {
      notify(error.message || "Failed to link material", "error");
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

  const projectTotals = useMemo(() => {
    if (!materialOptions.length) {
      return { totalIn: 0, totalOut: 0, currentStock: 0 };
    }
    return materialOptions.reduce(
      (acc, item) => ({
        totalIn: acc.totalIn + item.totalIn,
        totalOut: acc.totalOut + item.totalOut,
        currentStock: acc.currentStock + item.currentStock,
      }),
      { totalIn: 0, totalOut: 0, currentStock: 0 }
    );
  }, [materialOptions]);

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

  const handleLinkMaterial = async ({ materialId }) => {
    if (!selectedProjectId) {
      notify("Select a project first", "warning");
      return;
    }
    try {
      await linkMaterial(selectedProjectId, { materialId });
      notify("Material linked to project", "success");
      setMaterialDialogOpen(false);
      await loadDashboard(selectedProjectId);
      setSelectedMaterialId(materialId);
    } catch (error) {
      notify(error.message || "Failed to link material", "error");
    }
  };

  const handleCreateMaterial = async (payload) => {
    const sanitized = sanitizeMaterialPayload(payload);
    if (!sanitized.name || !sanitized.code) {
      const validationError = new Error("Material name and drawing number are required");
      notify(validationError.message, "warning");
      throw validationError;
    }
    try {
      const material = await createMaterial(sanitized);
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
    <Box sx={{ backgroundColor: "background.default", minHeight: "100vh" }}>
      <Box
        sx={{
          background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.background.default} 55%, ${theme.palette.background.paper} 100%)`,
          pb: { xs: 4, md: 6 },
        }}
      >
        <Container maxWidth="lg" sx={{ pt: { xs: 4, md: 6 } }}>
          <Stack spacing={{ xs: 3, md: 4 }}>
            <Stack spacing={1}>
              <Typography variant={isMobile ? "h5" : "h4"} fontWeight={800}>
                Backoffice Inventory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Track every inward and outward movement with FIFO details and live stock-on-hand snapshots.
              </Typography>
            </Stack>

            <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
              <Button
                variant="contained"
                size={isMobile ? "medium" : "large"}
                onClick={() => setProjectDialogOpen(true)}
                sx={{ borderRadius: 999 }}
              >
                Create project
              </Button>
              <Button
                variant="outlined"
                size={isMobile ? "medium" : "large"}
                sx={{ borderRadius: 999 }}
                onClick={() => setMaterialDialogOpen(true)}
                disabled={!selectedProjectId}
              >
                Link material
              </Button>
            </Stack>

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 600 }} gutterBottom>
                    Focus project
                  </Typography>
                  <Autocomplete
                    options={dashboard?.projects ?? []}
                    getOptionLabel={(option) => `${option.name} (${option.code})`}
                    value={selectedProjectId ? dashboard?.projects?.find((p) => p.id === selectedProjectId) ?? null : null}
                    onChange={(_, value) => setSelectedProjectId(value ? value.id : null)}
                    isOptionEqualToValue={(option, value) => option.id === value.id}
                    renderInput={(params) => <TextField {...params} placeholder="Search or scan project" size="small" />}
                    loading={dashboardLoading && !(dashboard?.projects?.length > 0)}
                  />
                </Box>
                {selectedProject && (
                  <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ xs: "flex-start", sm: "center" }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={700}>
                        {selectedProject.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {selectedProject.clientLocation || "–"} • {selectedProject.status || "In Progress"}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      <Chip label={`${materialOptions.length.toLocaleString()} materials`} size="small" />
                    </Stack>
                  </Stack>
                )}
                {selectedProject && (
                  <Stack direction="row" spacing={2} flexWrap="wrap">
                    <StatCard
                      label="Total inward"
                      value={`${formatNumber(projectTotals.totalIn)} ${selectedMaterialSummary?.unit || ""}`}
                      helper="All batches received"
                    />
                    <StatCard
                      label="Total outward"
                      value={`${formatNumber(projectTotals.totalOut)} ${selectedMaterialSummary?.unit || ""}`}
                      helper="FIFO issued"
                    />
                    <StatCard
                      label="Stock in hand"
                      value={`${formatNumber(projectTotals.currentStock)} ${selectedMaterialSummary?.unit || ""}`}
                      helper="Across linked materials"
                    />
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
        {dashboardLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress />
          </Box>
        ) : !selectedProject ? (
          <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              Create a project to begin
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Start by capturing the site details so materials and movements can be tracked instantly.
            </Typography>
          </Paper>
        ) : (
          <Stack spacing={4}>
            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "stretch", md: "center" }}>
                  <TextField
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search material name or drawing number"
                    size="small"
                    fullWidth
                  />
                  <TextField
                    select
                    SelectProps={{ native: true }}
                    label="Sort by"
                    size="small"
                    value={sortOption}
                    onChange={(event) => setSortOption(event.target.value)}
                    sx={{ width: { xs: "100%", sm: 220 } }}
                  >
                    <option value="activity">Latest activity</option>
                    <option value="stockDesc">Stock high to low</option>
                    <option value="stockAsc">Stock low to high</option>
                    <option value="name">Name (A-Z)</option>
                  </TextField>
                </Stack>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {[
                    { value: "all", label: "All activity" },
                    { value: "in", label: "Has inwards" },
                    { value: "out", label: "Has outwards" },
                  ].map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      color={movementFilter === option.value ? "primary" : "default"}
                      variant={movementFilter === option.value ? "filled" : "outlined"}
                      onClick={() => setMovementFilter(option.value)}
                    />
                  ))}
                  <Divider flexItem orientation="vertical" sx={{ mx: 1, display: { xs: "none", sm: "block" } }} />
                  {[
                    { value: "all", label: "All stock" },
                    { value: "available", label: "In stock" },
                    { value: "out", label: "Out of stock" },
                  ].map((option) => (
                    <Chip
                      key={option.value}
                      label={option.label}
                      color={stockFilter === option.value ? "primary" : "default"}
                      variant={stockFilter === option.value ? "filled" : "outlined"}
                      onClick={() => setStockFilter(option.value)}
                    />
                  ))}
                </Stack>
              </Stack>
            </Paper>

            {filteredMaterials.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
                <Typography variant="h6" fontWeight={700} gutterBottom>
                  No materials match the filters
                </Typography>
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Adjust your filters or link another material to this project.
                </Typography>
                <Button variant="contained" onClick={() => setMaterialDialogOpen(true)} disabled={!selectedProjectId}>
                  Link material
                </Button>
              </Paper>
            ) : (
              <Stack spacing={3}>
                <Stack spacing={2}>
                  {paginatedMaterials.map((summary) => (
                    <MaterialCard
                      key={summary.materialId}
                      summary={summary}
                      selected={summary.materialId === selectedMaterialId}
                      onSelect={setSelectedMaterialId}
                      onInward={() => setShowInwardForm(true)}
                      onOutward={() => setShowOutwardForm(true)}
                      onUnlink={handleUnlinkMaterial}
                    />
                  ))}
                </Stack>
                {pageCount > 1 && (
                  <Pagination
                    count={pageCount}
                    page={page}
                    onChange={(_, value) => setPage(value)}
                    shape="rounded"
                    color="primary"
                    sx={{ alignSelf: "center" }}
                  />
                )}
              </Stack>
            )}

            <Paper variant="outlined" sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
              <Stack spacing={3}>
                <Stack
                  direction={{ xs: "column", md: "row" }}
                  spacing={2}
                  alignItems={{ xs: "flex-start", md: "center" }}
                  justifyContent="space-between"
                >
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      Material focus
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      See stock-in-hand, invoices received, and FIFO issued history in one mobile-ready panel.
                    </Typography>
                  </Box>
                  {selectedMaterialSummary && (
                    <Chip
                      label={`${selectedMaterialSummary.materialCode || ""} • ${selectedMaterialSummary.unit || ""}`}
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
                  <Paper variant="outlined" sx={{ p: 4, borderRadius: 3, textAlign: "center" }}>
                    <Typography variant="body2" color="text.secondary">
                      Select a material above to review its inward and outward history.
                    </Typography>
                  </Paper>
                ) : (
                  <Stack spacing={3}>
                    <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems={{ xs: "flex-start", md: "center" }}>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {materialDetail.material.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {materialDetail.project.name} • {materialDetail.material.code || "–"} • UOM {materialDetail.material.unit || "–"}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} flexWrap="wrap">
                        <StatCard
                          label="Stock in hand"
                          value={`${formatNumber(materialDetail.stats.currentStock)} ${materialDetail.material.unit || ""}`}
                        />
                        <StatCard
                          label="Total in / out"
                          value={`${formatNumber(materialDetail.stats.totalIn)} / ${formatNumber(materialDetail.stats.totalOut)}`}
                        />
                      </Stack>
                    </Stack>

                    <Stack direction={{ xs: "column", md: "row" }} spacing={1} flexWrap="wrap">
                      <Button variant="contained" onClick={() => setShowInwardForm(true)}>
                        Record inward
                      </Button>
                      <Button variant="outlined" color="error" onClick={() => setShowOutwardForm(true)}>
                        Record outward
                      </Button>
                      <Button variant="text" color="inherit" onClick={() => handleUnlinkMaterial(materialDetail.material.id)}>
                        Remove from project
                      </Button>
                    </Stack>

                    <MovementList
                      title="Inward batches"
                      movements={materialDetail.inwards}
                      emptyMessage="No inward entries yet."
                      unit={materialDetail.material.unit}
                    />
                    <MovementList
                      title="Outward movements"
                      movements={materialDetail.outwards}
                      emptyMessage="No outward entries yet."
                      unit={materialDetail.material.unit}
                    />
                    <MovementList
                      title="Complete history"
                      movements={materialDetail.history}
                      emptyMessage="No history recorded yet."
                      unit={materialDetail.material.unit}
                    />
                  </Stack>
                )}
              </Stack>
            </Paper>
          </Stack>
        )}
      </Container>

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

      <Dialog
        open={showInwardForm}
        onClose={() => setShowInwardForm(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Record inward entry</DialogTitle>
        <DialogContent dividers>
          <InwardForm onSubmit={handleInward} loading={savingInward} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowInwardForm(false)} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showOutwardForm}
        onClose={() => setShowOutwardForm(false)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>Record outward entry</DialogTitle>
        <DialogContent dividers>
          <OutwardForm onSubmit={handleOutward} loading={savingOutward} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowOutwardForm(false)} color="inherit">
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
