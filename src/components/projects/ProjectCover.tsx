"use client";

import Image from "next/image";
import type { Project } from "@/config/content";
import { useI18n } from "../I18nProvider";

const Corner = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={`absolute z-10 size-4 border-accent ${className}`} />
);

/**
 * Capa do projeto. Com imagem: P&B que ganha cor no hover, moldura deslocada (receita 4).
 * Sem imagem: prancha técnica com a inicial vazada, no lugar reservado para a foto.
 */
export function ProjectCover({ project, priority = false }: { project: Project; priority?: boolean }) {
  const { t, pick } = useI18n();

  return (
    <figure data-intro="figure" className="group relative">
      {/* moldura deslocada */}
      <span
        aria-hidden="true"
        className="absolute inset-0 border border-accent transition-transform duration-500 ease-out group-hover:translate-x-2.5 group-hover:translate-y-2.5"
      />
      <div className={`relative overflow-hidden ${project.cover ? "aspect-[16/10]" : "aspect-[16/10] nav:aspect-[21/9]"} border border-line-strong bg-surface`}>
        <Corner className="-left-px -top-px border-l-2 border-t-2" />
        <Corner className="-right-px -top-px border-r-2 border-t-2" />
        <Corner className="-bottom-px -left-px border-b-2 border-l-2" />
        <Corner className="-bottom-px -right-px border-b-2 border-r-2" />

        {project.cover ? (
          <Image
            src={project.cover.src}
            alt={pick(project.cover.alt)}
            fill
            priority={priority}
            sizes="(min-width: 900px) calc(100vw - 360px), 100vw"
            className="object-cover grayscale contrast-[1.05] transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.02] group-hover:grayscale-[.15]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
            <svg viewBox="0 0 1600 1000" preserveAspectRatio="none" className="absolute inset-0 size-full">
              <g stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke">
                <line x1="0" y1="0" x2="1600" y2="1000" vectorEffect="non-scaling-stroke" />
                <line x1="1600" y1="0" x2="0" y2="1000" vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
            <span className="vt-display-cover display vazado relative [--fs:clamp(8rem,26vw,22rem)] leading-none ![-webkit-text-stroke-color:var(--line-strong)] group-hover:![-webkit-text-stroke-color:var(--accent)]">
              {project.name.charAt(0)}
            </span>
          </div>
        )}

        {/* sobre a imagem, o rótulo ganha um fundo para não sumir */}
        <figcaption
          className={`label absolute left-4 top-3 z-10 !text-[11px] ${project.cover ? "bg-[color-mix(in_srgb,var(--c-bg)_80%,transparent)] px-1.5 py-0.5 !text-fg" : ""}`}
        >
          {t.projects.cover}
        </figcaption>
        {!project.cover ? (
          <span className="label absolute bottom-3 right-4 z-10 !text-[11px]">{t.projects.noImage}</span>
        ) : null}
      </div>
    </figure>
  );
}
