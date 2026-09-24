"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/motion";

const INTERACTIVE = "a, button, [data-cursor], input, label, summary";
/** Elementos que se preenchem com o acento no hover: o cursor troca para a cor de contraste. */
const FILLED = "[data-fill], .btn-bracket";

/** Cursor do tema (forma vem das variáveis --cursor-*). Só em dispositivos com mouse. */
export function Cursor() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    document.documentElement.classList.add("has-cursor");
    el.classList.add("is-hidden");
    gsap.set(el, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(el, "x", { duration: 0.22, ease: "power3" });
    const yTo = gsap.quickTo(el, "y", { duration: 0.22, ease: "power3" });

    const move = (e: PointerEvent) => {
      el.classList.remove("is-hidden");
      xTo(e.clientX);
      yTo(e.clientY);
      const target = e.target as Element | null;
      const link = target?.closest?.(INTERACTIVE);
      el.classList.toggle("is-link", !!link);
      el.classList.toggle("is-fill", !!link && !!target?.closest?.(FILLED));
    };
    const leave = () => el.classList.add("is-hidden");

    window.addEventListener("pointermove", move, { passive: true });
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      window.removeEventListener("pointermove", move);
      document.documentElement.removeEventListener("pointerleave", leave);
      document.documentElement.classList.remove("has-cursor");
    };
  }, []);

  return <div ref={ref} className="cursor vt-cursor" aria-hidden="true" />;
}
