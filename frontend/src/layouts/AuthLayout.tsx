import React from "react";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Stack, Typography, useTheme } from "@mui/material";
import { motion } from "framer-motion";
import { Outlet } from "react-router-dom";
import { getThemeColors } from "../theme/theme";

export default function AuthLayout() {
  const theme = useTheme();
  const activeColors = getThemeColors(theme.palette.mode);

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "grid",
        placeItems: "center",
        bgcolor: theme.palette.background.default,
        p: 2,
        transition: "background-color 200ms ease, background 200ms ease",
        background:
          theme.palette.mode === "dark"
            ? `radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.12) 0%, ${theme.palette.background.default} 70%)`
            : `radial-gradient(ellipse at 50% 0%, rgba(124,58,237,0.06) 0%, ${theme.palette.background.default} 70%)`,
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
            border: `1px solid ${theme.palette.divider}`,
            borderRadius: 3,
            bgcolor: theme.palette.mode === "dark" ? activeColors.backgroundSecondary : "#FFFFFF",
            boxShadow:
              theme.palette.mode === "dark"
                ? "0 24px 48px rgba(0,0,0,0.4)"
                : "0 24px 48px rgba(0,0,0,0.05)",
            transition: "all 200ms ease",
          }}
        >
          {/* Logo mark */}
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 38,
                height: 38,
                borderRadius: 2,
                bgcolor: activeColors.primaryAccent,
                display: "grid",
                placeItems: "center",
              }}
            >
              <LockOutlinedIcon sx={{ fontSize: 20, color: "#fff" }} />
            </Box>
            <Typography variant="h4" fontWeight={800}>
              TeamSync
            </Typography>
          </Stack>

          {/* Child pages (Forms) */}
          <Outlet />
        </Stack>
      </motion.div>
    </Box>
  );
}
