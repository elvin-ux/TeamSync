import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:8080/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem("teamsync.accessToken");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      window.localStorage.removeItem("teamsync.accessToken");
      window.localStorage.removeItem("teamsync.role");
      window.localStorage.removeItem("teamsync.userName");
      window.localStorage.removeItem("teamsync.userEmail");
      window.localStorage.removeItem("teamsync.userAvatarUrl");

      if (
        window.location.pathname !== "/login" &&
        window.location.pathname !== "/register" &&
        window.location.pathname !== "/"
      ) {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);
