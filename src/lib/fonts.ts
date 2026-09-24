import {
  Aldrich,
  Inter,
  JetBrains_Mono,
  Space_Grotesk,
  IBM_Plex_Mono,
  Unbounded,
  Oswald,
  Outfit,
  Turret_Road,
  Archivo,
} from "next/font/google";

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

// COBALTO
export const unbounded = Unbounded({ subsets: ["latin"], variable: "--ff-unbounded", display: "swap", preload: false });
// FORJA
export const oswald = Oswald({ subsets: ["latin"], variable: "--ff-oswald", display: "swap", preload: false });
// MANUSCRITO — geométrica; vazada mostra as sobreposições internas
export const outfit = Outfit({ subsets: ["latin"], variable: "--ff-outfit", display: "swap", preload: false });
// SONAR — quadrada com terminais curvos, leitura de instrumento
export const turretRoad = Turret_Road({
  subsets: ["latin"],
  weight: "800",
  variable: "--ff-turret",
  display: "swap",
  preload: false,
});
// HERBÁRIO — eixo de largura (wdth) para a versão expandida
export const archivo = Archivo({
  subsets: ["latin"],
  axes: ["wdth"],
  style: ["normal", "italic"],
  variable: "--ff-archivo",
  display: "swap",
  preload: false,
});

export const fontVariables = [aldrich, jetbrains, inter, spaceGrotesk, plexMono, unbounded, oswald, outfit, turretRoad, archivo].map((f) => f.variable).join(" ");
