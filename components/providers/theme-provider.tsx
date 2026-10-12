"use client";

import * as React from "react";

type Theme = "light" | "dark" | "system";

interface ThemeContextType {
  theme: "light" | "dark";
  themePreference: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [themePreference, setThemePreference] = React.useState<Theme>("system");
  const [theme, setResolvedTheme] = React.useState<"light" | "dark">("light");

  React.useEffect(() => {
    try {
      const stored = localStorage.getItem("finflow-theme") as Theme | null;
      const initialPref = stored || "system";
      setThemePreference(initialPref);

      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      const resolved =
        initialPref === "system"
          ? isSystemDark
            ? "dark"
            : "light"
          : initialPref;

      setResolvedTheme(resolved);
      if (resolved === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    } catch {
      // Fallback if localStorage is inaccessible
    }
  }, []);

  React.useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      if (themePreference === "system") {
        const nextTheme = mediaQuery.matches ? "dark" : "light";
        setResolvedTheme(nextTheme);
        if (nextTheme === "dark") {
          document.documentElement.classList.add("dark");
        } else {
          document.documentElement.classList.remove("dark");
        }
      }
    };

    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, [themePreference]);

  const setTheme = React.useCallback((newPref: Theme) => {
    setThemePreference(newPref);
    try {
      localStorage.setItem("finflow-theme", newPref);
    } catch {}

    const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    const resolved =
      newPref === "system"
        ? isSystemDark
          ? "dark"
          : "light"
        : newPref;

    setResolvedTheme(resolved);
    if (resolved === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, []);

  const toggleTheme = React.useCallback(() => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
  }, [theme, setTheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themePreference,
        setTheme,
        toggleTheme,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}

