import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";

const initialState = () => ({
  quantity: "",
  weightTons: "",
  unitsCount: "",
  movementTime: dayjs().format("YYYY-MM-DDTHH:mm"),
  issuedTo: "",
  reference: "",
  remarks: "",
});

export function OutwardForm({ onSubmit, loading }) {
  const [form, setForm] = useState(() => initialState());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      quantity: Number(form.quantity),
      weightTons: form.weightTons ? Number(form.weightTons) : null,
      unitsCount: form.unitsCount ? Number(form.unitsCount) : null,
      movementTime: form.movementTime ? new Date(form.movementTime).toISOString() : null,
      issuedTo: form.issuedTo,
      reference: form.reference || null,
      remarks: form.remarks || null,
    });
    setForm(initialState());
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Record Outward (FIFO)
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              name="quantity"
              label="Quantity"
              type="number"
              required
              fullWidth
              value={form.quantity}
              onChange={handleChange}
              inputProps={{ step: "0.001", min: "0" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="weightTons"
              label="Weight (Tons)"
              type="number"
              fullWidth
              value={form.weightTons}
              onChange={handleChange}
              inputProps={{ step: "0.001", min: "0" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="unitsCount"
              label="Units (Nos)"
              type="number"
              fullWidth
              value={form.unitsCount}
              onChange={handleChange}
              inputProps={{ step: "1", min: "0" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="movementTime"
              label="Outward Date & Time"
              type="datetime-local"
              required
              fullWidth
              value={form.movementTime}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="issuedTo"
              label="Issued To / Target Location"
              required
              fullWidth
              value={form.issuedTo}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="reference"
              label="Reference (DC / Request No)"
              fullWidth
              value={form.reference}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="remarks"
              label="Remarks"
              fullWidth
              value={form.remarks}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button type="submit" variant="contained" color="error" disabled={loading}>
            Save Outward Entry
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
