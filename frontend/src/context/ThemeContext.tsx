import React, { createContext, useContext, useEffect, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { createAppTheme } from "../theme/theme";

type ThemeMode = "light" | "dark";

interface ThemeModeContextType {
  mode: ThemeMode;
  toggleThemeMode: () => void;
}

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export function ThemeModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem("teamsync.themeMode");
    return (saved as ThemeMode) || "dark";
  });

  useEffect(() => {
    localStorage.setItem("teamsync.themeMode", mode);
  }, [mode]);

  const toggleThemeMode = () => {
    setMode((prev) => (prev === "light" ? "dark" : "light"));
  };

  const theme = React.useMemo(() => createAppTheme(mode), [mode]);

  return (
    <ThemeModeContext.Provider value={{ mode, toggleThemeMode }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
}

export function useThemeMode() {
  const context = useContext(ThemeModeContext);
  if (!context) {
    throw new Error("useThemeMode must be used within a ThemeModeProvider");
  }
  return context;
}
