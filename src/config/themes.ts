/**
 * Lista de temas. Para ADICIONAR um tema:
 *  1. Crie um bloco `[data-theme="<id>"] { ... }` em src/styles/themes.css
 *     definindo TODAS as variáveis (copie o bloco do terminal como base).
 *  2. Adicione uma entrada aqui (id igual ao do CSS).
 *  3. Se o tema usar fontes novas, declare-as em src/lib/fonts.ts com
 *     `preload: false` e inclua a variável em `fontVariables`.
 * Nada mais precisa mudar: seletor, script anti-piscada e componentes leem esta lista.
 */
import type { Localized } from "@/i18n/config";

export type Theme = {
  id: string;
  name: string;
  description: Localized;
  /** Cores da bolinha no seletor: [fundo, acento] */
  swatch: [string, string];
};

export const THEMES: Theme[] = [
  {
    id: "terminal",
    name: "TERMINAL",
    description: {
      en: "Phosphor black, lime accent, 40 px grid.",
      pt: "Preto de fósforo, acento limão, grid de 40 px.",
      es: "Negro fósforo, acento lima, cuadrícula de 40 px.",
    },
    swatch: ["#0A0A0A", "#CCF200"],
  },
  {
    id: "blueprint",
    name: "BLUEPRINT",
    description: {
      en: "Drafting table: light paper, ink and red dimensions.",
      pt: "Prancheta técnica: papel claro, nanquim e cota vermelha.",
      es: "Mesa de dibujo técnico: papel claro, tinta y cotas rojas.",
    },
    swatch: ["#F4F4F4", "#D92A1C"],
  },
];

export const DEFAULT_THEME = THEMES[0].id;
export const THEME_STORAGE_KEY = "tema";

/** Roda no <head> antes da pintura: aplica o tema salvo sem piscar. */
export const themeInitScript = `(function(){document.documentElement.classList.add("js");try{var t=localStorage.getItem(${JSON.stringify(
  THEME_STORAGE_KEY,
)});if(t&&${JSON.stringify(THEMES.map((t) => t.id))}.indexOf(t)>-1)document.documentElement.dataset.theme=t;}catch(e){}})();`;
