import { Aldrich, Inter, JetBrains_Mono, Space_Grotesk, IBM_Plex_Mono } from "next/font/google";

/*
 * Cada fonte vira uma variável CSS (--ff-*). Os temas em themes.css escolhem
 * quais usar. Fontes de temas secundários ficam com preload: false: o
 * @font-face existe, mas o navegador só baixa o arquivo quando o tema é usado.
 */

// TERMINAL (padrão) — pré-carregadas
export const aldrich = Aldrich({ subsets: ["latin"], weight: "400", variable: "--ff-aldrich", display: "swap" });
export const jetbrains = JetBrains_Mono({ subsets: ["latin"], variable: "--ff-jetbrains", display: "swap" });
export const inter = Inter({ subsets: ["latin"], variable: "--ff-inter", display: "swap" });

// BLUEPRINT — sob demanda
export const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--ff-space-grotesk",
  display: "swap",
  preload: false,
});
export const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--ff-plex-mono",
  display: "swap",
  preload: false,
});

export const fontVariables = [aldrich, jetbrains, inter, spaceGrotesk, plexMono].map((f) => f.variable).join(" ");
