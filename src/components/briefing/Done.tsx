"use client";

import { useState } from "react";
import type { Briefing, Respostas } from "@/briefings/types";
import { baixarPdf } from "./pdf";

type Props = { briefing: Briefing; respostas: Respostas; extra: string; autor: string; enviadoEm: number };

/** Confirmação: agradecimento com o nome dela, o prazo de retorno e a cópia em PDF. */
export function Done({ briefing, respostas, extra, autor, enviadoEm }: Props) {
  const [estado, setEstado] = useState<"parado" | "gerando" | "falhou">("parado");
  const nome = typeof respostas.nome === "string" ? respostas.nome.split(/\s+/)[0] : "";

  const baixar = async () => {
    setEstado("gerando");
    try {
      await baixarPdf(briefing, respostas, extra, autor, enviadoEm);
      setEstado("parado");
    } catch {
      setEstado("falhou");
    }
  };

  return (
    <div className="max-w-[44rem]">
      <p className="label">Enviado</p>
      <h2 tabIndex={-1} data-titulo className="bf-title mt-4 text-[clamp(1.75rem,4.4vw,3.5rem)] outline-none">
        {briefing.final.titulo}
      </h2>
      <p className="mt-5 max-w-[34rem] text-[clamp(1rem,1.4vw,1.25rem)] leading-relaxed text-muted">
        {nome ? <span className="text-fg">Obrigado, {nome}. </span> : null}
        {briefing.final.texto}
      </p>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3">
        <button type="button" onClick={baixar} disabled={estado === "gerando"} className="bf-primary">
          {estado === "gerando" ? "Gerando..." : "Baixar cópia em PDF"}
          {estado === "gerando" ? null : <span aria-hidden="true">↓</span>}
        </button>
        <a href="/" className="bf-ghost">
          Conhecer meu trabalho <span aria-hidden="true">↗</span>
        </a>
      </div>
      <p role="alert" className="mt-4 min-h-[1.5rem] text-[16px] text-fg">
        {estado === "falhou" ? "Não consegui gerar o PDF agora. Tente de novo." : null}
      </p>
    </div>
  );
}
