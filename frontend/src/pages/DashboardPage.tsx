import { Box, Stack, Typography } from "@mui/material";
import { colors } from "../theme/theme";

const widgets = ["Today's Focus", "Upcoming Deadlines", "Project Health", "Assigned Tasks"];

export default function DashboardPage() {
  return (
    <Stack spacing={3}>
      <Box>
        <Typography variant="h2">Workspace</Typography>
        <Typography color="text.secondary">Phase 0 shell for the TeamSync dashboard flow.</Typography>
      </Box>
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        {widgets.map((widget) => (
          <Box key={widget} sx={{ minHeight: 160, p: 2.5, border: `1px solid ${colors.border}`, borderRadius: 2, bgcolor: colors.workspaceSurface }}>
            <Typography variant="h4">{widget}</Typography>
            <Typography color="text.secondary">Ready for its implementation phase.</Typography>
          </Box>
        ))}
      </Box>
    </Stack>
  );
}
