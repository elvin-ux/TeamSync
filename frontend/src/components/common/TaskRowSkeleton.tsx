import { Box, Card, Grid, Skeleton, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

export default function TaskRowSkeleton() {
  return (
    <Box component={motion.div} variants={fadeInUp}>
      <Card sx={{ p: 2.5, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={3} md={2.5}>
            <Skeleton variant="rounded" width={90} height={24} sx={{ borderRadius: 10 }} />
          </Grid>
          <Grid item xs={12} sm={5} md={5.5}>
            <Skeleton variant="text" width="80%" height={20} />
            <Skeleton variant="text" width="60%" height={14} />
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <Stack direction="row" spacing={1}>
              <Skeleton variant="rounded" width={52} height={20} sx={{ borderRadius: 10 }} />
              <Skeleton variant="rounded" width={52} height={20} sx={{ borderRadius: 10 }} />
            </Stack>
          </Grid>
          <Grid item xs={6} sm={2} md={2}>
            <Stack direction="row" spacing={1} alignItems="center">
              <Skeleton variant="circular" width={24} height={24} />
              <Skeleton variant="text" width={60} height={16} />
            </Stack>
          </Grid>
        </Grid>
      </Card>
    </Box>
  );
}
