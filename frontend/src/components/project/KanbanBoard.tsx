import { useState } from "react";
import {
  DndContext,
  useDraggable,
  useDroppable,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import {
  Avatar,
  Box,
  Card,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  Typography,
  useTheme,
} from "@mui/material";
import EditRoundedIcon from "@mui/icons-material/EditRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import CalendarMonthRoundedIcon from "@mui/icons-material/CalendarMonthRounded";

import type { Task, TaskStatus } from "../../types/task";
import { getTaskStatusColors } from "../../pages/ProjectWorkspacePage";
import { getPriorityColor } from "../../pages/ProjectsPage";

const COLUMNS: { id: TaskStatus; label: string; color: string }[] = [
  { id: "TODO", label: "Todo", color: "#94A3B8" },
  { id: "IN_PROGRESS", label: "In Progress", color: "#4F46E5" },
  { id: "REVIEW", label: "Review", color: "#D97706" },
  { id: "TESTING", label: "Testing", color: "#8B5CF6" },
  { id: "COMPLETED", label: "Completed", color: "#16A34A" },
];

interface KanbanBoardProps {
  tasks: Task[];
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => void;
  onClickCard?: (task: Task) => void;
  canEdit: boolean;
  activeColors: any;
}

export default function KanbanBoard({
  tasks,
  onStatusChange,
  onEditTask,
  onDeleteTask,
  onClickCard,
  canEdit,
  activeColors,
}: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const theme = useTheme();

  // Configure sensors: pointer for mouse, touch with delay so scroll still works
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    })
  );

  const activeTask = tasks.find((t) => t.id === activeId);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeTaskId = active.id as string;
    let newStatus: TaskStatus | null = null;

    const overIdStr = over.id as string;
    if (["TODO", "IN_PROGRESS", "REVIEW", "TESTING", "COMPLETED"].includes(overIdStr)) {
      newStatus = overIdStr as TaskStatus;
    } else {
      // Dropped directly on another task card, inspect its status
      const targetTask = tasks.find((t) => t.id === over.id);
      if (targetTask) {
        newStatus = targetTask.status;
      }
    }

    if (newStatus) {
      const targetTask = tasks.find((t) => t.id === activeTaskId);
      if (targetTask && targetTask.status !== newStatus) {
        onStatusChange(activeTaskId, newStatus);
      }
    }
  };

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <Box
        sx={{
          display: "flex",
          gap: 2.5,
          overflowX: "auto",
          pb: 3,
          minHeight: "calc(100vh - 350px)",
          alignItems: "stretch",
          "&::-webkit-scrollbar": {
            height: 8,
          },
          "&::-webkit-scrollbar-track": {
            background: "transparent",
          },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
            borderRadius: 4,
          },
        }}
      >
        {COLUMNS.map((col) => {
          const columnTasks = tasks.filter((t) => t.status === col.id);
          return (
            <KanbanColumn
              key={col.id}
              id={col.id}
              label={col.label}
              color={col.color}
              tasksCount={columnTasks.length}
            >
              {columnTasks.map((task) => (
                <KanbanCard
                  key={task.id}
                  task={task}
                  onEdit={onEditTask}
                  onDelete={onDeleteTask}
                  onClick={() => onClickCard?.(task)}
                  canEdit={canEdit}
                />
              ))}
            </KanbanColumn>
          );
        })}
      </Box>

      {/* Floating Drag Preview Overlay */}
      <DragOverlay dropAnimation={{ duration: 200, easing: "ease" }}>
        {activeId && activeTask ? (
          <Box sx={{ transform: "rotate(3deg)", opacity: 0.9 }}>
            <KanbanCard
              task={activeTask}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
              canEdit={canEdit}
              isOverlay
            />
          </Box>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// DROPPABLE COLUMN COMPONENT
interface KanbanColumnProps {
  id: TaskStatus;
  label: string;
  color: string;
  tasksCount: number;
  children: React.ReactNode;
}

function KanbanColumn({ id, label, color, tasksCount, children }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const theme = useTheme();

  return (
    <Box
      ref={setNodeRef}
      sx={{
        flex: "1 0 280px",
        maxWidth: 320,
        bgcolor: theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.25)" : "rgba(241, 245, 249, 0.5)",
        borderRadius: 4,
        border: `1px solid ${isOver ? color : theme.palette.divider}`,
        boxShadow: isOver
          ? `0 0 16px ${color}1a, inset 0 0 12px ${color}08`
          : "none",
        display: "flex",
        flexDirection: "column",
        transition: "all 200ms ease",
        p: 2,
      }}
    >
      {/* Column Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
          px: 0.5,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 8, height: 8, borderRadius: "50%", bgcolor: color }} />
          <Typography variant="body2" fontWeight={800} sx={{ letterSpacing: 0.5 }}>
            {label}
          </Typography>
        </Stack>
        <Chip
          label={tasksCount}
          size="small"
          sx={{
            height: 20,
            fontSize: 10,
            fontWeight: 800,
            bgcolor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)",
            color: "text.secondary",
          }}
        />
      </Box>

      {/* Column Content */}
      <Stack
        spacing={2}
        sx={{
          flexGrow: 1,
          minHeight: 400,
          overflowY: "auto",
        }}
      >
        {children}
      </Stack>
    </Box>
  );
}

// DRAGGABLE CARD COMPONENT
interface KanbanCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onClick?: () => void;
  canEdit: boolean;
  isOverlay?: boolean;
}

