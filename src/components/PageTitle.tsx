"use client";

import { findNav, navNumber } from "@/config/nav";
import type { Localized } from "@/i18n/config";
import { useI18n } from "./I18nProvider";

/** Cabeçalho padrão de página interna (provisório enquanto as páginas não têm conteúdo). */
export function PageTitle({ href, title, note }: { href: string; title?: string; note?: Localized }) {
  const { pick } = useI18n();
  const nav = findNav(href);
  const label = nav ? pick(nav.item.label) : "";
  return (
    <section className="px-5 pb-16 pt-14 nav:px-12 nav:pt-20">
      <p className="label mb-6">
        <span className="text-accent">{nav ? navNumber(nav.index) : "--"}.</span> / {label}
        {title ? ` / ${title.toUpperCase()}` : ""}
      </p>
      <h1 className="display -ml-[0.04em] text-[clamp(3.25rem,11vw,10rem)]">{title ?? label}</h1>
      {note ? <p className="caret mt-8 max-w-[52ch] font-mono text-[13px] leading-relaxed text-muted">{pick(note)}</p> : null}
    </section>
  );
}
