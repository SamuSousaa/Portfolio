"use client";

import Image from "next/image";
import { useRef } from "react";
import { PROFILE } from "@/config/content";
import { gsap, useGSAP } from "@/lib/motion";
import { useI18n } from "../I18nProvider";

/** Fundo discreto para rótulos sobre a foto */
const CHIP = "bg-[color-mix(in_srgb,var(--c-bg)_80%,transparent)] px-1.5 py-0.5 !text-fg";

const Corner = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={`absolute size-4 border-accent ${className}`} />
);

/**
 * FIG.01 — visor do hero. Com PROFILE.heroPhoto: a foto preenche o quadro
 * (P&B, ganha cor no hover) e a mira, os círculos de cota e as marcas ficam
 * por cima, como num visor de câmera. Sem foto: monograma técnico (iniciais
 * sólidas + cópia vazada deslocada). Parallax leve com o mouse nos dois casos.
 */
export function Monogram() {
  const ref = useRef<HTMLDivElement>(null);
  const { t, pick } = useI18n();
  const photo = PROFILE.heroPhoto;

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
      aria-label={photo ? pick(photo.alt) : `${t.monogram} ${PROFILE.initials}`}
    >
      {/* foto: um pouco maior que o quadro, para o parallax não mostrar a borda */}
      {photo ? (
        <div className="absolute inset-0 overflow-hidden" aria-hidden="true">
          <div className="absolute -inset-3" data-depth="6">
            <Image
              src={photo.src}
              alt=""
              fill
              priority
              sizes="(min-width: 1100px) 460px, (min-width: 900px) 460px, 340px"
              style={{ objectPosition: photo.position ?? "50% 50%" }}
              className="object-cover grayscale contrast-[1.05] transition-[filter] duration-700 ease-out group-hover:grayscale-[.15]"
            />
          </div>
          {/* véu leve: mantém a mira e os rótulos legíveis sobre áreas claras */}
          <div className="absolute inset-0 bg-[color-mix(in_srgb,var(--c-bg)_18%,transparent)] transition-opacity duration-700 group-hover:opacity-0" />
        </div>
      ) : null}

      <Corner className="-left-px -top-px z-10 border-l-2 border-t-2" />
      <Corner className="-right-px -top-px z-10 border-r-2 border-t-2" />
      <Corner className="-bottom-px -left-px z-10 border-b-2 border-l-2" />
      <Corner className="-bottom-px -right-px z-10 border-b-2 border-r-2" />

      <figcaption className={`label absolute left-4 top-3 z-10 !text-[10px] ${photo ? CHIP : ""}`}>{photo ? t.portraitFig : t.monogram}</figcaption>
      <span className={`label absolute right-4 top-3 z-10 !text-[10px] ${photo ? CHIP : ""}`} aria-hidden="true">
        {t.scale}
      </span>

      {/* varredura de radar dentro do círculo de cota (só onde o tema define --dial-sweep; nunca sobre a foto) */}
      {!photo ? (
        <span aria-hidden="true" className="absolute inset-[12.5%]" data-depth="-8">
          <span className="dial-sweep block size-full rounded-full" />
        </span>
      ) : null}

      <svg viewBox="0 0 400 400" className="absolute inset-0 size-full" aria-hidden="true" data-depth="-8">
        {/* mira: com foto, só as pontas nas bordas, para não cortar o rosto */}
        <g stroke="var(--accent)" strokeWidth="1">
          <line x1="200" y1="28" x2="200" y2={photo ? 64 : 140} />
          <line x1="200" y1={photo ? 336 : 260} x2="200" y2="372" />
          <line x1="28" y1="200" x2={photo ? 64 : 140} y2="200" />
          <line x1={photo ? 336 : 260} y1="200" x2="372" y2="200" />
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

      {!photo ? (
      /*
        iniciais: a caixa de cada letra é aparada na altura das maiúsculas
        (text-box-trim), então o centro da caixa é o centro visual do "SS" em
        qualquer fonte. A cópia vazada fica 0,03 em para baixo/direita e a
        sólida 0,03 em para cima/esquerda: o PAR fica centrado na mira.
      */
      <div className="absolute inset-0 grid place-items-center" data-depth="14">
        <div className="vt-display-mono relative">
          <span
            aria-hidden="true"
            className="display vazado absolute inset-0 block translate-x-[0.03em] translate-y-[0.03em] whitespace-nowrap [--fs:clamp(5rem,12vw,10rem)] [text-box:trim-both_cap_alphabetic] ![-webkit-text-stroke-color:var(--accent)] transition-transform duration-500 group-hover:translate-x-[0.07em] group-hover:translate-y-[0.07em]"
          >
            {PROFILE.initials}
          </span>
          <span className="display relative block -translate-x-[0.03em] -translate-y-[0.03em] whitespace-nowrap text-fg [--fs:clamp(5rem,12vw,10rem)] [text-box:trim-both_cap_alphabetic]">
            {PROFILE.initials}
          </span>
        </div>
      </div>
      ) : null}

      {/* cota inferior */}
      <div className="absolute inset-x-4 bottom-3 z-10 flex items-center gap-3" aria-hidden="true">
        <span className="h-2 w-px bg-muted" />
        <span className="h-px flex-1 bg-line-strong" />
        <span className={`label !text-[10px] ${photo ? CHIP : ""}`}>Ø 300</span>
        <span className="h-px flex-1 bg-line-strong" />
        <span className="h-2 w-px bg-muted" />
      </div>
    </figure>
  );
}
