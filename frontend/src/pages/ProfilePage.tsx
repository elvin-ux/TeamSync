import { useState, useEffect } from "react";
import {
  Alert,
  Avatar,
  Box,
  Button,
  CircularProgress,
  Divider,
  Paper,
  Stack,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import CloudUploadRoundedIcon from "@mui/icons-material/CloudUploadRounded";
import PersonRoundedIcon from "@mui/icons-material/PersonRounded";
import DomainRoundedIcon from "@mui/icons-material/DomainRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { userService } from "../services/userService";
import { getThemeColors } from "../theme/theme";
import type { UpdateProfileData } from "../types/auth";

export default function ProfilePage() {
  const theme = useTheme();
  const activeColors = getThemeColors(theme.palette.mode);
  const { updateProfileInfo } = useAuth();
  const queryClient = useQueryClient();

  const [name, setName] = useState("");
  const [department, setDepartment] = useState("");
  const [bio, setBio] = useState("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Fetch profile
  const { data: profile, isLoading, isError } = useQuery({
    queryKey: ["userProfile"],
    queryFn: userService.getProfile,
  });

  // Pre-fill form when profile loads
  useEffect(() => {
    if (profile) {
      setName(profile.name || "");
      setDepartment(profile.department || "");
      setBio(profile.bio || "");
      // Make sure AuthContext is in sync with latest DB profile on load
      updateProfileInfo(profile.name, profile.avatarUrl);
    }
  }, [profile]);

  // Update profile text fields mutation
  const updateProfileMutation = useMutation({
    mutationFn: (data: UpdateProfileData) => userService.updateProfile(data),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["userProfile"], updatedProfile);
      updateProfileInfo(updatedProfile.name, updatedProfile.avatarUrl);
      setSuccessMessage("Profile details updated successfully.");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || "Failed to update profile.");
      setSuccessMessage(null);
    },
  });

  // Upload avatar mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => userService.uploadAvatar(file),
    onSuccess: (updatedProfile) => {
      queryClient.setQueryData(["userProfile"], updatedProfile);
      updateProfileInfo(updatedProfile.name, updatedProfile.avatarUrl);
      setSuccessMessage("Avatar image uploaded successfully.");
      setErrorMessage(null);
      setTimeout(() => setSuccessMessage(null), 4000);
    },
    onError: (error: any) => {
      setErrorMessage(error.response?.data?.message || "Failed to upload avatar.");
      setSuccessMessage(null);
    },
  });

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage("Name is required.");
      return;
    }
    updateProfileMutation.mutate({
      name: name.trim(),
      department: department.trim() || null,
      bio: bio.trim() || null,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setErrorMessage("Please upload an image file (PNG, JPG, etc.).");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File size must be less than 2MB.");
        return;
      }
      uploadAvatarMutation.mutate(file);
    }
  };

  if (isLoading) {
    return (
      <Box sx={{ display: "grid", placeItems: "center", minHeight: 360 }}>
        <CircularProgress color="primary" />
      </Box>
    );
  }

  if (isError || !profile) {
    return (
      <Alert severity="error" variant="outlined" sx={{ my: 2 }}>
        Failed to load user profile details. Please refresh the page.
      </Alert>
    );
  }

  const formattedDate = new Date(profile.createdAt).toLocaleDateString(undefined, {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <Stack spacing={4} component={motion.div} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
      {/* Page Header */}
      <Box>
        <Typography variant="h2">My Profile</Typography>
        <Typography color="text.secondary">View and configure your personal workspace settings.</Typography>
      </Box>

      {/* Alert Notifications */}
      {successMessage && (
        <Alert severity="success" variant="outlined" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}
      {errorMessage && (
        <Alert severity="error" variant="outlined" onClose={() => setErrorMessage(null)}>
          {errorMessage}
        </Alert>
      )}

      {/* Main Form Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "320px 1fr" }, gap: 3.5 }}>
        {/* Left Card: Avatar uploader and Metadata */}
        <Paper
          sx={{
            p: 3.5,
            height: "fit-content",
            bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
            borderRadius: 3,
            textAlign: "center",
          }}
        >
          <Stack spacing={3} alignItems="center">
            {/* Avatar display */}
            <Box sx={{ position: "relative" }}>
              <Avatar
                src={profile.avatarUrl || undefined}
                sx={{
                  width: 128,
                  height: 128,
                  fontSize: 44,
                  fontWeight: 700,
                  bgcolor: activeColors.primaryAccent,
                  boxShadow: `0 0 0 4px ${theme.palette.background.paper}, 0 0 0 6px ${activeColors.primaryAccent}15`,
                }}
              >
                {profile.name.charAt(0).toUpperCase()}
              </Avatar>

              {/* Upload loading indicator overlay */}
              {uploadAvatarMutation.isPending && (
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    borderRadius: "50%",
                    bgcolor: "rgba(0,0,0,0.5)",
                    display: "grid",
                    placeItems: "center",
                  }}
                >
                  <CircularProgress size={32} color="inherit" />
                </Box>
              )}
            </Box>

            {/* Avatar Uploader Button */}
            <Button
              component="label"
              variant="outlined"
              size="small"
              startIcon={<CloudUploadRoundedIcon />}
              disabled={uploadAvatarMutation.isPending}
            >
              Upload Picture
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileChange}
              />
            </Button>
            <Typography variant="caption" color="text.secondary">
              JPG, PNG, or GIF. Max 2MB.
            </Typography>

            <Divider sx={{ width: "100%" }} />

            {/* Metadata readout fields */}
            <Stack spacing={2} sx={{ width: "100%", textAlign: "left" }}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <BadgeRoundedIcon color="disabled" sx={{ fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Role
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {profile.role}
                  </Typography>
                </Box>
              </Stack>

              <Stack direction="row" spacing={1.5} alignItems="center">
                <CalendarMonthRoundedIcon color="disabled" sx={{ fontSize: 20 }} />
                <Box>
                  <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                    Joined TeamSync
                  </Typography>
                  <Typography variant="body2" fontWeight={700}>
                    {formattedDate}
                  </Typography>
                </Box>
              </Stack>
            </Stack>
          </Stack>
        </Paper>

        {/* Right Card: Text Settings form */}
        <Paper
          component="form"
          onSubmit={handleTextSubmit}
          noValidate
          sx={{
            p: { xs: 3, sm: 4 },
            bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
            borderRadius: 3,
          }}
        >
          <Stack spacing={3.5}>
            <Typography variant="h3" fontWeight={700}>
              Profile Settings
            </Typography>

            {/* Form Fields */}
            <Stack spacing={3}>
              <TextField
                label="Full name"
                required
                fullWidth
                value={name}
                onChange={(e) => setName(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <PersonRoundedIcon color="disabled" sx={{ mr: 1.5, fontSize: 20 }} />
                    ),
                  },
                }}
              />

              <TextField
                label="Email address"
                disabled
                fullWidth
                value={profile.email}
                helperText="Email address cannot be changed."
              />

              <TextField
                label="Department"
                fullWidth
                placeholder="e.g. Engineering, Design, Operations"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <DomainRoundedIcon color="disabled" sx={{ mr: 1.5, fontSize: 20 }} />
                    ),
                  },
                }}
              />

              <TextField
                label="Bio"
                multiline
                rows={4}
                fullWidth
                placeholder="Tell us a little about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                slotProps={{
                  input: {
                    startAdornment: (
                      <DescriptionRoundedIcon color="disabled" sx={{ mr: 1.5, mt: -6, fontSize: 20 }} />
                    ),
                  },
                }}
              />
            </Stack>

            {/* Action buttons */}
            <Stack direction="row" spacing={2} justifyContent="flex-end">
              <Button
                variant="contained"
                type="submit"
                disabled={updateProfileMutation.isPending}
                sx={{ px: 4 }}
              >
                {updateProfileMutation.isPending ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Stack>
  );
}
