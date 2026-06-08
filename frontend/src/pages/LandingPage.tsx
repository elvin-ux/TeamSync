import ArrowForwardRoundedIcon from "@mui/icons-material/ArrowForwardRounded";
import { Box, Button, Stack, Typography } from "@mui/material";
import { Link } from "react-router-dom";
import { colors } from "../theme/theme";

export default function LandingPage() {
  return (
    <Box sx={{ minHeight: "100vh", bgcolor: colors.backgroundPrimary, color: "text.primary", overflow: "hidden" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ height: 72, px: { xs: 2, md: 6 } }}>
        <Typography variant="h4">TeamSync</Typography>
        <Button component={Link} to="/login" variant="outlined">
          Login
        </Button>
      </Stack>
      <Box sx={{ minHeight: "calc(100vh - 72px)", display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, alignItems: "center", gap: 6, px: { xs: 2, md: 8 }, pb: 8 }}>
        <Stack spacing={3} sx={{ maxWidth: 620 }}>
          <Typography variant="h1">TeamSync</Typography>
          <Typography variant="h3" color="text.secondary">
            Collaborate. Assign. Track. Deliver.
          </Typography>
          <Typography color="text.secondary">
            A workspace-first project management platform for teams that need clear ownership, visible progress, and fewer lost decisions.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <Button component={Link} to="/register" variant="contained" endIcon={<ArrowForwardRoundedIcon />}>
              Start workspace
            </Button>
            <Button component={Link} to="/dashboard" variant="text">
              View dashboard
            </Button>
          </Stack>
        </Stack>
        <Box sx={{ minHeight: { xs: 300, md: 520 }, border: `1px solid ${colors.border}`, borderRadius: 3, bgcolor: colors.backgroundSecondary, position: "relative", p: 3 }}>
          {["Project Alpha", "Review API Spec", "Design Workspace"].map((label, index) => (
            <Box
              key={label}
              sx={{
                position: "absolute",
                left: `${12 + index * 18}%`,
                top: `${18 + index * 20}%`,
                width: 220,
                p: 2,
                border: `1px solid ${colors.border}`,
                borderRadius: 2,
                bgcolor: colors.workspaceSurface,
                boxShadow: "0 24px 80px rgba(124, 58, 237, 0.18)",
              }}
            >
              <Typography fontWeight={800}>{label}</Typography>
              <Typography variant="caption" color="text.secondary">
                Phase 0 workspace visual
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
