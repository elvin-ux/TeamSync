import { useEffect, useRef, useState } from "react";
import {
  Box,
  Card,
  Divider,
  Grid,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
  Chip,
  useMediaQuery,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../services/dashboardService";
import { getThemeColors } from "../theme/theme";
import { fadeInUp, staggerContainer, pageTransition } from "../utils/animations";
import DashboardStatSkeleton from "../components/common/DashboardStatSkeleton";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip as ChartTooltip,
  Legend,
} from "recharts";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import FolderSpecialRoundedIcon from "@mui/icons-material/FolderSpecialRounded";
import AssignmentTurnedInRoundedIcon from "@mui/icons-material/AssignmentTurnedInRounded";
import HourglassEmptyRoundedIcon from "@mui/icons-material/HourglassEmptyRounded";
import ErrorOutlineRoundedIcon from "@mui/icons-material/ErrorOutlineRounded";
import CheckCircleOutlineRoundedIcon from "@mui/icons-material/CheckCircleOutlineRounded";

// Animated counter hook
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(0);
  const raf = useRef<number | null>(null);

  useEffect(() => {
    const start = performance.now();
    const animate = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) raf.current = requestAnimationFrame(animate);
    };
    raf.current = requestAnimationFrame(animate);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); };
  }, [target, duration]);

  return value;
}

