import { yupResolver } from "@hookform/resolvers/yup";
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
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import * as yup from "yup";
import { useAuth } from "../hooks/useAuth";
import { authService } from "../services/authService";
import type { LoginFormValues } from "../types/auth";

const schema = yup.object({
  email: yup.string().email("Enter a valid email").required("Email is required"),
  password: yup.string().required("Password is required"),
});

export default function LoginPage() {
  const { setSession } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: yupResolver(schema),
  });

  const mutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      setSession(data.token, data.role, data.name, data.email);
      navigate("/dashboard", { replace: true });
    },
  });

  const onSubmit = (values: LoginFormValues) => {
    mutation.mutate(values);
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h3" fontWeight={700}>
          Welcome back
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Sign in to your workspace
        </Typography>
      </Box>

      {mutation.isError && (
        <Alert severity="error" variant="outlined">
          {(mutation.error as { response?: { data?: { message?: string } } })?.response?.data
            ?.message ?? "Invalid email or password"}
        </Alert>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <Stack spacing={2}>
          <TextField
            id="login-email"
            label="Email address"
            type="email"
            autoComplete="email"
            fullWidth
            {...register("email")}
            error={!!errors.email}
            helperText={errors.email?.message}
          />
          <TextField
            id="login-password"
            label="Password"
            type="password"
            autoComplete="current-password"
            fullWidth
            {...register("password")}
            error={!!errors.password}
            helperText={errors.password?.message}
          />

          <Box sx={{ textAlign: "right" }}>
            <Typography
              component={Link}
              to="/forgot-password"
              variant="caption"
              color="primary"
              sx={{ textDecoration: "none", "&:hover": { textDecoration: "underline" } }}
            >
              Forgot password?
            </Typography>
          </Box>

          <Button
            id="login-submit"
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
              "Sign in"
            )}
          </Button>
        </Stack>
      </form>

      <Divider />

      <Typography variant="body2" color="text.secondary" textAlign="center">
        Don&apos;t have an account?{" "}
        <Typography
          component={Link}
          to="/register"
          variant="body2"
          color="primary"
          sx={{ textDecoration: "none", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}
        >
          Create one
        </Typography>
      </Typography>
    </Stack>
  );
}
