"use client";

import Image from "next/image";
import { useRef } from "react";
import { EXPERIENCE, PROFILE, SKILLS, SKILL_HIGHLIGHTS } from "@/config/content";
import { findNav, navNumber } from "@/config/nav";
import { useIntro } from "@/lib/useIntro";
import { useReveal } from "@/lib/useReveal";
import { HudStatus } from "../Hud";
import { TransitionLink } from "../PageTransition";
import { useI18n } from "../I18nProvider";
import { Swap } from "@/components/Swap";

const pad = (n: number) => String(n).padStart(2, "0");

/** "2.9055°S 41.7734°W" */
const coords = ({ lat, lng }: { lat: number; lng: number }) =>
  `${Math.abs(lat).toFixed(4)}°${lat < 0 ? "S" : "N"} ${Math.abs(lng).toFixed(4)}°${lng < 0 ? "W" : "E"}`;

const Awaiting = ({ cmd, text }: { cmd: string; text: string }) => (
  <div className="flex flex-col gap-2 font-mono text-[12px] text-muted">
    <p>
      <span className="text-accent">$</span> {cmd}
    </p>
    <p className="caret">{text}</p>
  </div>
);

const Corner = ({ className }: { className: string }) => (
  <span aria-hidden="true" className={`absolute z-10 size-4 border-accent ${className}`} />
);

/** Cabeçalho de seção: letra no acento + título, na coluna estreita. */
const SectionHead = ({ letter, title, meta }: { letter: string; title: string; meta?: string }) => (
  <div className="flex items-baseline justify-between gap-4 nav:block">
    <h2 className="label !text-fg">
      <span className="text-accent">{letter}</span> — {title}
    </h2>
    {meta ? <p className="label nav:mt-2">{meta}</p> : null}
  </div>
);

/** Retrato. Com foto: P&B que ganha cor no hover. Sem foto: prancha técnica com as iniciais vazadas. */
function Portrait() {
  const { t, pick } = useI18n();
  const photo = PROFILE.portrait;

  return (
    <figure data-intro="figure" data-probe="portrait" className="group relative">
      <span
        aria-hidden="true"
        className="absolute inset-0 border border-accent transition-transform duration-500 ease-out group-hover:translate-x-2.5 group-hover:translate-y-2.5"
      />
      <div className="relative aspect-[4/5] overflow-hidden border border-line-strong bg-surface">
        <Corner className="-left-px -top-px border-l-2 border-t-2" />
        <Corner className="-right-px -top-px border-r-2 border-t-2" />
        <Corner className="-bottom-px -left-px border-b-2 border-l-2" />
        <Corner className="-bottom-px -right-px border-b-2 border-r-2" />

        {photo ? (
          <Image
            src={photo.src}
            alt={pick(photo.alt)}
            fill
            priority
            sizes="(min-width: 900px) 480px, 100vw"
            style={{ objectPosition: photo.position }}
            className="object-cover grayscale contrast-[1.05] transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.02] group-hover:grayscale-[.15]"
          />
        ) : (
          <div className="absolute inset-0 grid place-items-center" aria-hidden="true">
            {/* mira: cruz central + círculo de enquadramento */}
            <svg viewBox="0 0 400 500" className="absolute inset-0 size-full">
              <g fill="none" stroke="var(--line-strong)" strokeWidth="1" vectorEffect="non-scaling-stroke">
                <line x1="200" y1="0" x2="200" y2="500" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="250" x2="400" y2="250" vectorEffect="non-scaling-stroke" />
                <circle cx="200" cy="250" r="150" vectorEffect="non-scaling-stroke" />
              </g>
            </svg>
            <span className="vt-display-cover display vazado relative [--fs:clamp(6rem,14vw,11rem)] leading-none ![-webkit-text-stroke-color:var(--line-strong)] group-hover:![-webkit-text-stroke-color:var(--accent)]">
              {PROFILE.initials}
            </span>
          </div>
        )}

        {/* sobre a foto, o rótulo ganha um fundo para não sumir em áreas claras */}
        <figcaption
          className={`label absolute left-4 top-3 z-10 !text-[10px] ${photo ? "bg-[color-mix(in_srgb,var(--c-bg)_80%,transparent)] px-1.5 py-0.5 !text-fg" : ""}`}
        >
          {t.about.portrait}
        </figcaption>
        {!photo ? <span className="label absolute bottom-3 right-4 z-10 !text-[10px]">{t.about.noImage}</span> : null}
      </div>
    </figure>
  );
}

