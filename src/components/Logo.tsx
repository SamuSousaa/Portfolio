"use client";

import { PROFILE } from "@/config/content";
import { useI18n } from "./I18nProvider";
import { TransitionLink } from "./PageTransition";
import { LogoMark } from "@/components/LogoMark";

export function Logo() {
  const { t } = useI18n();
  return (
    <TransitionLink href="/" aria-label={`${PROFILE.firstName} ${PROFILE.lastName} — ${t.a11y.home}`} data-fill className="group flex items-center gap-3">
      <span className="grid size-10 place-items-center border border-line-strong text-fg transition-colors duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
        <LogoMark className="h-6 w-auto" />
      </span>
      {/* sb-full: some com a sidebar encolhida (só dentro da sidebar; no topo do celular fica) */}
      <span className="sb-full whitespace-nowrap font-mono text-[12px] leading-tight tracking-[0.12em] text-muted">
        <span className="block text-fg">{PROFILE.firstName}</span>
        {PROFILE.version}
      </span>
    </TransitionLink>
  );
}
