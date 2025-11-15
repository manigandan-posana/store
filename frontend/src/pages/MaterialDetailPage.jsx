import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getMaterialDetail } from "../api/projects";
import { recordInward, recordOutward } from "../api/inventory";
import { MovementTable } from "../components/common/MovementTable";
import { InwardForm } from "../components/forms/InwardForm";
import { OutwardForm } from "../components/forms/OutwardForm";
import { useNotification } from "../providers/NotificationProvider";
import { useAuth } from "../providers/AuthProvider";

export function MaterialDetailPage() {
  const { projectId, materialId } = useParams();
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState("overview");
  const [savingInward, setSavingInward] = useState(false);
  const [savingOutward, setSavingOutward] = useState(false);
  const { notify } = useNotification();
  const { user } = useAuth();

  const loadDetail = async () => {
    setLoading(true);
    try {
      const data = await getMaterialDetail(projectId, materialId);
      setDetail(data);
    } catch (error) {
      notify(error.message || "Failed to load material detail", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDetail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId, materialId]);

  const handleInward = async (payload) => {
    setSavingInward(true);
    try {
      await recordInward(projectId, materialId, payload);
      notify("Inward entry recorded", "success");
      await loadDetail();
    } catch (error) {
      notify(error.message || "Failed to record inward", "error");
    } finally {
      setSavingInward(false);
    }
  };

  const handleOutward = async (payload) => {
    setSavingOutward(true);
    try {
      await recordOutward(projectId, materialId, payload);
      notify("Outward entry recorded", "success");
      await loadDetail();
    } catch (error) {
      notify(error.message || "Failed to record outward", "error");
    } finally {
      setSavingOutward(false);
    }
  };

  if (loading || !detail) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        {loading ? <CircularProgress /> : <Typography>No data found.</Typography>}
      </Box>
    );
  }

  const { project, material, stats } = detail;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        {material.name}
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom>
        {project.name} • {material.code}
      </Typography>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              Current Stock
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {stats.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Remaining Tons: {stats.currentStockTons !== null && stats.currentStockTons !== undefined
                ? stats.currentStockTons.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Remaining Units: {stats.currentUnits !== null && stats.currentUnits !== undefined
                ? stats.currentUnits.toLocaleString()
                : "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              Total Inward Quantity
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.totalIn.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tons: {stats.totalInTons !== null && stats.totalInTons !== undefined
                ? stats.totalInTons.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Units: {stats.totalInUnits !== null && stats.totalInUnits !== undefined
                ? stats.totalInUnits.toLocaleString()
                : "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              Total Outward Quantity
            </Typography>
            <Typography variant="h5" fontWeight={700}>
              {stats.totalOut.toLocaleString(undefined, { maximumFractionDigits: 2 })}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Tons: {stats.totalOutTons !== null && stats.totalOutTons !== undefined
                ? stats.totalOutTons.toLocaleString(undefined, { maximumFractionDigits: 2 })
                : "-"}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Units: {stats.totalOutUnits !== null && stats.totalOutUnits !== undefined
                ? stats.totalOutUnits.toLocaleString()
                : "-"}
            </Typography>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="caption" color="text.secondary">
              Line Type
            </Typography>
            <Typography variant="h6" fontWeight={600}>
              {material.category || "–"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              Drawing No.: {material.code || "–"}
            </Typography>
            <Typography variant="caption" color="text.secondary" display="block">
              UOM: {material.unit || "–"}
            </Typography>
          </Grid>
        </Grid>
      </Paper>

      <Paper elevation={1} sx={{ borderRadius: 2, mb: 3 }}>
        <Tabs
          value={tab}
          onChange={(_, value) => setTab(value)}
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab value="overview" label="Overview" />
          <Tab value="inwards" label={`Inwards (${detail.inwards.length})`} />
          <Tab value="outwards" label={`Outwards (${detail.outwards.length})`} />
          <Tab value="history" label={`History (${detail.history.length})`} />
        </Tabs>
      </Paper>

      {tab === "overview" && user?.role !== "ADMIN" && (
        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <InwardForm onSubmit={handleInward} loading={savingInward} />
          </Grid>
          <Grid item xs={12} md={6}>
            <OutwardForm onSubmit={handleOutward} loading={savingOutward} />
          </Grid>
        </Grid>
      )}

      {tab === "overview" && user?.role === "ADMIN" && (
        <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="subtitle1" color="text.secondary">
            Inventory adjustments can be performed by backoffice users. You currently have read-only access.
          </Typography>
        </Paper>
      )}

      {tab === "inwards" && (
        <MovementTable title="Inward Batches" movements={detail.inwards} />
      )}

      {tab === "outwards" && (
        <MovementTable title="Outward Movements" movements={detail.outwards} />
      )}

      {tab === "history" && (
        <MovementTable title="Combined History" movements={detail.history} />
      )}
    </Box>
  );
}
