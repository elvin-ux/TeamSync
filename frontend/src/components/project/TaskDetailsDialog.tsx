import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Button,
  Card,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import ChatBubbleOutlineRoundedIcon from "@mui/icons-material/ChatBubbleOutlineRounded";

import type { Task } from "../../types/task";
import { useAuth } from "../../hooks/useAuth";
import { getThemeColors } from "../../theme/theme";
import { getTaskStatusColors } from "../../pages/ProjectWorkspacePage";
import { getPriorityColor } from "../../pages/ProjectsPage";
import { commentService } from "../../services/commentService";

interface TaskDetailsDialogProps {
  open: boolean;
  onClose: () => void;
  task: Task | undefined;
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

export default function TaskDetailsDialog({ open, onClose, task }: TaskDetailsDialogProps) {
  const theme = useTheme();
  const activeColors = getThemeColors(theme.palette.mode);
  const { userEmail, role } = useAuth();
  const queryClient = useQueryClient();

  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editContent, setEditContent] = useState("");

  const taskId = task?.id;

  // Query Comments
  const { data: comments = [], isLoading: isCommentsLoading } = useQuery({
    queryKey: ["taskComments", taskId],
    queryFn: () => commentService.getTaskComments(taskId!),
    enabled: !!taskId && open,
  });

  // Create Comment Mutation
  const createCommentMutation = useMutation({
    mutationFn: (content: string) =>
      commentService.createComment({ taskId: taskId!, content }),
    onSuccess: () => {
      setNewComment("");
      queryClient.invalidateQueries({ queryKey: ["taskComments", taskId] });
    },
  });

  // Update Comment Mutation
  const updateCommentMutation = useMutation({
    mutationFn: ({ commentId, content }: { commentId: string; content: string }) =>
      commentService.updateComment(commentId, { content }),
    onSuccess: () => {
      setEditingCommentId(null);
      setEditContent("");
      queryClient.invalidateQueries({ queryKey: ["taskComments", taskId] });
    },
  });

