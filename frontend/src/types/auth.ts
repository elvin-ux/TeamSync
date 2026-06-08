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

// ---- User Profile Types ----

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  department: string | null;
  bio: string | null;
  createdAt: string;
}

export interface UpdateProfileData {
  name: string;
  department: string | null;
  bio: string | null;
}
