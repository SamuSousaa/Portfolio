"use client";

import { useRef } from "react";
import { findNav, navNumber } from "@/config/nav";
import type { Localized } from "@/i18n/config";
import { useIntro } from "@/lib/useIntro";
import { useI18n } from "./I18nProvider";

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
  const label = nav ? pick(nav.item.label) : "";
  useIntro(ref);

  return (
    <section ref={ref} className="px-5 pb-12 pt-14 nav:px-12 nav:pb-16 nav:pt-20">
      <p data-intro="label" className="label mb-6">
        <span className="text-accent">{nav ? navNumber(nav.index) : "--"}.</span> / {label}
        {title ? ` / ${title.toUpperCase()}` : ""}
        {meta ? <span className="text-fg"> — {meta}</span> : null}
      </p>
      <h1 className="display -ml-[0.04em] text-[clamp(3.25rem,11vw,10rem)]">
        <span className="block overflow-hidden pb-[0.05em]">
          <span data-intro="line" className="block">
            {title ?? label}
          </span>
        </span>
      </h1>
      {note ? (
        <p data-intro="fade" className="caret mt-8 max-w-[52ch] font-mono text-[13px] leading-relaxed text-muted">
          {pick(note)}
        </p>
      ) : null}
      {children}
    </section>
  );
}
