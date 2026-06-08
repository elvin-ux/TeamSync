import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Stack,
  Typography,
  useTheme,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CircleRoundedIcon from "@mui/icons-material/CircleRounded";
import NotificationsNoneRoundedIcon from "@mui/icons-material/NotificationsNoneRounded";

interface NotificationsPanelProps {
  open: boolean;
  onClose: () => void;
}

const mockNotifications = [
  {
    id: 1,
    title: "Task assigned to you",
    desc: "Lead assigned you the task 'Implement Authentication Layout'",
    time: "2 hours ago",
    unread: true,
  },
  {
    id: 2,
    title: "New comment on TeamSync",
    desc: "Admin commented: 'Looks great! Let us proceed to Phase 2.'",
    time: "4 hours ago",
    unread: true,
  },
  {
    id: 3,
    title: "Project phase updated",
    desc: "Project TeamSync moved from Phase 1 to Phase 2",
    time: "1 day ago",
    unread: false,
  },
];

export default function NotificationsPanel({ open, onClose }: NotificationsPanelProps) {
  const theme = useTheme();

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
        <Stack direction="row" alignItems="center" spacing={1}>
          <NotificationsNoneRoundedIcon />
          <Typography variant="h4">Notifications</Typography>
        </Stack>
        <IconButton onClick={onClose} size="small">
          <CloseRoundedIcon />
        </IconButton>
      </Stack>

      {/* Notifications list */}
      <Box sx={{ flex: 1, overflowY: "auto" }}>
        {mockNotifications.length > 0 ? (
          <List disablePadding>
            {mockNotifications.map((notif, idx) => (
              <Box key={notif.id}>
                <ListItem
                  alignItems="flex-start"
                  sx={{
                    px: 2.5,
                    py: 2.25,
                    bgcolor: notif.unread
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
                    {notif.unread && (
                      <Box sx={{ pt: 0.5 }}>
                        <CircleRoundedIcon color="primary" sx={{ fontSize: 8 }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" fontWeight={700} color="text.primary">
                        {notif.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: "block" }}>
                        {notif.desc}
                      </Typography>
                      <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: "block", fontSize: 11 }}>
                        {notif.time}
                      </Typography>
                    </Box>
                  </Stack>
                </ListItem>
                {idx < mockNotifications.length - 1 && <Divider />}
              </Box>
            ))}
          </List>
        ) : (
          <Box sx={{ p: 4, textAlign: "center", mt: 8 }}>
            <NotificationsNoneRoundedIcon sx={{ fontSize: 48, color: "text.secondary", opacity: 0.5, mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary">
              No notifications yet
            </Typography>
          </Box>
        )}
      </Box>
    </Drawer>
  );
}
