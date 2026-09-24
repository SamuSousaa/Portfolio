import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_THEME, themeInitScript } from "@/config/themes";
import { PROFILE } from "@/config/content";
import { htmlLang } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransitionProvider } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Cursor } from "@/components/Cursor";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const name = `${PROFILE.firstName} ${PROFILE.lastName}`;
  return {
    title: { default: `${name} — ${PROFILE.role[locale]}`, template: `%s — ${name}` },
    description: PROFILE.bio[locale],
  };
}

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  return (
    <html lang={htmlLang(locale)} data-theme={DEFAULT_THEME} className={fontVariables} suppressHydrationWarning>
      <head>
        {/* aplica o tema salvo antes da primeira pintura */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        <I18nProvider initial={locale}>
          <ThemeProvider>
            <PageTransitionProvider>
              {/* efeito de fundo do tema (brasa, radar...) */}
              <div className="fx" aria-hidden="true" />
              <SmoothScroll />
              <Sidebar />
              <div className="flex min-h-dvh flex-col nav:pl-[260px]">
                <Topbar />
                <main id="conteudo" className="flex-1">
                  {children}
                </main>
              </div>
              <Cursor />
              <div className="grain" aria-hidden="true" />
            </PageTransitionProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
