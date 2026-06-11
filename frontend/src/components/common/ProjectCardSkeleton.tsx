import { Box, Card, Skeleton, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

export default function ProjectCardSkeleton() {
  return (
    <Box component={motion.div} variants={fadeInUp}>
      <Card sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={2}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="rounded" width={72} height={22} sx={{ borderRadius: 10 }} />
            <Skeleton variant="rounded" width={56} height={22} sx={{ borderRadius: 10 }} />
          </Stack>
          <Skeleton variant="text" width="60%" height={28} />
          <Skeleton variant="text" width="90%" height={16} />
          <Skeleton variant="text" width="75%" height={16} />
          <Box sx={{ pt: 1 }}>
            <Skeleton variant="rounded" width="100%" height={6} sx={{ borderRadius: 3 }} />
          </Box>
          <Stack direction="row" justifyContent="space-between">
            <Skeleton variant="text" width={80} height={16} />
            <Skeleton variant="text" width={60} height={16} />
          </Stack>
        </Stack>
      </Card>
    </Box>
  );
}
