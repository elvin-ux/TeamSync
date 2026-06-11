import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
  useTheme,
  Tooltip,
  useMediaQuery,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import FilterListRoundedIcon from "@mui/icons-material/FilterListRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";
import KeyboardArrowRightRoundedIcon from "@mui/icons-material/KeyboardArrowRightRounded";

import { projectService } from "../services/projectService";
import { useAuth } from "../hooks/useAuth";
import { getThemeColors } from "../theme/theme";
import ProjectFormDialog from "../components/project/ProjectFormDialog";
import type { Project, ProjectStatus, ProjectPriority } from "../types/project";

// Status color resolver
export const getStatusColor = (status: ProjectStatus, mode: "light" | "dark") => {
  const colors = {
    PLANNING: { bg: mode === "dark" ? "rgba(148, 163, 184, 0.1)" : "#F1F5F9", text: mode === "dark" ? "#94A3B8" : "#475569", border: "rgba(148, 163, 184, 0.2)" },
    ACTIVE: { bg: mode === "dark" ? "rgba(56, 189, 248, 0.1)" : "#E0F2FE", text: "#0284C7", border: "rgba(56, 189, 248, 0.2)" },
    ON_HOLD: { bg: mode === "dark" ? "rgba(245, 158, 11, 0.1)" : "#FEF3C7", text: "#D97706", border: "rgba(245, 158, 11, 0.2)" },
    COMPLETED: { bg: mode === "dark" ? "rgba(34, 197, 94, 0.1)" : "#DCFCE7", text: "#16A34A", border: "rgba(34, 197, 94, 0.2)" },
    CANCELLED: { bg: mode === "dark" ? "rgba(239, 68, 68, 0.1)" : "#FEE2E2", text: "#DC2626", border: "rgba(239, 68, 68, 0.2)" },
  };
  return colors[status] || colors.PLANNING;
};

// Priority color resolver
export const getPriorityColor = (priority: ProjectPriority) => {
  const colors = {
    LOW: "info",
    MEDIUM: "success",
    HIGH: "warning",
    CRITICAL: "error",
  } as const;
  return colors[priority] || "default";
};

