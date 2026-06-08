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
    <Stack spacing={2.5}>
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

      <Divider />

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
  );
}
