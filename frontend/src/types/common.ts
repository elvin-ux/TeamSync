export type UserRole = "ADMIN" | "LEAD" | "MEMBER";

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  errors: string[];
}
