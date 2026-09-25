"use client";

import { useCallback, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { pagePath } from "@/config/nav";
import { LOCALES, type Localized } from "@/i18n/config";
import { PROFILE } from "@/config/content";
import { HudClock, HudCoords, HudStatus } from "./Hud";
import { MobileMenu } from "./MobileMenu";
import { Logo } from "./Logo";
import { useI18n } from "./I18nProvider";
import { Swap } from "@/components/Swap";

export function Topbar() {
  const pathname = usePathname();
  const { t, tr } = useI18n();
  const current = Object.fromEntries(LOCALES.map((l) => [l.id, pagePath(pathname, l.id).join(" / ")])) as Localized;
  const [open, setOpen] = useState(false);
  const close = useCallback(() => setOpen(false), []);
  const toggleRef = useRef<HTMLButtonElement>(null);

  return (
    <>
      <header className="sticky top-0 z-30 isolate border-b border-line">
        {/* fundo em camada própria: troca na hora, enquanto os textos esmaecem */}
        <div className="vt-topbar-bg absolute inset-0 -z-10 bg-[color-mix(in_srgb,var(--c-bg)_88%,transparent)] backdrop-blur-sm" aria-hidden="true" />
        <div className="flex h-14 items-center justify-between gap-6 px-5 nav:px-8">
          {/* celular: logo */}
          <div className="nav:hidden">
            <Logo />
          </div>

          {/* desktop: papel à esquerda */}
          <p className="label hidden whitespace-nowrap !text-fg nav:block">
            <span className="text-muted">SYS.01 — </span>
            <Swap v={PROFILE.role} />
          </p>

          {/* HUD numa linha (≥1300 px, com a sidebar de 300); coordenadas só ≥1600, onde cabem até na rota mais longa */}
          <div className="label hidden items-center gap-6 whitespace-nowrap min-[1300px]:flex">
            <HudStatus />
            <span className="h-3 w-px bg-line-strong" aria-hidden="true" />
            <HudClock />
            <span className="hidden h-3 w-px bg-line-strong min-[1600px]:block" aria-hidden="true" />
            <span className="hidden min-[1600px]:inline">
              <HudCoords />
            </span>
          </div>

          {/* desktop: caminho */}
          <p className="label hidden whitespace-nowrap !text-fg nav:block">
            <span className="text-accent">/</span> <Swap align="end" v={current} />
          </p>

          {/* celular: botão de menu à direita */}
          <button
            ref={toggleRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            data-fill
            className="hit flex h-9 items-center gap-3 border border-line-strong px-3 font-mono text-[11px] tracking-[0.14em] text-fg transition-colors [--hit-y:4px] hover:border-accent hover:bg-accent hover:text-on-accent nav:hidden"
          >
            <Swap align="end" v={tr((d) => d.menu)} />
            <span aria-hidden="true" className="flex flex-col gap-[3px]">
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-4 bg-current" />
              <span className="block h-px w-2.5 bg-current" />
            </span>
          </button>
        </div>

        {/* celular: HUD compacto + caminho */}
        <div className="label flex h-8 items-center justify-between gap-3 border-t border-line px-5 !text-[10px] nav:hidden min-[1300px]:hidden">
          <HudStatus />
          <HudClock dateless />
          <HudCoords short />
        </div>
        {/* faixa intermediária (900–1300): HUD abaixo do topo */}
        <div className="label hidden h-8 items-center gap-6 border-t border-line px-8 !text-[10px] nav:flex min-[1300px]:hidden">
          <HudStatus />
          <HudClock />
          <HudCoords />
        </div>
      </header>

      <MobileMenu open={open} onClose={close} returnFocusRef={toggleRef} current={current} />
    </>
  );
}
