"use client";

import { useRef } from "react";
import { PROFILE } from "@/config/content";
import { useIntro } from "@/lib/useIntro";
import { TransitionLink } from "../PageTransition";
import { Monogram } from "./Monogram";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { tr } = useI18n();

  useIntro(ref);

  return (
    <section
      ref={ref}
      className="relative isolate grid flex-1 content-center overflow-hidden gap-12 px-5 pb-14 pt-10 nav:px-12 nav:py-16 min-[1100px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] min-[1100px]:items-center min-[1100px]:gap-14"
    >
      {/* marca d'água: invisível em TERMINAL/BLUEPRINT (--watermark-opacity: 0) */}
      <span aria-hidden="true" className="watermark -bottom-[0.12em] right-[2%] -z-10 text-[calc(clamp(14rem,34vw,34rem)*var(--display-scale))]">
        {PROFILE.initials}
      </span>

      <div className="@container min-w-0">
        <p data-intro="label" className="label mb-8">
          <span className="text-accent">SYS.01</span> — <Swap v={tr((d) => d.portfolio)} /> / {new Date().getFullYear()}
        </p>

        <h1 className="display -ml-[0.05em] [--fs:min(20cqi,12.5rem)]">
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-intro="line" className="block">
              {PROFILE.firstName}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-intro="line" className="name-accent block">
              {PROFILE.lastName}
            </span>
          </span>
        </h1>

        <div className="mt-10 grid gap-8 nav:grid-cols-[minmax(0,1fr)_auto] nav:items-end">
          <div data-intro="fade" className="max-w-[46ch] font-mono text-[13px] leading-relaxed text-muted nav:text-[14px]">
            <p className="label mb-3 !text-fg">
              <span className="text-accent">&gt;</span> <Swap v={PROFILE.role} />
            </p>
            <Swap block v={PROFILE.bio} />
          </div>
          <div data-intro="fade">
            <TransitionLink href="/projects" className="btn-bracket btn-primary">
              <Swap v={tr((d) => d.viewProjects)} />
              <span aria-hidden="true">→</span>
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
