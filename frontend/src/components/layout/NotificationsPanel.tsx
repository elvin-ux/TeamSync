import {
  Box,
  Button,
  CircularProgress,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationService } from "../../services/notificationService";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const theme = useTheme();
  const queryClient = useQueryClient();

  // Query User Notifications
  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ["notifications"],
    queryFn: notificationService.getUserNotifications,
    enabled: open,
  });

  // Mark as Read Mutation
  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
    },
  });

  // Mark All as Read Mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      queryClient.invalidateQueries({ queryKey: ["unreadNotificationsCount"] });
    },
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationClick = (id: string, isRead: boolean) => {
    if (!isRead) {
      markAsReadMutation.mutate(id);
    }
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 380 },
          bgcolor: theme.palette.background.paper,
          borderLeft: `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      {/* Header */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ px: 2.5, py: 2, borderBottom: `1px solid ${theme.palette.divider}` }}
      >
        <Stack direction="row" alignItems="center" spacing={1.25}>
          <NotificationsNoneRoundedIcon sx={{ color: "text.primary" }} />
          <Typography variant="h6" fontWeight={750} color="text.primary">
            Notifications
          </Typography>
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {unreadCount > 0 && (
            <Button
              size="small"
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700 }}
            >
              Mark all read
            </Button>
          )}
          <IconButton onClick={onClose} size="small">
            <CloseRoundedIcon />
          </IconButton>
        </Stack>
      </Stack>

      {/* Notifications list */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {isLoading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
            <CircularProgress size={24} />
          </Box>
        ) : notifications.length > 0 ? (
          <List disablePadding>
            {notifications.map((notif, idx) => (
              <Box key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                  sx={{
                    px: 2.5,
                    py: 2.25,
                    cursor: !notif.isRead ? "pointer" : "default",
                    bgcolor: !notif.isRead
                      ? theme.palette.mode === "dark"
                        ? "rgba(124, 58, 237, 0.04)"
                        : "rgba(124, 58, 237, 0.02)"
                      : "transparent",
                    transition: "background 150ms",
                    "&:hover": {
                      bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.01)",
                    },
                  }}
                >
                  <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                    {/* Unread dot indicator */}
                    {!notif.isRead && (
                      <Box sx={{ pt: 0.75 }}>
                        <CircleRoundedIcon color="primary" sx={{ fontSize: 8 }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1, pl: notif.isRead ? 3 : 0 }}>
                      <Typography variant="body2" fontWeight={700} color="text.primary" sx={{ fontSize: 13 }}>
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block", fontSize: 11.5, lineHeight: 1.4 }}>
                        {notif.message}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontSize: 10 }}>
                        {formatTime(notif.createdAt)}
                      </Typography>
                    </Box>
                  </Stack>
                </ListItem>
                {idx < notifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: "center", mt: 8 }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5, mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              No notifications yet
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
