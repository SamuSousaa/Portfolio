"use client";

import { useRef } from "react";
import { PROFILE } from "@/config/content";
import { useIntro } from "@/lib/useIntro";
import { TransitionLink } from "../PageTransition";
import { Monogram } from "./Monogram";
import { useI18n } from "../I18nProvider";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { t, pick } = useI18n();

  useIntro(ref);

  return (
    <section
      ref={ref}
      className="grid flex-1 content-center gap-12 px-5 pb-14 pt-10 nav:px-12 nav:py-16 min-[1100px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] min-[1100px]:items-center min-[1100px]:gap-14"
    >
      <div className="@container min-w-0">
        <p data-intro="label" className="label mb-8">
          <span className="text-accent">SYS.01</span> — {t.portfolio} / {new Date().getFullYear()}
        </p>

        <h1 className="display -ml-[0.05em] text-[min(20cqi,12.5rem)]">
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-intro="line" className="block">
              {PROFILE.firstName}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-intro="line" className="vazado block">
              {PROFILE.lastName}
            </span>
          </span>
        </h1>

        <div className="mt-10 grid gap-8 nav:grid-cols-[minmax(0,1fr)_auto] nav:items-end">
          <div data-intro="fade" className="max-w-[46ch] font-mono text-[13px] leading-relaxed text-muted nav:text-[14px]">
            <p className="label mb-3 !text-fg">
              <span className="text-accent">&gt;</span> {pick(PROFILE.role)}
            </p>
            <p>{pick(PROFILE.bio)}</p>
          </div>
          <div data-intro="fade">
            <TransitionLink href="/projects" className="btn-bracket">
              {t.viewProjects}<span aria-hidden="true">→</span>
            </TransitionLink>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[340px] justify-self-start nav:max-w-[460px] min-[1100px]:justify-self-end">
        <Monogram />
      </div>
    </section>
  );
}
