"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { NAV, findNav, navNumber, type NavIconName } from "@/config/nav";
import { PROFILE } from "@/config/content";
import { ScrollTrigger } from "@/lib/motion";
import { SIDEBAR_COLLAPSED, SIDEBAR_KEY } from "@/lib/sidebar";
import { TransitionLink } from "./PageTransition";
import { Settings } from "./Settings";
import { SocialIcons } from "./Social";
import { Logo } from "./Logo";
import { useI18n } from "./I18nProvider";

/** Ícones de traço fino da sidebar encolhida (24×24, herdam a cor do texto). */
const ICONS: Record<NavIconName | "settings", React.ReactNode> = {
  home: (
    <>
      <path d="M3.5 10.5 12 3.5l8.5 7" />
      <path d="M5.5 9v11.5h13V9" />
      <path d="M10 20.5v-6h4v6" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8" r="4" />
      <path d="M4.5 20.5c0-4.1 3.4-7 7.5-7s7.5 2.9 7.5 7" />
    </>
  ),
  layers: (
    <>
      <path d="m12 3.5 8.5 4.75L12 13 3.5 8.25 12 3.5Z" />
      <path d="m3.5 12.25 8.5 4.75 8.5-4.75" />
      <path d="m3.5 16.25 8.5 4.75 8.5-4.75" />
    </>
  ),
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" />
      <path d="m3.5 7 8.5 6 8.5-6" />
    </>
  ),
  settings: (
    <>
      <path d="M4 7h9M17 7h3M4 17h3M11 17h9" />
      <circle cx="15" cy="7" r="2" />
      <circle cx="9" cy="17" r="2" />
    </>
  ),
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="20"
      height="20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.25"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {ICONS[name]}
    </svg>
  );
}

/** Etiqueta com o nome da aba, à direita do ícone (só com a sidebar encolhida). */
const Tip = ({ children }: { children: React.ReactNode }) => (
  <span className="sb-tip label pointer-events-none absolute left-full top-1/2 ml-5 -translate-y-1/2 whitespace-nowrap border border-line-strong bg-bg px-2.5 py-1.5 !text-fg opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100">
    {children}
  </span>
);

export function Sidebar() {
  const pathname = usePathname();
  const { t, pick } = useI18n();
  const activeIndex = findNav(pathname)?.index ?? -1;
  const year = new Date().getFullYear();
  // o estado real é a classe no <html> (aplicada antes da pintura); aqui só espelha para o aria
  const [collapsed, setCollapsed] = useState(false);
  useEffect(() => setCollapsed(document.documentElement.classList.contains(SIDEBAR_COLLAPSED)), []);

  const toggle = (next = !collapsed) => {
    document.documentElement.classList.toggle(SIDEBAR_COLLAPSED, next);
    setCollapsed(next);
    try {
      localStorage.setItem(SIDEBAR_KEY, next ? "collapsed" : "expanded");
    } catch {}
    // a coluna de conteúdo muda de largura: recalcula os gatilhos de scroll no fim da transição
    setTimeout(() => ScrollTrigger.refresh(), 450);
  };

  return (
    <aside className="sidebar vt-sidebar fixed inset-y-0 left-0 z-40 hidden flex-col border-r border-line [--ring-gap:var(--c-surface)] nav:flex">
      {/* fundo em camada própria: troca na hora, enquanto os textos esmaecem */}
      <div className="vt-sidebar-bg absolute inset-0 -z-10 bg-[var(--c-surface)]" aria-hidden="true" />

      {/* encolher / expandir, em cima da borda */}
      <button
        type="button"
        onClick={() => toggle()}
        aria-expanded={!collapsed}
        aria-label={collapsed ? t.a11y.expandSidebar : t.a11y.collapseSidebar}
        className="absolute -right-3.5 top-[calc(var(--sb-head-pt)+10px)] z-10 grid size-7 place-items-center rounded-full border border-line-strong bg-[var(--c-surface)] text-muted transition-colors duration-200 hover:border-accent hover:text-accent"
      >
        <svg
          viewBox="0 0 24 24"
          width="14"
          height="14"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="sb-chevron"
          aria-hidden="true"
        >
          <path d="m12 7-5 5 5 5M18 7l-5 5 5 5" />
        </svg>
      </button>

      <div className="flex shrink-0 items-center px-6 pt-[var(--sb-head-pt)]">
        <div className="sb-logo">
          <Logo size="lg" />
        </div>
      </div>

      <nav aria-label={t.a11y.mainNav} className="px-6 pt-[var(--sb-nav-pt)]">
        <p className="sb-full sb-indent label mb-6 whitespace-nowrap">{t.index}</p>
        <ul className="flex flex-col gap-[var(--sb-gap)]">
          {NAV.map((item, i) => {
            const active = i === activeIndex;
            return (
              <li key={item.href}>
                <TransitionLink
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex h-10 items-center font-mono text-[14px] tracking-[0.12em] transition-colors duration-200 ${
                    active ? "text-accent" : "text-muted hover:text-fg"
                  }`}
                >
                  <span className="sb-full sb-indent flex items-center gap-3 whitespace-nowrap">
                    <span
                      aria-hidden="true"
                      className={`h-px bg-accent transition-[width] duration-300 ${active ? "w-4" : "w-0 group-hover:w-2"}`}
                    />
                    <span>{navNumber(i)}.</span>
                    <span>{pick(item.label)}</span>
                  </span>
                  <span className="sb-mini absolute left-0 top-0.5 grid size-9 place-items-center" aria-hidden="true">
                    <Icon name={item.icon} />
                  </span>
                  <Tip>
                    <span className="text-accent">{navNumber(i)}.</span> {pick(item.label)}
                  </Tip>
                </TransitionLink>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="relative mt-auto px-6 pb-6">
        <div className="sb-full">
          <SocialIcons className="mb-6" />
          <div className="border-t border-line pt-5">
            <Settings />
          </div>
          <div className="mt-6 space-y-1.5 whitespace-nowrap border-t border-line pt-5">
            <p className="label !text-[11px]">
              {PROFILE.version} // {year}
            </p>
            <p className="label !text-[11px]">
              © {year} {PROFILE.firstName} {PROFILE.lastName}
            </p>
          </div>
        </div>

        {/* encolhida: redes empilhadas + atalho que abre a sidebar nos ajustes */}
        <div className="sb-mini absolute bottom-6 left-6 flex flex-col gap-2">
          <SocialIcons className="flex-col" />
          <button
            type="button"
            onClick={() => toggle(false)}
            aria-label={t.settings}
            className="group relative mt-4 grid size-9 place-items-center border border-line text-muted transition-colors duration-200 hover:border-accent hover:text-accent"
          >
            <Icon name="settings" />
            <Tip>{t.settings}</Tip>
          </button>
        </div>
      </div>
    </aside>
  );
}
