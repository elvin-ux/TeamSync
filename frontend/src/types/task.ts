export type TaskStatus = "TODO" | "IN_PROGRESS" | "REVIEW" | "TESTING" | "COMPLETED";
export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Task {
  id: string;
  projectId: string;
  projectName: string;
  assignedToId: string | null;
  assignedToName: string | null;
  createdById: string;
  createdByName: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequest {
  projectId: string;
  assignedToId?: string | null;
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  deadline?: string | null;
  estimatedHours?: number | null;
}

export interface UpdateTaskRequest {
  assignedToId?: string | null;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  deadline: string | null;
  estimatedHours: number | null;
  actualHours: number | null;
}
