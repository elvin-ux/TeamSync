import type { ApiResponse } from "../types/common";
import type { Notification } from "../types/notification";
import { api } from "./api";

export const notificationService = {
  getUserNotifications: async (): Promise<Notification[]> => {
    const response = await api.get<ApiResponse<Notification[]>>("/notifications");
    return response.data.data;
  },

  getUnreadCount: async (): Promise<number> => {
    const response = await api.get<ApiResponse<number>>("/notifications/unread-count");
    return response.data.data;
  },

  markAsRead: async (notificationId: string): Promise<void> => {
    await api.put<ApiResponse<void>>(`/notifications/${notificationId}/read`);
  },

  markAllAsRead: async (): Promise<void> => {
    await api.put<ApiResponse<void>>("/notifications/read-all");
  },
};
