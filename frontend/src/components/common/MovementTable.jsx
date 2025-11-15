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
            <TableCell>Declared Qty</TableCell>
            <TableCell>Variance</TableCell>
            <TableCell>Weight (Tons)</TableCell>
            <TableCell>Units (Nos)</TableCell>
            <TableCell>Remaining</TableCell>
            <TableCell>Batch / Source</TableCell>
            <TableCell>Vehicle / Issued To</TableCell>
            <TableCell>Reference</TableCell>
            <TableCell>Date &amp; Time</TableCell>
            <TableCell>Remarks</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {movements.length === 0 && (
            <TableRow>
              <TableCell colSpan={13}>
                <Box sx={{ textAlign: "center", py: 3, color: "text.secondary" }}>No movements yet.</Box>
              </TableCell>
            </TableRow>
          )}
          {movements.map((movement) => {
            const palette = typeColor[movement.type] || { bg: "grey.200", color: "text.primary" };
            const vehicleInfo = [movement.vehicleType, movement.vehicleNumber]
              .filter(Boolean)
              .join(" / ");
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
                <TableCell>{formatNumber(movement.declaredQuantity)}</TableCell>
                <TableCell>{formatNumber(movement.variance)}</TableCell>
                <TableCell>{formatNumber(movement.weightTons)}</TableCell>
                <TableCell>
                  {movement.unitsCount !== null && movement.unitsCount !== undefined
                    ? movement.unitsCount.toLocaleString()
                    : "-"}
                </TableCell>
                <TableCell>{formatNumber(movement.remainingQuantity)}</TableCell>
                <TableCell>{movement.batchNumber || "-"}</TableCell>
                <TableCell>{movement.issuedToOrSupplier || vehicleInfo || "-"}</TableCell>
                <TableCell>{movement.reference || "-"}</TableCell>
                <TableCell>{new Date(movement.movementTime).toLocaleString()}</TableCell>
                <TableCell>{movement.remarks || "-"}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Paper>
  );
}
