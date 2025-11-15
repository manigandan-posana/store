import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";

const initialState = () => ({
  invoiceNumber: "",
  invoiceDate: dayjs().format("YYYY-MM-DD"),
  receiveDate: dayjs().format("YYYY-MM-DD"),
  vehicleNumber: "",
  invoiceQuantity: "",
  deliveredQuantity: "",
  supplierName: "",
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
      invoiceNumber: form.invoiceNumber,
      invoiceDate: form.invoiceDate || null,
      receiveDate: form.receiveDate || null,
      vehicleNumber: form.vehicleNumber || null,
      invoiceQuantity: form.invoiceQuantity ? Number(form.invoiceQuantity) : null,
      deliveredQuantity: form.deliveredQuantity ? Number(form.deliveredQuantity) : null,
      supplierName: form.supplierName || null,
      remarks: form.remarks || null,
    });
    setForm(initialState());
  };

  return (
    <Paper elevation={1} sx={{ p: 3, borderRadius: 2 }}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Record Inward (Invoice Entry)
      </Typography>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              name="invoiceNumber"
              label="Invoice Number"
              required
              fullWidth
              value={form.invoiceNumber}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="invoiceDate"
              label="Invoice Date"
              type="date"
              required
              fullWidth
              value={form.invoiceDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="receiveDate"
              label="Receiving Date"
              type="date"
              required
              fullWidth
              value={form.receiveDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="invoiceQuantity"
              label="Invoice Quantity"
              type="number"
              required
              fullWidth
              value={form.invoiceQuantity}
              onChange={handleChange}
              inputProps={{ step: "0.001", min: "0" }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="deliveredQuantity"
              label="Actual Delivered Quantity"
              type="number"
              required
              fullWidth
              value={form.deliveredQuantity}
              onChange={handleChange}
              inputProps={{ step: "0.001", min: "0" }}
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
          <Grid item xs={12} md={6}>
            <TextField
              name="supplierName"
              label="Supplier Name"
              fullWidth
              value={form.supplierName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
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
