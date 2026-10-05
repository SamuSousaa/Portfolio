"use client";

import Image from "next/image";
import { useCallback, useRef, useState } from "react";
import type { Localized } from "@/i18n/config";
import type { Project } from "@/config/content";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";
import { ProjectCover } from "./ProjectCover";

const pad = (n: number) => String(n).padStart(2, "0");

const Corner = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={`absolute z-10 size-4 border-accent ${className}`} />
);

type Slide = { src: string; alt: Localized; caption: Localized };

/** Seta discreta na lateral do quadro; ganha fundo no acento com o hover. */
function Arrow({ dir, label, onClick }: { dir: "prev" | "next"; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className={`absolute top-1/2 z-10 grid size-11 -translate-y-1/2 nav:size-10 place-items-center border border-line-strong bg-[color-mix(in_srgb,var(--c-bg)_70%,transparent)] font-mono text-fg opacity-60 backdrop-blur-sm transition-[opacity,background-color,border-color,color] duration-200 hover:border-accent hover:bg-accent hover:text-on-accent hover:opacity-100 focus-visible:opacity-100 ${
        dir === "prev" ? "left-3" : "right-3"
      }`}
    >
      <span aria-hidden="true">{dir === "prev" ? "←" : "→"}</span>
    </button>
  );
}

/**
 * Visor do projeto: capa + telas no mesmo quadro, em loop, trocadas pelas setas das
 * laterais, pelo teclado (← →) ou deslizando o dedo. O quadro é limitado pela altura
 * da janela, para caber inteiro na tela. Só telas de desktop (16:10): as de celular
 * têm lugar próprio na página (funcionalidades ou a faixa "no celular").
 */
export function ProjectViewer({ project }: { project: Project }) {
  const { t, tr, pick } = useI18n();
  const p = t.projects;
  const slides: Slide[] = [
    ...(project.cover ? [{ ...project.cover, caption: tr((d) => d.projects.coverCaption) }] : []),
    ...(project.gallery ?? []),
  ];
  const [index, setIndex] = useState(0);
  const touch = useRef<number | null>(null);
  const mobile = project.device === "mobile";
  const go = useCallback((to: number) => setIndex((to + slides.length) % slides.length), [slides.length]);

  // sem imagem nenhuma: a prancha técnica de sempre
  if (!slides.length) return <ProjectCover project={project} priority />;
  const many = slides.length > 1;

  return (
    <figure
      data-intro="figure"
      tabIndex={0}
      aria-roledescription="carousel"
      aria-label={`${project.name} — ${pad(index + 1)} / ${pad(slides.length)}`}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") go(index + 1);
        if (e.key === "ArrowLeft") go(index - 1);
      }}
      className="group relative w-full outline-none"
    >
      <div
        // sempre 16:10 (as imagens são 16:10: nada é cortado). Largura toda do conteúdo, mas nunca
        // mais alto que a janela (menos o topo e uma folga): aí o quadro estreita e fica centrado.
        className="relative mx-auto aspect-[16/10] w-[min(100%,calc((100svh-var(--topbar-h)-5rem)*1.6))] overflow-hidden border border-line-strong bg-surface"
        onPointerDown={(e) => (touch.current = e.clientX)}
        onPointerUp={(e) => {
          if (touch.current === null) return;
          const dx = e.clientX - touch.current;
          touch.current = null;
          if (many && Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <Corner className="-left-px -top-px border-l-2 border-t-2" />
        <Corner className="-right-px -top-px border-r-2 border-t-2" />
        <Corner className="-bottom-px -left-px border-b-2 border-l-2" />
        <Corner className="-bottom-px -right-px border-b-2 border-r-2" />

        {/* todas empilhadas e já carregadas; a atual aparece num crossfade curto */}
        {slides.map((s, i) => (
          <div
            key={s.src}
            aria-hidden={i !== index}
            className={`absolute inset-0 transition-opacity duration-300 ease-out ${i === index ? "opacity-100" : "pointer-events-none opacity-0"}`}
          >
            <Image
              src={s.src}
              alt={pick(s.alt)}
              fill
              priority={i === 0}
              sizes="(min-width: 900px) calc(100vw - 340px), 100vw"
              quality={90}
              className="object-cover object-top"
            />
          </div>
        ))}

        {many ? (
          <>
            <Arrow dir="prev" label={p.prevScreen} onClick={() => go(index - 1)} />
            <Arrow dir="next" label={p.nextScreen} onClick={() => go(index + 1)} />
          </>
        ) : null}

        {/* legenda da tela atual + contador; avisos do projeto no canto oposto */}
        <figcaption className="label absolute left-4 top-3 z-10 bg-[color-mix(in_srgb,var(--c-bg)_80%,transparent)] px-1.5 py-0.5 !text-[11px] !text-fg">
          <span className="tabular-nums text-accent">
            {pad(index + 1)}/{pad(slides.length)}
          </span>{" "}
          — <Swap v={slides[index].caption} />
        </figcaption>
        {/* no celular os avisos descem para o rodapé do quadro, para não cobrir a legenda */}
        <div className="absolute bottom-3 left-4 z-10 flex gap-2 nav:bottom-auto nav:left-auto nav:right-4 nav:top-3">
          {mobile ? (
            <span className="label bg-[color-mix(in_srgb,var(--c-bg)_80%,transparent)] px-1.5 py-0.5 !text-[11px] text-accent">
              <Swap v={tr((d) => d.projects.mobileFirst)} />
            </span>
          ) : null}
          {project.demoData ? (
            <span className="label bg-[color-mix(in_srgb,var(--c-bg)_80%,transparent)] px-1.5 py-0.5 !text-[11px]">
              <Swap v={tr((d) => d.projects.demoData)} />
            </span>
          ) : null}
        </div>
      </div>
    </figure>
  );
}
