import { yupResolver } from "@hookform/resolvers/yup";
import PersonAddOutlinedIcon from "@mui/icons-material/PersonAddOutlined";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Divider,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import { colors } from "../theme/theme";
import type { RegisterFormValues } from "../types/auth";

const schema = yup.object({
  name: yup
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(100, "Name is too long")
    .required("Full name is required"),
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup
    .string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export default function RegisterPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: ({ name, email, password }: RegisterFormValues) =>
      authService.register({ name, email, password }),
    onSuccess: (data) => {
      setSession(data.token, data.role, data.name, data.email);
      navigate("/dashboard", { replace: true });
    },
  });

  const onSubmit = (values: RegisterFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        p: 2,
        background: `radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, ${colors.backgroundPrimary} 70%)`,
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{ width: "100%", maxWidth: 460 }}
      >
        <Stack
          spacing={2.5}
          sx={{
            p: { xs: 3, sm: 4 },
            border: `1px solid ${colors.border}`,
            borderRadius: 3,
            bgcolor: colors.backgroundSecondary,
            boxShadow: "0 24px 48px rgba(0,0,0,0.4)",
          }}
        >
          {/* Logo mark */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: colors.primaryAccent,
                display: "grid",
                placeItems: "center",
              }}
            >
              <PersonAddOutlinedIcon sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Typography variant="h4" fontWeight={800}>
              TeamSync
            </Typography>
          </Stack>

          <Box>
            <Typography variant="h3" fontWeight={700}>
              Create your account
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.5 }}>
              Join your team workspace
            </Typography>
          </Box>

          {mutation.isError && (
            <Alert severity="error" variant="outlined">
              {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
                ?.message ?? "Registration failed. Please try again."}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <Stack spacing={2}>
              <TextField
                id="register-name"
                label="Full name"
                autoComplete="name"
                fullWidth
                {...register("name")}
                error={!!errors.name}
                helperText={errors.name?.message}
              />
              <TextField
                id="register-email"
                label="Email address"
                type="email"
                autoComplete="email"
                fullWidth
                {...register("email")}
                error={!!errors.email}
                helperText={errors.email?.message}
              />
              <TextField
                id="register-password"
                label="Password"
                type="password"
                autoComplete="new-password"
                fullWidth
                {...register("password")}
                error={!!errors.password}
                helperText={errors.password?.message}
              />
              <TextField
                id="register-confirm-password"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                fullWidth
                {...register("confirmPassword")}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword?.message}
              />

              <Button
                id="register-submit"
                type="submit"
                variant="contained"
                size="large"
                fullWidth
                disabled={mutation.isPending}
                sx={{ mt: 0.5 }}
              >
                {mutation.isPending ? (
                  <CircularProgress size={22} color="inherit" />
                ) : (
                  "Create account"
                )}
              </Button>
            </Stack>
          </form>

          <Divider sx={{ borderColor: colors.border }} />

          <Typography variant="body2" color="text.secondary" textAlign="center">
            Already have an account?{" "}
            <Typography
              component={Link}
              to="/login"
              variant="body2"
              color="primary"
              sx={{ textDecoration: "none", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}
            >
              Sign in
            </Typography>
          </Typography>
        </Stack>
      </motion.div>
    </Box>
  );
}
