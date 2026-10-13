"use client";

import type { ItemLink, Pergunta, Valor, ValorGrupo } from "@/briefings/types";
import { Grupo } from "./fields/Grupo";
import { Links } from "./fields/Links";
import { Opcoes } from "./fields/Opcoes";
import { Texto } from "./fields/Texto";

type Props = {
  slug: string;
  pergunta: Pergunta;
  /** Posição entre as perguntas que se aplicam (1, 2, 3...) */
  numero: number;
  valor: Valor | undefined;
  onChange: (v: Valor | undefined) => void;
  /** Escolha única: responde e já avança */
  onEscolher: (v: string) => void;
  erro: string | null;
};

export const TITULO_ID = "bf-pergunta";
const ERRO_ID = "bf-erro";

/** Uma pergunta na tela: numeração, título, ajuda, o campo do tipo certo e o erro. */
export function Question({ slug, pergunta: p, numero, valor, onChange, onEscolher, erro }: Props) {
  const erroId = erro ? ERRO_ID : undefined;
  return (
    <div>
      <p className="label">
        Pergunta {String(numero).padStart(2, "0")} <span aria-hidden="true">·</span> {p.obrigatoria ? <span className="text-fg">Obrigatória</span> : "Opcional"}
      </p>
      <h2 id={TITULO_ID} tabIndex={-1} className="bf-title mt-4 max-w-[22em] text-[clamp(1.5rem,3.4vw,2.75rem)] outline-none">
        {p.titulo}
      </h2>
      {p.ajuda ? <p className="mt-4 max-w-[38rem] text-[16px] leading-relaxed text-muted">{p.ajuda}</p> : null}

      <div className="mt-8 nav:mt-10">
        {p.tipo === "texto" || p.tipo === "texto_longo" ? (
          <div className="max-w-[40rem]">
            <Texto
              valor={typeof valor === "string" ? valor : ""}
              onChange={onChange}
              longo={p.tipo === "texto_longo"}
              placeholder={p.placeholder ?? "Escreva aqui"}
              rotuloId={TITULO_ID}
              erroId={erroId}
              invalido={!!erro}
              foco
            />
          </div>
        ) : p.tipo === "unica" ? (
          <Opcoes opcoes={p.opcoes} valor={typeof valor === "string" ? [valor] : []} onChange={([v]) => onEscolher(v)} rotuloId={TITULO_ID} atalhos />
        ) : p.tipo === "multipla" ? (
          <Opcoes
            multipla
            opcoes={p.opcoes}
            max={p.max}
            outro={p.outro}
            valor={Array.isArray(valor) ? (valor as string[]) : []}
            onChange={(v) => onChange(v.length ? v : undefined)}
            rotuloId={TITULO_ID}
            atalhos
          />
        ) : p.tipo === "links" ? (
          <Links pergunta={p} valor={Array.isArray(valor) ? (valor as ItemLink[]) : []} onChange={onChange} erroId={erroId} />
        ) : p.tipo === "grupo" ? (
          <Grupo
            slug={slug}
            pergunta={p}
            valor={valor && typeof valor === "object" && !Array.isArray(valor) ? (valor as ValorGrupo) : {}}
            onChange={onChange}
            erroId={erroId}
          />
        ) : null}
      </div>

      {/* o espaço do erro existe sempre: a mensagem não empurra nada */}
      <p id={ERRO_ID} role="alert" className="mt-4 min-h-[1.5rem] text-[16px] text-fg">
        {erro ? (
          <>
            <span className="font-mono text-[12px] tracking-[0.14em]" aria-hidden="true">
              [!]{" "}
            </span>
            {erro}
          </>
        ) : null}
      </p>
    </div>
  );
}
