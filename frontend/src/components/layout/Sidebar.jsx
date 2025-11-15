import {
  Dashboard as DashboardIcon,
  Inventory2 as InventoryIcon,
  ListAlt as ListIcon,
} from "@mui/icons-material";
import {
  Box,
  Divider,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
} from "@mui/material";
import { useMemo } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../../providers/AuthProvider";

const drawerWidth = 240;

export function Sidebar() {
  const { user } = useAuth();
  const links = useMemo(() => {
    if (!user) {
      return [];
    }
    if (user.role === "ADMIN") {
      return [
        { to: "/admin", label: "Analytics", icon: <DashboardIcon /> },
        { to: "/admin/users", label: "Backoffice Users", icon: <ListIcon /> },
      ];
    }
    return [
      { to: "/", label: "Dashboard", icon: <DashboardIcon /> },
      { to: "/projects", label: "Projects", icon: <ListIcon /> },
      { to: "/materials", label: "Materials", icon: <InventoryIcon /> },
    ];
  }, [user]);

  return (
    <Drawer
      variant="permanent"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        [`& .MuiDrawer-paper`]: {
          width: drawerWidth,
          boxSizing: "border-box",
        },
      }}
    >
      <Toolbar>
        <Typography variant="h6" component="div" fontWeight="600">
          Inventory Pro
        </Typography>
      </Toolbar>
      <Divider />
      <Box sx={{ overflow: "auto" }}>
        <List>
          {links.map((link) => (
            <ListItem key={link.to} disablePadding>
              <ListItemButton
                component={NavLink}
                to={link.to}
                sx={{
                  "&.active": {
                    backgroundColor: "primary.light",
                    color: "primary.contrastText",
                    "& .MuiListItemIcon-root": { color: "primary.contrastText" },
                  },
                }}
              >
                <ListItemIcon>{link.icon}</ListItemIcon>
                <ListItemText primary={link.label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>
    </Drawer>
  );
}