// Individual animated stat card
function StatCard({
  title,
  rawValue,
  subtitle,
  icon,
  isCritical = false,
}: {
  title: string;
  rawValue: number | string;
  subtitle: string;
  icon: React.ReactNode;
  isCritical?: boolean;
}) {
  const theme = useTheme();
  const isNumeric = typeof rawValue === "number";
  const counted = useCountUp(isNumeric ? (rawValue as number) : 0);
  const displayValue = isNumeric ? counted : rawValue;

  return (
    <Box component={motion.div} variants={fadeInUp}>
      <Card
        component={motion.div}
        whileHover={{ y: -3, boxShadow: theme.palette.mode === "dark" ? "0 12px 32px rgba(0,0,0,0.4)" : "0 12px 32px rgba(0,0,0,0.08)" }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        sx={{
          p: 2.5,
          borderRadius: 3,
          border: isCritical ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
          bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
          boxShadow: "none",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          cursor: "default",
          transition: "box-shadow 250ms ease, transform 250ms ease",
        }}
      >
        <Box>
          <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
            {title}
          </Typography>
          <Typography variant="h3" fontWeight={850} sx={{ my: 0.75, color: isCritical ? "error.main" : "text.primary" }}>
            {displayValue}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {subtitle}
          </Typography>
        </Box>
        <Box
          sx={{
            p: 1.5,
            borderRadius: 2.5,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
          }}
        >
          {icon}
        </Box>
      </Card>
    </Box>
  );
}

export default function DashboardPage() {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const activeColors = getThemeColors(theme.palette.mode);
  const { role, userName } = useAuth();

  const isAdminOrLead = role === "ADMIN" || role === "LEAD";

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardService.getDashboardStats,
  });

  const COLORS = {
    TODO: "#64748B",
    IN_PROGRESS: "#3B82F6",
    REVIEW: "#F59E0B",
    TESTING: "#7C3AED",
    COMPLETED: "#10B981",
  };

  const getPriorityColor = (prio: string) => {
    switch (prio.toUpperCase()) {
      case "CRITICAL": return "error";
      case "HIGH": return "warning";
      case "MEDIUM": return "info";
      default: return "default";
    }
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <Stack spacing={4} sx={{ pb: 6 }}>
        <Box>
          <Box sx={{ height: 36, width: "40%", bgcolor: "action.hover", borderRadius: 2, mb: 1 }} />
          <Box sx={{ height: 20, width: "60%", bgcolor: "action.hover", borderRadius: 2 }} />
        </Box>
        <Grid container spacing={3}>
          {[0, 1, 2, 3].map((i) => (
            <Grid item xs={12} sm={6} md={3} key={i}>
              <DashboardStatSkeleton />
            </Grid>
          ))}
        </Grid>
      </Stack>
    );
  }

  if (isError || !stats) {
    return (
      <Box
        component={motion.div}
        variants={scaleIn}
        initial="hidden"
        animate="visible"
        sx={{ p: 6, textAlign: "center" }}
      >
        <ErrorOutlineRoundedIcon sx={{ fontSize: 48, color: "error.main", mb: 2 }} />
        <Typography variant="h5" fontWeight={700} color="error" gutterBottom>
          Failed to load dashboard
        </Typography>
        <Typography color="text.secondary">Please refresh the page or try again later.</Typography>
      </Box>
    );
  }

  const taskPieData = stats.taskStatusBreakdown
    .map((item) => ({
      name: item.status.replace("_", " "),
      value: item.count,
      color: COLORS[item.status as keyof typeof COLORS] || "#64748B",
    }))
    .filter((item) => item.value > 0);

  const statsCards = isAdminOrLead
    ? [
        { title: "Total Projects", rawValue: stats.totalProjects, subtitle: `${stats.activeProjects} active projects`, icon: <FolderSpecialRoundedIcon sx={{ fontSize: 28, color: "primary.main" }} /> },
        { title: "Total Users", rawValue: stats.totalUsers, subtitle: "Registered on platform", icon: <PeopleAltRoundedIcon sx={{ fontSize: 28, color: "success.main" }} /> },
        { title: "Completion Rate", rawValue: `${stats.overallTaskCompletionRate.toFixed(1)}%`, subtitle: `${stats.totalPendingTasks} pending tasks`, icon: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 28, color: "info.main" }} /> },
        { title: "Overdue Tasks", rawValue: stats.totalOverdueTasks, subtitle: "Requires attention", icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 28, color: "error.main" }} />, isCritical: stats.totalOverdueTasks > 0 },
      ]
    : [
        { title: "My Assigned Tasks", rawValue: stats.userAssignedTasksCount, subtitle: "Current active workload", icon: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 28, color: "primary.main" }} /> },
        { title: "My Completed Tasks", rawValue: stats.userCompletedTasksCount, subtitle: "All-time completed", icon: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 28, color: "success.main" }} /> },
        { title: "Pending Tasks", rawValue: stats.userAssignedTasksCount - stats.userCompletedTasksCount, subtitle: "Need completion", icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 28, color: "warning.main" }} /> },
        { title: "Platform Active Projects", rawValue: stats.activeProjects, subtitle: `Out of ${stats.totalProjects} total`, icon: <FolderSpecialRoundedIcon sx={{ fontSize: 28, color: "info.main" }} /> },
      ];

  return (
    <Stack
      component={motion.div}
      variants={pageTransition}
      initial="hidden"
      animate="visible"
      exit="exit"
      spacing={4}
      sx={{ pb: 6 }}
    >
      {/* Welcome Header */}
      <Box component={motion.div} variants={fadeInUp}>
        <Typography variant="h2" fontWeight={800} color="text.primary">
          Welcome back, {userName}! 👋
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Here is an overview of what is happening across your workspace.
        </Typography>
      </Box>

      {/* Stats Summary Cards Grid */}
      <Grid
        container
        spacing={3}
        component={motion.div}
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {statsCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <StatCard {...card} />
          </Grid>
        ))}
      </Grid>

      {/* Charts section */}
      <Grid container spacing={3} component={motion.div} variants={staggerContainer} initial="hidden" animate="visible">
        {/* Task Status breakdown */}
        <Grid item xs={12} md={isAdminOrLead ? 5 : 6} component={motion.div} variants={fadeInUp}>
          <Card
            sx={{
              p: 3,
              borderRadius: 3,
              border: `1px solid ${theme.palette.divider}`,
              bgcolor: "transparent",
              boxShadow: "none",
              height: 380,
              display: "flex",
              flexDirection: "column",
            }}
          >
            <Typography variant="h5" fontWeight={750} sx={{ mb: 2 }}>
              Task Distribution
            </Typography>
            <Box sx={{ flex: 1, display: "flex", justifyContent: "center", alignItems: "center" }}>
              {taskPieData.length > 0 ? (
                <ResponsiveContainer width="100%" height={260}>
                  <PieChart>
                    <Pie data={taskPieData} cx="50%" cy="50%" innerRadius={65} outerRadius={90} paddingAngle={3} dataKey="value">
                      {taskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Stack alignItems="center" spacing={1}>
                  <CheckCircleOutlineRoundedIcon sx={{ fontSize: 40, color: "success.main", opacity: 0.6 }} />
                  <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                    No tasks yet — create your first one!
                  </Typography>
                </Stack>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Team Productivity / Upcoming Deadlines */}
        {isAdminOrLead ? (
          <Grid item xs={12} md={7} component={motion.div} variants={fadeInUp}>
            <Card sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: "transparent", boxShadow: "none", height: 380, display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" fontWeight={750} sx={{ mb: 2 }}>Team Productivity</Typography>
              <Box sx={{ flex: 1 }}>
                {stats.teamProductivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart data={stats.teamProductivity} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="memberName" stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
                      <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
                      <ChartTooltip contentStyle={{ backgroundColor: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderRadius: 8 }} />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="completedTasks" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pendingTasks" name="Pending" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 1 }}>
                    <PeopleAltRoundedIcon sx={{ fontSize: 40, opacity: 0.3 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>No productivity logs recorded yet.</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={6} component={motion.div} variants={fadeInUp}>
            <Card sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: "transparent", boxShadow: "none", height: 380, display: "flex", flexDirection: "column" }}>
              <Typography variant="h5" fontWeight={750} sx={{ mb: 1.5 }}>Upcoming Deadlines</Typography>
              <Box sx={{ flex: 1, overflowY: isXs ? "visible" : "auto", maxHeight: isXs ? "none" : 300 }}>
                {stats.userUpcomingTasks.length > 0 ? (
                  <List disablePadding>
                    {stats.userUpcomingTasks.map((task, idx) => (
                      <Box key={task.id}>
                        <ListItem sx={{ py: 1.5, px: 0 }}>
                          <Stack direction={isXs ? "column" : "row"} justifyContent="space-between" alignItems={isXs ? "flex-start" : "center"} sx={{ width: "100%", gap: isXs ? 1 : 0 }}>
                            <Box sx={{ mr: isXs ? 0 : 2, overflow: "hidden" }}>
                              <Typography variant="body2" fontWeight={700} color="text.primary" noWrap={!isXs} sx={{ display: "block" }}>{task.title}</Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>Project: {task.projectName}</Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: isXs ? 0.5 : 0 }}>
                              <Chip label={task.priority} size="small" color={getPriorityColor(task.priority) as any} variant="outlined" sx={{ height: 20, fontSize: 9.5, fontWeight: 700 }} />
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "error.main" }}>
                                <CalendarMonthRoundedIcon sx={{ fontSize: 13 }} />
                                <Typography variant="caption" fontWeight={700}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : ""}</Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </ListItem>
                        {idx < stats.userUpcomingTasks.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", flexDirection: "column", gap: 1 }}>
                    <CheckCircleOutlineRoundedIcon sx={{ fontSize: 40, color: "success.main", opacity: 0.6 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>You're all caught up! No upcoming deadlines.</Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Closest Deadlines (Admin/Lead only) */}
      {isAdminOrLead && (
        <Box component={motion.div} variants={fadeInUp}>
          <Card sx={{ p: 3, borderRadius: 3, border: `1px solid ${theme.palette.divider}`, bgcolor: "transparent", boxShadow: "none" }}>
            <Typography variant="h5" fontWeight={750} sx={{ mb: 2 }}>Closest Deadlines (Assigned to Me)</Typography>
            {stats.userUpcomingTasks.length > 0 ? (
              <List disablePadding>
                {stats.userUpcomingTasks.map((task, idx) => (
                  <Box key={task.id}>
                    <ListItem sx={{ py: 1.5, px: 0 }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                        <Box sx={{ overflow: "hidden" }}>
                          <Typography variant="body2" fontWeight={700} color="text.primary">{task.title}</Typography>
                          <Typography variant="caption" color="text.secondary">Project: {task.projectName}</Typography>
                        </Box>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Chip label={task.priority} size="small" color={getPriorityColor(task.priority) as any} variant="outlined" sx={{ height: 20, fontSize: 9.5, fontWeight: 700 }} />
                          <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "error.main" }}>
                            <CalendarMonthRoundedIcon sx={{ fontSize: 13 }} />
                            <Typography variant="caption" fontWeight={700}>{task.deadline ? new Date(task.deadline).toLocaleDateString() : ""}</Typography>
                          </Stack>
                        </Stack>
                      </Stack>
                    </ListItem>
                    {idx < stats.userUpcomingTasks.length - 1 && <Divider />}
                  </Box>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                No tasks with upcoming deadlines assigned to you.
              </Typography>
            )}
          </Card>
        </Box>
      )}
    </Stack>
  );
}

// local import for error state
import { scaleIn } from "../utils/animations";
