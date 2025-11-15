import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { fetchInventoryAnalytics, fetchInventoryMovementReport } from "../api/admin";
import { DataCard } from "../components/common/DataCard";
import { useNotification } from "../providers/NotificationProvider";

export function AdminDashboardPage() {
  const { notify } = useNotification();
  const [analytics, setAnalytics] = useState(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(true);
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("");

  useEffect(() => {
    const loadAnalytics = async () => {
      setAnalyticsLoading(true);
      try {
        const data = await fetchInventoryAnalytics();
        setAnalytics(data);
      } catch (error) {
        notify(error.message || "Failed to load analytics", "error");
      } finally {
        setAnalyticsLoading(false);
      }
    };
    loadAnalytics();
  }, [notify]);

  useEffect(() => {
    const loadReport = async () => {
      setReportLoading(true);
      try {
        const projectId = projectFilter ? Number(projectFilter) : undefined;
        const data = await fetchInventoryMovementReport(projectId);
        setReport(data);
      } catch (error) {
        notify(error.message || "Failed to load movement report", "error");
      } finally {
        setReportLoading(false);
      }
    };
    loadReport();
  }, [projectFilter, notify]);

  const formatNumber = (value, fractionDigits = 2) =>
    value !== null && value !== undefined
      ? Number(value).toLocaleString(undefined, { maximumFractionDigits: fractionDigits })
      : "-";

  const projectOptions = report?.projects ?? [];

  const movementCounts = useMemo(() => {
    if (!report?.movements) {
      return { inCount: 0, outCount: 0 };
    }
    return report.movements.reduce(
      (acc, movement) => {
        if (movement.type === "IN") {
          acc.inCount += 1;
        } else if (movement.type === "OUT") {
          acc.outCount += 1;
        }
        return acc;
      },
      { inCount: 0, outCount: 0 }
    );
  }, [report]);

  const handleProjectFilterChange = (event) => {
    setProjectFilter(event.target.value);
  };

  const renderTypeChip = (type) => {
    if (type === "IN") {
      return <Chip label="Inward" color="success" size="small" />;
    }
    if (type === "OUT") {
      return <Chip label="Outward" color="error" size="small" />;
    }
    return <Chip label={type} size="small" />;
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Inventory Analytics &amp; Reports
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Detailed view of project-wise movements, enabling finance and audit teams to reconcile every inward
        batch and FIFO outward issue.
      </Typography>

      {analyticsLoading && !analytics ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
          <CircularProgress />
        </Box>
      ) : (
        analytics && (
          <>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={3}>
                <DataCard title="Projects" value={analytics.totalProjects.toLocaleString()} subtitle="Active & archived" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataCard title="Materials" value={analytics.totalMaterials.toLocaleString()} subtitle="Tracked SKUs" />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataCard
                  title="Quantity In"
                  value={formatNumber(analytics.totalQuantityIn)}
                  subtitle="All projects"
                  color="success"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <DataCard
                  title="Quantity Out"
                  value={formatNumber(analytics.totalQuantityOut)}
                  subtitle="FIFO issued"
                  color="error"
                />
              </Grid>
            </Grid>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6} md={4}>
                <DataCard
                  title="Stock On Hand"
                  value={formatNumber(analytics.totalQuantityOnHand)}
                  subtitle="Current available quantity"
                  color="primary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DataCard
                  title="Tonnage On Hand"
                  value={formatNumber(analytics.totalTonsOnHand)}
                  subtitle="Weighted tonnes"
                  color="secondary"
                />
              </Grid>
              <Grid item xs={12} sm={6} md={4}>
                <DataCard
                  title="Units On Hand"
                  value={analytics.totalUnitsOnHand?.toLocaleString() ?? "-"}
                  subtitle="Pieces / nos"
                  color="warning"
                />
              </Grid>
            </Grid>
          </>
        )
      )}

      {report && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={6} md={4}>
            <DataCard
              title="Movements Logged"
              value={report.movements.length.toLocaleString()}
              subtitle="Filtered dataset"
              color="primary"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DataCard
              title="Inward Quantity"
              value={formatNumber(report.totalInQuantity)}
              subtitle={`${movementCounts.inCount.toLocaleString()} batches`}
              color="success"
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <DataCard
              title="Outward Quantity"
              value={formatNumber(report.totalOutQuantity)}
              subtitle={`${movementCounts.outCount.toLocaleString()} issues`}
              color="error"
            />
          </Grid>
        </Grid>
      )}

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", sm: "center" }}
          sx={{ mb: 2 }}
        >
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              Inward &amp; Outward Movements
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {report?.selectedProject
                ? `Showing transactions for ${report.selectedProject.name} (${report.selectedProject.code}).`
                : "Showing transactions across all projects."}
            </Typography>
          </Box>
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="project-filter-label">Filter by project</InputLabel>
            <Select
              labelId="project-filter-label"
              label="Filter by project"
              value={projectFilter}
              onChange={handleProjectFilterChange}
            >
              <MenuItem value="">
                <em>All projects</em>
              </MenuItem>
              {projectOptions.map((project) => (
                <MenuItem key={project.id} value={project.id}>
                  {project.name} ({project.code})
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        {reportLoading && !report ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress size={32} />
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 520 }}>
            <Table size="small" stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell>Invoice / Handover</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Supplier / Recipient</TableCell>
                  <TableCell>Vehicle / Store</TableCell>
                  <TableCell>Batch / Notes</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {report?.movements?.length ? (
                  report.movements.map((movement) => {
                    const invoiceInfo =
                      movement.type === "IN"
                        ? movement.invoiceNumber || "-"
                        : movement.handoverName || "-";
                    const dateInfo =
                      movement.type === "IN"
                        ? `${movement.invoiceDate || "-"} → ${movement.receiveDate || "-"}`
                        : movement.handoverDate || "-";
                    const personInfo =
                      movement.type === "IN"
                        ? movement.supplierName || "-"
                        : `${movement.handoverName || "-"}${movement.handoverDesignation ? ` (${movement.handoverDesignation})` : ""}`;
                    const vehicleInfo =
                      movement.type === "IN" ? movement.vehicleNumber || "-" : movement.storeInchargeName || "-";
                    const batchInfo = movement.batchSummary || "-";
                    return (
                      <TableRow key={`${movement.type}-${movement.id}`}>
                        <TableCell>{renderTypeChip(movement.type)}</TableCell>
                        <TableCell>{movement.projectName}</TableCell>
                        <TableCell>{movement.materialName}</TableCell>
                        <TableCell align="right">{formatNumber(movement.quantity)}</TableCell>
                        <TableCell>{invoiceInfo}</TableCell>
                        <TableCell>
                          {dateInfo}
                          <Typography variant="caption" color="text.secondary" display="block">
                            {new Date(movement.movementTime).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>{personInfo}</TableCell>
                        <TableCell>{vehicleInfo}</TableCell>
                        <TableCell>{batchInfo}</TableCell>
                        <TableCell>{movement.remarks || "-"}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={9} align="center" sx={{ py: 4, color: "text.secondary" }}>
                      {projectFilter ? "No movements recorded for this project yet." : "No movements recorded yet."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>
    </Box>
  );
}
