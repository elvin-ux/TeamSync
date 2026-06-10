import type { Task } from "./task";

export interface ProjectStatusCount {
  status: string;
  count: number;
}

export interface TaskStatusCount {
  status: string;
  count: number;
}

export interface TeamProductivityDto {
  memberName: string;
  completedTasks: number;
  pendingTasks: number;
}

export interface DashboardStatsResponse {
  totalUsers: number;
  totalProjects: number;
  activeProjects: number;
  overallTaskCompletionRate: number;
  totalPendingTasks: number;
  totalOverdueTasks: number;
  userAssignedTasksCount: number;
  userCompletedTasksCount: number;
  userUpcomingTasks: Task[];
  projectStatusBreakdown: ProjectStatusCount[];
  taskStatusBreakdown: TaskStatusCount[];
  teamProductivity: TeamProductivityDto[];
}
