"use client";

import { MARQUEE } from "@/config/content";
import { LOCALES } from "@/i18n/config";
import { useI18n } from "../I18nProvider";

/*
 * Largura exata de uma volta, sem medir no navegador: a fonte é monoespaçada
 * (JetBrains Mono e IBM Plex Mono têm avanço de 0,6 em), então
 *   caractere = 12px × (0,6 + 0,16 de letter-spacing) = 9,12 px
 *   cada palavra ainda tem 2 × 24 px de respiro + o separador.
 * A duração sai de largura ÷ --marquee-speed (globals.css): mesma velocidade em
 * qualquer idioma, e a troca de tema nunca mexe na animação.
 */
const CHAR_PX = 12 * (0.6 + 0.16);
const WORD_PX = 48 + CHAR_PX; // respiro + "-"
const SEPARATOR = "-";

/**
 * Faixa de palavras-chave no acento, em loop contínuo. As três versões (EN/PT/ES)
 * rodam juntas, empilhadas; só a do idioma ativo aparece. Conteúdo duplicado
 * para o loop não ter emenda.
 */
export function Marquee() {
  const { locale } = useI18n();

  return (
    <div className="grid overflow-hidden border-y border-accent bg-accent py-3 font-mono text-[12px] tracking-[0.16em] text-on-accent">
      <p className="sr-only">{MARQUEE[locale].join(", ")}</p>
      <div className="vt-marquee grid">
        {LOCALES.map((l) => {
          const words = MARQUEE[l.id];
          const runPx = words.join("").length * CHAR_PX + words.length * WORD_PX;
          const run = (
            <span className="flex shrink-0 items-center">
              {words.map((word) => (
                <span key={word} className="flex items-center">
                  <span className="px-6">{word}</span>
                  <span aria-hidden="true">{SEPARATOR}</span>
                </span>
              ))}
            </span>
          );
          return (
            <div
              key={l.id}
              aria-hidden="true"
              className={`trilho w-max justify-self-start [grid-area:1/1] ${l.id === locale ? "" : "invisible"}`}
              style={{ "--run": runPx.toFixed(2) } as React.CSSProperties}
            >
              {run}
              {run}
            </div>
          );
        })}
      </div>
    </div>
  );
}
