import { Box, Button, Grid, Paper, TextField, Typography } from "@mui/material";
import dayjs from "dayjs";
import { useState } from "react";

const initialState = () => ({
  quantity: "",
  handoverDate: dayjs().format("YYYY-MM-DD"),
  handoverName: "",
  handoverDesignation: "",
  storeInchargeName: "",
  remarks: "",
});

export function OutwardForm({ onSubmit, loading, card = true }) {
  const [form, setForm] = useState(() => initialState());

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      quantity: form.quantity ? Number(form.quantity) : null,
      handoverDate: form.handoverDate || null,
      handoverName: form.handoverName,
      handoverDesignation: form.handoverDesignation || null,
      storeInchargeName: form.storeInchargeName,
      remarks: form.remarks || null,
    });
    setForm(initialState());
  };

  const Wrapper = card ? Paper : Box;
  const wrapperProps = card
    ? { elevation: 1, sx: { p: 3, borderRadius: 2 } }
    : { sx: { p: { xs: 0.5, md: 1 } } };

  return (
    <Wrapper {...wrapperProps}>
      <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
        Record Outward (Handover)
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
              name="handoverDate"
              label="Handover Date"
              type="date"
              required
              fullWidth
              value={form.handoverDate}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              name="handoverName"
              label="Handover Name"
              required
              fullWidth
              value={form.handoverName}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="handoverDesignation"
              label="Handover Designation"
              fullWidth
              value={form.handoverDesignation}
              onChange={handleChange}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <TextField
              name="storeInchargeName"
              label="Store Incharge Name"
              required
              fullWidth
              value={form.storeInchargeName}
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
          <Button type="submit" variant="contained" color="error" disabled={loading}>
            Save Outward Entry
          </Button>
        </Box>
      </Box>
    </Wrapper>
  );
}
