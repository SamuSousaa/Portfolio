"use client";

import { useId } from "react";
import { subVisivel } from "@/briefings/logic";
import type { Arquivo as ArquivoEnviado, PerguntaGrupo, ValorGrupo } from "@/briefings/types";
import { Arquivo } from "./Arquivo";
import { Opcoes } from "./Opcoes";
import { Texto } from "./Texto";

type Props = { slug: string; pergunta: PerguntaGrupo; valor: ValorGrupo; onChange: (v: ValorGrupo) => void; erroId?: string };

const TIPO = { texto: "text", email: "email", tel: "tel", link: "url", data: "date" } as const;

/** Vários campos na mesma tela, gravados numa chave só. Campos com `quando` aparecem conforme os irmãos. */
export function Grupo({ slug, pergunta, valor, onChange, erroId }: Props) {
  const id = useId();
  const campos = pergunta.campos.filter((c) => subVisivel(c, valor));
  const primeiraLista = campos.find((c) => c.tipo === "unica");
  const primeiroTexto = campos.find((c) => c.tipo !== "unica" && c.tipo !== "arquivo");
  const mudar = (nome: string, v: string | ArquivoEnviado | undefined) => onChange({ ...valor, [nome]: v });

  return (
    <div className="grid max-w-[40rem] gap-7">
      {campos.map((c, i) => {
        const rotuloId = `${id}-${c.nome}`;
        const v = valor[c.nome];
        const texto = typeof v === "string" ? v : "";
        return (
          <div key={c.nome}>
            {/* a 1ª lista de opções responde à própria pergunta: o rótulo fica só para leitores de tela */}
            <span id={rotuloId} className={c.tipo === "unica" && i === 0 ? "sr-only" : "label mb-2 block"}>
              {c.rotulo}
            </span>
            {c.tipo === "unica" ? (
              <Opcoes
                opcoes={c.opcoes ?? []}
                valor={texto ? [texto] : []}
                onChange={([escolha]) => mudar(c.nome, escolha)}
                rotuloId={rotuloId}
                atalhos={c === primeiraLista}
              />
            ) : c.tipo === "arquivo" ? (
              <Arquivo slug={slug} rotulo={c.rotulo} valor={typeof v === "object" ? v : undefined} onChange={(a) => mudar(c.nome, a)} />
            ) : (
              <Texto
                valor={texto}
                onChange={(s) => mudar(c.nome, s)}
                longo={c.tipo === "texto_longo"}
                tipo={c.tipo === "texto_longo" ? "text" : TIPO[c.tipo]}
                placeholder={c.placeholder}
                rotuloId={rotuloId}
                erroId={erroId}
                pequeno
                foco={c === primeiroTexto && !primeiraLista}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
