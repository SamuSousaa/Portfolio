"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { DEFAULT_THEME, THEMES, THEME_STORAGE_KEY } from "@/config/themes";
import { withViewTransition } from "@/lib/viewTransition";

type Ctx = { theme: string; setTheme: (id: string) => void; preload: (id: string) => Promise<void> };
const ThemeContext = createContext<Ctx>({ theme: DEFAULT_THEME, setTheme: () => {}, preload: async () => {} });

/** Espera máxima pelas fontes no clique (o carregamento começa antes, no hover/foco). */
const FONT_CAP_MS = 300;

const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/** Descobre as fontes que um tema usa (sem aplicá-lo) e as carrega com document.fonts.load. */
function loadThemeFonts(id: string) {
  const probe = document.createElement("div");
  probe.dataset.theme = id;
  probe.setAttribute("aria-hidden", "true");
  probe.style.cssText = "position:fixed;left:-9999px;top:0;visibility:hidden;pointer-events:none";
  probe.innerHTML =
    '<span class="display" style="--fs:16px"></span><span class="name-accent"></span><span class="label"></span><span class="font-sans"></span>';
  document.body.append(probe);
  const specs = new Set(
    Array.from(probe.children, (el) => {
      const cs = getComputedStyle(el);
      return `${cs.fontStyle} ${cs.fontWeight} 16px ${cs.fontFamily}`;
    }),
  );
  probe.remove();
  return Promise.all([...specs].map((spec) => document.fonts.load(spec, "SAMUEL SOUSA").catch(() => []))).then(
    () => undefined,
  );
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

  /** Chamado já na intenção (mouse/foco na bolinha): as fontes carregam em segundo plano. */
  const preload = useCallback((id: string) => {
    const map = loading.current;
    if (!map.has(id)) map.set(id, loadThemeFonts(id));
    return map.get(id)!;
  }, []);

  const setTheme = useCallback(
    async (id: string) => {
      if (id === current.current || !THEMES.some((t) => t.id === id)) return;
      current.current = id;
      try {
        localStorage.setItem(THEME_STORAGE_KEY, id);
      } catch {}

      // fontes prontas antes da troca (espera máx. FONT_CAP_MS)
      await Promise.race([preload(id), sleep(FONT_CAP_MS)]);
      if (current.current !== id) return; // outro clique chegou antes

      // onda em três camadas, feita pelo compositor (ver "TROCA DE TEMA" em globals.css);
      // com reduced motion ou sem suporte, a troca é instantânea
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
