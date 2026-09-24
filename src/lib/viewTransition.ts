"use client";

import { flushSync } from "react-dom";
import { prefersReducedMotion } from "./motion";

/**
 * Aplica `update` dentro de uma View Transition, com a classe `kind` no <html>
 * enquanto ela dura (ver globals.css):
 *   vt-theme = onda em três camadas da troca de tema
 *   vt-lang  = crossfade curto da troca de idioma
 * Transições CSS próprias dos elementos ficam desligadas no instante da troca,
 * para a foto nova já nascer com as cores finais. Sem suporte ou com reduced
 * motion: troca direta.
 * --vt-lag (ms, no <html>) = tempo entre a foto antiga e o início da animação;
 * o marquee usa para a foto antiga "alcançar" a faixa que seguiu rodando.
 */
export function withViewTransition(kind: "vt-theme" | "vt-lang", update: () => void): Promise<void> {
  const root = document.documentElement;
  let captured = 0;
  const run = () => {
    captured = performance.now(); // a foto antiga acabou de ser tirada
    root.classList.add("no-transitions");
    flushSync(update);
  };
  const release = () => requestAnimationFrame(() => root.classList.remove("no-transitions"));

  if (!document.startViewTransition || prefersReducedMotion()) {
    run();
    release();
    return Promise.resolve();
  }
  root.classList.add(kind);
  const vt = document.startViewTransition(run);
  vt.ready.then(() => {
    root.style.setProperty("--vt-lag", (performance.now() - captured).toFixed(1));
    release();
  }, release);
  return vt.finished.finally(() => root.classList.remove(kind));
}
