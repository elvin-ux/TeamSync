import React, { useEffect, useState, useRef } from "react";
import {
  Backdrop,
  Box,
  InputBase,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import DashboardRoundedIcon from "@mui/icons-material/DashboardRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import SettingsRoundedIcon from "@mui/icons-material/SettingsRounded";
import DarkModeRoundedIcon from "@mui/icons-material/DarkModeRounded";
import LightModeRoundedIcon from "@mui/icons-material/LightModeRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";
import { useThemeMode } from "../../context/ThemeContext";
import { useAuth } from "../../hooks/useAuth";
import { authService } from "../../services/authService";
import { useQuery } from "@tanstack/react-query";
import { searchService } from "../../services/searchService";

interface CommandPaletteProps {
  open: boolean;
  onClose: () => void;
}

export default function CommandPalette({ open, onClose }: CommandPaletteProps) {
  const [search, setSearch] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const theme = useTheme();
  const navigate = useNavigate();
  const { mode, toggleThemeMode } = useThemeMode();
  const { clearSession } = useAuth();
  const listRef = useRef<HTMLUListElement>(null);

  const handleLogout = async () => {
    onClose();
    await authService.logout();
    clearSession();
    navigate("/login", { replace: true });
  };

  const commands = [
    {
      id: "nav-dashboard",
      label: "Go to Dashboard",
      category: "Navigation",
      icon: <DashboardRoundedIcon />,
      action: () => {
        navigate("/dashboard");
        onClose();
      },
    },
    {
      id: "nav-projects",
      label: "Go to Projects",
      category: "Navigation",
      icon: <FolderRoundedIcon />,
      action: () => {
        navigate("/projects");
        onClose();
      },
    },
    {
      id: "nav-tasks",
      label: "Go to Tasks",
      category: "Navigation",
      icon: <TaskAltRoundedIcon />,
      action: () => {
        navigate("/tasks");
        onClose();
      },
    },
    {
      id: "nav-team",
      label: "Go to Team",
      category: "Navigation",
      icon: <GroupsRoundedIcon />,
      action: () => {
        navigate("/team");
        onClose();
      },
    },
    {
      id: "nav-settings",
      label: "Go to Settings",
      category: "Navigation",
      icon: <SettingsRoundedIcon />,
      action: () => {
        navigate("/settings");
        onClose();
      },
    },
    {
      id: "action-theme",
      label: `Switch to ${mode === "dark" ? "Light" : "Dark"} Mode`,
      category: "Actions",
      icon: mode === "dark" ? <LightModeRoundedIcon /> : <DarkModeRoundedIcon />,
      action: () => {
        toggleThemeMode();
        onClose();
      },
    },
    {
      id: "action-logout",
      label: "Sign Out",
      category: "Actions",
      icon: <LogoutRoundedIcon />,
      action: handleLogout,
    },
  ];

  // Fetch search results from API
  const { data: searchResults, isLoading } = useQuery({
    queryKey: ["globalSearch", search],
    queryFn: () => searchService.searchAll(search),
    enabled: open && search.trim().length >= 2,
  });

  // Project search results into command items format
  const getDynamicResults = () => {
    const list: any[] = [];
    if (!searchResults) return list;

    // 1. Projects
    searchResults.projects.forEach((p) => {
      list.push({
        id: `project-${p.id}`,
        label: p.name,
        category: "Projects",
        icon: <FolderRoundedIcon sx={{ color: "primary.main" }} />,
        action: () => {
          navigate(`/projects/${p.id}`);
          onClose();
        },
      });
    });

    // 2. Tasks
    searchResults.tasks.forEach((t) => {
      list.push({
        id: `task-${t.id}`,
        label: `${t.title} (Project: ${t.projectName})`,
        category: "Tasks",
        icon: <TaskAltRoundedIcon sx={{ color: "success.main" }} />,
        action: () => {
          navigate(`/projects/${t.projectId}?task=${t.id}`);
          onClose();
        },
      });
    });

    // 3. Comments
    searchResults.comments.forEach((c) => {
      list.push({
        id: `comment-${c.id}`,
        label: `"${c.content}" (Task: ${c.taskTitle})`,
        category: "Comments",
        icon: <ChatBubbleOutlineRoundedIcon sx={{ color: "info.main" }} />,
        action: () => {
          navigate(`/projects/${c.projectId}?task=${c.taskId}`);
          onClose();
        },
      });
    });

    // 4. Members
    searchResults.members.forEach((m) => {
      list.push({
        id: `member-${m.id}`,
        label: `${m.name} (${m.email})`,
        category: "Members",
        icon: <GroupsRoundedIcon sx={{ color: "warning.main" }} />,
        action: () => {
          navigate("/team");
          onClose();
        },
      });
    });

    return list;
  };

  const dynamicResults = getDynamicResults();

  // Filter commands
  const filtered =
    search.trim().length >= 2
      ? dynamicResults
      : commands.filter(
          (cmd) =>
            cmd.label.toLowerCase().includes(search.toLowerCase()) ||
            cmd.category.toLowerCase().includes(search.toLowerCase())
        );

  // Reset index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  // Handle keyboard navigation inside command palette
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.children[selectedIndex] as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: "nearest" });
      }
    }
  }, [selectedIndex]);

  // Clear search input on open/close
  useEffect(() => {
    if (!open) {
      setSearch("");
    }
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <Backdrop
          open={open}
          onClick={onClose}
          sx={{
            zIndex: theme.zIndex.modal + 1,
            backgroundColor: "rgba(5, 8, 22, 0.4)",
            backdropFilter: "blur(8px)",
          }}
        >
          <Box
            onClick={(e) => e.stopPropagation()}
            component={motion.div}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            onKeyDown={handleKeyDown}
            sx={{
              width: "100%",
              maxWidth: 600,
              bgcolor: theme.palette.mode === "dark" ? "rgba(17, 24, 39, 0.85)" : "rgba(255, 255, 255, 0.9)",
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
              boxShadow: "0 24px 48px rgba(0,0,0,0.3)",
              overflow: "hidden",
              mx: 2,
            }}
          >
            {/* Input search bar */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                px: 2.5,
                py: 2,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <SearchRoundedIcon sx={{ color: "text.secondary", mr: 1.5, fontSize: 22 }} />
              <InputBase
                autoFocus
                fullWidth
                placeholder="Search projects, tasks, members or comments..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                sx={{
                  fontSize: 16,
                  color: "text.primary",
                  "& input::placeholder": {
                    color: "text.secondary",
                    opacity: 0.8,
                  },
                }}
              />
              {isLoading ? (
                <CircularProgress size={18} sx={{ mr: 1.5 }} />
              ) : (
                <Box
                  sx={{
                    px: 1,
                    py: 0.25,
                    borderRadius: 1,
                    bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)",
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  <Typography variant="caption" color="text.secondary" fontWeight={700}>
                    ESC
                  </Typography>
                </Box>
              )}
            </Box>

            {/* List results */}
            <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
              {filtered.length > 0 ? (
                <List ref={listRef} disablePadding>
                  {filtered.map((cmd, idx) => {
                    const isSelected = idx === selectedIndex;
                    const showHeader = idx === 0 || filtered[idx - 1].category !== cmd.category;

                    return (
                      <React.Fragment key={cmd.id}>
                        {showHeader && (
                          <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
                            <Typography
                              variant="caption"
                              color="primary"
                              fontWeight={800}
                              sx={{ textTransform: "uppercase", letterSpacing: 1 }}
                            >
                              {cmd.category}
                            </Typography>
                          </Box>
                        )}
                        <ListItem disablePadding>
                          <ListItemButton
                            onClick={cmd.action}
                            selected={isSelected}
                            sx={{
                              px: 2.5,
                              py: 1.25,
                              mx: 1,
                              my: 0.25,
                              borderRadius: 2,
                              color: isSelected ? "text.primary" : "text.secondary",
                              backgroundColor: isSelected
                                ? theme.palette.mode === "dark"
                                  ? "rgba(124, 58, 237, 0.15) !important"
                                  : "rgba(124, 58, 237, 0.08) !important"
                                : "transparent",
                              "&:hover": {
                                color: "text.primary",
                                backgroundColor: theme.palette.mode === "dark"
                                  ? "rgba(255, 255, 255, 0.05)"
                                  : "rgba(0, 0, 0, 0.02)",
                              },
                            }}
                          >
                            <ListItemIcon
                              sx={{
                                minWidth: 40,
                                color: isSelected ? "primary.main" : "text.secondary",
                              }}
                            >
                              {cmd.icon}
                            </ListItemIcon>
                            <ListItemText
                              primary={cmd.label}
                              primaryTypographyProps={{
                                fontWeight: isSelected ? 700 : 500,
                                fontSize: 14,
                                sx: {
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                },
                              }}
                            />
                          </ListItemButton>
                        </ListItem>
                      </React.Fragment>
                    );
                  })}
                </List>
              ) : (
                <Box sx={{ p: 4, textAlign: "center" }}>
                  <Typography color="text.secondary" variant="body2">
                    No results found for &ldquo;{search}&rdquo;
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        </Backdrop>
      )}
    </AnimatePresence>
  );
}
