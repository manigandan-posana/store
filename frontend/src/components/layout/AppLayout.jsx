import {
  AppBar,
  Avatar,
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { useAuth } from "../../providers/AuthProvider";

export function AppLayout() {
  const { user, logout } = useAuth();
  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((part) => part[0].toUpperCase())
        .join("")
    : "";

  return (
    <Box sx={{ display: "flex" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        color="inherit"
        elevation={1}
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: "space-between" }}>
          <Typography variant="h6" noWrap component="div" fontWeight={600} color="primary.main">
            Project Inventory Control
          </Typography>
          {user && (
            <Stack direction="row" spacing={2} alignItems="center">
              <Stack spacing={0} textAlign="right">
                <Typography variant="subtitle2" fontWeight={600}>
                  {user.displayName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user.role === "ADMIN" ? "Administrator" : "Backoffice"}
                </Typography>
              </Stack>
              <Avatar sx={{ bgcolor: "primary.main", width: 36, height: 36 }}>{initials}</Avatar>
              <Button variant="outlined" size="small" onClick={logout}>
                Logout
              </Button>
            </Stack>
          )}
        </Toolbar>
      </AppBar>
      <Sidebar />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: "grey.100", minHeight: "100vh" }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
