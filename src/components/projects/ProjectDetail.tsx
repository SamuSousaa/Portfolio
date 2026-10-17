"use client";

import { useRef } from "react";
import { PROJECTS, type Project } from "@/config/content";
import type { Localized } from "@/i18n/config";
import { navNumber, findNav } from "@/config/nav";
import { useIntro } from "@/lib/useIntro";
import { useReveal } from "@/lib/useReveal";
import { TransitionLink } from "../PageTransition";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";
import { ProjectViewer } from "./ProjectViewer";
import { ProjectScreens } from "./ProjectScreens";

const pad = (n: number) => String(n).padStart(2, "0");

export function ProjectDetail({ project }: { project: Project }) {
  const top = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const { t, pick, tr } = useI18n();
  useIntro(top);
  useReveal(body);

  const p = t.projects;
  const nav = findNav("/projects");
  const index = PROJECTS.findIndex((x) => x.slug === project.slug);
  const next = PROJECTS.length > 1 ? PROJECTS[(index + 1) % PROJECTS.length] : null;

  // ficha em linhas pontilhadas: rótulo ..... valor
  const meta = [
    { label: p.year, value: project.year },
    { label: p.role, value: project.role ? pick(project.role) : null },
    {
      label: p.status,
      value: project.status ? (
        <span className="inline-flex items-center gap-2">
          {project.status === "live" ? <span className="status-dot" aria-hidden="true" /> : null}
          {p.statusLabel[project.status]}
        </span>
      ) : null,
    },
    {
      label: p.colStack,
      // cada tecnologia inteira numa linha, com o "·" preso a ela: a quebra só acontece entre itens
      value: project.stack.map((s, i) => (
        <span key={s}>
          {i ? " " : null}
          <span className="whitespace-nowrap">
            {s}
            {i < project.stack.length - 1 ? " ·" : null}
          </span>
        </span>
      )),
    },
  ];

  // a faixa logo abaixo do topo: o resumo curto, ou as três primeiras seções enquanto ele não existe
  const brief: { label: string; body: Localized }[] = project.brief
    ? [
        { label: p.problem, body: project.brief.problem },
        { label: p.solution, body: project.brief.solution },
        { label: p.result, body: project.brief.result },
      ]
    : (project.sections ?? []).slice(0, 3).map((s) => ({ label: pick(s.title).toUpperCase(), body: s.body }));

  const links = [
    project.links?.live && { href: project.links.live, label: p.live },
    project.links?.repo && { href: project.links.repo, label: p.repo },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <section ref={top} className="@container px-5 pt-10 nav:px-12 nav:pt-14">
        <div className="mb-10 flex flex-wrap items-baseline justify-between gap-x-6 gap-y-3 nav:mb-12">
          <TransitionLink
            href="/projects"
            data-intro="label"
            className="hit font-mono text-[11px] tracking-[0.14em] text-muted transition-colors [--hit-y:15px] hover:text-accent"
          >
            [ ← <Swap v={tr((d) => d.projects.allProjects)} /> ]
          </TransitionLink>
          <p data-intro="label" className="label">
            <span className="text-accent">{nav ? navNumber(nav.index) : "--"}.</span> / {nav ? pick(nav.item.label) : ""} /{" "}
            <span className="text-fg">
              {pad(index + 1)} — {project.name.toUpperCase()}
            </span>
          </p>
        </div>

        {/* topo dividido: tudo o que se precisa saber à esquerda, as telas à direita */}
        <div className="grid gap-10 @[52rem]:grid-cols-[minmax(0,5fr)_minmax(0,8fr)] @[52rem]:items-start @[52rem]:gap-12">
          <div className="@container">
            {/* o nome cabe na coluna: curtos chegam a 8rem, longos encolhem (125cqi ÷ letras, folga para os temas de fonte larga) */}
            <h1
              className="vt-display-title display -ml-[0.04em] whitespace-nowrap"
              style={{ "--fs": `min(8rem, calc(125cqi / ${project.name.length}))` } as React.CSSProperties}
            >
              <span className="-mt-[calc(var(--fs)*0.2)] block overflow-hidden pb-[calc(var(--fs)*0.05)] pt-[calc(var(--fs)*0.2)]">
                <span data-intro="line" className="block">
                  {project.name}
                </span>
              </span>
            </h1>
            <p data-intro="fade" className="mt-5 flex gap-[1ch] font-mono text-[14px] leading-relaxed text-muted">
              <span className="text-accent">&gt;</span>
              <Swap block v={project.description} />
            </p>

            <dl data-intro="fade" className="mt-8 grid gap-3 border-t border-line pt-5 font-mono text-[12px] uppercase tracking-[0.08em]">
              {meta.map((m) => (
                <div key={m.label} className="flex items-baseline gap-3">
                  <dt className="label shrink-0">{m.label}</dt>
                  <span aria-hidden="true" className="min-w-6 flex-1 border-b border-dotted border-line-strong" />
                  <dd className={`max-w-[70%] text-right leading-relaxed ${m.value ? "text-fg" : "text-muted"}`}>{m.value ?? "—"}</dd>
                </div>
              ))}
            </dl>

            {project.partners?.length ? (
              <p data-intro="fade" className="label mt-5">
                <Swap v={tr((d) => d.projects.partners)} />{" "}
                {project.partners.map((pt, i) => (
                  <span key={pt.url}>
                    {i ? ", " : null}
                    <a
                      href={pt.url}
                      target="_blank"
                      rel="noreferrer"
                      className="hit text-fg underline decoration-line-strong underline-offset-4 transition-colors [--hit-y:15px] hover:text-accent hover:decoration-accent"
                    >
                      {pt.name} ↗
                    </a>
                  </span>
                ))}
              </p>
            ) : null}

            {links.length ? (
              <div data-intro="fade" className="mt-7 flex flex-wrap gap-3">
                {links.map((l) => (
                  <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn-bracket">
                    {l.label}
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            ) : null}
          </div>

          <ProjectViewer project={project} />
        </div>
      </section>

      <div ref={body} className="@container px-5 pb-20 pt-16 nav:px-12 nav:pt-20">
        {/* problema · solução · resultado, numa faixa só */}
        {brief.length ? (
          <section data-reveal aria-label={p.overview} className="divider grid border-t border-line @[48rem]:grid-cols-3">
            {brief.map((b, i) => (
              <div key={b.label} className={`py-6 @[48rem]:py-8 ${i ? "border-t border-line @[48rem]:border-l @[48rem]:border-t-0 @[48rem]:pl-8" : ""} @[48rem]:pr-8`}>
                <h2 className="label">
                  <span className="tabular-nums text-accent">{pad(i + 1)}</span> — <span className="!text-fg">{b.label}</span>
                </h2>
                <p className="mt-4 max-w-[38ch] text-[clamp(15px,1.1vw,17px)] leading-relaxed text-fg">
                  <Swap block v={b.body} />
                </p>
              </div>
            ))}
          </section>
        ) : null}

        <ProjectScreens project={project} label={project.features?.length ? p.features : p.onMobile} />

        {/* próximo projeto (ou volta ao índice quando só há um) */}
        <div data-reveal className="mt-20 border-t border-line-strong">
          <TransitionLink
            href={next ? `/projects/${next.slug}` : "/projects"}
            data-fill
            className="group flex items-end justify-between gap-6 px-2 py-8 transition-colors duration-200 hover:bg-accent hover:text-on-accent"
          >
            <span>
              <span className="label mb-3 block group-hover:!text-on-accent">{next ? p.next : t.index}</span>
              <span className="display block [--fs:clamp(2.5rem,7vw,6rem)]">{next ? next.name : <Swap v={tr((d) => d.projects.allProjects)} />}</span>
            </span>
            <span aria-hidden="true" className="font-mono text-3xl transition-transform duration-300 group-hover:translate-x-2">
              →
            </span>
          </TransitionLink>
        </div>
      </div>
    </>
  );
}
