import {
  Box,
  Button,
  Card,
  CardContent,
  Fab,
  Grid,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { useCallback, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { fetchOutwards } from "../../api/inventory";
import { useNotification } from "../../providers/NotificationProvider";

export function BackofficeOutwardsListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { notify } = useNotification();
  const [outwards, setOutwards] = useState([]);
  const [form, setForm] = useState({ startDate: "", endDate: "", project: "" });

  const loadOutwards = useCallback(
    async (filters) => {
      try {
        const data = await fetchOutwards(filters);
        setOutwards(data);
      } catch (error) {
        notify(error.message || "Failed to load outwards", "error");
      }
    },
    [notify]
  );

  useEffect(() => {
    loadOutwards({});
  }, [loadOutwards]);

  useEffect(() => {
    if (!location.state) {
      return;
    }
    const { project, projectId } = location.state;
    const filters = {};
    if (project) filters.project = project;
    if (projectId) filters.projectId = projectId;
    setForm((prev) => ({ ...prev, project: project || "" }));
    loadOutwards(filters);
    navigate(location.pathname, { replace: true });
  }, [location, loadOutwards, navigate]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filters = {};
    if (form.startDate) filters.startDate = form.startDate;
    if (form.endDate) filters.endDate = form.endDate;
    if (form.project) filters.project = form.project;
    loadOutwards(filters);
  };

  return (
    <Box pb={8}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Outwards
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Track issues and dispatches across active projects.
      </Typography>

      <Stack spacing={2} sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              label="Start"
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="End"
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>
        <TextField label="Project" name="project" value={form.project} onChange={handleChange} fullWidth />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" fullWidth onClick={applyFilters}>
            Apply
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => {
              setForm({ startDate: "", endDate: "", project: "" });
              loadOutwards({});
            }}
          >
            Clear
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {outwards.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No outward entries yet.
          </Typography>
        )}
        {outwards.map((entry) => (
          <Card key={entry.id} elevation={2} sx={{ borderRadius: 3 }}>
            <CardContent>
              <Stack spacing={0.5}>
                <Typography variant="subtitle2" fontWeight={700}>
                  {entry.reference || "No reference"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {entry.movementTime ? new Date(entry.movementTime).toLocaleString() : "-"}
                </Typography>
                <Typography variant="body2">
                  {entry.projectName} • {entry.materialName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Issued to: {entry.issuedToOrSupplier || "-"}
                </Typography>
                <Typography variant="subtitle2" color="error">
                  Qty {entry.quantity.toLocaleString(undefined, { maximumFractionDigits: 2 })}
                </Typography>
              </Stack>
            </CardContent>
          </Card>
        ))}
      </Stack>

      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: "fixed", bottom: 88, right: 16 }}
        onClick={() => navigate("/backoffice/outwards/new")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
