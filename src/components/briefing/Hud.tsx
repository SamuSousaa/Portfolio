"use client";

type TopoProps = {
  /** Texto do canto esquerdo: "03 / 06 — CONTEÚDO", "RESUMO"... */
  etapa: string;
  /** Texto do canto direito: tempo restante */
  tempo: string;
  /** Quanto de cada etapa já passou, de 0 a 1 */
  segmentos: number[];
  /** Posição e total de perguntas, para leitores de tela */
  posicao: number;
  total: number;
};

/** Topo do briefing: etapa atual, tempo restante e a barra de progresso (um segmento por etapa). */
export function HudTopo({ etapa, tempo, segmentos, posicao, total }: TopoProps) {
  return (
    <header className="px-5 pt-5 nav:px-12 nav:pt-7">
      <div className="label flex items-baseline justify-between gap-4">
        <span className="text-fg">{etapa}</span>
        <span className="tabular-nums">{tempo}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Progresso do briefing"
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={posicao}
        aria-valuetext={`${posicao} de ${total} perguntas`}
        className="mt-3 grid auto-cols-fr grid-flow-col gap-1"
      >
        {segmentos.map((s, i) => (
          <span key={i} className="bf-seg">
            <span style={{ transform: `scaleX(${s})` }} />
          </span>
        ))}
      </div>
    </header>
  );
}

const hora = (ms: number) => new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" }).format(ms);

/** Rodapé: status do rascunho à esquerda e a saída discreta para o portfólio à direita. */
export function HudRodape({ salvoEm, enviado, autor }: { salvoEm: number | null; enviado: boolean; autor: string }) {
  return (
    <footer className="label flex items-center justify-between gap-4 border-t border-line px-5 py-3 nav:px-12">
      <span className="tabular-nums" aria-live="off">
        {enviado ? "Briefing enviado" : salvoEm ? `Rascunho salvo · ${hora(salvoEm)}` : "Rascunho neste aparelho"}
      </span>
      <a href="/" target="_blank" rel="noopener" className="hit transition-colors [--hit-y:14px] hover:text-fg">
        {autor} <span aria-hidden="true">↗</span>
      </a>
    </footer>
  );
}
