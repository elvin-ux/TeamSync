import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  Typography,
  useTheme,
  Alert,
} from "@mui/material";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import ArrowDropDownRoundedIcon from "@mui/icons-material/ArrowDropDownRounded";
import FolderRoundedIcon from "@mui/icons-material/FolderRounded";
import TaskAltRoundedIcon from "@mui/icons-material/TaskAltRounded";
import GroupsRoundedIcon from "@mui/icons-material/GroupsRounded";
import ListAltRoundedIcon from "@mui/icons-material/ListAltRounded";

import { projectService } from "../services/projectService";
import { useAuth } from "../hooks/useAuth";
import { getThemeColors } from "../theme/theme";
import ProjectFormDialog from "../components/project/ProjectFormDialog";
import AddMemberDialog from "../components/project/AddMemberDialog";
import { getStatusColor, getPriorityColor } from "./ProjectsPage";
import type { ProjectStatus } from "../types/project";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function CustomTabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`project-tabpanel-${index}`}
      aria-labelledby={`project-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ProjectWorkspacePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const theme = useTheme();
  const activeColors = getThemeColors(theme.palette.mode);
  const queryClient = useQueryClient();
  const { role } = useAuth();

  // State
  const [tabValue, setTabValue] = useState(0);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isAddMemberOpen, setIsAddMemberOpen] = useState(false);
  const [statusMenuAnchor, setStatusMenuAnchor] = useState<null | HTMLElement>(null);

  const canEdit = role === "ADMIN" || role === "LEAD";
  const canDelete = role === "ADMIN";

  // Query project details
  const { data: project, isLoading, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectService.getProject(id!),
    enabled: !!id,
  });

  // Query project members
  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ["projectMembers", id],
    queryFn: () => projectService.getProjectMembers(id!),
    enabled: !!id,
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: (userId: string) => projectService.removeProjectMember(id!, userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectMembers", id] });
    },
  });

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: () => projectService.deleteProject(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      navigate("/projects", { replace: true });
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: (status: ProjectStatus) =>
      projectService.updateProjectStatus(id!, status),
    onSuccess: (updated) => {
      queryClient.setQueryData(["project", id], updated);
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleStatusMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setStatusMenuAnchor(event.currentTarget);
  };

  const handleStatusMenuClose = () => {
    setStatusMenuAnchor(null);
  };

  const handleStatusChange = (newStatus: ProjectStatus) => {
    handleStatusMenuClose();
    updateStatusMutation.mutate(newStatus);
  };

  const handleDeleteConfirm = () => {
    setIsDeleteOpen(false);
    deleteMutation.mutate();
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 360 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isError || !project) {
    return (
      <Stack spacing={2} sx={{ mt: 2 }}>
        <Alert severity="error" variant="outlined">
          Failed to load project details. It may have been deleted.
        </Alert>
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          variant="outlined"
          onClick={() => navigate("/projects")}
          sx={{ width: "fit-content" }}
        >
          Back to Projects
        </Button>
      </Stack>
    );
  }

  const statusColors = getStatusColor(project.status, theme.palette.mode);
  const formattedStartDate = project.startDate
    ? new Date(project.startDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not set";

  const formattedEndDate = project.endDate
    ? new Date(project.endDate).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "Not set";

  return (
    <Stack spacing={4} component={motion.div} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {/* Top Breadcrumb & Actions */}
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Button
          startIcon={<ArrowBackRoundedIcon />}
          onClick={() => navigate("/projects")}
          variant="text"
          color="inherit"
          sx={{ fontWeight: 600 }}
        >
          Back to Projects
        </Button>

        <Stack direction="row" spacing={1.5}>
          {canEdit && (
            <Button
              startIcon={<EditRoundedIcon />}
              variant="outlined"
              onClick={() => setIsFormOpen(true)}
            >
              Edit
            </Button>
          )}
          {canDelete && (
            <Button
              startIcon={<DeleteRoundedIcon />}
              variant="outlined"
              color="error"
              onClick={() => setIsDeleteOpen(true)}
            >
              Delete
            </Button>
          )}
        </Stack>
      </Stack>

      {/* Project Meta Info Header */}
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
          borderRadius: 3.5,
          border: `1px solid ${theme.palette.divider}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Status Line Top border */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 6,
            bgcolor: statusColors.text,
          }}
        />

        <Stack spacing={3}>
          <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" alignItems={{ xs: "flex-start", sm: "center" }} spacing={2.5}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Box
                sx={{
                  width: 48,
                  height: 48,
                  borderRadius: 2.5,
                  bgcolor: `${statusColors.text}12`,
                  display: "grid",
                  placeItems: "center",
                  color: statusColors.text,
                }}
              >
                <FolderRoundedIcon fontSize="medium" />
              </Box>
              <Box>
                <Typography variant="h2" fontWeight={800} sx={{ lineClamp: 1 }}>
                  {project.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Created by {project.createdByName}
                </Typography>
              </Box>
            </Stack>

            {/* Status Quick Action Selector */}
            <Stack direction="row" spacing={1.5} alignItems="center">
              <Chip
                label={project.status.charAt(0) + project.status.slice(1).toLowerCase().replace("_", " ")}
                sx={{
                  bgcolor: statusColors.bg,
                  color: statusColors.text,
                  border: `1px solid ${statusColors.border}`,
                  fontWeight: 700,
                  fontSize: 13,
                  py: 1.75,
                }}
              />

              {canEdit && (
                <>
                  <Button
                    variant="outlined"
                    size="small"
                    endIcon={<ArrowDropDownRoundedIcon />}
                    onClick={handleStatusMenuOpen}
                    sx={{ minHeight: 32, fontSize: 13, borderRadius: 2 }}
                    disabled={updateStatusMutation.isPending}
                  >
                    Quick Status
                  </Button>
                  <Menu
                    anchorEl={statusMenuAnchor}
                    open={Boolean(statusMenuAnchor)}
                    onClose={handleStatusMenuClose}
                  >
                    <MenuItem onClick={() => handleStatusChange("PLANNING")}>Planning</MenuItem>
                    <MenuItem onClick={() => handleStatusChange("ACTIVE")}>Active</MenuItem>
                    <MenuItem onClick={() => handleStatusChange("ON_HOLD")}>On Hold</MenuItem>
                    <MenuItem onClick={() => handleStatusChange("COMPLETED")}>Completed</MenuItem>
                    <MenuItem onClick={() => handleStatusChange("CANCELLED")}>Cancelled</MenuItem>
                  </Menu>
                </>
              )}
            </Stack>
          </Stack>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 760, lineHeight: 1.6 }}>
            {project.description || "No description provided."}
          </Typography>

          <Divider />

          {/* Quick Stats Grid */}
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CalendarMonthRoundedIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Start Date
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formattedStartDate}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <CalendarMonthRoundedIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    End Date
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formattedEndDate}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <PersonRoundedIcon sx={{ color: "text.secondary" }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Project Manager / Lead
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {project.createdByName}
                  </Typography>
                </Box>
              </Stack>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <Box
                  sx={{
                    width: 20,
                    height: 20,
                    borderRadius: "50%",
                    bgcolor: `${getPriorityColor(project.priority)}.main`,
                    opacity: 0.15,
                  }}
                />
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">
                    Priority Level
                  </Typography>
                  <Chip
                    label={project.priority}
                    size="small"
                    color={getPriorityColor(project.priority)}
                    sx={{ fontWeight: 800, height: 20, fontSize: 10 }}
                  />
                </Box>
              </Stack>
            </Grid>
          </Grid>
        </Stack>
      </Card>

      {/* Tabs Menu navigation */}
      <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="project workspace tabs"
          textColor="primary"
          indicatorColor="primary"
        >
          <Tab icon={<ListAltRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Overview" sx={{ fontWeight: 700 }} />
          <Tab icon={<TaskAltRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Tasks" sx={{ fontWeight: 700 }} />
          <Tab icon={<GroupsRoundedIcon sx={{ fontSize: 18 }} />} iconPosition="start" label="Members" sx={{ fontWeight: 700 }} />
        </Tabs>
      </Box>

      {/* Tab Panels */}
      <CustomTabPanel value={tabValue} index={0}>
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            <Card sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3 }}>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                About Project
              </Typography>
              <Typography variant="body1" sx={{ whiteSpace: "pre-line", color: "text.secondary", lineHeight: 1.6 }}>
                {project.description || "No description provided."}
              </Typography>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ p: 3, bgcolor: "background.paper", borderRadius: 3 }}>
              <Typography variant="h3" fontWeight={700} sx={{ mb: 2 }}>
                Details
              </Typography>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Project ID</Typography>
                  <Typography variant="body2" sx={{ fontFamily: "monospace", breakWord: "anywhere" }}>{project.id}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Created At</Typography>
                  <Typography variant="body2">{new Date(project.createdAt).toLocaleString()}</Typography>
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" display="block">Last Updated At</Typography>
                  <Typography variant="body2">{new Date(project.updatedAt).toLocaleString()}</Typography>
                </Box>
              </Stack>
            </Card>
          </Grid>
        </Grid>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={1}>
        {/* Tasks Empty State Placeholder */}
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            py: 8,
            px: 2,
            textAlign: "center",
            borderRadius: 4,
            bgcolor: "rgba(255,255,255,0.01)",
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <TaskAltRoundedIcon sx={{ fontSize: 48, color: "text.secondary", mb: 2, opacity: 0.6 }} />
          <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
            No tasks assigned yet
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 380, mb: 3, fontSize: 13.5 }}>
            Tasks are not available yet. Project task scheduling and management is part of Phase 6.
          </Typography>
          <Button variant="outlined" disabled size="small">
            Create first task
          </Button>
        </Box>
      </CustomTabPanel>

      <CustomTabPanel value={tabValue} index={2}>
        {isMembersLoading ? (
          <Box sx={{ display: "grid", placeItems: "center", py: 4 }}>
            <CircularProgress size={28} />
          </Box>
        ) : (
          <Stack spacing={3}>
            {canEdit && (
              <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  variant="contained"
                  startIcon={<GroupsRoundedIcon sx={{ fontSize: 18 }} />}
                  onClick={() => setIsAddMemberOpen(true)}
                  size="small"
                >
                  Add Member
                </Button>
              </Box>
            )}

            {members.length > 0 ? (
              <Grid container spacing={2.5}>
                {members.map((member) => (
                  <Grid item xs={12} sm={6} md={4} key={member.membershipId}>
                    <Card
                      sx={{
                        p: 2.5,
                        bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
                        borderRadius: 3,
                        border: `1px solid ${theme.palette.divider}`,
                        position: "relative",
                      }}
                    >
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar
                          src={member.avatarUrl || undefined}
                          sx={{
                            width: 44,
                            height: 44,
                            bgcolor: activeColors.primaryAccent,
                            fontSize: 16,
                            fontWeight: 700,
                          }}
                        >
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box sx={{ flex: 1, minWidth: 0 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {member.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" display="block" noWrap>
                            {member.email}
                          </Typography>
                          {member.department && (
                            <Typography variant="caption" color="primary.main" fontWeight={600} display="block" noWrap sx={{ mt: 0.25 }}>
                              {member.department}
                            </Typography>
                          )}
                        </Box>

                        {/* Remove button: only visible to leads/admins, and cannot remove project creator */}
                        {canEdit && member.userId !== project.createdById && (
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => removeMemberMutation.mutate(member.userId)}
                            disabled={removeMemberMutation.isPending}
                            sx={{ alignSelf: "flex-start" }}
                          >
                            {removeMemberMutation.isPending && removeMemberMutation.variables === member.userId ? (
                              <CircularProgress size={16} color="inherit" />
                            ) : (
                              <DeleteRoundedIcon fontSize="small" />
                            )}
                          </IconButton>
                        )}
                      </Stack>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  py: 6,
                  px: 2,
                  textAlign: "center",
                  borderRadius: 4,
                  bgcolor: "rgba(255,255,255,0.01)",
                  border: `1px dashed ${theme.palette.divider}`,
                }}
              >
                <GroupsRoundedIcon sx={{ fontSize: 44, color: "text.secondary", mb: 2, opacity: 0.6 }} />
                <Typography variant="h4" fontWeight={700} sx={{ mb: 1 }}>
                  No members added yet
                </Typography>
                <Typography color="text.secondary" sx={{ maxWidth: 380, mb: 3, fontSize: 13.5 }}>
                  Add team members to this project to collaborate and assign tasks.
                </Typography>
                {canEdit && (
                  <Button variant="outlined" size="small" onClick={() => setIsAddMemberOpen(true)}>
                    Add team members
                  </Button>
                )}
              </Box>
            )}
          </Stack>
        )}
      </CustomTabPanel>

      {/* Project Form Dialog (for edit mode) */}
      <ProjectFormDialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        project={project}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        aria-labelledby="delete-project-dialog-title"
        aria-describedby="delete-project-dialog-description"
        PaperProps={{ sx: { borderRadius: 3 } }}
      >
        <DialogTitle id="delete-project-dialog-title">
          <Typography variant="h3" fontWeight={700}>
            Delete Project?
          </Typography>
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-project-dialog-description">
            Are you sure you want to delete project &quot;{project.name}&quot;? This action is permanent and cannot be undone. All associated content will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setIsDeleteOpen(false)} variant="text" color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={deleteMutation.isPending}
            sx={{ px: 3 }}
          >
            {deleteMutation.isPending ? <CircularProgress size={22} color="inherit" /> : "Delete Project"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Add Member Dialog */}
      <AddMemberDialog
        open={isAddMemberOpen}
        onClose={() => setIsAddMemberOpen(false)}
        projectId={id!}
        currentMemberUserIds={members.map((m) => m.userId)}
      />
    </Stack>
  );
}
