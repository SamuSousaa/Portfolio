"use client";

import { useId, useState } from "react";
import { LIMITES } from "@/briefings/logic";
import type { ItemLink, PerguntaLinks } from "@/briefings/types";
import { Texto } from "./Texto";

type Props = { pergunta: PerguntaLinks; valor: ItemLink[]; onChange: (v: ItemLink[]) => void; erroId?: string };

const VAZIO: ItemLink = { link: "", comentario: "" };

/** Lista de sites, cada um com um comentário. Começa no mínimo pedido e cresce até o máximo. */
export function Links({ pergunta, valor, onChange, erroId }: Props) {
  const id = useId();
  const [extras, setExtras] = useState(0);
  const total = Math.min(pergunta.max, Math.max(pergunta.min ?? 1, valor.length) + extras);
  const itens = Array.from({ length: total }, (_, i) => valor[i] ?? VAZIO);
  const mudar = (i: number, parte: Partial<ItemLink>) => onChange(itens.map((item, n) => (n === i ? { ...item, ...parte } : item)));

  return (
    <div className="max-w-[40rem]">
      <ol className="grid gap-7">
        {itens.map((item, i) => (
          <li key={i} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-x-3">
            <span className="label pt-[1.05rem]" aria-hidden="true">
              {String(i + 1).padStart(2, "0")}
            </span>
            <div>
              <span id={`${id}-l${i}`} className="sr-only">
                Endereço do site {i + 1}
              </span>
              <Texto
                tipo="url"
                pequeno
                valor={item.link}
                onChange={(link) => mudar(i, { link })}
                placeholder="Endereço do site"
                rotuloId={`${id}-l${i}`}
                erroId={erroId}
                foco={i === 0}
              />
              <span id={`${id}-c${i}`} className="sr-only">
                Comentário sobre o site {i + 1}
              </span>
              <input
                type="text"
                value={item.comentario}
                maxLength={LIMITES.comentario}
                placeholder={pergunta.placeholderComentario ?? "Comentário"}
                aria-labelledby={`${id}-c${i}`}
                onChange={(e) => mudar(i, { comentario: e.target.value })}
                className="bf-input bf-input--sm"
              />
            </div>
          </li>
        ))}
      </ol>
      {total < pergunta.max ? (
        <button type="button" onClick={() => setExtras((n) => n + 1)} className="bf-ghost mt-4 ml-11">
          + Adicionar outro
        </button>
      ) : null}
    </div>
  );
}