export function About() {
  const top = useRef<HTMLElement>(null);
  const body = useRef<HTMLDivElement>(null);
  const { t, pick } = useI18n();
  useIntro(top);
  useReveal(body);

  const a = t.about;
  const self = findNav("/about");
  const contact = findNav("/contact");

  const spec = [
    { label: a.name, value: `${PROFILE.firstName} ${PROFILE.lastName}` },
    { label: a.role, value: <Swap v={PROFILE.role} /> },
    {
      label: a.base,
      value: (
        <span className="flex flex-col gap-1">
          <span>{PROFILE.location.city}</span>
          <span className="text-[11px] text-muted">{coords(PROFILE.location)}</span>
        </span>
      ),
    },
    { label: a.status, value: <HudStatus /> },
  ];

  return (
    <>
      {/*
        primeira dobra: título, foto, bio e ficha cabem juntos na tela (≥1100 px).
        A foto é limitada pela ALTURA da janela (4:5 → largura = altura × 0,8);
        a altura da foto define a da seção, e a ficha fica colada na base dela.
        Abaixo de 1100 px vira uma coluna só: título, foto, bio, ficha.
      */}
      <section
        ref={top}
        className="grid gap-10 px-5 pb-16 pt-14 nav:px-12 min-[1100px]:grid-cols-[auto_minmax(0,1fr)] min-[1100px]:grid-rows-[auto_1fr] min-[1100px]:gap-x-12 min-[1100px]:gap-y-6 min-[1100px]:py-12 min-[1100px]:[grid-template-areas:'photo_head'_'photo_info']"
      >
        <header className="min-[1100px]:[grid-area:head]">
          <p data-intro="label" className="label mb-5">
            <span className="text-accent">{self ? navNumber(self.index) : "--"}.</span> / {self ? pick(self.item.label) : ""}
          </p>
          <h1 className="vt-display-title display -ml-[0.04em] [--fs:clamp(3.25rem,min(6.5vw,10svh),6.5rem)]">
            <span className="block overflow-hidden pb-[calc(var(--fs)*0.05)]">
              <span data-intro="line" className="block">
                {self ? <Swap v={self.item.label} /> : null}
              </span>
            </span>
          </h1>
        </header>

        <div className="w-full max-w-[30rem] min-[1100px]:w-[min(34vw,calc((100svh-var(--topbar-h)-6rem)*0.8))] min-[1100px]:max-w-none min-[1100px]:[grid-area:photo]">
          <Portrait />
        </div>

        <div className="flex flex-col min-[1100px]:[grid-area:info]">
          <p data-intro="label" className="label mb-4">
            <span className="text-accent">&gt;</span> whoami
          </p>
          <p data-intro="fade" data-probe="lead" className="text-[clamp(18px,1.75vw,26px)] leading-[1.3] tracking-[-0.01em] text-fg min-[1100px]:mb-8">
            <Swap block v={PROFILE.bio} />
          </p>

          <dl data-intro="fade" data-probe="spec" className="mt-10 grid grid-cols-2 border-l border-t border-line min-[1100px]:mt-auto">
            {spec.map((s) => (
              <div key={s.label} className="border-b border-r border-line bg-surface px-5 py-5 min-[1100px]:py-4">
                <dt className="label mb-3 min-[1100px]:mb-2">{s.label}</dt>
                <dd className="font-mono text-[13px] uppercase tracking-[0.08em] text-fg">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <div ref={body} className="px-5 pb-20 pt-4 nav:px-12 nav:pt-8">
        {/* A — perfil (texto longo) */}
        <section data-reveal data-probe="about-text" className="divider grid gap-6 border-t border-line pt-8 nav:grid-cols-[14rem_minmax(0,1fr)] nav:gap-12">
          <SectionHead letter="A" title={a.profile} />
          {PROFILE.about.length ? (
            <div className="flex max-w-[62ch] flex-col gap-5 text-[clamp(15px,1.1vw,17px)] leading-relaxed text-fg">
              {PROFILE.about.map((para, i) => (
                <p key={i}>
                  <Swap block v={para} />
                </p>
              ))}
            </div>
          ) : (
            <Awaiting cmd={a.fetchAbout} text={t.awaiting} />
          )}
        </section>

        {/* B — stack */}
        <section data-reveal data-probe="stack" className="divider mt-16 grid gap-6 border-t border-line pt-8 nav:grid-cols-[14rem_minmax(0,1fr)] nav:gap-12">
          <SectionHead letter="B" title={a.stack} meta={pad(SKILLS.reduce((n, g) => n + g.items.length, 0))} />
          {SKILLS.length ? (
            <div>
            {/* legenda dos principais */}
            <p className="label mb-4 flex items-center gap-2">
              <span aria-hidden="true" className="size-2.5 bg-accent" />
              {a.core}
            </p>
            <dl className="border-t border-line">
              {SKILLS.map((g, i) => (
                <div
                  key={g.group.en}
                  className="grid gap-3 border-b border-line py-5 sm:grid-cols-[3rem_12rem_minmax(0,1fr)] sm:items-baseline sm:gap-6"
                >
                  <span className="label hidden sm:block">{pad(i + 1)}</span>
                  <dt className="label !text-fg">
                    <Swap v={g.group} />
                  </dt>
                  <dd className="flex flex-wrap gap-2">
                    {g.items.map((s) => {
                      const name = typeof s === "string" ? s : s.en;
                      const core = SKILL_HIGHLIGHTS.includes(name);
                      return (
                        <span
                          key={name}
                          className={`border px-2.5 py-1.5 font-mono text-[11px] uppercase tracking-[0.1em] transition-colors duration-200 hover:border-accent hover:bg-accent hover:text-on-accent ${
                            core ? "border-accent text-accent" : "border-line-strong text-fg"
                          }`}
                        >
                          {core ? <span className="sr-only">{a.core}: </span> : null}
                          {typeof s === "string" ? s : <Swap v={s} />}
                        </span>
                      );
                    })}
                  </dd>
                </div>
              ))}
            </dl>
            </div>
          ) : (
            <Awaiting cmd={a.fetchStack} text={t.awaiting} />
          )}
        </section>

        {/* C — trajetória */}
        <section data-reveal data-probe="trajectory" className="divider mt-16 grid gap-6 border-t border-line pt-8 nav:grid-cols-[14rem_minmax(0,1fr)] nav:gap-12">
          <SectionHead letter="C" title={a.trajectory} meta={pad(EXPERIENCE.length)} />
          {EXPERIENCE.length ? (
            <ol className="border-l border-line-strong">
              {EXPERIENCE.map((xp) => (
                <li key={xp.period + xp.org} className="relative border-b border-line py-5 pl-6 last:border-b-0">
                  <span aria-hidden="true" className="absolute -left-[5px] top-7 size-[9px] border border-accent bg-bg" />
                  <p className="label">{xp.period}</p>
                  <p className="mt-1 text-[17px] text-fg">
                    <Swap v={xp.role} />
                  </p>
                  <p className="font-mono text-[12px] text-muted">{xp.org}</p>
                </li>
              ))}
            </ol>
          ) : (
            <Awaiting cmd={a.fetchExperience} text={t.awaiting} />
          )}
        </section>

        {/* próximo passo: contato */}
        <div data-reveal data-probe="cta" className="mt-20 border-t border-line-strong">
          <TransitionLink
            href="/contact"
            data-fill
            className="group flex items-end justify-between gap-6 px-2 py-8 transition-colors duration-200 hover:bg-accent hover:text-on-accent"
          >
            <span>
              <span className="label mb-3 block group-hover:!text-on-accent">
                {contact ? `${navNumber(contact.index)}. ` : ""}
                {a.nextStep}
              </span>
              <span className="display block [--fs:clamp(2.5rem,7vw,6rem)]">
                {contact ? <Swap v={contact.item.label} /> : null}
              </span>
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
