import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { changePassword } from "../../api/auth";
import { useAuth } from "../../providers/AuthProvider";
import { useNotification } from "../../providers/NotificationProvider";

const INITIAL_FORM = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

export function BackofficeProfilePage() {
  const { user, logout } = useAuth();
  const { notify } = useNotification();
  const [form, setForm] = useState(INITIAL_FORM);
  const [saving, setSaving] = useState(false);

  const initials = user?.displayName
    ? user.displayName
        .split(" ")
        .filter(Boolean)
        .map((part) => part[0]?.toUpperCase())
        .slice(0, 2)
        .join("")
    : user?.email?.[0]?.toUpperCase() || "U";

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!form.currentPassword || !form.newPassword || !form.confirmPassword) {
      notify("Please complete all password fields", "warning");
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      notify("New password and confirmation do not match", "warning");
      return;
    }
    if (form.newPassword.length < 8) {
      notify("New password must be at least 8 characters", "warning");
      return;
    }
    if (form.newPassword === form.currentPassword) {
      notify("New password must be different from current password", "warning");
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: form.currentPassword, newPassword: form.newPassword });
      notify("Password updated successfully", "success");
      setForm(INITIAL_FORM);
    } catch (error) {
      notify(error.message || "Failed to change password", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} pb={10}>
      <Stack spacing={3}>
        <Card elevation={2} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: "primary.main", width: 56, height: 56, fontWeight: 600 }}>{initials}</Avatar>
              <Box>
                <Typography variant="h6" fontWeight={700}>
                  {user?.displayName || "Back Office User"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user?.email}
                </Typography>
                <Typography variant="caption" color="primary">
                  Role: {user?.role}
                </Typography>
                {user?.lastLoginAt && (
                  <Typography variant="caption" display="block" color="text.secondary">
                    Last login {new Date(user.lastLoginAt).toLocaleString()}
                  </Typography>
                )}
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card elevation={1} sx={{ borderRadius: 3 }}>
          <CardContent>
            <Stack spacing={2}>
              <Typography variant="subtitle1" fontWeight={700}>
                Change Password
              </Typography>
              <TextField
                label="Current Password"
                name="currentPassword"
                type="password"
                value={form.currentPassword}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="New Password"
                name="newPassword"
                type="password"
                value={form.newPassword}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                label="Confirm New Password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                fullWidth
                required
              />
              <Button type="submit" variant="contained" size="large" disabled={saving}>
                {saving ? "Saving..." : "Update Password"}
              </Button>
            </Stack>
          </CardContent>
        </Card>

        <Button variant="outlined" color="error" onClick={logout}>
          Logout
        </Button>
      </Stack>
    </Box>
  );
}
