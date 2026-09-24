"use client";

import { LOCALES, type Localized } from "@/i18n/config";
import { useI18n } from "./I18nProvider";

/**
 * Texto que muda com o idioma sem mexer no layout: as três versões ficam
 * empilhadas na mesma célula e só a ativa aparece. O bloco sempre ocupa o
 * tamanho da maior tradução, então trocar de idioma não empurra nada.
 */
export function Swap({
  v,
  block = false,
  align = "start",
  className = "",
}: {
  v: Localized<React.ReactNode>;
  block?: boolean;
  align?: "start" | "center" | "end";
  className?: string;
}) {
  const { locale } = useI18n();
  const justify = { start: "justify-items-start", center: "justify-items-center", end: "justify-items-end" }[align];
  return (
    <span className={`${block ? "grid" : "inline-grid"} ${justify} ${className}`}>
      {LOCALES.map((l) => {
        const active = l.id === locale;
        return (
          <span
            key={l.id}
            lang={l.htmlLang}
            aria-hidden={active ? undefined : true}
            className={`[grid-area:1/1] ${active ? "" : "invisible"}`}
          >
            {v[l.id]}
          </span>
        );
      })}
    </span>
  );
}
