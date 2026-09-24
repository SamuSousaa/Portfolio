"use client";

import { flushSync } from "react-dom";
import { prefersReducedMotion } from "./motion";

/**
 * Aplica `update` dentro de uma View Transition com a classe `kind` no <html>
 * (vt-theme = sobe de baixo para cima; vt-lang = crossfade; ver globals.css).
 * As transições CSS ficam desligadas no instante da troca, para as cores não
 * "atrasarem" dentro da página nova. Sem suporte ou com reduced motion: troca direta.
 */
export function withViewTransition(kind: "vt-theme" | "vt-lang", update: () => void): Promise<void> {
  const root = document.documentElement;
  const run = () => {
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
  vt.ready.then(release, release);
  return vt.finished.finally(() => root.classList.remove(kind));
}
