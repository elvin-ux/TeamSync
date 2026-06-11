import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import ProtectedRoute from "./components/common/ProtectedRoute";
import DashboardLayout from "./layouts/DashboardLayout";
import AuthLayout from "./layouts/AuthLayout";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import RegisterPage from "./pages/RegisterPage";
import ProfilePage from "./pages/ProfilePage";
import ProjectsPage from "./pages/ProjectsPage";
import ProjectWorkspacePage from "./pages/ProjectWorkspacePage";

export default function App() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Routes location={location} key={location.pathname}>
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth routes wrapped in AuthLayout */}
        <Route element={<AuthLayout />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        </Route>

        {/* Protected routes – require valid JWT */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/projects" element={<ProjectsPage />} />
            <Route path="/projects/:id" element={<ProjectWorkspacePage />} />
            <Route path="/tasks" element={<PlaceholderPage title="Tasks" />} />
            <Route path="/tasks/:id" element={<PlaceholderPage title="Task Details" />} />
            <Route path="/team" element={<PlaceholderPage title="Team" />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<PlaceholderPage title="Settings" />} />
            <Route path="/notifications" element={<PlaceholderPage title="Notifications" />} />

            {/* Admin-only routes */}
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/users" element={<PlaceholderPage title="Admin Users" />} />
              <Route path="/admin/analytics" element={<PlaceholderPage title="Admin Analytics" />} />
            </Route>
          </Route>
        </Route>

        {/* Error routes */}
        <Route path="/access-denied" element={<PlaceholderPage title="Access Denied" />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AnimatePresence>
  );
}
