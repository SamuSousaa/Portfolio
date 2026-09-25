"use client";

import { useRef } from "react";
import { findNav, navNumber } from "@/config/nav";
import { LOCALES, type Localized } from "@/i18n/config";
import { useIntro } from "@/lib/useIntro";
import { useI18n } from "./I18nProvider";
import { Swap } from "@/components/Swap";

type Props = {
  href: string;
  /** Substitui o rótulo da aba como título (ex.: nome do projeto) */
  title?: string;
  note?: Localized;
  /** Texto extra no fim do rótulo de sistema (ex.: "01 ENTRADAS") */
  meta?: string;
  children?: React.ReactNode;
};

/** Cabeçalho padrão de página interna, com a mesma entrada do hero. */
export function PageTitle({ href, title, note, meta, children }: Props) {
  const ref = useRef<HTMLElement>(null);
  const { pick } = useI18n();
  const nav = findNav(href);
  const labels = nav?.item.label;
  const label = nav ? pick(nav.item.label) : "";
  useIntro(ref);

  return (
    <section ref={ref} className="px-5 pb-12 pt-14 nav:px-12 nav:pb-16 nav:pt-20">
      <p data-intro="label" className="label mb-6">
        <span className="text-accent">{nav ? navNumber(nav.index) : "--"}.</span> / {label}
        {title ? ` / ${title.toUpperCase()}` : ""}
        {meta ? <span className="text-fg"> — {meta}</span> : null}
      </p>
      <h1 className="vt-display-title display -ml-[0.04em] [--fs:clamp(3.25rem,11vw,10rem)]">
        <span className="block overflow-hidden pb-[calc(var(--fs)*0.05)]">
          <span data-intro="line" className="block">
            {title ?? (labels ? <Swap v={labels} /> : null)}
          </span>
        </span>
      </h1>
      {note ? (
        <p data-intro="fade" className="mt-8 max-w-[52ch] font-mono text-[13px] leading-relaxed text-muted">
          {/* o cursor piscando vai dentro de cada tradução, colado na última palavra (e não numa linha própria) */}
          <Swap v={Object.fromEntries(LOCALES.map((l) => [l.id, <>{note[l.id]}<span className="caret" aria-hidden="true" /></>])) as Localized<React.ReactNode>} />
        </p>
      ) : null}
      {children}
    </section>
  );
}
