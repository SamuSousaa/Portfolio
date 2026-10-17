"use client";

import { useEffect, useRef } from "react";

/** Imagens menores que isso (ícones) não abrem buraco na varredura; miniaturas de tela abrem. */
const MIN = 24;

/**
 * Linhas de varredura CRT por cima da tela inteira (sidebar, menu mobile, loader),
 * menos sobre as imagens: a máscara da camada ganha um recorte em cada imagem
 * visível, recalculado a cada quadro (scroll suave, prévia que segue o mouse).
 * Só trabalha quando o tema liga a varredura (--crt-opacity > 0). Durante a
 * transição de página (html[data-transition]) não há recortes: tela toda coberta.
 * Recortes sobrepostos se anulariam (mask-composite: exclude é um XOR), então um
 * recorte contido em outro é descartado: no crossfade do visor as duas telas
 * ocupam o mesmo lugar e a varredura voltava por cima delas.
 */
export function Crt() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    let last = "";

    const holes = () => {
      const vw = innerWidth;
      const vh = innerHeight;
      const rects: DOMRect[] = [];
      for (const img of document.querySelectorAll<HTMLElement>("img, video")) {
        let r = img.getBoundingClientRect();
        if (r.width < MIN || r.height < MIN || r.bottom <= 0 || r.top >= vh || r.right <= 0 || r.left >= vw) continue;
        if (img.checkVisibility && !img.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        // a moldura que corta a imagem (zoom no hover, object-cover) manda no recorte
        const clip = img.parentElement?.closest<HTMLElement>(".overflow-hidden");
        if (clip) {
          const c = clip.getBoundingClientRect();
          const x = Math.max(r.left, c.left);
          const y = Math.max(r.top, c.top);
          r = new DOMRect(x, y, Math.min(r.right, c.right) - x, Math.min(r.bottom, c.bottom) - y);
          if (r.width <= 0 || r.height <= 0) continue;
        }
        // coberta pelo menu mobile ou pelo loader: a varredura continua por cima deles
        const top = document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2);
        if (top?.closest(".menu-mobile, .loader")) continue;
        // contido num recorte já aberto (ou o contrário): fica só o maior
        const inside = (a: DOMRect, b: DOMRect) => a.left >= b.left - 1 && a.top >= b.top - 1 && a.right <= b.right + 1 && a.bottom <= b.bottom + 1;
        if (rects.some((o) => inside(r, o))) continue;
        for (let i = rects.length - 1; i >= 0; i--) if (inside(rects[i], r)) rects.splice(i, 1);
        rects.push(r);
      }
      return rects.map((r) => `${Math.round(r.left)}px ${Math.round(r.top)}px / ${Math.round(r.width)}px ${Math.round(r.height)}px`);
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      // durante a transição de página a varredura cobre tudo, imagens inclusive
      const on = getComputedStyle(el).opacity !== "0" && !("transition" in document.documentElement.dataset);
      const h = on ? holes() : [];
      const next = h.join(",");
      if (next === last) return;
      last = next;
      if (!h.length) {
        el.style.maskImage = "";
        el.style.maskPosition = "";
        el.style.maskSize = "";
        return;
      }
      const full = "linear-gradient(#000, #000)";
      el.style.maskImage = [full, ...h.map(() => full)].join(",");
      el.style.maskPosition = ["0 0", ...h.map((s) => s.split(" / ")[0])].join(",");
      el.style.maskSize = ["100% 100%", ...h.map((s) => s.split(" / ")[1])].join(",");
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, []);

  return <div ref={ref} className="crt vt-crt" aria-hidden="true" />;
}
