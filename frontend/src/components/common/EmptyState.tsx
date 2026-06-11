import { Box, Button, Typography } from "@mui/material";
import { motion } from "framer-motion";
import { scaleIn } from "../../utils/animations";

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({ icon, title, subtitle, actionLabel, onAction }: EmptyStateProps) {
  return (
    <Box
      component={motion.div}
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: 10,
        px: 4,
        textAlign: "center",
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 80,
          height: 80,
          borderRadius: "50%",
          background: "linear-gradient(135deg, rgba(99,102,241,0.12) 0%, rgba(168,85,247,0.12) 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 1,
          "& svg": { fontSize: 38, opacity: 0.55 },
        }}
      >
        {icon}
      </Box>
      <Typography variant="h3" fontWeight={700} sx={{ mb: 0.5 }}>
        {title}
      </Typography>
      {subtitle && (
        <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 380, lineHeight: 1.6 }}>
          {subtitle}
        </Typography>
      )}
      {actionLabel && onAction && (
        <Button
          variant="contained"
          onClick={onAction}
          sx={{ mt: 1, px: 3, borderRadius: 2.5 }}
          component={motion.button}
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
