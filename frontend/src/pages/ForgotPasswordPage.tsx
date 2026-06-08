import MailOutlineRoundedIcon from "@mui/icons-material/MailOutlineRounded";
import {
  Alert,
  Box,
  Button,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { motion } from "framer-motion";
import { useState } from "react";
import { Link } from "react-router-dom";
import { colors } from "../theme/theme";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Placeholder – POST /auth/forgot-password will be implemented in Phase 3
    setSubmitted(true);
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
        style={{ width: "100%", maxWidth: 440 }}
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
              <MailOutlineRoundedIcon sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Typography variant="h4" fontWeight={800}>
              TeamSync
            </Typography>
          </Stack>

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
      </motion.div>
    </Box>
  );
}
