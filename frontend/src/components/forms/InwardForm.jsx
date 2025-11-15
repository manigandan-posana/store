import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";

const initialState = () => ({
  quantity: "",
  declaredQuantity: "",
  batchNumber: "",
  weightTons: "",
  unitsCount: "",
  movementTime: dayjs().format("YYYY-MM-DDTHH:mm"),
  vehicleType: "",
  vehicleNumber: "",
  supplier: "",
  reference: "",
  remarks: "",
});

export function InwardForm({ onSubmit, loading }) {
  const [form, setForm] = useState(() => initialState());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      quantity: Number(form.quantity),
      declaredQuantity: form.declaredQuantity ? Number(form.declaredQuantity) : null,
      batchNumber: form.batchNumber || null,
      weightTons: form.weightTons ? Number(form.weightTons) : null,
      unitsCount: form.unitsCount ? Number(form.unitsCount) : null,
      movementTime: form.movementTime ? new Date(form.movementTime).toISOString() : null,
      vehicleType: form.vehicleType || null,
      vehicleNumber: form.vehicleNumber || null,
      supplier: form.supplier || null,
      reference: form.reference || null,
      remarks: form.remarks || null,
    });
    setForm(initialState());
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Record Inward (New Batch)
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
              name="declaredQuantity"
              label="Declared Quantity"
              type="number"
              fullWidth
              value={form.declaredQuantity}
              onChange={handleChange}
              inputProps={{ step: "0.001", min: "0" }}
              helperText="Manifested quantity"
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="batchNumber"
              label="Batch / Vehicle Identifier"
              fullWidth
              value={form.batchNumber}
              onChange={handleChange}
              helperText="E.g. Truck number, lot number"
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
              label="Inward Date & Time"
              type="datetime-local"
              required
              fullWidth
              value={form.movementTime}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="supplier"
              label="Supplier"
              fullWidth
              value={form.supplier}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="vehicleType"
              label="Vehicle Type"
              fullWidth
              value={form.vehicleType}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="vehicleNumber"
              label="Vehicle Number"
              fullWidth
              value={form.vehicleNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="reference"
              label="Reference (PO / Invoice / DC)"
              fullWidth
              value={form.reference}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              name="remarks"
              label="Remarks"
              fullWidth
              multiline
              minRows={2}
              value={form.remarks}
              onChange={handleChange}
            />
          </Grid>
        </Grid>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 3 }}>
          <Button type="submit" variant="contained" disabled={loading}>
            Save Inward Entry
          </Button>
        </Box>
      </Box>
    </Paper>
  );
}
