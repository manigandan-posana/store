import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { listProjects, createProject } from "../api/projects";
import { StatusChip } from "../components/common/StatusChip";
import { CreateProjectDialog } from "../components/forms/CreateProjectDialog";
import { useNotification } from "../providers/NotificationProvider";
import LaunchIcon from "@mui/icons-material/Launch";

export function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const { notify } = useNotification();

  const loadProjects = async () => {
    setLoading(true);
    try {
      const response = await listProjects();
      setProjects(response);
    } catch (error) {
      notify(error.message || "Failed to load projects", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleCreateProject = async (values) => {
    try {
      const project = await createProject(values);
      notify(`Project "${project.name}" created`, "success");
      setOpenDialog(false);
      await loadProjects();
    } catch (error) {
      notify(error.message || "Failed to create project", "error");
    }
  };

  return (
    <Box>
      <Box mb={3} display="flex" justifyContent="space-between" alignItems="center">
        <div>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Manage projects, client locations, and drill into material stock positions.
          </Typography>
        </div>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Create Project
        </Button>
      </Box>

      <Paper elevation={1} sx={{ borderRadius: 2 }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Project Name</TableCell>
              <TableCell>Project Code</TableCell>
              <TableCell>Client / Location</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                  <CircularProgress size={28} />
                </TableCell>
              </TableRow>
            ) : projects.length ? (
              projects.map((project) => (
                <TableRow key={project.id} hover>
                  <TableCell>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {project.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {project.description || "No description"}
                    </Typography>
                  </TableCell>
                  <TableCell>{project.code}</TableCell>
                  <TableCell>{project.clientLocation || "-"}</TableCell>
                  <TableCell>
                    <StatusChip status={project.status || "Planning"} />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      component={RouterLink}
                      to={`/projects/${project.id}`}
                      size="small"
                      color="primary"
                    >
                      <LaunchIcon fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} align="center" sx={{ py: 4, color: "text.secondary" }}>
                  No projects found. Create one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Paper>

      <CreateProjectDialog open={openDialog} onClose={() => setOpenDialog(false)} onSubmit={handleCreateProject} />
    </Box>
  );
}
