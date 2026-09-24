"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { DEFAULT_THEME, THEMES, THEME_STORAGE_KEY } from "@/config/themes";

type Ctx = { theme: string; setTheme: (id: string) => void };
const ThemeContext = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {} });

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  // O script do <head> já aplicou o tema salvo; aqui só sincronizamos o estado.
  useEffect(() => {
    const current = document.documentElement.dataset.theme;
    if (current && THEMES.some((t) => t.id === current)) setThemeState(current);
  }, []);

  const setTheme = useCallback((id: string) => {
    if (!THEMES.some((t) => t.id === id)) return;
    document.documentElement.dataset.theme = id;
    setThemeState(id);
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {}
  }, []);

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
