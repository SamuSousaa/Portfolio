"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { limpar, limparTudo, primeiroErro, todas, validar, visiveis } from "@/briefings/logic";
import type { Briefing as Config, Respostas, Valor } from "@/briefings/types";
import { Done } from "./Done";
import { HudRodape, HudTopo } from "./Hud";
import { Question } from "./Question";
import { Summary } from "./Summary";
import { useDraft, type Fase } from "./useDraft";

/** Duração da saída da tela atual (igual à de .bf-out em briefing.css). */
const SAIDA_MS = 150;
/** Pausa para ela ver a opção marcada antes de a escolha única avançar sozinha. */
const ESCOLHA_MS = 220;

const doisDigitos = (n: number) => String(n).padStart(2, "0");

/**
 * O briefing inteiro: abertura → uma pergunta por tela → resumo → confirmação.
 * Tudo o que é texto ou regra vem da configuração (src/briefings/<slug>.ts).
 */
export function Briefing({ briefing, autor }: { briefing: Config; autor: string }) {
  const [respostas, setRespostas] = useState<Respostas>({});
  const [extra, setExtra] = useState("");
  const [fase, setFase] = useState<Fase>("abertura");
  const [chave, setChave] = useState<string | null>(null);
  /** Veio do resumo para corrigir uma resposta: ao avançar, volta para o resumo */
  const [editando, setEditando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [dir, setDir] = useState<1 | -1>(1);
  const [saindo, setSaindo] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [falha, setFalha] = useState<string | null>(null);
  const [isca, setIsca] = useState("");

  const { inicial, salvoEm, salvar, apagar } = useDraft(briefing.slug);
  const pronto = inicial !== undefined;
  const tela = useRef<HTMLDivElement>(null);
  const rolagem = useRef<HTMLElement>(null);
  const ocupado = useRef(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const itens = useMemo(() => visiveis(briefing, respostas), [briefing, respostas]);
  const limpas = useMemo(() => limparTudo(briefing, respostas), [briefing, respostas]);
  const idx = itens.findIndex((i) => i.pergunta.chave === chave);
  const atual = fase === "pergunta" && idx >= 0 ? itens[idx] : null;
  const temRespostas = Object.values(limpas).length > 0;

  // rascunho: o que estava salvo volta ao abrir; depois, cada resposta é gravada
  useEffect(() => {
    if (!inicial) return;
    setRespostas(inicial.respostas);
    setExtra(inicial.extra ?? "");
    if (inicial.fase === "enviado") setFase("enviado");
  }, [inicial]);
  useEffect(() => {
    if (!pronto || fase === "abertura" || fase === "enviado") return;
    salvar({ respostas, extra, fase, chave });
  }, [pronto, respostas, extra, fase, chave, salvar]);

  /** Troca de tela: a atual sai, a próxima entra. Sem movimento, troca na hora. */
  const trocar = useCallback((sentido: 1 | -1, mudar: () => void) => {
    if (ocupado.current) return;
    setDir(sentido);
    setErro(null);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return mudar();
    ocupado.current = true;
    setSaindo(true);
    timers.current.push(
      setTimeout(() => {
        mudar();
        setSaindo(false);
        ocupado.current = false;
      }, SAIDA_MS),
    );
  }, []);

  // tela nova: volta ao topo e leva o foco para o campo (com teclado) ou para o título
  const primeira = useRef(true);
  useEffect(() => {
    if (saindo) return;
    if (primeira.current) {
      primeira.current = false;
      return;
    }
    rolagem.current?.scrollTo(0, 0);
    const comTeclado = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const alvo =
      (comTeclado ? tela.current?.querySelector<HTMLElement>("[data-autofocus]") : null) ??
      tela.current?.querySelector<HTMLElement>("h2[tabindex]");
    alvo?.focus({ preventScroll: true });
  }, [fase, chave, saindo]);

  const irPara = (c: string, sentido: 1 | -1 = 1) =>
    trocar(sentido, () => {
      setFase("pergunta");
      setChave(c);
    });

  const comecar = () => {
    const salvo = inicial && temRespostas ? inicial : null;
    if (salvo?.fase === "resumo") return trocar(1, () => setFase("resumo"));
    const destino = itens.find((i) => i.pergunta.chave === salvo?.chave) ?? itens[0];
    irPara(destino.pergunta.chave);
  };

  const recomecar = () => {
    apagar();
    setRespostas({});
    setExtra("");
  };

  /** Valida a pergunta atual e segue. `r` permite avançar com uma resposta que ainda não está no estado. */
  const avancar = (r: Respostas = respostas, pular = false) => {
    if (!atual) return;
    const p = atual.pergunta;
    if (!pular) {
      const problema = validar(p, limpar(p, r[p.chave], briefing.slug));
      if (problema) return setErro(problema);
    }
    const lista = visiveis(briefing, r);
    const prox = lista[lista.findIndex((i) => i.pergunta.chave === p.chave) + 1];
    // editando: só segue adiante se a resposta abriu uma pergunta nova, ainda em branco
    const segue = prox && (!editando || (!!prox.pergunta.quando && r[prox.pergunta.chave] === undefined));
    if (segue) return irPara(prox.pergunta.chave);
    trocar(1, () => {
      setFase("resumo");
      setEditando(false);
    });
  };

  const responder = (v: Valor | undefined) => {
    if (!atual) return;
    setErro(null);
    setRespostas((r) => ({ ...r, [atual.pergunta.chave]: v }));
  };

  const escolher = (v: string) => {
    if (!atual || ocupado.current) return;
    const r = { ...respostas, [atual.pergunta.chave]: v };
    setRespostas(r);
    setErro(null);
    timers.current.push(setTimeout(() => avancar(r), ESCOLHA_MS));
  };

  const pular = () => {
    if (!atual) return;
    const r = { ...respostas, [atual.pergunta.chave]: undefined };
    setRespostas(r);
    avancar(r, true);
  };

  const voltar = () => {
    if (editando) {
      return trocar(-1, () => {
        setFase("resumo");
        setEditando(false);
      });
    }
    if (idx <= 0) return trocar(-1, () => setFase("abertura"));
    irPara(itens[idx - 1].pergunta.chave, -1);
  };

  const editar = (c: string) => {
    setEditando(true);
    irPara(c, -1);
  };

  const mostrarErro = (e: { chave: string; erro: string }) => {
    setEditando(true);
    trocar(-1, () => {
      setFase("pergunta");
      setChave(e.chave);
      setErro(e.erro);
    });
  };

  const enviar = async () => {
    if (enviando) return;
    const problema = primeiroErro(briefing, limpas);
    if (problema) return mostrarErro(problema);
    setEnviando(true);
    setFalha(null);
    try {
      const res = await fetch("/api/briefing", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ slug: briefing.slug, respostas: limpas, extra, site: isca }),
      });
      const dados = await res.json().catch(() => null);
      if (res.ok && dados?.ok) {
        setRespostas(limpas);
        salvar({ respostas: limpas, extra, fase: "enviado", chave: null });
        trocar(1, () => setFase("enviado"));
      } else if (res.status === 400 && typeof dados?.chave === "string") {
        mostrarErro(dados);
      } else {
        setFalha(dados?.erro ?? "Não consegui enviar agora. Suas respostas continuam salvas, tente de novo.");
      }
    } catch {
      setFalha("Parece que a conexão caiu. Suas respostas continuam salvas, tente de novo.");
    } finally {
      setEnviando(false);
    }
  };

  // Enter avança; em texto longo, Shift+Enter quebra a linha (no celular, Enter quebra: não existe Shift+Enter)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Enter" || e.isComposing || e.ctrlKey || e.metaKey || e.altKey) return;
      const alvo = e.target as HTMLElement;
      // numa opção em foco, Enter avança (Espaço marca); nos outros botões e links, Enter é o clique normal
      if (alvo.closest?.("button:not(.bf-option), a, input[type=file]")) return;
      if (fase === "abertura") return comecar();
      if (fase !== "pergunta") return;
      if (alvo instanceof HTMLTextAreaElement && (e.shiftKey || !window.matchMedia("(hover: hover) and (pointer: fine)").matches)) return;
      e.preventDefault();
      avancar();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const nEtapas = briefing.etapas.length;
  const segmentos = briefing.etapas.map((_, n) => {
    if (fase === "abertura") return 0;
    if (fase !== "pergunta" || idx < 0) return 1;
    const daEtapa = itens.map((i, pos) => ({ ...i, pos })).filter((i) => i.etapa === n);
    return daEtapa.length ? daEtapa.filter((i) => i.pos < idx).length / daEtapa.length : 1;
  });
  const restam = atual ? Math.max(1, Math.ceil((briefing.minutos * (itens.length - idx)) / itens.length)) : 0;
  const hud = atual
    ? { etapa: `${doisDigitos(atual.etapa + 1)} / ${doisDigitos(nEtapas)} — ${briefing.etapas[atual.etapa].curto}`, tempo: `Faltam ~${restam} min` }
    : fase === "abertura"
      ? { etapa: "Briefing", tempo: `~${briefing.minutos} min` }
      : fase === "resumo"
        ? { etapa: "Resumo", tempo: "Último passo" }
        : { etapa: "Enviado", tempo: "" };

  const continuando = !!inicial && temRespostas;
  const ultima = atual && idx === itens.length - 1;

  return (
    <div className="bf-root relative flex flex-col">
      <h1 className="sr-only">{briefing.titulo}</h1>
      <HudTopo {...hud} segmentos={segmentos} posicao={fase === "abertura" ? 0 : atual ? idx : itens.length} total={itens.length} />

      {atual ? (
        <span className="bf-ghost-number absolute bottom-28 right-12 z-[-1] hidden xl:block" aria-hidden="true">
          {doisDigitos(atual.etapa + 1)}
        </span>
      ) : null}

      <main ref={rolagem} className="bf-scroll flex-1">
        <div
          ref={tela}
          key={`${fase}:${chave}`}
          className={`${saindo ? "bf-out" : "bf-in"} px-5 pb-6 pt-[clamp(1.75rem,8vh,5.5rem)] nav:px-12`}
          style={{ "--bf-dir": dir } as React.CSSProperties}
        >
          {fase === "abertura" ? (
            <div className="max-w-[52rem]">
              <p className="label">{briefing.abertura.rotulo}</p>
              <h2 tabIndex={-1} className="display mt-5 outline-none [--fs:clamp(2.5rem,8vw,6rem)]">
                {briefing.abertura.titulo}
              </h2>
              <p className="mt-7 max-w-[36rem] text-[clamp(1rem,1.4vw,1.25rem)] leading-relaxed text-muted">
                <span className="text-fg">Sou {autor}. </span>
                {briefing.abertura.texto}
              </p>
              <ul className="label mt-8 flex flex-wrap gap-x-6 gap-y-2">
                <li>~{briefing.minutos} minutos</li>
                <li>{todas(briefing).filter((i) => !i.pergunta.quando).length} perguntas</li>
                <li>Dá para parar e voltar depois</li>
              </ul>
              <div className="mt-10 flex flex-wrap items-center gap-x-6 gap-y-2">
                <button type="button" onClick={comecar} className="bf-primary">
                  {continuando ? "Continuar de onde parei" : briefing.abertura.botao} <span aria-hidden="true">→</span>
                </button>
                {continuando ? (
                  <button type="button" onClick={recomecar} className="bf-ghost">
                    Começar de novo
                  </button>
                ) : null}
              </div>
            </div>
          ) : null}

          {atual ? (
            <div className="max-w-[56rem]">
              <Question
                slug={briefing.slug}
                pergunta={atual.pergunta}
                numero={idx + 1}
                valor={respostas[atual.pergunta.chave]}
                onChange={responder}
                onEscolher={escolher}
                erro={erro}
              />
            </div>
          ) : null}

          {fase === "resumo" ? (
            <Summary
              briefing={briefing}
              respostas={limpas}
              extra={extra}
              onExtra={setExtra}
              onEditar={editar}
              onEnviar={enviar}
              enviando={enviando}
              falha={falha}
              isca={isca}
              onIsca={setIsca}
            />
          ) : null}

          {fase === "enviado" ? <Done briefing={briefing} respostas={limpas} extra={extra} autor={autor} enviadoEm={salvoEm ?? Date.now()} /> : null}
        </div>
      </main>

      {atual ? (
        <nav aria-label="Navegação do briefing" className="flex items-center justify-between gap-4 border-t border-line px-5 py-3 nav:px-12">
          <button type="button" onClick={voltar} className="bf-ghost">
            <span aria-hidden="true">←</span> {editando ? "Resumo" : "Voltar"}
          </button>
          <div className="flex items-center gap-5">
            {atual.pergunta.obrigatoria ? null : (
              <button type="button" onClick={pular} className="bf-ghost">
                Pular
              </button>
            )}
            <button type="button" onClick={() => avancar()} className="bf-primary">
              {editando ? "Salvar" : ultima ? "Ver resumo" : "Avançar"}
              <span className="bf-key--atalho" aria-hidden="true">
                ↵
              </span>
            </button>
          </div>
        </nav>
      ) : null}

      <HudRodape salvoEm={salvoEm} enviado={fase === "enviado"} autor={autor} />
    </div>
  );
}
