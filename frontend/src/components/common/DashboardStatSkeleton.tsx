import { Box, Card, Skeleton, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

export default function DashboardStatSkeleton() {
  return (
    <Box component={motion.div} variants={fadeInUp}>
      <Card sx={{ p: 3, borderRadius: 3, border: "1px solid", borderColor: "divider" }}>
        <Stack spacing={1.5}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Skeleton variant="text" width={100} height={16} />
            <Skeleton variant="circular" width={40} height={40} />
          </Stack>
          <Skeleton variant="text" width={70} height={40} />
          <Skeleton variant="text" width={120} height={14} />
        </Stack>
      </Card>
    </Box>
  );
}