  // Delete Comment Mutation
  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => commentService.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["taskComments", taskId] });
    },
  });

  if (!task) return null;

  const taskStatusColors = getTaskStatusColors(task.status as any, theme.palette.mode);
  const deadlineFormatted = task.deadline
    ? new Date(task.deadline).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "No deadline";

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || createCommentMutation.isPending) return;
    createCommentMutation.mutate(newComment.trim());
  };

  const handleSaveEdit = (commentId: string) => {
    if (!editContent.trim() || updateCommentMutation.isPending) return;
    updateCommentMutation.mutate({ commentId, content: editContent.trim() });
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
          borderRadius: 4,
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: "none",
        },
      }}
    >
      <DialogTitle sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Typography variant="h3" fontWeight={800}>
          Task Details
        </Typography>
        <IconButton onClick={onClose} size="small" sx={{ color: "text.secondary" }}>
          <CloseRoundedIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 3, borderColor: theme.palette.divider }}>
        <Grid container spacing={4.5}>
          {/* Left Panel: Details & Description */}
          <Grid item xs={12} md={7}>
            <Stack spacing={3.5}>
              <Box>
                <Typography variant="h2" fontWeight={850} gutterBottom sx={{ fontSize: "1.35rem", lineHeight: 1.3 }}>
                  {task.title}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" fontWeight={750} color="text.primary" gutterBottom>
                  Description
                </Typography>
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    whiteSpace: "pre-line",
                    lineHeight: 1.6,
                    bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.01)" : "rgba(0, 0, 0, 0.01)",
                    p: 2,
                    borderRadius: 2.5,
                    border: `1px solid ${theme.palette.divider}`,
                  }}
                >
                  {task.description || "No description provided."}
                </Typography>
              </Box>

              {/* Comments Section */}
              <Box>
                <Typography variant="subtitle2" fontWeight={750} color="text.primary" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
                  <ChatBubbleOutlineRoundedIcon sx={{ fontSize: 18 }} />
                  Discussion ({comments.length})
                </Typography>

                {/* Comments List */}
                <Stack spacing={2.5} sx={{ mb: 3, maxHeight: 280, overflowY: "auto", pr: 1 }}>
                  {isCommentsLoading ? (
                    <Box sx={{ display: "flex", justifyContent: "center", py: 2 }}>
                      <CircularProgress size={20} />
                    </Box>
                  ) : comments.length > 0 ? (
                    comments.map((comment) => {
                      const isAuthor = comment.authorEmail === userEmail;
                      const isLeadOrAdmin = role === "ADMIN" || role === "LEAD";
                      const canDeleteComment = isAuthor || isLeadOrAdmin;
                      const isEditing = editingCommentId === comment.id;

                      return (
                        <Box key={comment.id} sx={{ display: "flex", gap: 1.75 }}>
                          <Avatar sx={{ width: 28, height: 28, fontSize: 12, fontWeight: 700, bgcolor: "primary.main" }}>
                            {comment.authorName.charAt(0).toUpperCase()}
                          </Avatar>
                          <Box sx={{ flexGrow: 1 }}>
                            {/* Author & Time */}
                            <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 0.5 }}>
                              <Typography variant="caption" fontWeight={750} color="text.primary">
                                {comment.authorName}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: 9.5 }}>
                                {getRelativeTime(comment.createdAt)}
                              </Typography>

                              {/* Actions */}
                              {!isEditing && (
                                <Stack direction="row" spacing={0.5} sx={{ ml: "auto" }}>
                                  {isAuthor && (
                                    <IconButton
                                      size="small"
                                      onClick={() => {
                                        setEditingCommentId(comment.id);
                                        setEditContent(comment.content);
                                      }}
                                      sx={{ p: 0.25, color: "text.secondary" }}
                                    >
                                      <EditRoundedIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  )}
                                  {canDeleteComment && (
                                    <IconButton
                                      size="small"
                                      color="error"
                                      onClick={() => deleteCommentMutation.mutate(comment.id)}
                                      disabled={deleteCommentMutation.isPending}
                                      sx={{ p: 0.25 }}
                                    >
                                      <DeleteRoundedIcon sx={{ fontSize: 12 }} />
                                    </IconButton>
                                  )}
                                </Stack>
                              )}
                            </Stack>

                            {/* Comment Body */}
                            {isEditing ? (
                              <Stack spacing={1} sx={{ mt: 1 }}>
                                <TextField
                                  fullWidth
                                  multiline
                                  size="small"
                                  value={editContent}
                                  onChange={(e) => setEditContent(e.target.value)}
                                  slotProps={{
                                    input: { sx: { fontSize: 12, borderRadius: 2 } }
                                  }}
                                />
                                <Stack direction="row" spacing={1} justifyContent="flex-end">
                                  <Button
                                    size="small"
                                    variant="text"
                                    onClick={() => setEditingCommentId(null)}
                                    sx={{ fontSize: 10 }}
                                  >
                                    Cancel
                                  </Button>
                                  <Button
                                    size="small"
                                    variant="contained"
                                    onClick={() => handleSaveEdit(comment.id)}
                                    disabled={updateCommentMutation.isPending}
                                    sx={{ fontSize: 10, px: 2 }}
                                  >
                                    Save
                                  </Button>
                                </Stack>
                              </Stack>
                            ) : (
                              <Typography variant="body2" color="text.secondary" sx={{ fontSize: 13, lineHeight: 1.5, wordBreak: "break-word" }}>
                                {comment.content}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      );
                    })
                  ) : (
                    <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", textAlign: "center", display: "block", py: 2 }}>
                      No comments yet. Start the conversation!
                    </Typography>
                  )}
                </Stack>

                {/* Add Comment Input */}
                <Box component="form" onSubmit={handleAddComment} sx={{ display: "flex", gap: 1.5, alignItems: "flex-end" }}>
                  <TextField
                    placeholder="Write a comment..."
                    fullWidth
                    multiline
                    maxRows={3}
                    size="small"
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    slotProps={{
                      input: { sx: { borderRadius: 2.5, fontSize: 12.5 } }
                    }}
                  />
                  <IconButton
                    type="submit"
                    color="primary"
                    disabled={!newComment.trim() || createCommentMutation.isPending}
                    sx={{
                      bgcolor: "primary.main",
                      color: "primary.contrastText",
                      width: 36,
                      height: 36,
                      borderRadius: 2.5,
                      "&:hover": { bgcolor: "primary.dark" },
                      "&.Mui-disabled": { bgcolor: "action.disabledBackground" },
                    }}
                  >
                    {createCommentMutation.isPending ? (
                      <CircularProgress size={18} color="inherit" />
                    ) : (
                      <SendRoundedIcon sx={{ fontSize: 16 }} />
                    )}
                  </IconButton>
                </Box>
              </Box>
            </Stack>
          </Grid>

          {/* Right Panel: Metadata Attributes */}
          <Grid item xs={12} md={5}>
            <Card
              sx={{
                p: 3,
                bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.01)" : "rgba(0, 0, 0, 0.01)",
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 2.5, letterSpacing: 0.5 }}>
                Properties
              </Typography>

              <Stack spacing={2.5}>
                {/* Status */}
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, fontWeight: 600 }}>
                    Status
                  </Typography>
                  <Chip
                    label={task.status.replace("_", " ")}
                    size="small"
                    sx={{
                      bgcolor: taskStatusColors.bg,
                      color: taskStatusColors.text,
                      fontWeight: 800,
                      fontSize: 10.5,
                    }}
                  />
                </Box>

                {/* Priority */}
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, fontWeight: 600 }}>
                    Priority
                  </Typography>
                  <Chip
                    label={task.priority}
                    size="small"
                    color={getPriorityColor(task.priority as any)}
                    sx={{ fontWeight: 800, fontSize: 10.5 }}
                  />
                </Box>

                {/* Assignee */}
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.75, fontWeight: 600 }}>
                    Assignee
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Avatar sx={{ width: 24, height: 24, fontSize: 10, fontWeight: 700, bgcolor: task.assignedToName ? "primary.main" : "action.disabledBackground" }}>
                      {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : "?"}
                    </Avatar>
                    <Typography variant="body2" fontWeight={600}>
                      {task.assignedToName || "Unassigned"}
                    </Typography>
                  </Stack>
                </Box>

                {/* Deadline */}
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Deadline
                  </Typography>
                  <Stack direction="row" alignItems="center" spacing={0.75} sx={{ color: "text.secondary" }}>
                    <CalendarMonthRoundedIcon sx={{ fontSize: 16 }} />
                    <Typography variant="body2" fontWeight={600}>
                      {deadlineFormatted}
                    </Typography>
                  </Stack>
                </Box>

                {/* Estimates */}
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                    Estimated Duration
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {task.estimatedHours ? `${task.estimatedHours} Hours` : "Not set"}
                  </Typography>
                </Box>

                {task.actualHours && (
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 0.5, fontWeight: 600 }}>
                      Actual Duration
                    </Typography>
                    <Typography variant="body2" fontWeight={700} color="success.main">
                      {task.actualHours} Hours
                    </Typography>
                  </Box>
                )}

                <Divider sx={{ my: 1 }} />

                {/* Creator & Dates */}
                <Stack spacing={1.5}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      Created By
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color="text.primary">
                      {task.createdByName}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block" sx={{ fontWeight: 600 }}>
                      Created At
                    </Typography>
                    <Typography variant="caption" color="text.primary">
                      {new Date(task.createdAt).toLocaleString()}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2.5 }}>
        <Button variant="outlined" onClick={onClose} size="small" sx={{ borderRadius: 2 }}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
}
