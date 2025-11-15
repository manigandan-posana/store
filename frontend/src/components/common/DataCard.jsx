import { Paper, Typography } from "@mui/material";

export function DataCard({ title, subtitle, value, color = "primary" }) {
  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
      <Typography variant="caption" color="text.secondary" textTransform="uppercase">
        {title}
      </Typography>
      <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }} color={`${color}.main`}>
        {value}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Paper>
  );
}
