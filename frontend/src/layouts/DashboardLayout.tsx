import AddRoundedIcon from "@mui/icons-material/AddRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import NotificationsRoundedIcon from "@mui/icons-material/NotificationsRounded";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { colors } from "../theme/theme";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "Projects", path: "/projects", icon: <FolderRoundedIcon /> },
  { label: "Tasks", path: "/tasks", icon: <TaskAltRoundedIcon /> },
  { label: "Team", path: "/team", icon: <GroupsRoundedIcon /> },
  { label: "Analytics", path: "/admin/analytics", icon: <AnalyticsRoundedIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsRoundedIcon /> },
];

export default function DashboardLayout() {
  const { userName, clearSession } = useAuth();
  const navigate = useNavigate();

  const avatarInitial = userName ? userName.charAt(0).toUpperCase() : "?";

  const handleLogout = async () => {
    await authService.logout();
    clearSession();
    navigate("/login", { replace: true });
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: colors.backgroundPrimary,
        display: "grid",
        gridTemplateColumns: { xs: "1fr", md: "260px 1fr 320px" },
      }}
    >
      {/* Left sidebar */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          borderRight: `1px solid ${colors.border}`,
          bgcolor: colors.backgroundSecondary,
          p: 2,
        }}
      >
        {/* Logo */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 56 }}>
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: colors.primaryAccent,
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              color: "#fff",
              fontSize: 18,
            }}
          >
            T
          </Box>
          <Typography variant="h4">TeamSync</Typography>
        </Stack>

        {/* Create button */}
        <Button startIcon={<AddRoundedIcon />} variant="contained" sx={{ mt: 3, mb: 2 }}>
          Create
        </Button>

        {/* Nav items */}
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          {navItems.map((item) => (
            <Box
              key={item.path}
              component={NavLink}
              to={item.path}
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "text.secondary",
                textDecoration: "none",
                transition: "background 150ms",
                "&.active": { color: "text.primary", bgcolor: colors.workspaceSurface },
                "&:hover": { bgcolor: colors.workspaceSurface },
              }}
            >
              {item.icon}
              <Typography fontWeight={700}>{item.label}</Typography>
            </Box>
          ))}
        </Stack>

        {/* User info + logout */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={1.5}
          sx={{
            mt: 2,
            pt: 2,
            borderTop: `1px solid ${colors.border}`,
          }}
        >
          <Avatar sx={{ width: 34, height: 34, bgcolor: colors.primaryAccent, fontSize: 14, fontWeight: 700 }}>
            {avatarInitial}
          </Avatar>
          <Typography
            variant="caption"
            color="text.secondary"
            fontWeight={600}
            sx={{ flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
          >
            {userName ?? "User"}
          </Typography>
          <Tooltip title="Sign out">
            <IconButton size="small" onClick={handleLogout} sx={{ color: "text.secondary" }}>
              <LogoutRoundedIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      </Box>

      {/* Main content */}
      <Box component="main" sx={{ minWidth: 0 }}>
        {/* Top bar */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          sx={{
            minHeight: 72,
            px: { xs: 2, md: 3 },
            borderBottom: `1px solid ${colors.border}`,
          }}
        >
          <Box
            sx={{
              flex: 1,
              maxWidth: 560,
              height: 44,
              border: `1px solid ${colors.border}`,
              borderRadius: 2,
              bgcolor: colors.workspaceSurface,
              display: "flex",
              alignItems: "center",
              gap: 1.5,
              px: 2,
              cursor: "pointer",
            }}
          >
            <SearchRoundedIcon color="disabled" />
            <Typography color="text.secondary">Search or press Ctrl + K</Typography>
          </Box>
          <Tooltip title="Notifications">
            <IconButton>
              <NotificationsRoundedIcon />
            </IconButton>
          </Tooltip>
          <Avatar sx={{ width: 36, height: 36, bgcolor: colors.secondaryAccent, fontSize: 14, fontWeight: 700 }}>
            {avatarInitial}
          </Avatar>
        </Stack>

        <Box sx={{ p: { xs: 2, md: 3 } }}>
          <Outlet />
        </Box>
      </Box>

      {/* Right context panel */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "block" },
          borderLeft: `1px solid ${colors.border}`,
          bgcolor: colors.backgroundSecondary,
          p: 2.5,
        }}
      >
        <Typography variant="h4" sx={{ mb: 2 }}>
          Context
        </Typography>
        <Stack spacing={1.5}>
          {["Activity feed", "Notifications", "Project insights"].map((label) => (
            <Box
              key={label}
              sx={{
                p: 2,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                bgcolor: colors.workspaceSurface,
              }}
            >
              <Typography fontWeight={700}>{label}</Typography>
              <Typography variant="caption" color="text.secondary">
                Phase 1 shell – coming soon
              </Typography>
            </Box>
          ))}
        </Stack>
      </Box>
    </Box>
  );
}
