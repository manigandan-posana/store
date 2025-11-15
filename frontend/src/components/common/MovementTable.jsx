import {
  Avatar,
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";

const typeColor = {
  IN: { bg: "success.light", color: "success.dark" },
  OUT: { bg: "error.light", color: "error.dark" },
};

export function MovementTable({ title, movements = [] }) {
  const formatNumber = (value, fractionDigits = 3) =>
    value !== null && value !== undefined
      ? Number(value).toLocaleString(undefined, { maximumFractionDigits: fractionDigits })
      : "-";

  const formatDate = (date) => (date ? new Date(date).toLocaleDateString() : "-");
  const formatDateTime = (value) => (value ? new Date(value).toLocaleString() : "-");

  return (
    <Paper elevation={1} sx={{ p: 2, borderRadius: 2, overflowX: "auto" }}>
      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
        {title}
      </Typography>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>Type</TableCell>
            <TableCell>Project</TableCell>
            <TableCell>Material</TableCell>
            <TableCell>Quantity</TableCell>
            <TableCell>Invoice / Handover</TableCell>
            <TableCell>Dates</TableCell>
            <TableCell>People</TableCell>
            <TableCell>Vehicle / Notes</TableCell>
            <TableCell>Remarks</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.length === 0 && (
            <TableRow>
              <TableCell colSpan={9}>
                <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>No movements yet.</Box>
              </TableCell>
            </TableRow>
          )}
          {movements.map((movement) => {
            const palette = typeColor[movement.type] || { bg: "grey.200", color: "text.primary" };
            const invoiceInfo =
              movement.type === "IN"
                ? `${movement.invoiceNumber || "-"}`
                : movement.handoverName || "-";
            const dateInfo =
              movement.type === "IN"
                ? `${formatDate(movement.invoiceDate)} → ${formatDate(movement.receiveDate)}`
                : formatDate(movement.handoverDate);
            const personInfo =
              movement.type === "IN"
                ? movement.supplierName || "-"
                : `${movement.handoverName || "-"}${movement.handoverDesignation ? ` (${movement.handoverDesignation})` : ""}`;
            const vehicleInfo =
              movement.type === "IN" ? movement.vehicleNumber || "-" : movement.storeInchargeName || "-";
            const batchInfo = movement.batchSummary || "-";

            return (
              <TableRow key={`${movement.id || movement.movementTime}-${movement.type}-${movement.materialId}`}>
                <TableCell>
                  <Avatar sx={{ bgcolor: palette.bg, color: palette.color, width: 32, height: 32, fontSize: 14 }}>
                    {movement.type}
                  </Avatar>
                </TableCell>
                <TableCell>{movement.projectName}</TableCell>
                <TableCell>{movement.materialName}</TableCell>
                <TableCell>{formatNumber(movement.quantity)}</TableCell>
                <TableCell>
                  {invoiceInfo}
                  <br />
                  {movement.type === "IN" ? formatNumber(movement.invoiceQuantity) : batchInfo}
                </TableCell>
                <TableCell>
                  {dateInfo}
                  <br />
                  <Typography variant="caption" color="text.secondary">
                    {formatDateTime(movement.movementTime)}
                  </Typography>
                </TableCell>
                <TableCell>{personInfo}</TableCell>
                <TableCell>{vehicleInfo}</TableCell>
                <TableCell>{movement.remarks || "-"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
