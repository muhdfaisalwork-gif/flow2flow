import React, { createContext, useContext, useEffect } from "react";

export type ThemeMode = "dark";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ThemeMode;
  setTheme: (theme: string) => void;
  toggleTheme: () => void;
}

export function applyThemeToDOM() {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light");
  root.classList.add("dark");
  root.setAttribute("data-theme", "dark");
  root.style.colorScheme = "dark";

  if (document.body) {
    document.body.classList.remove("light");
    document.body.classList.add("dark");
  }
}

const DEFAULT_VALUE: ThemeContextValue = {
  theme: "dark",
  resolvedTheme: "dark",
  setTheme: () => applyThemeToDOM(),
  toggleTheme: () => applyThemeToDOM(),
};

const ThemeContext = createContext<ThemeContextValue>(DEFAULT_VALUE);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: string;
  attribute?: string;
  enableSystem?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  useEffect(() => {
    applyThemeToDOM();
  }, []);

  return <ThemeContext.Provider value={DEFAULT_VALUE}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext);
}
