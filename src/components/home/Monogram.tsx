"use client";

import { useRef } from "react";
import { PROFILE } from "@/config/content";
import { gsap, useGSAP } from "@/lib/motion";
import { useI18n } from "../I18nProvider";

const Corner = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={`absolute size-4 border-accent ${className}`} />
);

/**
 * FIG.01 — monograma técnico. Ocupa o lugar da foto no hero.
 * Iniciais sólidas + cópia vazada deslocada (eco da "moldura deslocada"),
 * círculos de cota e mira. Parallax leve com o mouse.
 */
export function Monogram() {
  const ref = useRef<HTMLDivElement>(null);
  const { t } = useI18n();

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference) and (hover: hover) and (pointer: fine)", () => {
        const layers = gsap.utils.toArray<HTMLElement>("[data-depth]");
        const setters = layers.map((el) => ({
          depth: Number(el.dataset.depth),
          x: gsap.quickTo(el, "x", { duration: 0.8, ease: "power3" }),
          y: gsap.quickTo(el, "y", { duration: 0.8, ease: "power3" }),
        }));
        const move = (e: PointerEvent) => {
          const nx = e.clientX / window.innerWidth - 0.5;
          const ny = e.clientY / window.innerHeight - 0.5;
          setters.forEach((s) => {
            s.x(nx * s.depth);
            s.y(ny * s.depth);
          });
        };
        window.addEventListener("pointermove", move, { passive: true });
        return () => window.removeEventListener("pointermove", move);
      });
    },
    { scope: ref },
  );

  return (
    <figure
      ref={ref}
      data-intro="figure"
      className="group relative aspect-square w-full border border-line-strong bg-[color-mix(in_srgb,var(--surface)_70%,transparent)]"
      aria-label={`${t.monogram} ${PROFILE.initials}`}
    >
      <Corner className="-left-px -top-px border-l-2 border-t-2" />
      <Corner className="-right-px -top-px border-r-2 border-t-2" />
      <Corner className="-bottom-px -left-px border-b-2 border-l-2" />
      <Corner className="-bottom-px -right-px border-b-2 border-r-2" />

      <figcaption className="label absolute left-4 top-3 !text-[10px]">{t.monogram}</figcaption>
      <span className="label absolute right-4 top-3 !text-[10px]" aria-hidden="true">
        {t.scale}
      </span>

      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden="true" data-depth="-8">
        {/* mira */}
        <g stroke="var(--accent)" strokeWidth="1">
          <line x1="200" y1="28" x2="200" y2="140" />
          <line x1="200" y1="260" x2="200" y2="372" />
          <line x1="28" y1="200" x2="140" y2="200" />
          <line x1="260" y1="200" x2="372" y2="200" />
        </g>
        {/* círculos de cota */}
        <circle cx="200" cy="200" r="150" fill="none" stroke="var(--line-strong)" strokeDasharray="2 6" className="origin-center animate-[spin_90s_linear_infinite]" />
        <circle cx="200" cy="200" r="112" fill="none" stroke="var(--line)" />
        {/* marcas de grau */}
        <g stroke="var(--fg)" strokeWidth="1">
          {Array.from({ length: 24 }, (_, i) => (
            <line key={i} x1="200" y1="44" x2="200" y2={i % 6 === 0 ? 56 : 50} transform={`rotate(${i * 15} 200 200)`} opacity={i % 6 === 0 ? 0.9 : 0.35} />
          ))}
        </g>
      </svg>

      {/* iniciais */}
      <div className="absolute inset-0 grid place-items-center" data-depth="14">
        <div className="relative">
          <span
            aria-hidden="true"
            className="display vazado absolute left-0 top-0 block translate-x-[0.06em] translate-y-[0.06em] [--fs:clamp(5rem,12vw,10rem)] ![-webkit-text-stroke-color:var(--accent)] transition-transform duration-500 group-hover:translate-x-[0.1em] group-hover:translate-y-[0.1em]"
          >
            {PROFILE.initials}
          </span>
          <span className="display relative block [--fs:clamp(5rem,12vw,10rem)] text-fg">{PROFILE.initials}</span>
        </div>
      </div>

      {/* cota inferior */}
      <div className="absolute inset-x-4 bottom-3 flex items-center gap-3" aria-hidden="true">
        <span className="h-2 w-px bg-muted" />
        <span className="h-px flex-1 bg-line-strong" />
        <span className="label !text-[10px]">Ø 300</span>
        <span className="h-px flex-1 bg-line-strong" />
        <span className="h-2 w-px bg-muted" />
      </div>
    </figure>
  );
}
