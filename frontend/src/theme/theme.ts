import { createTheme } from "@mui/material/styles";

export const colors = {
  backgroundPrimary: "#050816",
  backgroundSecondary: "#0B1220",
  workspaceSurface: "#111827",
  elevatedSurface: "#172033",
  border: "#23304A",
  primaryAccent: "#7C3AED",
  secondaryAccent: "#8B5CF6",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#38BDF8",
};

export const theme = createTheme({
  palette: {
    mode: "dark",
    background: {
      default: colors.backgroundPrimary,
      paper: colors.workspaceSurface,
    },
    primary: {
      main: colors.primaryAccent,
      light: colors.secondaryAccent,
    },
    success: {
      main: colors.success,
    },
    warning: {
      main: colors.warning,
    },
    error: {
      main: colors.danger,
    },
    info: {
      main: colors.info,
    },
    divider: colors.border,
    text: {
      primary: "#F8FAFC",
      secondary: "#94A3B8",
    },
  },
  typography: {
    fontFamily: '"Inter", "Satoshi", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    h1: { fontSize: 48, fontWeight: 700, letterSpacing: 0 },
    h2: { fontSize: 36, fontWeight: 700, letterSpacing: 0 },
    h3: { fontSize: 28, fontWeight: 700, letterSpacing: 0 },
    h4: { fontSize: 22, fontWeight: 700, letterSpacing: 0 },
    body1: { fontSize: 16, letterSpacing: 0 },
    caption: { fontSize: 13, letterSpacing: 0 },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      defaultProps: {
        disableElevation: true,
      },
      styleOverrides: {
        root: {
          minHeight: 44,
          borderRadius: 8,
          textTransform: "none",
          fontWeight: 700,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: "none",
          border: `1px solid ${colors.border}`,
        },
      },
    },
  },
});
