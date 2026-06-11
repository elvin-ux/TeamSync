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

export const lightColors = {
  backgroundPrimary: "#F8FAFC", // Slate 50
  backgroundSecondary: "#FFFFFF", // White
  workspaceSurface: "#F1F5F9", // Slate 100
  elevatedSurface: "#E2E8F0", // Slate 200
  border: "#CBD5E1", // Slate 300
  primaryAccent: "#7C3AED", // Purple
  secondaryAccent: "#8B5CF6", // Light Purple
  success: "#10B981", // Success green
  warning: "#F59E0B",
  danger: "#EF4444",
  info: "#3B82F6",
};

export const getThemeColors = (mode: "light" | "dark") => {
  return mode === "light" ? lightColors : colors;
};

export const createAppTheme = (mode: "light" | "dark") => {
  const activeColors = getThemeColors(mode);

  return createTheme({
    palette: {
      mode,
      background: {
        default: activeColors.backgroundPrimary,
        paper: activeColors.workspaceSurface,
      },
      primary: {
        main: activeColors.primaryAccent,
        light: activeColors.secondaryAccent,
      },
      success: {
        main: activeColors.success,
      },
      warning: {
        main: activeColors.warning,
      },
      error: {
        main: activeColors.danger,
      },
      info: {
        main: activeColors.info,
      },
      divider: activeColors.border,
      text: {
        primary: mode === "light" ? "#0F172A" : "#F8FAFC", // Slate 900 vs Slate 50
        secondary: mode === "light" ? "#475569" : "#94A3B8", // Slate 600 vs Slate 400
      },
    },
    typography: {
      fontFamily: '"Inter", "Satoshi", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: {
        fontSize: 32,
        "@media (min-width:600px)": { fontSize: 40 },
        "@media (min-width:900px)": { fontSize: 48 },
        fontWeight: 700,
        letterSpacing: 0,
      },
      h2: {
        fontSize: 24,
        "@media (min-width:600px)": { fontSize: 30 },
        "@media (min-width:900px)": { fontSize: 36 },
        fontWeight: 700,
        letterSpacing: 0,
      },
      h3: {
        fontSize: 20,
        "@media (min-width:600px)": { fontSize: 24 },
        "@media (min-width:900px)": { fontSize: 28 },
        fontWeight: 700,
        letterSpacing: 0,
      },
      h4: {
        fontSize: 18,
        "@media (min-width:600px)": { fontSize: 20 },
        "@media (min-width:900px)": { fontSize: 22 },
        fontWeight: 700,
        letterSpacing: 0,
      },
      body1: {
        fontSize: 15,
        "@media (min-width:600px)": { fontSize: 16 },
        letterSpacing: 0,
      },
      caption: {
        fontSize: 12,
        "@media (min-width:600px)": { fontSize: 13 },
        letterSpacing: 0,
      },
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
            border: `1px solid ${activeColors.border}`,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& .MuiOutlinedInput-notchedOutline": {
              borderColor: activeColors.border,
            },
            "&:hover .MuiOutlinedInput-notchedOutline": {
              borderColor: activeColors.primaryAccent,
            },
          },
        },
      },
    },
  });
};
