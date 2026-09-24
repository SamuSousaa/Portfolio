"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_THEME, THEMES, THEME_STORAGE_KEY } from "@/config/themes";
import { withViewTransition } from "@/lib/viewTransition";

type Ctx = { theme: string; setTheme: (id: string) => void; preload: (id: string) => Promise<void> };
const ThemeContext = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {}, preload: async () => {} });

const FONT_WAIT_MS = 900;

/**
 * Carrega as fontes de um tema sem aplicá-lo: um elemento invisível com
 * data-theme="<id>" usa os estilos do tema e o navegador baixa as fontes.
 */
function loadThemeFonts(id: string) {
  const probe = document.createElement("div");
  probe.dataset.theme = id;
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none";
  probe.innerHTML =
    '<span class="display" style="--fs:16px">Aa</span><span class="name-accent">Aa</span><span class="label">Aa</span><span class="font-sans">Aa</span>';
  document.body.append(probe);
  const timeout = new Promise<void>((r) => setTimeout(r, FONT_WAIT_MS));
  return Promise.race([document.fonts.ready.then(() => undefined), timeout]).finally(() => probe.remove());
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);
  const loading = useRef(new Map<string, Promise<void>>());
  const current = useRef(DEFAULT_THEME);

  // O script do <head> já aplicou o tema salvo; aqui só sincronizamos o estado.
  useEffect(() => {
    const saved = document.documentElement.dataset.theme;
    if (saved && THEMES.some((t) => t.id === saved)) {
      current.current = saved;
      setThemeState(saved);
    }
  }, []);

  /** Chamado já na intenção (mouse/foco na bolinha), para a troca não esperar a rede. */
  const preload = useCallback((id: string) => {
    const map = loading.current;
    if (!map.has(id)) map.set(id, loadThemeFonts(id));
    return map.get(id)!;
  }, []);

  const setTheme = useCallback(
    async (id: string) => {
      if (id === current.current || !THEMES.some((t) => t.id === id)) return;
      current.current = id;
      await preload(id); // fontes prontas antes: a página nova já nasce com a fonte certa
      if (current.current !== id) return; // outro clique chegou antes
      try {
        localStorage.setItem(THEME_STORAGE_KEY, id);
      } catch {}
      await withViewTransition("vt-theme", () => {
        document.documentElement.dataset.theme = id;
        setThemeState(id);
      });
    },
    [preload],
  );

  return <ThemeContext.Provider value={{ theme, setTheme, preload }}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
