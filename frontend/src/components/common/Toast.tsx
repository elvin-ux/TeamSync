import { createContext, useCallback, useContext, useState, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Box, IconButton, Stack, Typography } from "@mui/material";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import ErrorRoundedIcon from "@mui/icons-material/ErrorRounded";
import InfoRoundedIcon from "@mui/icons-material/InfoRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  showToast: (type: ToastType, title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

const CONFIG: Record<ToastType, { color: string; bgDark: string; bgLight: string; icon: React.ReactNode }> = {
  success: {
    color: "#16A34A",
    bgDark: "rgba(22,163,74,0.12)",
    bgLight: "#F0FDF4",
    icon: <CheckCircleRoundedIcon sx={{ color: "#16A34A", fontSize: 22 }} />,
  },
  error: {
    color: "#DC2626",
    bgDark: "rgba(220,38,38,0.12)",
    bgLight: "#FEF2F2",
    icon: <ErrorRoundedIcon sx={{ color: "#DC2626", fontSize: 22 }} />,
  },
  info: {
    color: "#4F46E5",
    bgDark: "rgba(79,70,229,0.12)",
    bgLight: "#EEF2FF",
    icon: <InfoRoundedIcon sx={{ color: "#4F46E5", fontSize: 22 }} />,
  },
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timerRefs = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    clearTimeout(timerRefs.current[id]);
    delete timerRefs.current[id];
  }, []);

  const showToast = useCallback((type: ToastType, title: string, message?: string) => {
    const id = `${Date.now()}-${Math.random()}`;
    setToasts((prev) => [...prev.slice(-4), { id, type, title, message }]);
    timerRefs.current[id] = setTimeout(() => removeToast(id), 3500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <Box
        sx={{
          position: "fixed",
          bottom: 24,
          right: 24,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 1.5,
          pointerEvents: "none",
        }}
      >
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const cfg = CONFIG[toast.type];
            return (
              <motion.div
                key={toast.id}
                initial={{ opacity: 0, x: 80, scale: 0.92 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 80, scale: 0.92 }}
                transition={{ type: "spring", stiffness: 420, damping: 32 }}
                style={{ pointerEvents: "auto" }}
              >
                <Box
                  sx={{
                    minWidth: 300,
                    maxWidth: 400,
                    p: 2,
                    borderRadius: 3,
                    border: `1px solid ${cfg.color}28`,
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? cfg.bgDark : cfg.bgLight,
                    boxShadow: `0 8px 24px ${cfg.color}20`,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  <Stack direction="row" spacing={1.5} alignItems="flex-start">
                    <Box sx={{ mt: 0.1, flexShrink: 0 }}>{cfg.icon}</Box>
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body2" fontWeight={700} sx={{ lineHeight: 1.3 }}>
                        {toast.title}
                      </Typography>
                      {toast.message && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mt: 0.3 }}>
                          {toast.message}
                        </Typography>
                      )}
                    </Box>
                    <IconButton
                      size="small"
                      onClick={() => removeToast(toast.id)}
                      sx={{ p: 0.25, color: "text.secondary", mt: -0.25 }}
                    >
                      <CloseRoundedIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  </Stack>
                </Box>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </Box>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx.showToast;
}
