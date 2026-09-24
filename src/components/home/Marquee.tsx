"use client";

import { MARQUEE } from "@/config/content";
import { LOCALES } from "@/i18n/config";
import { useI18n } from "../I18nProvider";

/** Segundos por caractere: mesma velocidade em px para qualquer idioma. */
const SECONDS_PER_CHAR = 0.42;

/**
 * Faixa de palavras-chave no acento. As três versões (EN/PT/ES) rodam juntas,
 * empilhadas; só a do idioma ativo aparece. Trocar de idioma vira um crossfade
 * entre faixas já em movimento, sem salto. Conteúdo duplicado para o loop não ter emenda.
 */
export function Marquee() {
  const { locale } = useI18n();

  return (
    <div className="grid overflow-hidden border-y border-accent bg-accent py-3 font-mono text-[12px] tracking-[0.16em] text-on-accent">
      <p className="sr-only">{MARQUEE[locale].join(", ")}</p>
      {LOCALES.map((l) => {
        const words = MARQUEE[l.id];
        const chars = words.join("").length + words.length * 4;
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
          <div
            key={l.id}
            aria-hidden="true"
            className={`trilho w-max justify-self-start [grid-area:1/1] ${l.id === locale ? "" : "invisible"}`}
            style={{ animationDuration: `${chars * SECONDS_PER_CHAR}s` }}
          >
            {run}
            {run}
          </div>
        );
      })}
    </div>
  );
}
