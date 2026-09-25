"use client";

import { useRef } from "react";
import { PROJECTS, type Project } from "@/config/content";
import { navNumber, findNav } from "@/config/nav";
import { useIntro } from "@/lib/useIntro";
import { useReveal } from "@/lib/useReveal";
import { TransitionLink } from "../PageTransition";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";
import { ProjectViewer } from "./ProjectViewer";

const Awaiting = ({ text }: { text: string }) => (
  <p className="font-mono text-[12px] text-muted">
    <span className="text-accent">$</span> <span className="caret">{text}</span>
  </p>
);

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

  const meta = [
    { label: p.year, value: project.year },
    { label: p.role, value: project.role ? pick(project.role) : null },
    { label: p.colStack, value: project.stack.join(" · ") },
    {
      label: p.status,
      value: project.status ? (
        <span className="flex items-center gap-2">
          {project.status === "live" ? <span className="status-dot" aria-hidden="true" /> : null}
          {p.statusLabel[project.status]}
        </span>
      ) : null,
    },
  ];
  const links = [
    project.links?.live && { href: project.links.live, label: p.live },
    project.links?.repo && { href: project.links.repo, label: p.repo },
  ].filter(Boolean) as { href: string; label: string }[];

  return (
    <>
      <section ref={top} className="@container px-5 pt-10 nav:px-12 nav:pt-14">
        <div data-intro="label" className="mb-10">
          <TransitionLink href="/projects" className="font-mono text-[11px] tracking-[0.14em] text-muted transition-colors hover:text-accent">
            [ ← <Swap v={tr((d) => d.projects.allProjects)} /> ]
          </TransitionLink>
        </div>

        <p data-intro="label" className="label mb-6">
          <span className="text-accent">{nav ? navNumber(nav.index) : "--"}.</span> / {nav ? pick(nav.item.label) : ""} /{" "}
          <span className="text-fg">
            {String(index + 1).padStart(2, "0")} — {project.name.toUpperCase()}
          </span>
        </p>
        {/* o título cabe na largura: nomes curtos ficam em 13vw, longos encolhem (125cqi ÷ letras, folga para os temas de fonte larga) */}
        <h1
          className="vt-display-title display -ml-[0.04em] whitespace-nowrap"
          style={{ "--fs": `min(12rem, 13vw, calc(125cqi / ${project.name.length}))` } as React.CSSProperties}
        >
          <span className="block overflow-hidden pb-[calc(var(--fs)*0.05)]">
            <span data-intro="line" className="block">
              {project.name}
            </span>
          </span>
        </h1>
        <p data-intro="fade" className="mt-6 flex max-w-[52ch] gap-[1ch] font-mono text-[14px] leading-relaxed text-muted">
          <span className="text-accent">&gt;</span>
          <Swap block v={project.description} />
        </p>

        {/* ficha técnica */}
        <dl data-intro="fade" className="mt-12 grid grid-cols-2 border-l border-t border-line nav:grid-cols-4">
          {meta.map((m) => (
            <div key={m.label} className="border-b border-r border-line bg-surface px-5 py-5">
              <dt className="label mb-3">{m.label}</dt>
              <dd className={`font-mono text-[13px] uppercase tracking-[0.08em] ${m.value ? "text-fg" : "text-muted"}`}>
                {m.value ?? "—"}
              </dd>
            </div>
          ))}
        </dl>

        {project.partners?.length ? (
          <p data-intro="fade" className="label mt-6">
            <Swap v={tr((d) => d.projects.partners)} />{" "}
            {project.partners.map((pt, i) => (
              <span key={pt.url}>
                {i ? ", " : null}
                <a href={pt.url} target="_blank" rel="noreferrer" className="text-fg underline decoration-line-strong underline-offset-4 transition-colors hover:text-accent hover:decoration-accent">
                  {pt.name} ↗
                </a>
              </span>
            ))}
          </p>
        ) : null}

        {links.length ? (
          <div data-intro="fade" className="mt-6 flex flex-wrap gap-3">
            {links.map((l) => (
              <a key={l.href} href={l.href} target="_blank" rel="noreferrer" className="btn-bracket">
                {l.label}
                <span aria-hidden="true">↗</span>
              </a>
            ))}
          </div>
        ) : null}

        <div className="mt-12">
          <ProjectViewer project={project} />
        </div>
      </section>

      <div ref={body} className="px-5 pb-20 pt-16 nav:px-12 nav:pt-24">
        {/* visão geral */}
        <section data-reveal className="divider grid gap-6 border-t border-line pt-8 nav:grid-cols-[14rem_minmax(0,1fr)] nav:gap-12">
          <h2 className="label !text-fg">
            <span className="text-accent">A</span> — {p.overview}
          </h2>
          {project.overview ? (
            <p className="max-w-[62ch] text-[clamp(15px,1.1vw,17px)] leading-relaxed text-fg">{pick(project.overview)}</p>
          ) : (
            <Awaiting text={t.awaiting} />
          )}
        </section>

        {project.sections?.map((s, i) => (
          <section
            key={i}
            data-reveal
            className="divider mt-12 grid gap-6 border-t border-line pt-8 nav:grid-cols-[14rem_minmax(0,1fr)] nav:gap-12"
          >
            <h2 className="label !text-fg">
              <span className="text-accent">{String.fromCharCode(66 + i)}</span> — {pick(s.title).toUpperCase()}
            </h2>
            <p className="max-w-[62ch] text-[clamp(15px,1.1vw,17px)] leading-relaxed text-fg">{pick(s.body)}</p>
          </section>
        ))}

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
