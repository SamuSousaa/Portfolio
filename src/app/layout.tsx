import type { Metadata, Viewport } from "next";
import "./globals.css";
import { fontVariables } from "@/lib/fonts";
import { DEFAULT_THEME, themeInitScript } from "@/config/themes";
import { CONTACT, PROFILE, fullName } from "@/config/content";
import { SITE_URL } from "@/config/site";
import { htmlLang } from "@/i18n/config";
import { getServerLocale } from "@/i18n/server";
import { I18nProvider } from "@/components/I18nProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { PageTransitionProvider } from "@/components/PageTransition";
import { SmoothScroll } from "@/components/SmoothScroll";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { Cursor } from "@/components/Cursor";
import { headers } from "next/headers";
import { Loader } from "@/components/Loader";
import { isHardReload, loaderInitScript } from "@/lib/loader";
import { sidebarInitScript } from "@/lib/sidebar";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getServerLocale();
  const name = fullName;
  const title = `${name} — ${PROFILE.role[locale]}`;
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: `%s — ${name}` },
    description: PROFILE.bio[locale],
    applicationName: name,
    authors: [{ name, url: SITE_URL }],
    creator: name,
    openGraph: {
      type: "website",
      url: SITE_URL,
      siteName: name,
      title,
      description: PROFILE.bio[locale],
      locale: OG_LOCALE[locale],
      alternateLocale: Object.values(OG_LOCALE).filter((l) => l !== OG_LOCALE[locale]),
    },
    twitter: { card: "summary_large_image", title, description: PROFILE.bio[locale] },
  };
}

const OG_LOCALE = { en: "en_US", pt: "pt_BR", es: "es_ES" } as const;

/** Dados estruturados (schema.org/Person) para buscadores. */
const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: fullName,
  jobTitle: PROFILE.role.en,
  description: PROFILE.bio.en,
  url: SITE_URL,
  address: { "@type": "PostalAddress", addressLocality: PROFILE.location.city },
  sameAs: [CONTACT.github, CONTACT.linkedin],
};

export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getServerLocale();
  const forceLoader = isHardReload(await headers());
  return (
    <html
      lang={htmlLang(locale)}
      data-theme={DEFAULT_THEME}
      data-loader={forceLoader ? "force" : undefined}
      className={fontVariables}
      suppressHydrationWarning
    >
      <head>
        {/* aplica o tema salvo antes da primeira pintura */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        {/* liga o loader só na primeira visita da sessão, também antes da pintura */}
        <script dangerouslySetInnerHTML={{ __html: loaderInitScript }} />
        {/* sidebar encolhida ou não, também antes da pintura */}
        <script dangerouslySetInnerHTML={{ __html: sidebarInitScript }} />
      </head>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }} />
        <I18nProvider initial={locale}>
          <ThemeProvider>
            <PageTransitionProvider>
              {/* camadas do tema: textura (grid/pontos/pauta), efeito (brasa) e CRT */}
              <div className="page-bg vt-page-bg" aria-hidden="true" />
              <div className="theme-texture theme-texture--page vt-texture" aria-hidden="true" />
              <div className="fx vt-fx" aria-hidden="true" />
              <SmoothScroll />
              <Sidebar />
              <div className="vt-content flex min-h-dvh flex-col sidebar-offset">
                <Topbar />
                <main id="conteudo" className="flex-1">
                  {children}
                </main>
              </div>
              <Loader />
              <Cursor />
              <div className="grain vt-grain" aria-hidden="true" />
              <div className="crt vt-crt" aria-hidden="true" />
            </PageTransitionProvider>
          </ThemeProvider>
        </I18nProvider>
      </body>
    </html>
  );
}