export default function ProjectsPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down('sm'));
  const activeColors = getThemeColors(theme.palette.mode);
  const navigate = useNavigate();
  const { role } = useAuth();

  // State
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [isFormOpen, setIsFormOpen] = useState(false);

  const canCreate = role === "ADMIN" || role === "LEAD";

  // Query projects
  const { data: projects = [], isLoading, isError } = useQuery({
    queryKey: ["projects"],
    queryFn: projectService.getProjects,
  });

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesSearch = project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (project.description && project.description.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesStatus = statusFilter === "ALL" || project.status === statusFilter;
    const matchesPriority = priorityFilter === "ALL" || project.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleClearFilters = () => {
    setSearchQuery("");
    setStatusFilter("ALL");
    setPriorityFilter("ALL");
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Not set";
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 360 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isError) {
    return (
      <Typography color="error" variant="body1">
        Failed to load projects. Please refresh the page or try again later.
      </Typography>
    );
  }

  return (
    <Stack spacing={4} component={motion.div} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {/* Header */}
      <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2}>
        <Box>
          <Typography variant="h2">Projects</Typography>
          <Typography color="text.secondary">Create, manage, and collaborate on your workspaces.</Typography>
        </Box>
        {canCreate && (
          <Button
            variant="contained"
            startIcon={<AddRoundedIcon />}
            onClick={() => setIsFormOpen(true)}
            sx={{ px: 3 }}
          >
            Create Project
          </Button>
        )}
      </Stack>

      {/* Filters Bar */}
      <Card
        sx={{
          p: 2,
          bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
          borderRadius: 2.5,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Grid container spacing={2} alignItems="center">
          {/* Search field */}
          <Grid item xs={12} md={5}>
            <TextField
              placeholder="Search projects..."
              fullWidth
              size="small"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchRoundedIcon sx={{ color: "text.secondary" }} />
                    </InputAdornment>
                  ),
                  endAdornment: searchQuery && (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setSearchQuery("")}>
                        <ClearRoundedIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Grid>

          {/* Status filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Status"
              fullWidth
              size="small"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListRoundedIcon sx={{ color: "text.secondary", mr: 0.5 }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="ALL">All Statuses</MenuItem>
              <MenuItem value="PLANNING">Planning</MenuItem>
              <MenuItem value="ACTIVE">Active</MenuItem>
              <MenuItem value="ON_HOLD">On Hold</MenuItem>
              <MenuItem value="COMPLETED">Completed</MenuItem>
              <MenuItem value="CANCELLED">Cancelled</MenuItem>
            </TextField>
          </Grid>

          {/* Priority filter */}
          <Grid item xs={12} sm={6} md={3}>
            <TextField
              select
              label="Priority"
              fullWidth
              size="small"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <FilterListRoundedIcon sx={{ color: "text.secondary", mr: 0.5 }} />
                    </InputAdornment>
                  ),
                },
              }}
            >
              <MenuItem value="ALL">All Priorities</MenuItem>
              <MenuItem value="LOW">Low</MenuItem>
              <MenuItem value="MEDIUM">Medium</MenuItem>
              <MenuItem value="HIGH">High</MenuItem>
              <MenuItem value="CRITICAL">Critical</MenuItem>
            </TextField>
          </Grid>

          {/* Clear Filters Button */}
          {(searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL") && (
            <Grid item xs={12} md={1}>
              <Button
                variant="text"
                color="error"
                fullWidth
                onClick={handleClearFilters}
                sx={{ height: 40 }}
              >
                Clear
              </Button>
            </Grid>
          )}
        </Grid>
      </Card>

      {/* Projects Grid */}
      {filteredProjects.length > 0 ? (
        <Grid container spacing={3}>
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, idx) => {
              const statusColors = getStatusColor(project.status, theme.palette.mode);

              return (
                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={4}
                  key={project.id}
                  component={motion.div}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: idx * 0.05 }}
                >
                  <Card
                    onClick={() => navigate(`/projects/${project.id}`)}
                    sx={{
                      height: "100%",
                      cursor: "pointer",
                      bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
                      borderRadius: 3,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: "transform 200ms ease, box-shadow 200ms ease, border-color 200ms ease",
                      "&:hover": {
                        transform: "translateY(-4px)",
                        borderColor: activeColors.primaryAccent,
                        boxShadow: `0 12px 24px -10px ${activeColors.primaryAccent}1a`,
                      },
                      display: "flex",
                      flexDirection: "column",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    {/* Visual indicators */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 0,
                        left: 0,
                        right: 0,
                        height: 4,
                        bgcolor: statusColors.text,
                      }}
                    />

                    <CardContent sx={{ p: 3, flex: 1, display: "flex", flexDirection: "column" }}>
                      {/* Top Row: Status & Priority */}
                      <Stack direction={isXs ? "column" : "row"} justifyContent="space-between" alignItems={isXs ? "flex-start" : "center"} sx={{ mb: 2, gap: isXs ? 1 : 0 }}>
                        <Chip
                          label={project.status.charAt(0) + project.status.slice(1).toLowerCase().replace("_", " ")}
                          size="small"
                          sx={{
                            bgcolor: statusColors.bg,
                            color: statusColors.text,
                            border: `1px solid ${statusColors.border}`,
                            fontWeight: 700,
                            fontSize: 12,
                          }}
                        />
                        <Chip
                          label={project.priority}
                          size="small"
                          color={getPriorityColor(project.priority)}
                          variant="outlined"
                          sx={{ fontWeight: 700, fontSize: 11 }}
                        />
                      </Stack>

                      {/* Title & Description */}
                      <Box sx={{ flex: 1, mb: 3.5 }}>
                        <Typography variant="h4" fontWeight={700} sx={{ mb: 1, overflow: "hidden", textOverflow: "ellipsis", display: "-webkit-box", WebkitLineClamp: 1, WebkitBoxOrient: "vertical" }}>
                          {project.name}
                        </Typography>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          sx={{
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            display: "-webkit-box",
                            WebkitLineClamp: isXs ? 2 : 3,
                            WebkitBoxOrient: "vertical",
                            minHeight: isXs ? 40 : 60,
                          }}
                        >
                          {project.description || "No description provided."}
                        </Typography>
                      </Box>

                      {/* Divider */}
                      <Box sx={{ borderTop: `1px solid ${theme.palette.divider}`, my: 2 }} />

                      {/* Dates & Creator info */}
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ color: "text.secondary" }}>
                          <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
                          <Typography variant="caption" fontWeight={500}>
                            {formatDate(project.startDate)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" alignItems="center" spacing={0.5}>
                          <Typography variant="caption" color="text.secondary" sx={{ select: "none" }}>
                            By
                          </Typography>
                          <Typography variant="caption" fontWeight={700} color="text.primary">
                            {project.createdByName}
                          </Typography>
                          <KeyboardArrowRightRoundedIcon sx={{ fontSize: 16, color: "text.secondary" }} />
                        </Stack>
                      </Stack>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </AnimatePresence>
        </Grid>
      ) : (
        /* Empty State with Floating Orb */
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 2,
            textAlign: "center",
            borderRadius: 4,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          {/* Floating Orb visual component */}
          <Box
            sx={{
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: "radial-gradient(circle at 30% 30%, #8B5CF6 0%, #7C3AED 50%, #050816 100%)",
              boxShadow: "0 20px 40px rgba(124, 58, 237, 0.3), inset -10px -10px 30px rgba(0,0,0,0.6), inset 15px 15px 30px rgba(255,255,255,0.2)",
              animation: "float 4s ease-in-out infinite",
              mb: 3.5,
              "@keyframes float": {
                "0%, 100%": { transform: "translateY(0px)" },
                "50%": { transform: "translateY(-12px)" },
              },
            }}
          />

          <Typography variant="h3" fontWeight={700} sx={{ mb: 1 }}>
            {projects.length === 0 ? "Create your first project" : "No projects match your filters"}
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 420, mb: 4, fontSize: 14 }}>
            {projects.length === 0
              ? "Get started by launching a new collaborative workspace for your team."
              : "Try adjusting your search keywords or clearing active filters to find what you are looking for."}
          </Typography>

          {projects.length === 0 ? (
            canCreate && (
              <Button
                variant="contained"
                startIcon={<AddRoundedIcon />}
                onClick={() => setIsFormOpen(true)}
              >
                Create Project
              </Button>
            )
          ) : (
            <Button variant="outlined" onClick={handleClearFilters}>
              Reset Filters
            </Button>
          )}
        </Box>
      )}

      {/* Project Form Dialog */}
      <ProjectFormDialog open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </Stack>
  );
}
