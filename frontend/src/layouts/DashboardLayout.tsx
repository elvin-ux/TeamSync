import React, { useState, useEffect } from "react";
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
import MenuRoundedIcon from "@mui/icons-material/MenuRounded";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import ViewSidebarRoundedIcon from "@mui/icons-material/ViewSidebarRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import {
  Avatar,
  Box,
  Button,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  Menu,
  MenuItem,
  Divider,
  Drawer,
  BottomNavigation,
  BottomNavigationAction,
  useTheme,
  Paper,
  ListItemIcon,
  Badge,
} from "@mui/material";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { notificationService } from "../services/notificationService";
import { useThemeMode } from "../context/ThemeContext";
import { getThemeColors } from "../theme/theme";
import { useSSENotifications } from "../hooks/useSSENotifications";
import CommandPalette from "../components/layout/CommandPalette";
import NotificationsPanel from "../components/layout/NotificationsPanel";

const navItems = [
  { label: "Dashboard", path: "/dashboard", icon: <DashboardRoundedIcon /> },
  { label: "Projects", path: "/projects", icon: <FolderRoundedIcon /> },
  { label: "Tasks", path: "/tasks", icon: <TaskAltRoundedIcon /> },
  { label: "Team", path: "/team", icon: <GroupsRoundedIcon /> },
  { label: "Analytics", path: "/admin/analytics", icon: <AnalyticsRoundedIcon /> },
  { label: "Settings", path: "/settings", icon: <SettingsRoundedIcon /> },
];

