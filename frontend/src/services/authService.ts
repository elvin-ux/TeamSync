import type { ApiResponse } from "../types/common";
import type { AuthResponse, LoginFormValues, RegisterFormValues } from "../types/auth";
import { api } from "./api";

export const authService = {
  register: async (data: Omit<RegisterFormValues, "confirmPassword">): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/register", {
      name: data.name,
      email: data.email,
      password: data.password,
    });
    return response.data.data;
  },

  login: async (data: LoginFormValues): Promise<AuthResponse> => {
    const response = await api.post<ApiResponse<AuthResponse>>("/auth/login", {
      email: data.email,
      password: data.password,
    });
    return response.data.data;
  },

  logout: async (): Promise<void> => {
    // Best-effort: notify the server (future: token denylist support)
    await api.post("/auth/logout").catch(() => undefined);
  },
};
