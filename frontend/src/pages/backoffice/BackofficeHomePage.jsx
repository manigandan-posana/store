import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchDashboard } from "../../api/dashboard";
import { useNotification } from "../../providers/NotificationProvider";

export function BackofficeHomePage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const data = await fetchDashboard();
        setDashboard(data);
      } catch (error) {
        notify(error.message || "Failed to load dashboard", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [notify]);

  const filteredLowStock = useMemo(() => {
    if (!dashboard?.lowStockList) return [];
    const query = search.trim().toLowerCase();
    if (!query) return dashboard.lowStockList;
    return dashboard.lowStockList.filter((item) =>
      [item.materialName, item.materialCode].some((value) => value?.toLowerCase().includes(query))
    );
  }, [dashboard, search]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!dashboard) {
    return (
      <Typography color="text.secondary" textAlign="center" sx={{ py: 4 }}>
        No data available yet.
      </Typography>
    );
  }

  const recentMovements = dashboard.recentMovements ?? [];

  return (
    <Stack spacing={3}>
      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            Today at a glance
          </Typography>
          <Stack direction="row" spacing={2} flexWrap="wrap">
            <SummaryChip label="Inwards" value={dashboard.todaysInwards} color="success" />
            <SummaryChip label="Outwards" value={dashboard.todaysOutwards} color="error" />
            <SummaryChip label="Low Stock" value={dashboard.lowStockMaterials} color="warning" />
          </Stack>
        </CardContent>
      </Card>

      <Stack spacing={2} direction="row">
        <Button variant="contained" fullWidth size="large" onClick={() => navigate("/backoffice/inwards/new")}>
          + New Inward
        </Button>
        <Button variant="outlined" fullWidth size="large" onClick={() => navigate("/backoffice/outwards/new")}>
          + New Outward
        </Button>
      </Stack>

      <Card elevation={1} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Scan / Search Material
          </Typography>
          <TextField
            placeholder="Search material code or name"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            fullWidth
            size="small"
          />
          <List dense sx={{ mt: 2 }}>
            {filteredLowStock.length === 0 && (
              <ListItem>
                <ListItemText primary="No low stock materials" primaryTypographyProps={{ color: "text.secondary" }} />
              </ListItem>
            )}
            {filteredLowStock.slice(0, 5).map((item) => (
              <ListItem key={item.materialId} disableGutters>
                <ListItemText
                  primary={`${item.materialName}${item.materialCode ? ` (${item.materialCode})` : ""}`}
                  secondary={`On hand ${
                    item.currentStock != null
                      ? item.currentStock.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : "-"
                  }${item.unit ? ` ${item.unit}` : ""}`}
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Recent Activity
          </Typography>
          <List dense>
            {recentMovements.length === 0 && (
              <ListItem>
                <ListItemText primary="No recent movements" primaryTypographyProps={{ color: "text.secondary" }} />
              </ListItem>
            )}
            {recentMovements.map((movement) => (
              <ListItem key={movement.id} disableGutters sx={{ pb: 1 }}>
                <Stack spacing={0.5} width="100%">
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Chip
                      size="small"
                      label={movement.type === "IN" ? "Inward" : "Outward"}
                      color={movement.type === "IN" ? "success" : "error"}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {movement.movementTime ? new Date(movement.movementTime).toLocaleString() : "-"}
                    </Typography>
                  </Stack>
                  <Typography variant="body2" fontWeight={600}>
                    {movement.materialName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {movement.projectName} • Qty {movement.quantity != null
                      ? movement.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : "-"}
                  </Typography>
                </Stack>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Stack>
  );
}

function SummaryChip({ label, value, color }) {
  return (
    <Chip
      label={`${label}: ${value}`}
      color={color}
      sx={{ fontWeight: 600, fontSize: "0.85rem", borderRadius: 1.5 }}
    />
  );
}
