import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder – POST /auth/forgot-password will be implemented in Phase 3
    setSubmitted(true);
  };

  return (
    <Stack spacing={2.5}>
      <Box>
        <Typography variant="h3" fontWeight={700}>
          Reset password
        </Typography>
        <Typography color="text.secondary" sx={{ mt: 0.5 }}>
          Enter your email and we&apos;ll send a reset link
        </Typography>
      </Box>

      {submitted ? (
        <Alert severity="success" variant="outlined">
          If this email is registered, a reset link has been sent. Check your inbox.
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} noValidate>
          <Stack spacing={2}>
            <TextField
              id="forgot-password-email"
              label="Email address"
              type="email"
              fullWidth
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Button
              id="forgot-password-submit"
              type="submit"
              variant="contained"
              size="large"
              fullWidth
            >
              Send reset link
            </Button>
          </Stack>
        </form>
      )}

      <Typography variant="body2" color="text.secondary" textAlign="center">
        <Typography
          component={Link}
          to="/login"
          variant="body2"
          color="primary"
          sx={{ textDecoration: "none", fontWeight: 700, "&:hover": { textDecoration: "underline" } }}
        >
          ← Back to sign in
        </Typography>
      </Typography>
    </Stack>
  );
}
