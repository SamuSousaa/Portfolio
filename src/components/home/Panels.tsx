"use client";

import { useRef } from "react";
import { EXPERIENCE, FEATURED_SLOTS, PROFILE, PROJECTS } from "@/config/content";
import { useReveal } from "@/lib/useReveal";
import { TransitionLink } from "../PageTransition";
import { HudStatus } from "../Hud";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";
import { ProjectThumb } from "../projects/ProjectThumb";

const pad = (n: number) => String(n).padStart(2, "0");

function PanelHead({ index, title, meta }: { index: string; title: string; meta: string }) {
  return (
    <div className="flex items-center justify-between border-b border-line px-5 py-3">
      <p className="label !text-fg">
        <span className="text-accent">{index}</span> — {title}
      </p>
      <p className="label">{meta}</p>
    </div>
  );
}

export function Panels() {
  const ref = useRef<HTMLElement>(null);
  const { t } = useI18n();

  useReveal(ref);

  // os primeiros FEATURED_SLOTS projetos; o que faltar vira slot vazio (o índice completo fica em /projects)
  const slots = Array.from({ length: FEATURED_SLOTS }, (_, i) => PROJECTS[i] ?? null);

  const info = [
    { label: t.discipline, value: t.disciplineValue },
    { label: t.currentStatus, value: <HudStatus /> },
    { label: t.location, value: PROFILE.location.city },
  ];

  return (
    <section ref={ref} className="px-5 py-14 nav:px-12 nav:py-20" aria-label={t.a11y.dashboard}>
      <p className="label mb-6">{t.panel}</p>

      {/* blocos de informação */}
      <dl data-reveal className="grid border-l border-t border-line sm:grid-cols-3">
        {info.map((item) => (
          <div key={item.label} className="border-b border-r border-line bg-surface px-5 py-5">
            <dt className="label mb-3">{item.label}</dt>
            <dd className="font-mono text-[13px] uppercase tracking-[0.08em] text-fg">{item.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 grid gap-6 min-[1100px]:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
        {/* projetos em destaque */}
        <div data-reveal className="border border-line bg-surface">
          <PanelHead index="A" title={t.featured} meta={`${pad(slots.filter(Boolean).length)} / ${pad(slots.length)}`} />
          {/*
            subgrid: cada card ocupa 6 linhas (cabeçalho, miniatura, nome, descrição, stack, abrir)
            compartilhadas pelos três, então nomes e stacks ficam alinhados na horizontal
            mesmo com descrições e stacks de tamanhos diferentes.
          */}
          <ul className="grid md:grid-cols-3 md:grid-rows-[auto_auto_auto_auto_1fr_auto]">
            {slots.map((project, i) =>
              project ? (
                <li key={project.slug} className="border-b border-line md:contents">
                  <TransitionLink
                    href={`/projects/${project.slug}`}
                    data-fill
                    className={`group flex h-full flex-col p-5 transition-colors duration-200 hover:bg-accent hover:text-on-accent md:row-span-6 md:grid md:grid-rows-subgrid md:gap-0 ${i < slots.length - 1 ? "md:border-r md:border-line" : ""}`}
                  >
                    <span className="label flex justify-between group-hover:!text-on-accent">
                      <span>{pad(i + 1)}</span>
                      <span>{project.year}</span>
                    </span>
                    <ProjectThumb project={project} sizes="(min-width: 1100px) 22vw, (min-width: 768px) 30vw, 100vw" className="mt-4 group-hover:border-current" />
                    {/*
                      o nome acompanha a largura do card (nomes longos cabem em qualquer tema).
                      O container fica neste invólucro, não no link: contenção de layout
                      desligaria o subgrid do card.
                    */}
                    <span className="@container block pt-6">
                      <span className="display block whitespace-nowrap [--fs:min(2.5rem,11cqi)]">{project.name}</span>
                    </span>
                    <span className="mt-3 font-mono text-[12px] leading-relaxed text-muted group-hover:text-on-accent">
                      <Swap block v={project.description} />
                    </span>
                    <span className="mt-4 flex flex-wrap content-start gap-2">
                      {project.stack.map((s) => (
                        <span key={s} className="border border-line-strong px-2 py-1 font-mono text-[10px] uppercase tracking-[0.1em] group-hover:border-current">
                          {s}
                        </span>
                      ))}
                    </span>
                    <span className="mt-5 self-end font-mono text-[11px] tracking-[0.14em]">{t.open} →</span>
                  </TransitionLink>
                </li>
              ) : (
                <li
                  key={`slot-${i}`}
                  className="divider flex flex-col border-b border-line p-5 md:row-span-6 md:border-b-0 md:border-r md:last:border-r-0"
                >
                  <span className="label">{pad(i + 1)}</span>
                  <span className="mt-4 grid h-16 place-items-center md:mt-auto md:h-auto md:aspect-[4/3] border border-dashed border-line-strong">
                    <span className="label caret">{t.emptySlot}</span>
                  </span>
                </li>
              ),
            )}
          </ul>
        </div>

        {/* experiência */}
        <div data-reveal className="flex flex-col border border-line bg-surface">
          <PanelHead index="B" title={t.experience} meta={pad(EXPERIENCE.length)} />
          {EXPERIENCE.length ? (
            // as entradas dividem a altura do painel (que estica até a altura dos destaques)
            <ol className="flex flex-1 flex-col">
              {EXPERIENCE.map((xp) => (
                <li key={xp.period + xp.org} className="divider flex flex-1 flex-col justify-center border-b border-line px-5 py-4 last:border-b-0">
                  <p className="label">{xp.period}</p>
                  <p className="mt-1 text-[15px] text-fg">
                    <Swap block v={xp.role} />
                  </p>
                  <p className="font-mono text-[12px] text-muted">{xp.org}</p>
                </li>
              ))}
            </ol>
          ) : (
            <div className="flex flex-1 flex-col justify-center gap-2 px-5 py-10 font-mono text-[12px] text-muted">
              <p>
                <span className="text-accent">$</span> fetch --experience
              </p>
              <p className="caret">{t.awaiting}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
