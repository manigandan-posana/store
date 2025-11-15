import { Box, CircularProgress } from "@mui/material";
import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout";
import { DashboardPage } from "./pages/DashboardPage";
import { LoginPage } from "./pages/LoginPage";
import { MaterialDetailPage } from "./pages/MaterialDetailPage";
import { MaterialsPage } from "./pages/MaterialsPage";
import { ProjectDetailPage } from "./pages/ProjectDetailPage";
import { ProjectsPage } from "./pages/ProjectsPage";
import { AdminDashboardPage } from "./pages/AdminDashboardPage";
import { UserManagementPage } from "./pages/UserManagementPage";
import { useAuth } from "./providers/AuthProvider";

export function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <Box sx={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={user ? <Navigate to={user.role === "ADMIN" ? "/admin" : "/"} replace /> : <LoginPage />}
      />
      {user ? (
        <Route path="/" element={<AppLayout />}>
          {user.role === "ADMIN" ? (
            <>
              <Route index element={<Navigate to="/admin" replace />} />
              <Route path="admin" element={<AdminDashboardPage />} />
              <Route path="admin/users" element={<UserManagementPage />} />
              <Route path="*" element={<Navigate to="/admin" replace />} />
            </>
          ) : (
            <>
              <Route index element={<DashboardPage />} />
              <Route path="projects" element={<ProjectsPage />} />
              <Route path="projects/:projectId" element={<ProjectDetailPage />} />
              <Route
                path="projects/:projectId/materials/:materialId"
                element={<MaterialDetailPage />}
              />
              <Route path="materials" element={<MaterialsPage />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Route>
      ) : (
        <Route path="*" element={<Navigate to="/login" replace />} />
      )}
    </Routes>
  );
}
