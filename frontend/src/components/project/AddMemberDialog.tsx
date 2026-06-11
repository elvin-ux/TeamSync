import { useState } from "react";
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  IconButton,
  InputAdornment,
  CircularProgress,
  Typography,
  Stack,
  Alert,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import PersonAddAlt1RoundedIcon from "@mui/icons-material/PersonAddAlt1Rounded";
import ClearRoundedIcon from "@mui/icons-material/ClearRounded";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { userService } from "../../services/userService";
import { projectService } from "../../services/projectService";
import { getThemeColors } from "../../theme/theme";
import { useTheme } from "@mui/material/styles";
import { useMediaQuery } from "@mui/material";

interface AddMemberDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  currentMemberUserIds: string[];
}

export default function AddMemberDialog({
  open,
  onClose,
  projectId,
  currentMemberUserIds,
}: AddMemberDialogProps) {
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const activeColors = getThemeColors(theme.palette.mode);
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");

  // Query all users
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ["users"],
    queryFn: userService.getUsers,
    enabled: open,
  });

  // Mutation to add member
  const addMutation = useMutation({
    mutationFn: (userId: string) =>
      projectService.addProjectMember(projectId, { userId, roleInProject: "MEMBER" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectMembers", projectId] });
      onClose();
    },
  });

  const handleAddMember = (userId: string) => {
    addMutation.mutate(userId);
  };

  // Filter out existing members
  const availableUsers = users.filter((user) => !currentMemberUserIds.includes(user.id));

  // Filter by search keyword
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      fullScreen={isXs}
      PaperProps={{
        sx: { borderRadius: 3, p: 1 },
      }}
    >
      <DialogTitle>
        <Typography variant="h3" fontWeight={700}>
          Add Team Member
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Stack spacing={2.5}>
          {addMutation.isError && (
            <Alert severity="error" variant="outlined">
              {(addMutation.error as any).response?.data?.message || "Failed to add member."}
            </Alert>
          )}

          <TextField
            placeholder="Search users by name or email..."
            size="small"
            fullWidth
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchRoundedIcon sx={{ color: "text.secondary", fontSize: 18 }} />
                  </InputAdornment>
                ),
                endAdornment: search && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearch("")}>
                      <ClearRoundedIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                ),
              },
            }}
          />

          {isLoading ? (
            <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : isError ? (
            <Typography color="error" variant="body2" sx={{ py: 2, textAlign: "center" }}>
              Failed to load system users.
            </Typography>
          ) : filteredUsers.length > 0 ? (
            <List sx={{ maxHeight: 280, overflowY: "auto" }}>
              {filteredUsers.map((user) => (
                <ListItem
                  key={user.id}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      color="primary"
                      onClick={() => handleAddMember(user.id)}
                      disabled={addMutation.isPending}
                    >
                      {addMutation.isPending && addMutation.variables === user.id ? (
                        <CircularProgress size={18} color="inherit" />
                      ) : (
                        <PersonAddAlt1RoundedIcon sx={{ fontSize: 20 }} />
                      )}
                    </IconButton>
                  }
                  sx={{
                    borderRadius: 2,
                    mb: 0.5,
                    "&:hover": {
                      bgcolor: theme.palette.mode === "dark" ? activeColors.workspaceSurface : "#F1F5F9",
                    },
                  }}
                >
                  <ListItemAvatar>
                    <Avatar
                      src={user.avatarUrl || undefined}
                      sx={{
                        bgcolor: activeColors.primaryAccent,
                        fontSize: 14,
                        fontWeight: 700,
                        width: 36,
                        height: 36,
                      }}
                    >
                      {user.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="body2" fontWeight={700}>
                        {user.name}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap sx={{ display: "block", maxWidth: 200 }}>
                        {user.email}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 4, textAlign: "center" }}>
              {users.length === 0 ? "No users registered in the system." : "No matching users found."}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} color="inherit" disabled={addMutation.isPending}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
}
