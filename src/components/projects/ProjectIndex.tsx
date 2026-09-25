"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { PROJECTS } from "@/config/content";
import { useIntro } from "@/lib/useIntro";
import { gsap, prefersReducedMotion, useGSAP } from "@/lib/motion";
import { ProjectThumb } from "./ProjectThumb";
import { TransitionLink } from "../PageTransition";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";

const pad = (n: number) => String(n).padStart(2, "0");
const COLS = "nav:grid-cols-[3.5rem_minmax(0,1.1fr)_minmax(0,1.5fr)_minmax(0,1fr)_4.5rem_2rem]";

/**
 * Prévia flutuante (só com mouse, ≥900 px): a capa do projeto sob o cursor segue o
 * ponteiro com um pequeno atraso. Todas as capas ficam empilhadas; só a ativa aparece.
 */
function HoverPreview({ active }: { active: number | null }) {
  const box = useRef<HTMLDivElement>(null);
  const { pick } = useI18n();

  useGSAP(() => {
    const el = box.current;
    if (!el) return;
    const d = prefersReducedMotion() ? 0 : 0.45;
    const x = gsap.quickTo(el, "x", { duration: d, ease: "power3" });
    const y = gsap.quickTo(el, "y", { duration: d, ease: "power3" });
    const move = (e: PointerEvent) => {
      // à direita do cursor; perto da borda direita, vira para a esquerda
      const w = el.offsetWidth;
      x(e.clientX + 28 + w > window.innerWidth ? e.clientX - 28 - w : e.clientX + 28);
      y(e.clientY - el.offsetHeight / 2);
    };
    window.addEventListener("pointermove", move, { passive: true });
    return () => window.removeEventListener("pointermove", move);
  });

  return (
    <div
      ref={box}
      aria-hidden="true"
      className={`index-preview pointer-events-none fixed left-0 top-0 z-[60] w-[340px] transition-[opacity,scale] duration-300 ease-out ${
        active === null ? "scale-95 opacity-0" : "scale-100 opacity-100"
      }`}
    >
      <div className="relative aspect-[16/10] overflow-hidden border border-accent bg-surface">
        {PROJECTS.map((project, i) => (
          <div key={project.slug} className={`absolute inset-0 transition-opacity duration-200 ${i === active ? "opacity-100" : "opacity-0"}`}>
            {project.cover ? (
              <Image src={project.cover.src} alt={pick(project.cover.alt)} fill sizes="340px" className="object-cover object-top" />
            ) : (
              <div className="grid size-full place-items-center">
                <span className="display vazado [--fs:4rem] ![-webkit-text-stroke-color:var(--accent)]">{project.name.charAt(0)}</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Índice de projetos em tabela; a linha inteira é o link e se preenche com o acento. */
export function ProjectIndex() {
  const ref = useRef<HTMLElement>(null);
  const { t, pick } = useI18n();
  const [active, setActive] = useState<number | null>(null);
  useIntro(ref);

  return (
    <section ref={ref} className="px-5 pb-20 nav:px-12" aria-label={t.projects.entries}>
      <div data-intro="fade" className={`label hidden border-b border-line-strong pb-3 nav:grid ${COLS} nav:gap-6`}>
        <span>#</span>
        <span>{t.projects.colProject}</span>
        <span>{t.projects.colDescription}</span>
        <span>{t.projects.colStack}</span>
        <span>{t.projects.colYear}</span>
        <span />
      </div>

      <ol className="border-t border-line-strong nav:border-t-0" onPointerLeave={() => setActive(null)}>
        {PROJECTS.map((project, i) => (
          <li key={project.slug} data-intro="fade" className="border-b border-line" onPointerEnter={() => setActive(i)}>
            <TransitionLink
              href={`/projects/${project.slug}`}
              data-fill
              className={`group grid gap-3 px-2 py-6 transition-colors duration-200 hover:bg-accent hover:text-on-accent nav:items-center nav:gap-6 nav:py-7 ${COLS}`}
            >
              <span className="label flex justify-between group-hover:!text-on-accent nav:block">
                <span>{pad(i + 1)}</span>
                <span className="nav:hidden">{project.year}</span>
              </span>
              <ProjectThumb project={project} sizes="100vw" className="nav:hidden" />
              {/* a coluna do nome é um container: nomes longos (WELLNESSY) encolhem para caber em qualquer tema */}
              <span className="@container block min-w-0">
                <span
                  className="display block whitespace-nowrap transition-transform duration-300 group-hover:translate-x-1.5"
                  style={{ "--fs": `min(clamp(2.25rem,4vw,3.25rem), calc(125cqi / ${project.name.length}))` } as React.CSSProperties}
                >
                  {project.name}
                </span>
              </span>
              <span className="font-mono text-[13px] leading-relaxed text-muted group-hover:text-on-accent">
                <Swap block v={project.description} />
              </span>
              <span className="flex flex-wrap gap-2">
                {project.stack.map((s) => (
                  <span key={s} className="border border-line-strong px-2 py-1 font-mono text-[11px] uppercase tracking-[0.1em] group-hover:border-current">
                    {s}
                  </span>
                ))}
              </span>
              <span className="label hidden group-hover:!text-on-accent nav:block">{project.year}</span>
              <span aria-hidden="true" className="hidden font-mono text-lg transition-transform duration-300 group-hover:translate-x-1 nav:block">
                →
              </span>
            </TransitionLink>
          </li>
        ))}
      </ol>

      <HoverPreview active={active} />

      <p data-intro="fade" className="mt-8 font-mono text-[12px] text-muted">
        <span className="text-accent">$</span> ls projects/ <span className="text-fg">→ {pad(PROJECTS.length)}</span>
        <span className="caret mt-1 block">{t.projects.moreSoon}</span>
      </p>
    </section>
  );
}
