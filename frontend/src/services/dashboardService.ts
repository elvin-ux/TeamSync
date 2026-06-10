import type { ApiResponse } from "../types/common";
import type { DashboardStatsResponse } from "../types/dashboard";
import { api } from "./api";

export const dashboardService = {
  getDashboardStats: async (): Promise<DashboardStatsResponse> => {
    const response = await api.get<ApiResponse<DashboardStatsResponse>>("/dashboard/stats");
    return response.data.data;
  },
};
