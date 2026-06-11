import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  CircularProgress,
  Typography,
  useTheme,
  useMediaQuery,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { projectService } from "../../services/projectService";
import type { Project, CreateProjectRequest, UpdateProjectRequest } from "../../types/project";

const schema = yup.object({
  name: yup
    .string()
    .required("Project name is required")
    .max(100, "Name must not exceed 100 characters"),
  description: yup
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .default(""),
  status: yup.string().required("Status is required"),
  priority: yup.string().required("Priority is required"),
  startDate: yup.string().nullable().default(null),
  endDate: yup.string().nullable().default(null),
});

type FormValues = yup.InferType<typeof schema>;

interface ProjectFormDialogProps {
  open: boolean;
  onClose: () => void;
  project?: Project;
}

export default function ProjectFormDialog({ open, onClose, project }: ProjectFormDialogProps) {
  const queryClient = useQueryClient();
  const theme = useTheme();
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));
  const isEdit = !!project;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      description: "",
      status: "PLANNING",
      priority: "MEDIUM",
      startDate: "",
      endDate: "",
    },
  });

  // Pre-fill form when editing a project
  useEffect(() => {
    if (project && open) {
      reset({
        name: project.name,
        description: project.description || "",
        status: project.status,
        priority: project.priority,
        startDate: project.startDate || "",
        endDate: project.endDate || "",
      });
    } else if (open) {
      reset({
        name: "",
        description: "",
        status: "PLANNING",
        priority: "MEDIUM",
        startDate: "",
        endDate: "",
      });
    }
  }, [project, open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectService.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateProjectRequest) =>
      projectService.updateProject(project!.id, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ["projects"] });
      queryClient.invalidateQueries({ queryKey: ["project", project!.id] });
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      name: values.name,
      description: values.description || "",
      status: values.status as any,
      priority: values.priority as any,
      startDate: values.startDate || null,
      endDate: values.endDate || null,
    };

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog
      open={open}
      onClose={isPending ? undefined : onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isXs}
      PaperProps={{
        sx: {
          borderRadius: 3,
          p: 1.5,
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h3" fontWeight={700}>
          {isEdit ? "Edit Project" : "Create Project"}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Project Name"
              required
              fullWidth
              disabled={isPending}
              {...register("name")}
              error={!!errors.name}
              helperText={errors.name?.message}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={4}
              disabled={isPending}
              placeholder="What is this project about?"
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="project-status-label" required>
                  Status
                </InputLabel>
                <Select
                  labelId="project-status-label"
                  label="Status"
                  disabled={isPending}
                  value={watch("status") || "PLANNING"}
                  onChange={(e) => setValue("status", e.target.value as any)}
                >
                  <MenuItem value="PLANNING">Planning</MenuItem>
                  <MenuItem value="ACTIVE">Active</MenuItem>
                  <MenuItem value="ON_HOLD">On Hold</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                  <MenuItem value="CANCELLED">Cancelled</MenuItem>
                </Select>
                {errors.status && (
                  <FormHelperText>{errors.status.message}</FormHelperText>
                )}
              </FormControl>

              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel id="project-priority-label" required>
                  Priority
                </InputLabel>
                <Select
                  labelId="project-priority-label"
                  label="Priority"
                  disabled={isPending}
                  value={watch("priority") || "MEDIUM"}
                  onChange={(e) => setValue("priority", e.target.value as any)}
                >
                  <MenuItem value="LOW">Low</MenuItem>
                  <MenuItem value="MEDIUM">Medium</MenuItem>
                  <MenuItem value="HIGH">High</MenuItem>
                  <MenuItem value="CRITICAL">Critical</MenuItem>
                </Select>
                {errors.priority && (
                  <FormHelperText>{errors.priority.message}</FormHelperText>
                )}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
              <TextField
                label="Start Date"
                type="date"
                fullWidth
                disabled={isPending}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("startDate")}
                error={!!errors.startDate}
                helperText={errors.startDate?.message}
              />

              <TextField
                label="End Date"
                type="date"
                fullWidth
                disabled={isPending}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("endDate")}
                error={!!errors.endDate}
                helperText={errors.endDate?.message}
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={onClose} disabled={isPending} variant="text" color="inherit">
            Cancel
          </Button>
          <Button type="submit" disabled={isPending} variant="contained" sx={{ px: 3 }}>
            {isPending ? (
              <CircularProgress size={22} color="inherit" />
            ) : isEdit ? (
              "Save Changes"
            ) : (
              "Create Project"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
