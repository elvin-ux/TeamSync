import { useQuery } from "@tanstack/react-query";
import {
  Box,
  CircularProgress,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";

import { activityService } from "../../services/activityService";

interface ActivityTimelineProps {
  projectId: string;
}

const getRelativeTime = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
};

export default function ActivityTimeline({ projectId }: ActivityTimelineProps) {
  const theme = useTheme();

  const { data: activities = [], isLoading } = useQuery({
    queryKey: ["projectActivities", projectId],
    queryFn: () => activityService.getProjectActivities(projectId),
    enabled: !!projectId,
  });

  const getActivityConfig = (action: string) => {
    switch (action) {
      case "PROJECT_CREATED":
        return {
          icon: <FolderRoundedIcon sx={{ fontSize: 14 }} />,
          color: "#3B82F6",
          text: "created the project",
        };
      case "MEMBER_ADDED":
        return {
          icon: <GroupsRoundedIcon sx={{ fontSize: 14 }} />,
          color: "#06B6D4",
          text: "added member",
        };
      case "TASK_CREATED":
        return {
          icon: <TaskAltRoundedIcon sx={{ fontSize: 14 }} />,
          color: "#94A3B8",
          text: "created task",
        };
      case "TASK_ASSIGNED":
        return {
          icon: <PersonRoundedIcon sx={{ fontSize: 14 }} />,
          color: "#8B5CF6",
          text: "assigned task",
        };
      case "TASK_COMPLETED":
        return {
          icon: <TaskAltRoundedIcon sx={{ fontSize: 14 }} />,
          color: "#10B981",
          text: "completed task",
        };
      default:
        return {
          icon: <FolderRoundedIcon sx={{ fontSize: 14 }} />,
          color: "#64748B",
          text: "performed action",
        };
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  if (activities.length === 0) {
    return (
      <Box sx={{ py: 3, textAlign: "center" }}>
        <Typography variant="body2" color="text.secondary">
          No recent activity logged yet.
        </Typography>
      </Box>
    );
  }

  return (
    <Stack spacing={0} sx={{ position: "relative", pl: 1 }}>
      {activities.map((act, index) => {
        const config = getActivityConfig(act.action);
        const isLast = index === activities.length - 1;

        return (
          <Box key={act.id} sx={{ display: "flex", position: "relative", pb: isLast ? 0 : 3 }}>
            {/* Timeline Line */}
            {!isLast && (
              <Box
                sx={{
                  position: "absolute",
                  left: 12,
                  top: 24,
                  bottom: 0,
                  width: 1.5,
                  bgcolor: theme.palette.divider,
                }}
              />
            )}

            {/* Timeline Circle with Icon */}
            <Box
              sx={{
                width: 26,
                height: 26,
                borderRadius: "55%",
                display: "grid",
                placeItems: "center",
                bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)",
                border: `1.5px solid ${config.color}`,
                color: config.color,
                mr: 2,
                flexShrink: 0,
                zIndex: 1,
              }}
            >
              {config.icon}
            </Box>

            {/* Content Details */}
            <Box sx={{ pt: 0.25 }}>
              <Stack direction="row" spacing={1} alignItems="baseline" flexWrap="wrap">
                <Typography variant="caption" fontWeight={750} color="text.primary">
                  {act.userName}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {config.text}
                </Typography>
                {act.details && (
                  <Typography variant="caption" fontWeight={700} color="text.primary" sx={{ fontStyle: "italic" }}>
                    "{act.details}"
                  </Typography>
                )}
              </Stack>
              <Typography variant="caption" display="block" color="text.secondary" sx={{ fontSize: 9.5, mt: 0.5, fontWeight: 500 }}>
                {getRelativeTime(act.createdAt)}
              </Typography>
            </Box>
          </Box>
        );
      })}
    </Stack>
  );
}
