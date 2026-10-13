"use client";

import { useId } from "react";
import { LIMITES, linhas, visiveis } from "@/briefings/logic";
import type { Briefing, Respostas } from "@/briefings/types";

type Props = {
  briefing: Briefing;
  /** Respostas já limpas (só as perguntas que se aplicam) */
  respostas: Respostas;
  extra: string;
  onExtra: (v: string) => void;
  onEditar: (chave: string) => void;
  onEnviar: () => void;
  enviando: boolean;
  /** Mensagem da última tentativa que falhou */
  falha: string | null;
  /** Honeypot: campo invisível; preenchido = robô */
  isca: string;
  onIsca: (v: string) => void;
};

/** Tudo o que ela respondeu, por etapa, com "editar" em cada resposta, o campo final e o envio. */
export function Summary({ briefing, respostas, extra, onExtra, onEditar, onEnviar, enviando, falha, isca, onIsca }: Props) {
  const extraId = useId();
  const itens = visiveis(briefing, respostas);

  return (
    <div className="max-w-[56rem]">
      <p className="label">Resumo</p>
      <h2 tabIndex={-1} data-titulo className="bf-title mt-4 text-[clamp(1.5rem,3.4vw,2.75rem)] outline-none">
        {briefing.resumo.titulo}
      </h2>
      <p className="mt-4 max-w-[38rem] text-[16px] leading-relaxed text-muted">{briefing.resumo.texto}</p>

      {briefing.etapas.map((etapa, n) => {
        const daEtapa = itens.filter((i) => i.etapa === n);
        if (!daEtapa.length) return null;
        return (
          <section key={etapa.curto} className="mt-12" aria-label={etapa.titulo}>
            <h3 className="label border-b border-line-strong pb-3 !text-fg">
              {String(n + 1).padStart(2, "0")} — {etapa.curto}
            </h3>
            <dl>
              {daEtapa.map(({ pergunta }) => {
                const ls = linhas(pergunta, respostas[pergunta.chave]);
                return (
                  <div key={pergunta.chave} className="grid gap-x-6 gap-y-1 border-b border-line py-4 sm:grid-cols-[13rem_minmax(0,1fr)_auto]">
                    <dt className="label pt-1">{pergunta.curto}</dt>
                    <dd className="min-w-0 text-[16px] leading-relaxed">
                      {ls.length ? (
                        ls.map((l, i) => (
                          <p key={i} className="whitespace-pre-line break-words">
                            {l.href ? (
                              <a href={l.href} target="_blank" rel="noopener noreferrer" className="underline decoration-line-strong underline-offset-4 hover:decoration-fg">
                                {l.texto}
                              </a>
                            ) : (
                              l.texto
                            )}
                            {l.nota ? <span className="block text-muted">{l.nota}</span> : null}
                          </p>
                        ))
                      ) : (
                        <p className="text-muted">Não respondida</p>
                      )}
                    </dd>
                    <dd className="sm:text-right">
                      <button
                        type="button"
                        onClick={() => onEditar(pergunta.chave)}
                        aria-label={`${ls.length ? "Editar" : "Responder"}: ${pergunta.curto}`}
                        className="bf-ghost !min-h-8 underline underline-offset-4"
                      >
                        {ls.length ? "Editar" : "Responder"}
                      </button>
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>
        );
      })}

      <div className="mt-12 max-w-[40rem]">
        <label id={extraId} className="label mb-2 block !text-fg">
          {briefing.resumo.extra}
        </label>
        <textarea
          value={extra}
          rows={3}
          maxLength={LIMITES.extra}
          placeholder="Opcional"
          aria-labelledby={extraId}
          onChange={(e) => onExtra(e.target.value)}
          className="bf-input bf-input--sm"
        />
      </div>

      <div className="bf-hp" aria-hidden="true">
        <label>
          Site
          <input type="text" name="site" tabIndex={-1} autoComplete="off" value={isca} onChange={(e) => onIsca(e.target.value)} />
        </label>
      </div>

      <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-3 pb-10">
        <button type="button" onClick={onEnviar} disabled={enviando} className="bf-primary">
          {enviando ? "Enviando..." : falha ? "Tentar de novo" : "Enviar briefing"}
          {enviando ? null : <span aria-hidden="true">→</span>}
        </button>
        <p role="alert" className="min-w-0 flex-1 basis-64 text-[16px] text-fg">
          {falha ? (
            <>
              <span className="font-mono text-[12px] tracking-[0.14em]" aria-hidden="true">
                [!]{" "}
              </span>
              {falha}
            </>
          ) : null}
        </p>
      </div>
    </div>
  );
}