function KanbanCard({ task, onEdit, onDelete, onClick, canEdit, isOverlay }: KanbanCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
  });
  const theme = useTheme();

  const style = {
    transform: CSS.Transform.toString(transform),
    opacity: isDragging && !isOverlay ? 0.35 : 1,
  };

  const deadlineFormatted = task.deadline
    ? new Date(task.deadline).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : null;

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      sx={{
        p: 2,
        bgcolor: theme.palette.mode === "dark" ? "rgba(30, 41, 59, 0.65)" : "#FFFFFF",
        borderRadius: 3,
        border: `1px solid ${theme.palette.divider}`,
        cursor: isOverlay ? "grabbing" : "grab",
        touchAction: "none",
        transition: isDragging ? "none" : "box-shadow 200ms ease, border-color 200ms ease",
        position: "relative",
        boxShadow: isOverlay
          ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
          : theme.palette.mode === "dark"
          ? "0 2px 8px rgba(0, 0, 0, 0.2)"
          : "0 2px 8px rgba(0, 0, 0, 0.04)",
        "&:hover": {
          boxShadow: isOverlay
            ? "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
            : theme.palette.mode === "dark"
            ? "0 6px 20px rgba(0,0,0,0.4)"
            : "0 6px 20px rgba(0,0,0,0.06)",
          borderColor: theme.palette.mode === "dark" ? "rgba(255, 255, 255, 0.15)" : "rgba(0, 0, 0, 0.15)",
        },
      }}
    >
      {/* Title & Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
        <Typography variant="body2" fontWeight={700} sx={{ pr: 1, userSelect: "none" }}>
          {task.title}
        </Typography>

        {/* Prevent Dragging when clicking CRUD Actions */}
        {canEdit && !isOverlay && (
          <Stack
            direction="row"
            spacing={0.5}
            onPointerDown={(e) => e.stopPropagation()}
            onMouseDown={(e) => e.stopPropagation()}
            onClick={(e) => e.stopPropagation()}
          >
            <IconButton
              size="small"
              onClick={() => onEdit(task)}
              sx={{ p: 0.5, color: "text.secondary", "&:hover": { color: "text.primary" } }}
            >
              <EditRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(task.id)}
              sx={{ p: 0.5, "&:hover": { bgcolor: "rgba(239, 68, 68, 0.08)" } }}
            >
              <DeleteRoundedIcon sx={{ fontSize: 14 }} />
            </IconButton>
          </Stack>
        )}
      </Box>

      {/* Description */}
      {task.description && (
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            mb: 2,
            lineHeight: 1.4,
            userSelect: "none",
          }}
        >
          {task.description}
        </Typography>
      )}

      {/* Footer Info */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mt: "auto" }}>
        <Stack direction="row" alignItems="center" spacing={1}>
          <Chip
            label={task.priority}
            size="small"
            color={getPriorityColor(task.priority as any)}
            sx={{ fontWeight: 800, fontSize: 8, height: 16, px: 0.5 }}
          />

          {deadlineFormatted && (
            <Stack direction="row" alignItems="center" spacing={0.25} sx={{ color: "text.secondary" }}>
              <CalendarMonthRoundedIcon sx={{ fontSize: 11 }} />
              <Typography sx={{ fontSize: 9, fontWeight: 600 }}>
                {deadlineFormatted}
              </Typography>
            </Stack>
          )}

          {task.estimatedHours && (
            <Chip
              label={`${task.estimatedHours}h`}
              size="small"
              variant="outlined"
              sx={{ height: 16, fontSize: 8, fontWeight: 700, px: 0.5 }}
            />
          )}
        </Stack>

        {/* Assignee Avatar */}
        <Tooltip title={task.assignedToName ? `Assigned to ${task.assignedToName}` : "Unassigned"}>
          <Avatar
            sx={{
              width: 22,
              height: 22,
              bgcolor: task.assignedToName ? "primary.main" : "action.disabledBackground",
              fontSize: 10,
              fontWeight: 700,
            }}
          >
            {task.assignedToName ? task.assignedToName.charAt(0).toUpperCase() : "?"}
          </Avatar>
        </Tooltip>
      </Box>
    </Card>
  );
}
