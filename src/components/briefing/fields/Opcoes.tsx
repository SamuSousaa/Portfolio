"use client";

import { useEffect, useId } from "react";
import { LIMITES } from "@/briefings/logic";
import type { Opcao } from "@/briefings/types";

type Props = {
  opcoes: Opcao[];
  /** Marcadas: uma em escolha única, várias em múltipla */
  valor: string[];
  onChange: (v: string[]) => void;
  multipla?: boolean;
  max?: number;
  /** Campo de texto livre "Outro" (só em múltipla) */
  outro?: boolean;
  rotuloId: string;
  /** Liga as teclas 1–9 (uma lista por tela) */
  atalhos?: boolean;
};

/** Opções como blocos retos, com a tecla de atalho à vista: [1], [2]... */
export function Opcoes({ opcoes, valor, onChange, multipla, max, outro, rotuloId, atalhos }: Props) {
  const outroId = useId();
  const marcadas = valor.filter((v) => opcoes.some((o) => o.valor === v));
  const livre = valor.find((v) => !opcoes.some((o) => o.valor === v)) ?? "";
  const cheio = !!max && marcadas.length + (livre.trim() ? 1 : 0) >= max;

  const alternar = (v: string) => {
    if (!multipla) return onChange([v]);
    if (marcadas.includes(v)) return onChange(valor.filter((x) => x !== v));
    if (!cheio) onChange([...marcadas, v, ...(livre ? [livre] : [])]);
  };

  // teclas 1–9: fora dos campos de texto, para não roubar o que está sendo digitado
  useEffect(() => {
    if (!atalhos) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey || !/^[1-9]$/.test(e.key)) return;
      if ((e.target as HTMLElement).closest?.("input, textarea, select")) return;
      const opcao = opcoes[Number(e.key) - 1];
      if (!opcao) return;
      e.preventDefault();
      alternar(opcao.valor);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  return (
    <div>
      <div
        role={multipla ? "group" : "radiogroup"}
        aria-labelledby={rotuloId}
        className={`grid gap-2 ${opcoes.length > 4 ? "sm:grid-cols-2" : "max-w-[34rem]"}`}
      >
        {opcoes.map((o, i) => {
          const marcada = marcadas.includes(o.valor);
          return (
            <button
              key={o.valor}
              type="button"
              role={multipla ? "checkbox" : "radio"}
              aria-checked={marcada}
              aria-disabled={(cheio && !marcada) || undefined}
              onClick={() => alternar(o.valor)}
              className="bf-option"
            >
              {atalhos && i < 9 ? (
                <span className="bf-key bf-key--atalho" aria-hidden="true">
                  [{i + 1}]
                </span>
              ) : null}
              <span className="min-w-0 flex-1">{o.rotulo}</span>
              {/* a marca ocupa o lugar mesmo vazia: marcar não muda a largura do texto */}
              <span className="bf-key w-[1.5em] text-right" aria-hidden="true">
                {marcada ? "✓" : ""}
              </span>
            </button>
          );
        })}
      </div>

      {outro ? (
        <div className="mt-5 max-w-[34rem]">
          <label id={outroId} className="label block">
            Outra
          </label>
          <input
            type="text"
            value={livre}
            maxLength={LIMITES.outro}
            placeholder="Escreva aqui"
            aria-labelledby={outroId}
            disabled={cheio && !livre}
            onChange={(e) => onChange(e.target.value ? [...marcadas, e.target.value] : marcadas)}
            className="bf-input bf-input--sm"
          />
        </div>
      ) : null}
    </div>
  );
}
