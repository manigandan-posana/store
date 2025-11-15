import {
  Box,
  Card,
  CardContent,
  CircularProgress,
  Stack,
  Typography,
  Button,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getProject } from "../../api/projects";
import { useNotification } from "../../providers/NotificationProvider";

export function BackofficeProjectDetailPage() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const { notify } = useNotification();
  const [project, setProject] = useState(null);
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const response = await getProject(projectId);
        setProject(response.project);
        setMaterials(response.materials || []);
      } catch (error) {
        notify(error.message || "Failed to load project", "error");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [projectId, notify]);

  const totals = useMemo(() => {
    return materials.reduce(
      (acc, item) => ({
        totalIn: acc.totalIn + item.totalIn,
        totalOut: acc.totalOut + item.totalOut,
        current: acc.current + item.currentStock,
      }),
      { totalIn: 0, totalOut: 0, current: 0 }
    );
  }, [materials]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!project) {
    return (
      <Typography textAlign="center" color="text.secondary" sx={{ py: 4 }}>
        Project not found.
      </Typography>
    );
  }

  return (
    <Stack spacing={3} pb={8}>
      <Stack spacing={0.5}>
        <Typography variant="h5" fontWeight={700}>
          {project.name}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Code: {project.code}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {project.clientLocation || "No location specified"}
        </Typography>
        <Typography variant="body2">{project.description || "No description"}</Typography>
        <Typography variant="caption" color="primary" fontWeight={600}>
          Status: {project.status || "Planning"}
        </Typography>
      </Stack>

      <Card elevation={2} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Typography variant="subtitle1" fontWeight={700} gutterBottom>
            Totals
          </Typography>
          <Stack direction="row" spacing={2}>
            <SummaryBubble label="Total In" value={totals.totalIn} color="primary" />
            <SummaryBubble label="Total Out" value={totals.totalOut} color="error" />
            <SummaryBubble label="Balance" value={totals.current} color="success" />
          </Stack>
        </CardContent>
      </Card>

      <Card elevation={1} sx={{ borderRadius: 3 }}>
        <CardContent>
          <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
            <Typography variant="subtitle1" fontWeight={700}>
              Material Consumption
            </Typography>
            <Button
              size="small"
              onClick={() =>
                navigate("/backoffice/outwards", { state: { project: project.name, projectId: project.id } })
              }
            >
              View Issues
            </Button>
          </Stack>
          <Stack spacing={1.5}>
            {materials.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                No materials linked to this project yet.
              </Typography>
            )}
            {materials.map((material) => (
              <Card key={material.materialId} elevation={0} sx={{ bgcolor: "grey.100", borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700}>
                    {material.materialName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Code: {material.materialCode} • Unit: {material.unit || "-"}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                    <SummaryBubble label="In" value={material.totalIn} color="primary" small />
                    <SummaryBubble label="Out" value={material.totalOut} color="error" small />
                    <SummaryBubble label="Balance" value={material.currentStock} color="success" small />
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </CardContent>
      </Card>
    </Stack>
  );
}

function SummaryBubble({ label, value, color, small }) {
  return (
    <Box
      sx={(theme) => {
        const palette = theme.palette[color] || theme.palette.primary;
        return {
          px: small ? 1.5 : 2,
          py: small ? 0.5 : 0.75,
          bgcolor: alpha(palette.main, 0.12),
          borderRadius: 999,
          minWidth: small ? 80 : 110,
          textAlign: "center",
        };
      }}
    >
      <Typography
        variant={small ? "caption" : "body2"}
        fontWeight={600}
        sx={(theme) => ({ color: (theme.palette[color] || theme.palette.primary).dark })}
      >
        {label}
      </Typography>
      <Typography
        variant={small ? "caption" : "subtitle2"}
        fontWeight={700}
        sx={(theme) => ({ color: (theme.palette[color] || theme.palette.primary).main })}
      >
        {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}
      </Typography>
    </Box>
  );
}
