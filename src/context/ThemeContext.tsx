"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";

interface ThemeContextValue {
  isDark: boolean;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

const STORAGE_KEY = "eryx-theme";

export function ThemeProvider({ children }: { children: ReactNode }) {
  // Start `false` unconditionally on both server and client — this MUST
  // match what the server rendered, or React throws a hydration mismatch
  // warning. The real stored preference is read after mount instead (see
  // useEffect below), and the inline script in layout.tsx prevents a
  // visible flash before React even hydrates.
  const [isDark, setIsDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    setIsDark(stored === "dark");
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem(STORAGE_KEY, isDark ? "dark" : "light");
    document.documentElement.classList.toggle("dark", isDark);
  }, [isDark, mounted]);

  const toggleTheme = () => setIsDark((prev) => !prev);

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}