import { Chip } from "@mui/material";

const statusColorMap = {
  Planning: "default",
  "In Progress": "primary",
  Completed: "success",
  "On Hold": "warning",
};

export function StatusChip({ status }) {
  const color = statusColorMap[status] || "default";
  return <Chip label={status} color={color} size="small" variant={color === "default" ? "outlined" : "filled"} />;
}
