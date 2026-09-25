"use client";

import { PROFILE } from "@/config/content";
import { useI18n } from "./I18nProvider";
import { TransitionLink } from "./PageTransition";
import { LogoMark } from "@/components/LogoMark";

/** Marca sem moldura + nome. `lg` = sidebar do desktop (marca 48 px); `sm` = topo do celular. */
export function Logo({ size = "sm" }: { size?: "sm" | "lg" }) {
  const { t } = useI18n();
  const lg = size === "lg";
  return (
    <TransitionLink href="/" aria-label={`${PROFILE.firstName} ${PROFILE.lastName} — ${t.a11y.home}`} data-fill className={`group flex items-center ${lg ? "gap-4" : "gap-3"}`}>
      <LogoMark className={`sb-logo-mark w-auto shrink-0 text-fg transition-[color,translate] duration-200 group-hover:text-accent ${lg ? "h-12" : "h-8"}`} />
      {/* sb-full: some com a sidebar encolhida (só dentro da sidebar; no topo do celular fica) */}
      <span className={`sb-full whitespace-nowrap font-mono leading-tight tracking-[0.12em] text-muted text-[12px]`}>
        <span className={`block text-fg ${lg ? "mb-0.5 text-[15px] tracking-[0.1em]" : ""}`}>{PROFILE.firstName}</span>
        {PROFILE.version}
      </span>
    </TransitionLink>
  );
}
