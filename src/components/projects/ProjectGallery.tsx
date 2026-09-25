"use client";

import Image from "next/image";
import type { Project } from "@/config/content";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";

const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Telas do projeto em grade de 2 colunas (1 no celular). Cada uma em P&B que
 * ganha cor no hover, com legenda numerada (FIG.03, FIG.04...) continuando a capa.
 */
export function ProjectGallery({ project }: { project: Project }) {
  const { t, pick, tr } = useI18n();
  const shots = project.gallery ?? [];
  if (!shots.length) return null;

  return (
    <section data-reveal className="divider mt-12 grid gap-6 border-t border-line pt-8 nav:grid-cols-[14rem_minmax(0,1fr)] nav:gap-12">
      <h2 className="label !text-fg">
        <span className="text-accent">▦</span> — {t.projects.screens}
        <span className="mt-2 block text-muted">{pad(shots.length)}</span>
        {project.demoData ? (
          <span className="mt-4 inline-block border border-line-strong px-2 py-1 !text-[10px] text-muted">
            <Swap v={tr((d) => d.projects.demoData)} />
          </span>
        ) : null}
      </h2>
      <ul className="grid gap-6 sm:grid-cols-2">
        {shots.map((shot, i) => (
          <li key={shot.src}>
            <figure className="group">
              <div className="relative aspect-[16/10] overflow-hidden border border-line-strong bg-surface">
                <Image
                  src={shot.src}
                  alt={pick(shot.alt)}
                  fill
                  sizes="(min-width: 1100px) 40vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover object-top grayscale contrast-[1.05] transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.02] group-hover:grayscale-0"
                />
              </div>
              <figcaption className="label mt-3 flex gap-3">
                <span className="text-accent">FIG.{pad(i + 3)}</span>
                <Swap v={shot.caption} />
              </figcaption>
            </figure>
          </li>
        ))}
      </ul>
    </section>
  );
}
