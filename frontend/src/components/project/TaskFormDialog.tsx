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
} from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskService } from "../../services/taskService";
import { projectService } from "../../services/projectService";
import type { Task, CreateTaskRequest, UpdateTaskRequest } from "../../types/task";

const schema = yup.object({
  title: yup
    .string()
    .required("Task title is required")
    .max(150, "Title must not exceed 150 characters"),
  description: yup
    .string()
    .max(1000, "Description must not exceed 1000 characters")
    .default(""),
  status: yup.string().required("Status is required"),
  priority: yup.string().required("Priority is required"),
  assignedToId: yup.string().nullable().default(""),
  deadline: yup.string().nullable().default(""),
  estimatedHours: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .min(0, "Estimated hours cannot be negative")
    .default(null),
  actualHours: yup
    .number()
    .transform((value, originalValue) => (originalValue === "" ? null : value))
    .nullable()
    .min(0, "Actual hours cannot be negative")
    .default(null),
});

type FormValues = yup.InferType<typeof schema>;

interface TaskFormDialogProps {
  open: boolean;
  onClose: () => void;
  projectId: string;
  task?: Task;
}

export default function TaskFormDialog({ open, onClose, projectId, task }: TaskFormDialogProps) {
  const queryClient = useQueryClient();
  const isEdit = !!task;

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
      title: "",
      description: "",
      status: "TODO",
      priority: "MEDIUM",
      assignedToId: "",
      deadline: "",
      estimatedHours: null,
      actualHours: null,
    },
  });

  // Query project members to populate the assignee select dropdown
  const { data: members = [], isLoading: isMembersLoading } = useQuery({
    queryKey: ["projectMembers", projectId],
    queryFn: () => projectService.getProjectMembers(projectId),
    enabled: open,
  });

  // Pre-fill form when editing
  useEffect(() => {
    if (task && open) {
      reset({
        title: task.title,
        description: task.description || "",
        status: task.status,
        priority: task.priority,
        assignedToId: task.assignedToId || "",
        deadline: task.deadline || "",
        estimatedHours: task.estimatedHours,
        actualHours: task.actualHours,
      });
    } else if (open) {
      reset({
        title: "",
        description: "",
        status: "TODO",
        priority: "MEDIUM",
        assignedToId: "",
        deadline: "",
        estimatedHours: null,
        actualHours: null,
      });
    }
  }, [task, open, reset]);

  const createMutation = useMutation({
    mutationFn: (data: CreateTaskRequest) => taskService.createTask(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      onClose();
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UpdateTaskRequest) => taskService.updateTask(task!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projectTasks", projectId] });
      queryClient.invalidateQueries({ queryKey: ["task", task!.id] });
      onClose();
    },
  });

  const onSubmit = (values: FormValues) => {
    const assignedId = values.assignedToId && values.assignedToId !== "" ? values.assignedToId : null;

    if (isEdit) {
      const payload: UpdateTaskRequest = {
        title: values.title,
        description: values.description || "",
        status: values.status as any,
        priority: values.priority as any,
        assignedToId: assignedId,
        deadline: values.deadline || null,
        estimatedHours: values.estimatedHours,
        actualHours: values.actualHours,
      };
      updateMutation.mutate(payload);
    } else {
      const payload: CreateTaskRequest = {
        projectId,
        title: values.title,
        description: values.description || "",
        status: values.status as any,
        priority: values.priority as any,
        assignedToId: assignedId,
        deadline: values.deadline || null,
        estimatedHours: values.estimatedHours,
      };
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
      PaperProps={{
        sx: { borderRadius: 3, p: 1.5 },
      }}
    >
      <DialogTitle>
        <Typography variant="h3" fontWeight={700}>
          {isEdit ? "Edit Task" : "Create Task"}
        </Typography>
      </DialogTitle>

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <DialogContent>
          <Stack spacing={3} sx={{ mt: 1 }}>
            <TextField
              label="Task Title"
              required
              fullWidth
              disabled={isPending}
              {...register("title")}
              error={!!errors.title}
              helperText={errors.title?.message}
            />

            <TextField
              label="Description"
              fullWidth
              multiline
              rows={3}
              disabled={isPending}
              placeholder="What needs to be done?"
              {...register("description")}
              error={!!errors.description}
              helperText={errors.description?.message}
            />

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
              <FormControl fullWidth error={!!errors.status}>
                <InputLabel id="task-status-label" required>
                  Status
                </InputLabel>
                <Select
                  labelId="task-status-label"
                  label="Status"
                  disabled={isPending}
                  value={watch("status") || "TODO"}
                  onChange={(e) => setValue("status", e.target.value as any)}
                >
                  <MenuItem value="TODO">Todo</MenuItem>
                  <MenuItem value="IN_PROGRESS">In Progress</MenuItem>
                  <MenuItem value="REVIEW">Review</MenuItem>
                  <MenuItem value="TESTING">Testing</MenuItem>
                  <MenuItem value="COMPLETED">Completed</MenuItem>
                </Select>
                {errors.status && <FormHelperText>{errors.status.message}</FormHelperText>}
              </FormControl>

              <FormControl fullWidth error={!!errors.priority}>
                <InputLabel id="task-priority-label" required>
                  Priority
                </InputLabel>
                <Select
                  labelId="task-priority-label"
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
                {errors.priority && <FormHelperText>{errors.priority.message}</FormHelperText>}
              </FormControl>
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
              <FormControl fullWidth error={!!errors.assignedToId} disabled={isPending || isMembersLoading}>
                <InputLabel id="task-assignee-label">Assignee</InputLabel>
                <Select
                  labelId="task-assignee-label"
                  label="Assignee"
                  value={watch("assignedToId") || ""}
                  onChange={(e) => setValue("assignedToId", e.target.value)}
                >
                  <MenuItem value="">Unassigned</MenuItem>
                  {members.map((member) => (
                    <MenuItem key={member.userId} value={member.userId}>
                      {member.name} ({member.roleInProject})
                    </MenuItem>
                  ))}
                </Select>
                {errors.assignedToId && <FormHelperText>{errors.assignedToId.message}</FormHelperText>}
              </FormControl>

              <TextField
                label="Deadline"
                type="date"
                fullWidth
                disabled={isPending}
                slotProps={{ inputLabel: { shrink: true } }}
                {...register("deadline")}
                error={!!errors.deadline}
                helperText={errors.deadline?.message}
              />
            </Stack>

            <Stack direction={{ xs: "column", sm: "row" }} spacing={2.5}>
              <TextField
                label="Estimated Hours"
                type="number"
                fullWidth
                disabled={isPending}
                placeholder="e.g. 8"
                slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                {...register("estimatedHours")}
                error={!!errors.estimatedHours}
                helperText={errors.estimatedHours?.message}
              />

              {isEdit && (
                <TextField
                  label="Actual Hours"
                  type="number"
                  fullWidth
                  disabled={isPending}
                  placeholder="e.g. 10"
                  slotProps={{ htmlInput: { min: 0, step: 0.5 } }}
                  {...register("actualHours")}
                  error={!!errors.actualHours}
                  helperText={errors.actualHours?.message}
                />
              )}
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
              "Create Task"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
