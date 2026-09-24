"use client";

import type { RefObject } from "react";
import { gsap, useGSAP } from "./motion";

let firstLoad = true;

/**
 * Entrada padrão de página. Marque os elementos dentro de `scope` com:
 *   data-intro="label"  → desliza da esquerda
 *   data-intro="line"   → sobe de dentro de uma máscara (pai com overflow-hidden)
 *   data-intro="fade"   → aparece subindo
 *   data-intro="figure" → revela de cima para baixo
 * Na primeira carga entra logo; vindo de outra rota, espera os blocos revelarem.
 * Os elementos começam escondidos pelo CSS (html.js [data-intro]).
 */
export function useIntro(scope: RefObject<HTMLElement | null>) {
  useGSAP(
    () => {
      const root = scope.current;
      if (!root) return;
      const delay = firstLoad ? 0.15 : 0.55;
      firstLoad = false;
      const q = (kind: string) => Array.from(root.querySelectorAll(`[data-intro=${kind}]`));
      const all = Array.from(root.querySelectorAll("[data-intro]"));

      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const tl = gsap.timeline({ delay, defaults: { ease: "power4.out" } }).set(all, { visibility: "visible" });
        const labels = q("label"), lines = q("line"), fades = q("fade"), figures = q("figure");
        if (labels.length) tl.from(labels, { opacity: 0, x: -12, duration: 0.6, stagger: 0.05 });
        if (lines.length) tl.from(lines, { yPercent: 105, duration: 0.95, stagger: 0.09 }, "<0.05");
        if (fades.length)
          tl.from(fades, { opacity: 0, y: 18, duration: 0.8, stagger: 0.06, ease: "power3.out" }, lines.length ? "-=0.55" : "<0.1");
        if (figures.length) tl.from(figures, { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "expo.inOut" }, 0.1);
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set(all, { visibility: "visible" });
      });
    },
    { scope },
  );
}
