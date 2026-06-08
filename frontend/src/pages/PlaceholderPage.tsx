import { Box, Typography } from "@mui/material";
import { colors } from "../theme/theme";

interface PlaceholderPageProps {
  title: string;
}

export default function PlaceholderPage({ title }: PlaceholderPageProps) {
  return (
    <Box sx={{ minHeight: 360, p: 3, border: `1px solid ${colors.border}`, borderRadius: 2, bgcolor: colors.workspaceSurface }}>
      <Typography variant="h2">{title}</Typography>
      <Typography color="text.secondary">This route is registered for the documented app flow and will be built in its planned phase.</Typography>
    </Box>
  );
}
