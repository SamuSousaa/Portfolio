"use client";

import { MARQUEE } from "@/config/content";
import { useI18n } from "../I18nProvider";

/** Faixa de palavras-chave no acento. Conteúdo duplicado para o loop não ter emenda. */
export function Marquee() {
  const words = useI18n().pick(MARQUEE);
  const run = (
    <span className="flex shrink-0 items-center">
      {words.map((word) => (
        <span key={word} className="flex items-center">
          <span className="px-6">{word}</span>
          <span aria-hidden="true">✦</span>
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden border-y border-accent bg-accent py-3 font-mono text-[12px] tracking-[0.16em] text-on-accent">
      <p className="sr-only">{words.join(", ")}</p>
      <div className="trilho" aria-hidden="true">
        {run}
        {run}
      </div>
    </div>
  );
}
