import type { ApiResponse } from "../types/common";
import type { Project, CreateProjectRequest, UpdateProjectRequest, ProjectStatus } from "../types/project";
import { api } from "./api";

export const projectService = {
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get<ApiResponse<Project[]>>("/projects");
    return response.data.data;
  },

  getProject: async (id: string): Promise<Project> => {
    const response = await api.get<ApiResponse<Project>>(`/projects/${id}`);
    return response.data.data;
  },

  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    const response = await api.post<ApiResponse<Project>>("/projects", data);
    return response.data.data;
  },

  updateProject: async (id: string, data: UpdateProjectRequest): Promise<Project> => {
    const response = await api.put<ApiResponse<Project>>(`/projects/${id}`, data);
    return response.data.data;
  },

  deleteProject: async (id: string): Promise<void> => {
    await api.delete<ApiResponse<void>>(`/projects/${id}`);
  },

  updateProjectStatus: async (id: string, status: ProjectStatus): Promise<Project> => {
    const response = await api.patch<ApiResponse<Project>>(`/projects/${id}/status`, null, {
      params: { status }
    });
    return response.data.data;
  }
};
