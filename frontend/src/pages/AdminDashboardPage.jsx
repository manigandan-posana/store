import {
  Box,
  Chip,
  CircularProgress,
  FormControl,
  InputAdornment,
  InputLabel,
  MenuItem,
  Paper,
  Pagination,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import { useEffect, useMemo, useState } from "react";
import { fetchInventoryMovementReport } from "../api/admin";
import { listMaterials } from "../api/materials";
import { useNotification } from "../providers/NotificationProvider";

export function AdminDashboardPage() {
  const { notify } = useNotification();
  const [report, setReport] = useState(null);
  const [reportLoading, setReportLoading] = useState(true);
  const [projectFilter, setProjectFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [materialsMap, setMaterialsMap] = useState({});
  const [movementPage, setMovementPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  useEffect(() => {
    listMaterials()
      .then((materials) => {
        const index = materials.reduce((acc, material) => {
          acc[material.id] = material;
          return acc;
        }, {});
        setMaterialsMap(index);
      })
      .catch(() => {});
  }, []);

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

  useEffect(() => {
    setMovementPage(1);
  }, [projectFilter, typeFilter, search, rowsPerPage]);

  const formatNumber = (value, fractionDigits = 2) =>
    value !== null && value !== undefined
      ? Number(value).toLocaleString(undefined, { maximumFractionDigits: fractionDigits })
      : "-";

  const projectOptions = report?.projects ?? [];

  const filteredMovements = useMemo(() => {
    if (!report?.movements) {
      return [];
    }
    const query = search.trim().toLowerCase();
    return report.movements.filter((movement) => {
      if (typeFilter !== "ALL" && movement.type !== typeFilter) {
        return false;
      }
      if (!query) {
        return true;
      }
      const values = [
        movement.projectName,
        movement.materialName,
        movement.invoiceNumber,
        movement.handoverName,
        movement.supplierName,
        movement.vehicleNumber,
        movement.storeInchargeName,
      ];
      return values.some((value) => value?.toLowerCase?.().includes(query));
    });
  }, [report, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredMovements.length / rowsPerPage));

  const paginatedMovements = useMemo(() => {
    if (!filteredMovements.length) {
      return [];
    }
    const start = (movementPage - 1) * rowsPerPage;
    return filteredMovements.slice(start, start + rowsPerPage);
  }, [filteredMovements, movementPage, rowsPerPage]);

  useEffect(() => {
    if (movementPage > totalPages) {
      setMovementPage(totalPages);
    }
  }, [movementPage, totalPages]);

  const movementCounts = useMemo(() => {
    return filteredMovements.reduce(
      (acc, movement) => {
        if (movement.type === "IN") {
          acc.inCount += 1;
          acc.inQuantity += movement.quantity;
        } else if (movement.type === "OUT") {
          acc.outCount += 1;
          acc.outQuantity += movement.quantity;
        }
        return acc;
      },
      { inCount: 0, outCount: 0, inQuantity: 0, outQuantity: 0 }
    );
  }, [filteredMovements]);

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
      <Stack spacing={1} sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700}>
          Inventory Movement Ledger
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Audit every inward batch and FIFO outward issue with powerful filters and live stock context.
        </Typography>
      </Stack>

      <Paper elevation={1} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          spacing={2}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          sx={{ mb: 3, gap: 2 }}
        >
          <FormControl size="small" sx={{ minWidth: 220 }}>
            <InputLabel id="project-filter-label">Project</InputLabel>
            <Select
              labelId="project-filter-label"
              label="Project"
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

          <ToggleButtonGroup
            value={typeFilter}
            exclusive
            onChange={(_, value) => value && setTypeFilter(value)}
            size="small"
            aria-label="movement type filter"
          >
            <ToggleButton value="ALL">All</ToggleButton>
            <ToggleButton value="IN">Inwards</ToggleButton>
            <ToggleButton value="OUT">Outwards</ToggleButton>
          </ToggleButtonGroup>

          <TextField
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            size="small"
            placeholder="Search project, material, invoice..."
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: "100%", md: 320 } }}
          />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel id="rows-per-page-label">Rows</InputLabel>
            <Select
              labelId="rows-per-page-label"
              label="Rows"
              value={rowsPerPage}
              onChange={(event) => setRowsPerPage(Number(event.target.value))}
            >
              {[10, 25, 50, 100].map((size) => (
                <MenuItem key={size} value={size}>
                  {size} / page
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2} sx={{ mb: 3 }}>
          <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Total entries
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {filteredMovements.length.toLocaleString()}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {report?.selectedProject
                ? `${report.selectedProject.name} (${report.selectedProject.code})`
                : "All projects"}
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Inwards
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {movementCounts.inCount.toLocaleString()} • {formatNumber(movementCounts.inQuantity, 1)}
            </Typography>
          </Box>
          <Box sx={{ p: 2, borderRadius: 2, border: "1px solid", borderColor: "divider", flex: 1 }}>
            <Typography variant="caption" color="text.secondary">
              Outwards
            </Typography>
            <Typography variant="h6" fontWeight={700}>
              {movementCounts.outCount.toLocaleString()} • {formatNumber(movementCounts.outQuantity, 1)}
            </Typography>
          </Box>
        </Stack>

        {reportLoading && !report ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
            <CircularProgress size={32} />
          </Box>
        ) : filteredMovements.length === 0 ? (
          <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
            No movements match the current filters.
          </Box>
        ) : (
          <TableContainer sx={{ maxHeight: 560 }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Type</TableCell>
                  <TableCell>Project</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">On hand</TableCell>
                  <TableCell>Invoice / Handover</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Supplier / Recipient</TableCell>
                  <TableCell>Vehicle / Store</TableCell>
                  <TableCell>Batch / Notes</TableCell>
                  <TableCell>Remarks</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {paginatedMovements.map((movement) => {
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
                  const materialRecord = materialsMap[movement.materialId];
                  const onHand = materialRecord?.onHandQuantity;

                  return (
                    <TableRow key={`${movement.type}-${movement.id}`} hover>
                      <TableCell>{renderTypeChip(movement.type)}</TableCell>
                      <TableCell>{movement.projectName}</TableCell>
                      <TableCell>{movement.materialName}</TableCell>
                      <TableCell align="right">{formatNumber(movement.quantity)}</TableCell>
                      <TableCell align="right">
                        {onHand !== undefined ? formatNumber(onHand) : "-"}
                      </TableCell>
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
                })}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        {filteredMovements.length > rowsPerPage && (
          <Stack
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            sx={{ mt: 3 }}
            spacing={2}
          >
            <Typography variant="body2" color="text.secondary">
              Showing {paginatedMovements.length} of {filteredMovements.length} records
            </Typography>
            <Pagination
              count={totalPages}
              page={movementPage}
              color="primary"
              shape="rounded"
              onChange={(_, value) => setMovementPage(value)}
              showFirstButton
              showLastButton
            />
          </Stack>
        )}
      </Paper>
    </Box>
  );
}
