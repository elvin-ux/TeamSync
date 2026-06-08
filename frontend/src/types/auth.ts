import type { UserRole } from "./common";

// ---- Auth Request Types ----

export interface RegisterFormValues {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormValues {
  email: string;
  password: string;
}

// ---- Auth Response Types ----

export interface AuthResponse {
  token: string;
  role: UserRole;
  name: string;
  email: string;
}
