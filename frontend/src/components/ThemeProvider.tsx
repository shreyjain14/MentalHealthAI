"use client";

import { createContext, useContext, ReactNode } from "react";

// Simple theme context that always returns "dark" as the theme
interface ThemeContextType {
  theme: "dark";
  toggleTheme: () => void; // No-op function for compatibility
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Always dark theme, no toggle functionality
  const theme: "dark" = "dark";

  // No-op function just for compatibility
  const toggleTheme = () => {
    console.log("Theme toggling is disabled - app is dark mode only");
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
