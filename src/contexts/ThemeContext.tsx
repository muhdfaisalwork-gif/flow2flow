import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export type ThemeMode = "dark" | "light";

interface ThemeContextValue {
  theme: ThemeMode;
  resolvedTheme: ThemeMode;
  setTheme: (theme: ThemeMode | "system") => void;
  toggleTheme: () => void;
}

const STORAGE_KEY = "shadowflow_theme";
const LEGACY_STORAGE_KEY = "theme";

function getInitialTheme(defaultTheme: ThemeMode = "dark"): ThemeMode {
  if (typeof window === "undefined") return defaultTheme;
  try {
    const stored =
      window.localStorage.getItem(STORAGE_KEY) ||
      window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (stored === "light" || stored === "dark") {
      return stored;
    }
  } catch {
    // Ignore storage read errors
  }
  if (typeof document !== "undefined") {
    if (document.documentElement.classList.contains("light")) return "light";
    if (document.documentElement.classList.contains("dark")) return "dark";
  }
  return defaultTheme;
}

export function applyThemeToDOM(mode: ThemeMode) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  root.classList.remove("light", "dark");
  root.classList.add(mode);
  root.setAttribute("data-theme", mode);
  root.style.colorScheme = mode;

  if (document.body) {
    document.body.classList.remove("light", "dark");
    document.body.classList.add(mode);
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, mode);
    window.localStorage.setItem(LEGACY_STORAGE_KEY, mode);
  } catch {
    // Ignore storage write errors
  }
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export interface ThemeProviderProps {
  children: React.ReactNode;
  defaultTheme?: ThemeMode;
  attribute?: string;
  enableSystem?: boolean;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = "dark",
}) => {
  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const initial = getInitialTheme(defaultTheme);
    applyThemeToDOM(initial);
    return initial;
  });

  useEffect(() => {
    applyThemeToDOM(theme);
  }, [theme]);

  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY || e.key === LEGACY_STORAGE_KEY) {
        const val = e.newValue;
        if (val === "light" || val === "dark") {
          setThemeState(val);
          applyThemeToDOM(val);
        }
      }
    };

    const handleCustomEvent = (e: Event) => {
      const custom = e as CustomEvent<ThemeMode>;
      if (custom.detail === "light" || custom.detail === "dark") {
        setThemeState(custom.detail);
      }
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener("shadowflow-theme-change", handleCustomEvent);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener("shadowflow-theme-change", handleCustomEvent);
    };
  }, []);

  const setTheme = useCallback((nextInput: ThemeMode | "system") => {
    const resolved: ThemeMode =
      nextInput === "system"
        ? typeof window !== "undefined" &&
          window.matchMedia?.("(prefers-color-scheme: light)").matches
          ? "light"
          : "dark"
        : nextInput === "light"
          ? "light"
          : "dark";

    applyThemeToDOM(resolved);
    setThemeState(resolved);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<ThemeMode>("shadowflow-theme-change", { detail: resolved }));
    }
  }, []);

  const toggleTheme = useCallback(() => {
    const isCurrentlyDark =
      typeof document !== "undefined"
        ? document.documentElement.classList.contains("dark")
        : theme === "dark";
    const next: ThemeMode = isCurrentlyDark ? "light" : "dark";
    applyThemeToDOM(next);
    setThemeState(next);
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent<ThemeMode>("shadowflow-theme-change", { detail: next }));
    }
  }, [theme]);

  const value = useMemo(
    () => ({
      theme,
      resolvedTheme: theme,
      setTheme,
      toggleTheme,
    }),
    [theme, setTheme, toggleTheme]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    // Safe fallback if used outside ThemeProvider
    const current: ThemeMode =
      typeof document !== "undefined" && document.documentElement.classList.contains("light")
        ? "light"
        : "dark";
    return {
      theme: current,
      resolvedTheme: current,
      setTheme: (next) => {
        const mode: ThemeMode = next === "light" ? "light" : "dark";
        applyThemeToDOM(mode);
      },
      toggleTheme: () => {
        const isDark =
          typeof document !== "undefined" ? document.documentElement.classList.contains("dark") : true;
        applyThemeToDOM(isDark ? "light" : "dark");
      },
    };
  }
  return ctx;
}
