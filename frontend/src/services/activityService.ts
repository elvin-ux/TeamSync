import type { ApiResponse } from "../types/common";
import type { ActivityLog } from "../types/activity";
import { api } from "./api";

export const activityService = {
  getProjectActivities: async (projectId: string): Promise<ActivityLog[]> => {
    const response = await api.get<ApiResponse<ActivityLog[]>>(`/projects/${projectId}/activities`);
    return response.data.data;
  },
};
