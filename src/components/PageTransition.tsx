"use client";

import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { gsap, prefersReducedMotion, scrollToTop } from "@/lib/motion";
import { pagePath } from "@/config/nav";
import { useI18n } from "./I18nProvider";

/*
 * Transição em blocos (receita 6): clique → blocos cobrem a tela →
 * router.push → nova rota monta → blocos revelam.
 */

type Ctx = { navigate: (href: string) => void };
const TransitionContext = createContext<Ctx>({ navigate: () => {} });
export const usePageTransition = () => useContext(TransitionContext);

const TILE_COUNT = 60; // 10×6 no desktop, 5×12 no celular

export function PageTransitionProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { locale, t } = useI18n();
  const tilesRef = useRef<HTMLDivElement>(null);
  const labelRef = useRef<HTMLParagraphElement>(null);
  const covered = useRef(false);
  const busy = useRef(false);
  const [target, setTarget] = useState("");

  const grid = () => (window.matchMedia("(max-width: 899px)").matches ? [12, 5] : [6, 10]);
  const tiles = () => Array.from(tilesRef.current?.children ?? []);

  const reveal = useCallback(() => {
    if (!covered.current) return;
    covered.current = false;
    gsap
      .timeline({ onComplete: () => void (busy.current = false) })
      .to(labelRef.current, { opacity: 0, duration: 0.15 })
      .to(tiles(), {
        scaleY: 0,
        transformOrigin: "50% 0%",
        duration: 0.32,
        ease: "power2.inOut",
        stagger: { each: 0.012, grid: grid() as [number, number], from: "end" },
      });
  }, []);

  /** Cobre a tela com os blocos e chama onCovered quando termina. */
  const cover = useCallback((label: string, onCovered: () => void) => {
    busy.current = true;
    setTarget(label);
    gsap
      .timeline({
        onComplete: () => {
          covered.current = true;
          onCovered();
        },
      })
      .set(tiles(), { scaleY: 0, transformOrigin: "50% 100%" })
      .to(tiles(), {
        scaleY: 1,
        duration: 0.32,
        ease: "power2.inOut",
        stagger: { each: 0.012, grid: grid() as [number, number], from: "start" },
      })
      .to(labelRef.current, { opacity: 1, duration: 0.15 }, "-=0.1");
  }, []);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname || busy.current) return;
      if (prefersReducedMotion()) {
        router.push(href);
        return;
      }
      router.prefetch(href);
      cover(pagePath(href, locale).join(" / "), () => router.push(href, { scroll: false }));
    },
    [pathname, router, cover, locale],
  );

  // Nova rota montou: volta ao topo por baixo dos blocos e revela.
  useEffect(() => {
    if (!covered.current) return;
    scrollToTop();
    const id = requestAnimationFrame(() => reveal());
    return () => cancelAnimationFrame(id);
  }, [pathname, reveal]);

  // Segurança: se a navegação falhar, não deixa a tela coberta.
  useEffect(() => {
    const id = setInterval(() => {
      if (covered.current && busy.current) reveal();
    }, 4000);
    return () => clearInterval(id);
  }, [reveal]);

  return (
    <TransitionContext.Provider value={{ navigate }}>
      {children}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9000] grid grid-cols-5 grid-rows-12 nav:grid-cols-10 nav:grid-rows-6"
      >
        <div ref={tilesRef} className="contents">
          {Array.from({ length: TILE_COUNT }, (_, i) => (
            <span key={i} className="block scale-y-0 bg-[var(--transition-bg)] outline outline-1 outline-[var(--transition-bg)]" />
          ))}
        </div>
        <p
          ref={labelRef}
          className="label absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 !text-[var(--transition-fg)] opacity-0"
        >
          <span className="caret">{t.loading} / {target}</span>
        </p>
      </div>
    </TransitionContext.Provider>
  );
}

/** Link interno que passa pela transição. Cliques com modificador seguem o padrão do navegador. */
export function TransitionLink({
  href,
  onClick,
  ...rest
}: React.ComponentProps<typeof Link> & { href: string }) {
  const { navigate } = usePageTransition();
  return (
    <Link
      href={href}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        navigate(href);
      }}
      {...rest}
    />
  );
}
