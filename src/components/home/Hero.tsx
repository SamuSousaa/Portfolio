"use client";

import { useRef } from "react";
import { PROFILE } from "@/config/content";
import { gsap, useGSAP } from "@/lib/motion";
import { TransitionLink } from "../PageTransition";
import { Monogram } from "./Monogram";
import { useI18n } from "../I18nProvider";

let firstLoad = true;

export function Hero() {
  const ref = useRef<HTMLElement>(null);
  const { t, pick } = useI18n();

  useGSAP(
    () => {
      // Na primeira carga entra logo; vindo de outra rota, espera os blocos revelarem.
      const delay = firstLoad ? 0.15 : 0.55;
      firstLoad = false;
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        gsap
          .timeline({ delay, defaults: { ease: "power4.out" } })
          .set("[data-intro]", { visibility: "visible" })
          .from("[data-intro=label]", { opacity: 0, x: -12, duration: 0.6 })
          .from("[data-intro=line]", { yPercent: 105, duration: 0.95, stagger: 0.09 }, "<0.05")
          .from("[data-intro=fade]", { opacity: 0, y: 18, duration: 0.8, stagger: 0.07, ease: "power3.out" }, "-=0.55")
          .from(
            "[data-intro=figure]",
            { clipPath: "inset(0% 0% 100% 0%)", duration: 1, ease: "expo.inOut" },
            0.1,
          );
      });
      mm.add("(prefers-reduced-motion: reduce)", () => {
        gsap.set("[data-intro]", { visibility: "visible" });
      });
    },
    { scope: ref },
  );

  return (
    <section
      ref={ref}
      className="grid flex-1 content-center gap-12 px-5 pb-14 pt-10 nav:px-12 nav:py-16 min-[1100px]:grid-cols-[minmax(0,1.6fr)_minmax(0,1fr)] min-[1100px]:items-center min-[1100px]:gap-14"
    >
      <div className="@container min-w-0">
        <p data-intro="label" className="label mb-8">
          <span className="text-accent">SYS.01</span> — {t.portfolio} / {new Date().getFullYear()}
        </p>

        <h1 className="display -ml-[0.05em] text-[min(20cqi,12.5rem)]">
          <span className="block overflow-hidden pb-[0.04em]">
            <span data-intro="line" className="block">
              {PROFILE.firstName}
            </span>
          </span>
          <span className="block overflow-hidden pb-[0.06em]">
            <span data-intro="line" className="vazado block">
              {PROFILE.lastName}
            </span>
          </span>
        </h1>

        <div className="mt-10 grid gap-8 nav:grid-cols-[minmax(0,1fr)_auto] nav:items-end">
          <div data-intro="fade" className="max-w-[46ch] font-mono text-[13px] leading-relaxed text-muted nav:text-[14px]">
            <p className="label mb-3 !text-fg">
              <span className="text-accent">&gt;</span> {pick(PROFILE.role)}
            </p>
            <p>{pick(PROFILE.bio)}</p>
          </div>
          <div data-intro="fade">
            <TransitionLink href="/projects" className="btn-bracket">
              {t.viewProjects}<span aria-hidden="true">→</span>
            </TransitionLink>
          </div>
        </div>
      </div>

      <div className="w-full max-w-[340px] justify-self-start nav:max-w-[460px] min-[1100px]:justify-self-end">
        <Monogram />
      </div>
    </section>
  );
}
