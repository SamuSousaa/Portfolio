"use client";

import { PROFILE } from "@/config/content";
import { useI18n } from "./I18nProvider";
import { TransitionLink } from "./PageTransition";

export function Logo() {
  const { t } = useI18n();
  return (
    <TransitionLink href="/" aria-label={`${PROFILE.firstName} ${PROFILE.lastName} — ${t.a11y.home}`} data-fill className="group flex items-center gap-3">
      <span className="grid size-9 place-items-center border border-line-strong font-display text-[15px] text-fg transition-colors duration-200 group-hover:border-accent group-hover:bg-accent group-hover:text-on-accent">
        {PROFILE.initials}
      </span>
      <span className="font-mono text-[11px] leading-tight tracking-[0.12em] text-muted">
        <span className="block text-fg">{PROFILE.firstName}</span>
        {PROFILE.version}
      </span>
    </TransitionLink>
  );
}
