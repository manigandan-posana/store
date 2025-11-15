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
import { useNavigate } from "react-router-dom";
import { fetchInwards } from "../../api/inventory";
import { useNotification } from "../../providers/NotificationProvider";

export function BackofficeInwardsListPage() {
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [inwards, setInwards] = useState([]);
  const [form, setForm] = useState({ startDate: "", endDate: "", supplier: "" });

  const loadInwards = useCallback(
    async (filters) => {
      try {
        const data = await fetchInwards(filters);
        setInwards(data);
      } catch (error) {
        notify(error.message || "Failed to load inwards", "error");
      }
    },
    [notify]
  );

  useEffect(() => {
    loadInwards({});
  }, [loadInwards]);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const applyFilters = () => {
    const filters = {};
    if (form.startDate) filters.startDate = form.startDate;
    if (form.endDate) filters.endDate = form.endDate;
    if (form.supplier) filters.supplier = form.supplier;
    loadInwards(filters);
  };

  return (
    <Box pb={8}>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Inwards
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Swipe through recent receipts and tap an entry for more detail.
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
        <TextField
          label="Supplier"
          name="supplier"
          value={form.supplier}
          onChange={handleChange}
          fullWidth
        />
        <Stack direction="row" spacing={1}>
          <Button variant="contained" fullWidth onClick={applyFilters}>
            Apply
          </Button>
          <Button
            variant="text"
            fullWidth
            onClick={() => {
              setForm({ startDate: "", endDate: "", supplier: "" });
              loadInwards({});
            }}
          >
            Clear
          </Button>
        </Stack>
      </Stack>

      <Stack spacing={2}>
        {inwards.length === 0 && (
          <Typography variant="body2" color="text.secondary">
            No inward entries yet.
          </Typography>
        )}
        {inwards.map((entry) => (
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
                  Supplier: {entry.issuedToOrSupplier || "-"}
                </Typography>
                <Typography variant="subtitle2" color="primary">
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
        onClick={() => navigate("/backoffice/inwards/new")}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
}
