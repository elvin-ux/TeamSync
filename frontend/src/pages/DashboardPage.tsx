import {
  Box,
  Card,
  CircularProgress,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
  Chip,
} from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../hooks/useAuth";
import { dashboardService } from "../services/dashboardService";
import { getThemeColors } from "../theme/theme";
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

export default function DashboardPage() {
  const theme = useTheme();
  const activeColors = getThemeColors(theme.palette.mode);
  const { role, userName } = useAuth();

  const isAdminOrLead = role === "ADMIN" || role === "LEAD";

  const { data: stats, isLoading, isError } = useQuery({
    queryKey: ["dashboardStats"],
    queryFn: dashboardService.getDashboardStats,
  });

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh" }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !stats) {
    return (
      <Box sx={{ p: 3, textAlign: "center" }}>
        <Typography color="error" variant="h6">
          Failed to load dashboard statistics.
        </Typography>
      </Box>
    );
  }

  // Define colors for Pie Chart
  const COLORS = {
    TODO: "#64748B", // Slate
    IN_PROGRESS: "#3B82F6", // Blue
    REVIEW: "#F59E0B", // Amber
    TESTING: "#7C3AED", // Violet
    COMPLETED: "#10B981", // Emerald
  };

  const taskPieData = stats.taskStatusBreakdown
    .map((item) => ({
      name: item.status.replace("_", " "),
      value: item.count,
      color: COLORS[item.status as keyof typeof COLORS] || "#64748B",
    }))
    .filter((item) => item.value > 0);

  const statsCards = isAdminOrLead
    ? [
        {
          title: "Total Projects",
          value: stats.totalProjects,
          subtitle: `${stats.activeProjects} active projects`,
          icon: <FolderSpecialRoundedIcon sx={{ fontSize: 28, color: "primary.main" }} />,
        },
        {
          title: "Total Users",
          value: stats.totalUsers,
          subtitle: "Registered on platform",
          icon: <PeopleAltRoundedIcon sx={{ fontSize: 28, color: "success.main" }} />,
        },
        {
          title: "Completion Rate",
          value: `${stats.overallTaskCompletionRate.toFixed(1)}%`,
          subtitle: `${stats.totalPendingTasks} pending tasks`,
          icon: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 28, color: "info.main" }} />,
        },
        {
          title: "Overdue Tasks",
          value: stats.totalOverdueTasks,
          subtitle: "Requires attention",
          icon: <ErrorOutlineRoundedIcon sx={{ fontSize: 28, color: "error.main" }} />,
          isCritical: stats.totalOverdueTasks > 0,
        },
      ]
    : [
        {
          title: "My Assigned Tasks",
          value: stats.userAssignedTasksCount,
          subtitle: "Current active workload",
          icon: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 28, color: "primary.main" }} />,
        },
        {
          title: "My Completed Tasks",
          value: stats.userCompletedTasksCount,
          subtitle: "All-time completed",
          icon: <AssignmentTurnedInRoundedIcon sx={{ fontSize: 28, color: "success.main" }} />,
        },
        {
          title: "Pending Tasks",
          value: stats.userAssignedTasksCount - stats.userCompletedTasksCount,
          subtitle: "Need completion",
          icon: <HourglassEmptyRoundedIcon sx={{ fontSize: 28, color: "warning.main" }} />,
        },
        {
          title: "Platform Active Projects",
          value: stats.activeProjects,
          subtitle: `Out of ${stats.totalProjects} total`,
          icon: <FolderSpecialRoundedIcon sx={{ fontSize: 28, color: "info.main" }} />,
        },
      ];

  const getPriorityColor = (prio: string) => {
    switch (prio.toUpperCase()) {
      case "CRITICAL":
        return "error";
      case "HIGH":
        return "warning";
      case "MEDIUM":
        return "info";
      default:
        return "default";
    }
  };

  return (
    <Stack spacing={4} sx={{ pb: 6 }}>
      {/* Welcome Header */}
      <Box>
        <Typography variant="h2" fontWeight={800} color="text.primary">
          Welcome back, {userName}!
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mt: 0.5 }}>
          Here is an overview of what is happening across your workspace.
        </Typography>
      </Box>

      {/* Stats Summary Cards Grid */}
      <Grid container spacing={3}>
        {statsCards.map((card, idx) => (
          <Grid item xs={12} sm={6} md={3} key={idx}>
            <Card
              sx={{
                p: 2.5,
                borderRadius: 3,
                border: card.isCritical ? `1px solid ${theme.palette.error.main}` : `1px solid ${theme.palette.divider}`,
                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)",
                boxShadow: "none",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={700} sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}>
                  {card.title}
                </Typography>
                <Typography variant="h3" fontWeight={850} sx={{ my: 0.75, color: card.isCritical ? "error.main" : "text.primary" }}>
                  {card.value}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {card.subtitle}
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                }}
              >
                {card.icon}
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Charts section */}
      <Grid container spacing={3}>
        {/* Task Status breakdown */}
        <Grid item xs={12} md={isAdminOrLead ? 5 : 6}>
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
                    <Pie
                      data={taskPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={90}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {taskPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <ChartTooltip
                      contentStyle={{
                        backgroundColor: theme.palette.background.paper,
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 8,
                      }}
                    />
                    <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  No tasks available to show breakdown.
                </Typography>
              )}
            </Box>
          </Card>
        </Grid>

        {/* Team Productivity BarChart (Admin/Lead only) or User Upcoming Deadlines list */}
        {isAdminOrLead ? (
          <Grid item xs={12} md={7}>
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
                Team Productivity
              </Typography>
              <Box sx={{ flex: 1 }}>
                {stats.teamProductivity.length > 0 ? (
                  <ResponsiveContainer width="100%" height={270}>
                    <BarChart
                      data={stats.teamProductivity}
                      margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
                    >
                      <XAxis dataKey="memberName" stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
                      <YAxis stroke={theme.palette.text.secondary} style={{ fontSize: 11 }} />
                      <ChartTooltip
                        contentStyle={{
                          backgroundColor: theme.palette.background.paper,
                          border: `1px solid ${theme.palette.divider}`,
                          borderRadius: 8,
                        }}
                      />
                      <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                      <Bar dataKey="completedTasks" name="Completed" fill="#10B981" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="pendingTasks" name="Pending" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No productivity logs recorded yet.
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        ) : (
          <Grid item xs={12} md={6}>
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
              <Typography variant="h5" fontWeight={750} sx={{ mb: 1.5 }}>
                Upcoming Deadlines
              </Typography>
              <Box sx={{ flex: 1, overflowY: "auto" }}>
                {stats.userUpcomingTasks.length > 0 ? (
                  <List disablePadding>
                    {stats.userUpcomingTasks.map((task, idx) => (
                      <Box key={task.id}>
                        <ListItem sx={{ py: 1.5, px: 0 }}>
                          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                            <Box sx={{ mr: 2, overflow: "hidden" }}>
                              <Typography variant="body2" fontWeight={700} color="text.primary" noWrap sx={{ display: "block" }}>
                                {task.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.25 }}>
                                Project: {task.projectName}
                              </Typography>
                            </Box>
                            <Stack direction="row" spacing={1} alignItems="center">
                              <Chip
                                label={task.priority}
                                size="small"
                                color={getPriorityColor(task.priority)}
                                variant="outlined"
                                sx={{ height: 20, fontSize: 9.5, fontWeight: 700 }}
                              />
                              <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "error.main" }}>
                                <CalendarMonthRoundedIcon sx={{ fontSize: 13 }} />
                                <Typography variant="caption" fontWeight={700}>
                                  {task.deadline ? new Date(task.deadline).toLocaleDateString() : ""}
                                </Typography>
                              </Stack>
                            </Stack>
                          </Stack>
                        </ListItem>
                        {idx < stats.userUpcomingTasks.length - 1 && <Divider />}
                      </Box>
                    ))}
                  </List>
                ) : (
                  <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center" }}>
                    <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
                      No upcoming deadlines. You're all caught up!
                    </Typography>
                  </Box>
                )}
              </Box>
            </Card>
          </Grid>
        )}
      </Grid>

      {/* Overview/Project list for leads/admins, otherwise display deadlines list */}
      {isAdminOrLead && (
        <Card
          sx={{
            p: 3,
            borderRadius: 3,
            border: `1px solid ${theme.palette.divider}`,
            bgcolor: "transparent",
            boxShadow: "none",
          }}
        >
          <Typography variant="h5" fontWeight={750} sx={{ mb: 2 }}>
            Closest Deadlines (Assigned to Me)
          </Typography>
          {stats.userUpcomingTasks.length > 0 ? (
            <List disablePadding>
              {stats.userUpcomingTasks.map((task, idx) => (
                <Box key={task.id}>
                  <ListItem sx={{ py: 1.5, px: 0 }}>
                    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ width: "100%" }}>
                      <Box sx={{ overflow: "hidden" }}>
                        <Typography variant="body2" fontWeight={700} color="text.primary">
                          {task.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Project: {task.projectName}
                        </Typography>
                      </Box>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Chip
                          label={task.priority}
                          size="small"
                          color={getPriorityColor(task.priority)}
                          variant="outlined"
                          sx={{ height: 20, fontSize: 9.5, fontWeight: 700 }}
                        />
                        <Stack direction="row" spacing={0.5} alignItems="center" sx={{ color: "error.main" }}>
                          <CalendarMonthRoundedIcon sx={{ fontSize: 13 }} />
                          <Typography variant="caption" fontWeight={700}>
                            {task.deadline ? new Date(task.deadline).toLocaleDateString() : ""}
                          </Typography>
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
      )}
    </Stack>
  );
}
