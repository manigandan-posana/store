import {
  Box,
  CircularProgress,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { fetchInventoryAnalytics } from "../api/admin";
import { DataCard } from "../components/common/DataCard";
import { useNotification } from "../providers/NotificationProvider";

export function AdminDashboardPage() {
  const { notify } = useNotification();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchInventoryAnalytics();
        setAnalytics(data);
      } catch (error) {
        notify(error.message || "Failed to load analytics", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!analytics) {
    return (
      <Typography color="text.secondary" textAlign="center" sx={{ py: 6 }}>
        No analytics available yet.
      </Typography>
    );
  }

  const formatNumber = (value, fractionDigits = 2) =>
    value !== null && value !== undefined
      ? Number(value).toLocaleString(undefined, { maximumFractionDigits: fractionDigits })
      : "-";

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Inventory Analytics
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Monitor enterprise-wide inventory health, consumption trends, and backoffice utilisation.
      </Typography>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={3}>
          <DataCard title="Projects" value={analytics.totalProjects.toLocaleString()} subtitle="Active & archived" />
        </Grid>
        <Grid item xs={12} md={3}>
          <DataCard title="Materials" value={analytics.totalMaterials.toLocaleString()} subtitle="Tracked SKUs" />
        </Grid>
        <Grid item xs={12} md={3}>
          <DataCard
            title="Quantity In"
            value={formatNumber(analytics.totalQuantityIn)}
            subtitle="All projects"
            color="success"
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <DataCard
            title="Quantity Out"
            value={formatNumber(analytics.totalQuantityOut)}
            subtitle="FIFO issued"
            color="error"
          />
        </Grid>
      </Grid>

      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <DataCard
            title="Stock On Hand"
            value={formatNumber(analytics.totalQuantityOnHand)}
            subtitle="Current available quantity"
            color="primary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DataCard
            title="Tonnage On Hand"
            value={formatNumber(analytics.totalTonsOnHand)}
            subtitle="Weighted tonnes"
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <DataCard
            title="Units On Hand"
            value={analytics.totalUnitsOnHand?.toLocaleString() ?? "-"}
            subtitle="Pieces / nos"
            color="warning"
          />
        </Grid>
      </Grid>

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Project-wise Consumption (FIFO)
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Project</TableCell>
              <TableCell>Material</TableCell>
              <TableCell align="right">Quantity Issued</TableCell>
              <TableCell align="right">Tons Issued</TableCell>
              <TableCell align="right">Units Issued</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {analytics.projectConsumption.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No outward movements captured yet.
                </TableCell>
              </TableRow>
            )}
            {analytics.projectConsumption.flatMap((project) =>
              project.materials.map((material) => (
                <TableRow key={`${project.projectId}-${material.materialId}`}>
                  <TableCell>{project.projectName}</TableCell>
                  <TableCell>{material.materialName}</TableCell>
                  <TableCell align="right">{formatNumber(material.quantityConsumed)}</TableCell>
                  <TableCell align="right">{formatNumber(material.weightConsumed)}</TableCell>
                  <TableCell align="right">
                    {material.unitsConsumed ? material.unitsConsumed.toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