export default function DashboardLayout() {
  const { userName, userAvatarUrl, clearSession } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const { mode, toggleThemeMode } = useThemeMode();
  const activeColors = getThemeColors(mode);

  // Real-time SSE notification push (invalidates caches instantly)
  useSSENotifications();

  // Fetch unread notifications count (60 s fallback poll, SSE handles real-time)
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["unreadNotificationsCount"],
    queryFn: notificationService.getUnreadCount,
    refetchInterval: 60000,
  });

  // Layout states persisted in localStorage
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    return localStorage.getItem("teamsync.sidebarCollapsed") === "true";
  });
  const [isContextPanelOpen, setIsContextPanelOpen] = useState<boolean>(() => {
    return localStorage.getItem("teamsync.contextPanelOpen") !== "false";
  });

  // Modal / Menu states
  const [searchOpen, setSearchOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [avatarAnchorEl, setAvatarAnchorEl] = useState<null | HTMLElement>(null);

  const isAvatarMenuOpen = Boolean(avatarAnchorEl);

  useEffect(() => {
    localStorage.setItem("teamsync.sidebarCollapsed", String(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  useEffect(() => {
    localStorage.setItem("teamsync.contextPanelOpen", String(isContextPanelOpen));
  }, [isContextPanelOpen]);

  const handleLogout = async () => {
    await authService.logout();
    clearSession();
    navigate("/login", { replace: true });
  };

  const handleAvatarClick = (event: React.MouseEvent<HTMLElement>) => {
    setAvatarAnchorEl(event.currentTarget);
  };

  const handleAvatarMenuClose = () => {
    setAvatarAnchorEl(null);
  };

  const avatarInitial = userName ? userName.charAt(0).toUpperCase() : "?";

  // Navigation logic
  const handleNavClick = (path: string) => {
    navigate(path);
    setMobileNavOpen(false);
  };

  // Capture Ctrl + K to toggle command palette
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: theme.palette.background.default,
        color: theme.palette.text.primary,
        display: "grid",
        gridTemplateColumns: {
          xs: "1fr",
          md: `${isSidebarCollapsed ? "72px" : "260px"} 1fr ${isContextPanelOpen ? "320px" : "0px"}`,
        },
        transition: "grid-template-columns 200ms cubic-bezier(0.4, 0, 0.2, 1), background-color 200ms ease",
      }}
    >
      {/* Left Sidebar (Desktop only) */}
      <Box
        component="aside"
        sx={{
          display: { xs: "none", md: "flex" },
          flexDirection: "column",
          borderRight: `1px solid ${theme.palette.divider}`,
          bgcolor: mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
          p: 2,
          overflow: "hidden",
          transition: "all 200ms cubic-bezier(0.4, 0, 0.2, 1)",
          position: "sticky",
          top: 0,
          height: "100vh",
        }}
      >
        {/* Branding header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent={isSidebarCollapsed ? "center" : "flex-start"}
          spacing={isSidebarCollapsed ? 0 : 1.5}
          sx={{ minHeight: 56, mb: 2 }}
        >
          <Box
            sx={{
              width: 34,
              height: 34,
              borderRadius: 2,
              bgcolor: activeColors.primaryAccent,
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              color: "#fff",
              fontSize: 18,
              cursor: "pointer",
            }}
            onClick={() => navigate("/dashboard")}
          >
            T
          </Box>
          {!isSidebarCollapsed && (
            <Typography variant="h4" fontWeight={800} sx={{ whiteSpace: "nowrap" }}>
              TeamSync
            </Typography>
          )}
        </Stack>

        {/* Create button */}
        {isSidebarCollapsed ? (
          <Tooltip title="Create task" placement="right">
            <IconButton
              color="primary"
              sx={{
                width: 44,
                height: 44,
                borderRadius: 2,
                bgcolor: "primary.main",
                color: "#fff",
                mb: 3,
                mx: "auto",
                "&:hover": { bgcolor: "primary.light" },
              }}
            >
              <AddRoundedIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Button
            startIcon={<AddRoundedIcon />}
            variant="contained"
            fullWidth
            sx={{ mb: 3 }}
          >
            Create
          </Button>
        )}

        {/* Sidebar Nav Links */}
        <Stack spacing={0.75} sx={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            const content = (
              <Box
                component={NavLink}
                to={item.path}
                sx={{
                  px: isSidebarCollapsed ? 0 : 1.5,
                  py: 1.25,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isSidebarCollapsed ? "center" : "flex-start",
                  gap: isSidebarCollapsed ? 0 : 1.5,
                  color: isActive ? "text.primary" : "text.secondary",
                  bgcolor: isActive ? theme.palette.background.paper : "transparent",
                  textDecoration: "none",
                  transition: "all 150ms ease",
                  "&:hover": {
                    bgcolor: theme.palette.background.paper,
                    color: "text.primary",
                  },
                }}
              >
                {item.icon}
                {!isSidebarCollapsed && (
                  <Typography fontWeight={isActive ? 700 : 500} sx={{ fontSize: 14 }}>
                    {item.label}
                  </Typography>
                )}
              </Box>
            );

            return (
              <React.Fragment key={item.path}>
                {isSidebarCollapsed ? (
                  <Tooltip title={item.label} placement="right">
                    {content}
                  </Tooltip>
                ) : (
                  content
                )}
              </React.Fragment>
            );
          })}
        </Stack>

        {/* Bottom controls: Theme mode + Collapse */}
        <Stack spacing={1.5} sx={{ pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
          {/* Theme mode toggle */}
          {isSidebarCollapsed ? (
            <Tooltip title={mode === "dark" ? "Light Mode" : "Dark Mode"} placement="right">
              <IconButton onClick={toggleThemeMode} sx={{ mx: "auto", color: "text.secondary" }}>
                {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              </IconButton>
            </Tooltip>
          ) : (
            <Box
              onClick={toggleThemeMode}
              sx={{
                px: 1.5,
                py: 1.25,
                borderRadius: 2,
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                color: "text.secondary",
                cursor: "pointer",
                transition: "all 150ms",
                "&:hover": { bgcolor: theme.palette.background.paper, color: "text.primary" },
              }}
            >
              {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
              <Typography fontWeight={500} sx={{ fontSize: 14 }}>
                {mode === "dark" ? "Light Mode" : "Dark Mode"}
              </Typography>
            </Box>
          )}

          {/* User info */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent={isSidebarCollapsed ? "center" : "flex-start"}
            spacing={isSidebarCollapsed ? 0 : 1.5}
          >
            <Avatar
              src={userAvatarUrl || undefined}
              onClick={handleAvatarClick}
              sx={{
                width: 34,
                height: 34,
                bgcolor: activeColors.primaryAccent,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
              }}
            >
              {avatarInitial}
            </Avatar>
            {!isSidebarCollapsed && (
              <Box sx={{ flex: 1, overflow: "hidden" }}>
                <Typography
                  variant="body2"
                  fontWeight={600}
                  sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  {userName ?? "User"}
                </Typography>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                >
                  Member
                </Typography>
              </Box>
            )}
            {!isSidebarCollapsed && (
              <Tooltip title="Sign out">
                <IconButton size="small" onClick={handleLogout} sx={{ color: "text.secondary" }}>
                  <LogoutRoundedIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Stack>

          {/* Sidebar collapse control */}
          <IconButton
            size="small"
            onClick={() => setIsSidebarCollapsed((prev) => !prev)}
            sx={{
              alignSelf: "center",
              bgcolor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
              "&:hover": { bgcolor: theme.palette.background.default },
            }}
          >
            {isSidebarCollapsed ? <ChevronRightRoundedIcon fontSize="small" /> : <ChevronLeftRoundedIcon fontSize="small" />}
          </IconButton>
        </Stack>
      </Box>

      {/* Main Content Workspace Panel */}
      <Box
        component="main"
        sx={{
          minWidth: 0,
          display: "flex",
          flexDirection: "column",
          height: "100vh",
          position: "relative",
        }}
      >
        {/* Top Navbar */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          spacing={2}
          sx={{
            minHeight: 72,
            px: { xs: 2, md: 3 },
            borderBottom: `1px solid ${theme.palette.divider}`,
            bgcolor: theme.palette.mode === "dark" ? "transparent" : "#FFFFFF",
            zIndex: 10,
          }}
        >
          {/* Left item: Hamburger for mobile / Search shortcut trigger for desktop */}
          <Stack direction="row" alignItems="center" spacing={1}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={() => setMobileNavOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" } }}
            >
              <MenuRoundedIcon />
            </IconButton>

            {/* Global search launcher */}
            <Box
              onClick={() => setSearchOpen(true)}
              sx={{
                width: { xs: 160, sm: 280, md: 420 },
                height: 42,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: 2.5,
                bgcolor: theme.palette.mode === "dark" ? activeColors.workspaceSurface : "#F1F5F9",
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                px: 2,
                cursor: "pointer",
                transition: "all 150ms ease",
                "&:hover": {
                  borderColor: activeColors.primaryAccent,
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "#E2E8F0",
                },
              }}
            >
              <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
              <Typography variant="body2" color="text.secondary" sx={{ flex: 1, select: "none" }}>
                Search or press <Box component="span" sx={{ fontWeight: 700, fontSize: 12 }}>Ctrl+K</Box>
              </Typography>
            </Box>
          </Stack>

          {/* Right items: Controls + Profile */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            {/* Toggle context panel button (Desktop only) */}
            <Tooltip title={isContextPanelOpen ? "Hide context panel" : "Show context panel"}>
              <IconButton
                onClick={() => setIsContextPanelOpen((prev) => !prev)}
                sx={{ display: { xs: "none", md: "inline-flex" }, color: isContextPanelOpen ? "primary.main" : "text.secondary" }}
              >
                <ViewSidebarRoundedIcon />
              </IconButton>
            </Tooltip>

            {/* Notification bell */}
            <Tooltip title="Notifications">
              <IconButton onClick={() => setNotificationsOpen(true)} sx={{ color: "text.secondary" }}>
                <Badge badgeContent={unreadCount} color="error" max={99}>
                  <NotificationsRoundedIcon />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* Avatar Profile Popover trigger */}
            <Avatar
              src={userAvatarUrl || undefined}
              onClick={handleAvatarClick}
              sx={{
                width: 36,
                height: 36,
                bgcolor: activeColors.secondaryAccent,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                boxShadow: `0 0 0 2px ${theme.palette.background.paper}, 0 0 0 4px ${activeColors.secondaryAccent}22`,
              }}
            >
              {avatarInitial}
            </Avatar>
          </Stack>
        </Stack>

        {/* Scrollable content container */}
        <Box
          sx={{
            flex: 1,
            p: { xs: 2, md: 4 },
            overflowY: "auto",
            pb: { xs: 10, md: 4 }, // Add spacing for mobile bottom navigation bar
          }}
        >
          <Outlet />
        </Box>
      </Box>

      {/* Right Context Panel (Desktop only) */}
      {isContextPanelOpen && (
        <Box
          component="aside"
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            borderLeft: `1px solid ${theme.palette.divider}`,
            bgcolor: mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
            p: 2.5,
            overflowY: "auto",
            position: "sticky",
            top: 0,
            height: "100vh",
          }}
        >
          <Typography variant="h4" sx={{ mb: 2 }}>
            Workspace Activity
          </Typography>
          <Stack spacing={2}>
            {[
              { label: "Activity Feed", text: "Task 'Auth Shell' was marked done by Lead Manuel." },
              { label: "Recent Mentions", text: "You were tagged in '#general' chat channel." },
              { label: "Project Insights", text: "Velocity is up 12% compared to last week." },
            ].map((section) => (
              <Box
                key={section.label}
                sx={{
                  p: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  borderRadius: 2,
                  bgcolor: theme.palette.mode === "dark" ? activeColors.workspaceSurface : "#F8FAFC",
                }}
              >
                <Typography variant="subtitle2" fontWeight={800} color="primary" sx={{ mb: 0.5 }}>
                  {section.label}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {section.text}
                </Typography>
              </Box>
            ))}
          </Stack>
        </Box>
      )}

      {/* Profile Menu Popover Dropdown */}
      <Menu
        anchorEl={avatarAnchorEl}
        open={isAvatarMenuOpen}
        onClose={handleAvatarMenuClose}
        onClick={handleAvatarMenuClose}
        PaperProps={{
          sx: {
            mt: 1.5,
            minWidth: 180,
            bgcolor: theme.palette.background.paper,
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 8px 24px rgba(0,0,0,0.3)"
                : "0 8px 24px rgba(0,0,0,0.08)",
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 2,
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="body2" fontWeight={700}>
            {userName ?? "Signed in user"}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis" }}>
            {userName ? `${userName.toLowerCase().replace(/\s+/g, "")}@teamsync.com` : "user@teamsync.com"}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => navigate("/profile")} sx={{ fontSize: 14, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 30 }}><PersonRoundedIcon fontSize="small" /></ListItemIcon>
          Profile Details
        </MenuItem>
        <MenuItem onClick={() => navigate("/settings")} sx={{ fontSize: 14, py: 1 }}>
          <ListItemIcon sx={{ minWidth: 30 }}><SettingsRoundedIcon fontSize="small" /></ListItemIcon>
          Workspace Settings
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleLogout} sx={{ fontSize: 14, color: "error.main", py: 1 }}>
          <ListItemIcon sx={{ minWidth: 30, color: "error.main" }}><LogoutRoundedIcon fontSize="small" /></ListItemIcon>
          Sign out
        </MenuItem>
      </Menu>

      {/* Mobile Drawer Navigation (Hamburger menu fallback) */}
      <Drawer
        anchor="left"
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
        PaperProps={{
          sx: { width: 260, bgcolor: theme.palette.background.default, p: 2 },
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ minHeight: 56, mb: 3 }}>
          <Box
            sx={{
              width: 32,
              height: 32,
              borderRadius: 2,
              bgcolor: activeColors.primaryAccent,
              display: "grid",
              placeItems: "center",
              fontWeight: 800,
              color: "#fff",
              fontSize: 16,
            }}
          >
            T
          </Box>
          <Typography variant="h4" fontWeight={800}>
            TeamSync
          </Typography>
        </Stack>

        <Stack spacing={1} sx={{ flex: 1 }}>
          {navItems.map((item) => {
            const isActive = location.pathname === item.path || (item.path !== "/dashboard" && location.pathname.startsWith(item.path));
            return (
              <Box
                key={item.path}
                onClick={() => handleNavClick(item.path)}
                sx={{
                  px: 2,
                  py: 1.5,
                  borderRadius: 2,
                  display: "flex",
                  alignItems: "center",
                  gap: 2,
                  color: isActive ? "text.primary" : "text.secondary",
                  bgcolor: isActive ? theme.palette.background.paper : "transparent",
                  cursor: "pointer",
                  "&:hover": { bgcolor: theme.palette.background.paper },
                }}
              >
                {item.icon}
                <Typography fontWeight={isActive ? 700 : 500}>{item.label}</Typography>
              </Box>
            );
          })}
        </Stack>

        <Divider sx={{ my: 2 }} />

        {/* User Info Section (Mobile Drawer) */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ px: 2, py: 1.5, mb: 1 }}>
          <Avatar
            src={userAvatarUrl || undefined}
            sx={{
              width: 38,
              height: 38,
              bgcolor: activeColors.primaryAccent,
              fontSize: 15,
              fontWeight: 700,
            }}
          >
            {avatarInitial}
          </Avatar>
          <Box sx={{ flex: 1, overflow: "hidden" }}>
            <Typography
              variant="body2"
              fontWeight={700}
              sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              {userName ?? "User"}
            </Typography>
            <Typography
              variant="caption"
              color="text.secondary"
              sx={{ display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
            >
              Member
            </Typography>
          </Box>
        </Stack>

        <Divider sx={{ mb: 2 }} />

        <Stack spacing={2}>
          <Box
            onClick={() => {
              toggleThemeMode();
              setMobileNavOpen(false);
            }}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "text.secondary",
              cursor: "pointer",
            }}
          >
            {mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />}
            <Typography fontWeight={500}>
              {mode === "dark" ? "Light Mode" : "Dark Mode"}
            </Typography>
          </Box>
          <Box
            onClick={handleLogout}
            sx={{
              px: 2,
              py: 1.5,
              borderRadius: 2,
              display: "flex",
              alignItems: "center",
              gap: 2,
              color: "error.main",
              cursor: "pointer",
            }}
          >
            <LogoutRoundedIcon />
            <Typography fontWeight={500}>Sign out</Typography>
          </Box>
        </Stack>
      </Drawer>

      {/* Mobile Bottom Navigation (Responsive sticky bar) */}
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: { xs: "block", md: "none" },
          zIndex: theme.zIndex.appBar,
          borderTop: `1px solid ${theme.palette.divider}`,
        }}
        elevation={3}
      >
        <BottomNavigation
          showLabels
          value={
            navItems.findIndex(
              (item) =>
                location.pathname === item.path ||
                (item.path !== "/dashboard" && location.pathname.startsWith(item.path))
            )
          }
          onChange={(_, newValue) => {
            if (newValue === 4) {
              setNotificationsOpen(true);
            } else if (navItems[newValue]) {
              navigate(navItems[newValue].path);
            }
          }}
          sx={{
            height: 64,
            bgcolor: theme.palette.background.paper,
          }}
        >
          {navItems.slice(0, 4).map((item) => (
            <BottomNavigationAction
              key={item.path}
              label={item.label}
              icon={item.icon}
              sx={{
                color: "text.secondary",
                "&.Mui-selected": { color: "primary.main" },
              }}
            />
          ))}
          <BottomNavigationAction
            label="Alerts"
            icon={
              <Badge badgeContent={unreadCount} color="error" max={99}>
                <NotificationsRoundedIcon />
              </Badge>
            }
            onClick={() => setNotificationsOpen(true)}
            sx={{
              color: "text.secondary",
              "&.Mui-selected": { color: "primary.main" },
            }}
          />
        </BottomNavigation>
      </Paper>

      {/* Global Modals */}
      <CommandPalette open={searchOpen} onClose={() => setSearchOpen(false)} />
      <NotificationsPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
    </Box>
  );
}
