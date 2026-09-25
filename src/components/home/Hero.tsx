"use client";

import { useRef } from "react";
import { PROFILE } from "@/config/content";
import { useIntro } from "@/lib/useIntro";
import { TransitionLink } from "../PageTransition";
import { Monogram } from "./Monogram";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";
import { LogoMark } from "@/components/LogoMark";

/*
 * "A" montado em segmentos independentes que se sobrepõem (pernas cruzadas no
 * ápice + barra por cima), desenhado sobre o glifo da fonte. Só aparece nos
 * temas que ligam .glyph-a (COBALTO); nos outros fica o "A" da própria fonte.
 * Coordenadas em milésimos de em, nas métricas da Unbounded: ascendente 995,
 * descendente 245, altura das maiúsculas 750, largura de tinta 984.
 */
const A_LEGS = "M0 995 L230 995 L607 245 L377 245 Z M984 995 L754 995 L377 245 L607 245 Z";
const A_BAR = "M110 690 H874 V860 H110 Z";

function GlyphA() {
  return (
    <span className="glyph-a">
      A
      <svg aria-hidden="true" viewBox="0 0 984 1240" preserveAspectRatio="none">
        <path d={A_LEGS} />
        <path d={A_BAR} />
      </svg>
    </span>
  );
}

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
      <LogoMark className="vt-display-watermark watermark -bottom-[6%] right-[2%] -z-10 h-[clamp(12rem,30vw,30rem)] w-auto" />

      <div className="@container min-w-0">
        <p data-intro="label" className="label mb-8">
          <span className="text-accent">SYS.01</span> — <Swap v={tr((d) => d.portfolio)} /> / {new Date().getFullYear()}
        </p>

        <h1 className="vt-display-title display -ml-[0.05em] [--fs:min(18cqi,11.25rem)] tracking-[calc(var(--display-tracking)_-_0.03em)]">
          <span className="block overflow-hidden pb-[calc(var(--fs)*0.04)]">
            <span data-intro="line" className="block">
              {PROFILE.firstName}
            </span>
          </span>
          <span className="block overflow-hidden pb-[calc(var(--fs)*0.06)]">
            <span data-intro="line" className="name-accent block">
              {PROFILE.lastName.split(/(A)/).map((part, i) => (part === "A" ? <GlyphA key={i} /> : part))}
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
