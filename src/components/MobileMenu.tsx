"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { NAV, findNav, navNumber } from "@/config/nav";
import type { Localized } from "@/i18n/config";
import { PROFILE } from "@/config/content";
import { getLenis } from "@/lib/motion";
import { usePageTransition } from "./PageTransition";
import { Settings } from "./Settings";
import { SocialText } from "./Social";
import { useI18n } from "./I18nProvider";
import { Swap } from "@/components/Swap";

type Props = {
  open: boolean;
  onClose: () => void;
  returnFocusRef: React.RefObject<HTMLButtonElement | null>;
  current: Localized;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Menu em tela cheia (< 900 px), no padrão do Hazem Hassine.
 * Abertura/fechamento em CSS (.menu-mobile em globals.css), controlados só
 * pelo atributo data-open: o estado do React é a única fonte de verdade.
 */
export function MobileMenu({ open, onClose, returnFocusRef, current }: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();
  const { navigate } = usePageTransition();
  const { t, tr } = useI18n();
  const activeIndex = findNav(pathname)?.index ?? -1;
  const wasOpen = useRef(false);

  // trava o scroll, move o foco e devolve ao fechar
  useEffect(() => {
    const lenis = getLenis();
    if (open) {
      wasOpen.current = true;
      lenis?.stop();
      document.documentElement.style.overflow = "hidden";
      rootRef.current?.querySelector<HTMLElement>("[data-menu-item] a")?.focus({ preventScroll: true });
    } else if (wasOpen.current) {
      wasOpen.current = false;
      lenis?.start();
      document.documentElement.style.overflow = "";
      returnFocusRef.current?.focus({ preventScroll: true });
    }
  }, [open, returnFocusRef]);

  // rota mudou (por baixo da transição): fecha
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // fecha ao passar para o layout de desktop
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 900px)");
    const onChange = () => mq.matches && onClose();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [onClose]);

  // Esc + foco preso
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onClose();
        return;
      }
      if (e.key !== "Tab" || !rootRef.current) return;
      const items = Array.from(rootRef.current.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
        (el) => el.offsetParent !== null,
      );
      if (!items.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      } else if (!rootRef.current.contains(document.activeElement)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  return (
    <div
      ref={rootRef}
      id="menu-mobile"
      role="dialog"
      aria-modal="true"
      aria-label={t.a11y.menu}
      aria-hidden={!open}
      inert={!open}
      data-open={open}
      className="menu-mobile vt-menu fixed inset-0 z-[8000] isolate flex flex-col nav:hidden"
    >
      <div className="vt-menu-bg absolute inset-0 -z-20 bg-[var(--c-bg)]" aria-hidden="true" />
      <div className="theme-texture absolute inset-0 -z-10" aria-hidden="true" />
      <div className="flex h-14 shrink-0 items-center justify-between border-b border-line px-5">
        <p className="label !text-fg" data-menu-fade style={{ "--i": 0 } as React.CSSProperties}>
          <span className="text-accent">/</span> <Swap v={current} />
        </p>
        <button
          type="button"
          onClick={onClose}
          data-fill
          className="flex h-9 items-center gap-3 border border-line-strong px-3 font-mono text-[11px] tracking-[0.14em] text-fg transition-colors hover:border-accent hover:bg-accent hover:text-on-accent"
        >
          <Swap align="end" v={tr((d) => d.close)} />
          <span aria-hidden="true" className="relative block size-3">
            <span className="absolute left-0 top-1/2 block h-px w-3 rotate-45 bg-current" />
            <span className="absolute left-0 top-1/2 block h-px w-3 -rotate-45 bg-current" />
          </span>
        </button>
      </div>

      <nav aria-label={t.a11y.mainNav} className="flex flex-1 flex-col items-center justify-center px-5">
        <ul className="flex flex-col items-center gap-3">
          {NAV.map((item, i) => {
            const active = i === activeIndex;
            const exact = item.href === pathname;
            return (
              <li key={item.href} className="overflow-hidden">
                <div data-menu-item style={{ "--i": i } as React.CSSProperties}>
                  <a
                    href={item.href}
                    aria-current={active ? "page" : undefined}
                    onClick={(e) => {
                      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
                      e.preventDefault();
                      if (exact) onClose();
                      else navigate(item.href);
                    }}
                    className={`group flex items-start gap-3 py-1 transition-colors duration-200 ${
                      active ? "text-accent" : "text-fg hover:text-accent"
                    }`}
                  >
                    <span className="mt-[0.5em] font-mono text-[12px] tracking-[0.12em] text-muted">{navNumber(i)}.</span>
                    <Swap align="center" className="display [--fs:clamp(2.5rem,12vw,5rem)]" v={item.label} />
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="shrink-0 space-y-6 border-t border-line px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-6">
        <div data-menu-fade style={{ "--i": 1 } as React.CSSProperties}>
          <Settings variant="center" />
        </div>
        <div data-menu-fade style={{ "--i": 2 } as React.CSSProperties} className="space-y-3 text-center">
          <SocialText />
          <p className="label !text-[10px]">
            © {new Date().getFullYear()} {PROFILE.firstName} {PROFILE.lastName}
          </p>
        </div>
      </div>
    </div>
  );
}
