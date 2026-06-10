import type { ApiResponse } from "../types/common";
import type { Task, CreateTaskRequest, UpdateTaskRequest, TaskStatus } from "../types/task";
import { api } from "./api";

export const taskService = {
  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    const response = await api.get<ApiResponse<Task[]>>(`/tasks/project/${projectId}`);
    return response.data.data;
  },

  getTask: async (taskId: string): Promise<Task> => {
    const response = await api.get<ApiResponse<Task>>(`/tasks/${taskId}`);
    return response.data.data;
  },

  createTask: async (data: CreateTaskRequest): Promise<Task> => {
    const response = await api.post<ApiResponse<Task>>("/tasks", data);
    return response.data.data;
  },

  updateTask: async (taskId: string, data: UpdateTaskRequest): Promise<Task> => {
    const response = await api.put<ApiResponse<Task>>(`/tasks/${taskId}`, data);
    return response.data.data;
  },

  deleteTask: async (taskId: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/tasks/${taskId}`);
  },

  updateTaskStatus: async (taskId: string, status: TaskStatus): Promise<Task> => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/status`, null, {
      params: { status }
    });
    return response.data.data;
  },

  assignTask: async (taskId: string, userId: string | null): Promise<Task> => {
    const response = await api.patch<ApiResponse<Task>>(`/tasks/${taskId}/assign`, null, {
      params: { userId: userId || null }
    });
    return response.data.data;
  }
};
