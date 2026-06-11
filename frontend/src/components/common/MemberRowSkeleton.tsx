import { Box, Skeleton, Stack } from "@mui/material";
import { motion } from "framer-motion";
import { fadeInUp } from "../../utils/animations";

export default function MemberRowSkeleton() {
  return (
    <Box component={motion.div} variants={fadeInUp}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ py: 1.5, px: 2, borderRadius: 2, border: "1px solid", borderColor: "divider" }}
      >
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={38} height={38} />
          <Box>
            <Skeleton variant="text" width={120} height={18} />
            <Skeleton variant="text" width={160} height={14} />
          </Box>
        </Stack>
        <Skeleton variant="rounded" width={64} height={24} sx={{ borderRadius: 10 }} />
      </Stack>
    </Box>
  );
}
