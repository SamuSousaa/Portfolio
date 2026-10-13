import type { Metadata, Viewport } from "next";
import "../globals.css";
import "@/styles/briefing.css";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_THEME } from "@/config/themes";

/*
 * Layout próprio dos briefings: tela cheia, sem sidebar, loader, cursor nem troca
 * de tema ou idioma. Sempre no tema TERMINAL e em português. Fora dos buscadores:
 * só quem recebe o link acessa (a rota também não entra no sitemap).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true, googleBot: { index: false, follow: false } },
};

// o teclado do celular encolhe a área útil, então os botões continuam à vista
export const viewport: Viewport = { width: "device-width", initialScale: 1, interactiveWidget: "resizes-content" };

export default function BriefingLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" data-theme={DEFAULT_THEME} className={fontVariables}>
      <body>
        <div className="theme-texture theme-texture--page" aria-hidden="true" />
        {children}
        <div className="grain" aria-hidden="true" />
      </body>
    </html>
  );
}
