import type { ApiResponse } from "../types/common";
import type { UserProfile, UpdateProfileData } from "../types/auth";
import { api } from "./api";

export const userService = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await api.get<ApiResponse<UserProfile>>("/users/profile");
    return response.data.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<UserProfile> => {
    const response = await api.put<ApiResponse<UserProfile>>("/users/profile", data);
    return response.data.data;
  },

  uploadAvatar: async (file: File): Promise<UserProfile> => {
    const formData = new FormData();
    formData.append("file", file);

    const response = await api.post<ApiResponse<UserProfile>>("/users/avatar", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data.data;
  },

  getUsers: async (): Promise<UserProfile[]> => {
    const response = await api.get<ApiResponse<UserProfile[]>>("/users");
    return response.data.data;
  },
};
