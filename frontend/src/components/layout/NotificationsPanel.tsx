import {
  Box,
  Button,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  Skeleton,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";
import DoneAllRoundedIcon from "@mui/icons-material/DoneAllRounded";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { notificationService } from "../../services/notificationService";
import { fadeInUp, staggerContainer, scaleIn } from "../../utils/animations";

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
          {unreadCount > 0 && (
            <Box
              component={motion.div}
              key={unreadCount}
              initial={{ scale: 0.6 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 22 }}
              sx={{
                minWidth: 20,
                height: 20,
                borderRadius: 10,
                bgcolor: "primary.main",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                px: 0.75,
              }}
            >
              <Typography sx={{ fontSize: 11, fontWeight: 800, color: "#fff" }}>{unreadCount}</Typography>
            </Box>
          )}
        </Stack>
        <Stack direction="row" spacing={1} alignItems="center">
          {unreadCount > 0 && (
            <Button
              size="small"
              startIcon={<DoneAllRoundedIcon sx={{ fontSize: 16 }} />}
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              component={motion.button}
              whileTap={{ scale: 0.95 }}
              sx={{ textTransform: "none", fontSize: 11.5, fontWeight: 700, borderRadius: 2 }}
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
          // Skeleton loading
          <Stack sx={{ p: 2 }} spacing={2}>
            {[0, 1, 2, 3].map((i) => (
              <Stack key={i} direction="row" spacing={2} alignItems="flex-start">
                <Skeleton variant="circular" width={10} height={10} sx={{ mt: 1, flexShrink: 0 }} />
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="70%" height={18} />
                  <Skeleton variant="text" width="90%" height={14} />
                  <Skeleton variant="text" width="40%" height={12} sx={{ mt: 0.5 }} />
                </Box>
              </Stack>
            ))}
          </Stack>
        ) : notifications.length > 0 ? (
          <List
            disablePadding
            component={motion.ul}
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            style={{ padding: 0 }}
          >
            <AnimatePresence>
              {notifications.map((notif, idx) => (
                <Box
                  key={notif.id}
                  component={motion.div}
                  variants={fadeInUp}
                  exit={{ opacity: 0, x: 40 }}
                >
                  <ListItem
                    alignItems="flex-start"
                    onClick={() => handleNotificationClick(notif.id, notif.isRead)}
                    sx={{
                      px: 2.5,
                      py: 2.25,
                      cursor: !notif.isRead ? "pointer" : "default",
                      bgcolor: !notif.isRead
                        ? theme.palette.mode === "dark"
                          ? "rgba(124, 58, 237, 0.06)"
                          : "rgba(124, 58, 237, 0.03)"
                        : "transparent",
                      transition: "background 150ms",
                      "&:hover": {
                        bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.02)",
                      },
                    }}
                  >
                    <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                      {/* Animated unread dot */}
                      {!notif.isRead && (
                        <Box sx={{ pt: 0.75, flexShrink: 0 }}>
                          <Box
                            component={motion.div}
                            animate={{ scale: [1, 1.3, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                          >
                            <CircleRoundedIcon color="primary" sx={{ fontSize: 8 }} />
                          </Box>
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
            </AnimatePresence>
          </List>
        ) : (
          // Empty state
          <Box
            component={motion.div}
            variants={scaleIn}
            initial="hidden"
            animate="visible"
            sx={{ p: 4, textAlign: "center", mt: 6 }}
          >
            <Box
              sx={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.12) 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <NotificationsNoneRoundedIcon sx={{ fontSize: 34, opacity: 0.45 }} />
            </Box>
            <Typography variant="body1" fontWeight={700} color="text.primary" gutterBottom>
              All caught up!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              No notifications yet. You'll see updates here when something happens.
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
