import {
  Alert,
  Box,
  Button,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { createBackofficeUser, fetchBackofficeUsers } from "../api/admin";
import { useNotification } from "../providers/NotificationProvider";

export function UserManagementPage() {
  const { notify } = useNotification();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ displayName: "", email: "" });
  const [generatedPassword, setGeneratedPassword] = useState(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchBackofficeUsers();
      setUsers(data);
    } catch (error) {
      notify(error.message || "Failed to load users", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setCreating(true);
    setGeneratedPassword(null);
    try {
      const response = await createBackofficeUser(form);
      notify(`Backoffice user ${response.user.displayName} created`, "success");
      setGeneratedPassword(response.temporaryPassword);
      setForm({ displayName: "", email: "" });
      await loadUsers();
    } catch (error) {
      notify(error.message || "Failed to create user", "error");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Backoffice Team
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Manage user access for the inventory backoffice. New credentials are emailed automatically and shown below for confirmation.
      </Typography>

      <Paper elevation={1} sx={{ p: 3, borderRadius: 2, mb: 3 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Create Backoffice User
        </Typography>
        <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                label="Full Name"
                name="displayName"
                value={form.displayName}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <TextField
                label="Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                required
                fullWidth
              />
            </Grid>
            <Grid item xs={12} md={4}>
              <Button type="submit" variant="contained" disabled={creating} fullWidth>
                {creating ? "Creating..." : "Create User"}
              </Button>
            </Grid>
          </Grid>
        </Box>
        {generatedPassword && (
          <Alert severity="info" sx={{ mt: 2 }}>
            Temporary password: <strong>{generatedPassword}</strong>. Share securely with the user. A notification email has also been logged for audit.
          </Alert>
        )}
      </Paper>

      <Paper elevation={1} sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" fontWeight={600} sx={{ mb: 2 }}>
          Active Backoffice Users
        </Typography>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Updated</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 4, textAlign: "center" }}>
                  Loading users...
                </TableCell>
              </TableRow>
            )}
            {!loading && users.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} sx={{ py: 4, textAlign: "center", color: "text.secondary" }}>
                  No backoffice users yet.
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.displayName}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    {user.createdAt ? new Date(user.createdAt).toLocaleString() : "-"}
                  </TableCell>
                  <TableCell>
                    {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : "-"}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </Paper>
    </Box>
  );
}
