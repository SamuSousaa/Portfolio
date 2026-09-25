"use client";

import { useEffect, useState } from "react";
import { PROFILE } from "@/config/content";
import { THEMES } from "@/config/themes";
import { LOCALES } from "@/i18n/config";
import { LOADER_DONE, LOADER_KEY } from "@/lib/loader";
import { gsap, getLenis } from "@/lib/motion";
import { useI18n } from "./I18nProvider";

/* Quando aparece: ver src/lib/loader.ts. */
const COUNT = 1.2; // segundos do contador
const EXIT = 0.7; // segundos da cortina subindo
let started = false;

export function Loader() {
  const { t, locale } = useI18n();
  const [step, setStep] = useState(0);
  const [theme, setTheme] = useState("");

  useEffect(() => {
    const html = document.documentElement;
    if (!html.classList.contains("loader-on")) return;
    setTheme(THEMES.find((th) => th.id === html.dataset.theme)?.name ?? "");
    // roda uma vez só: o loader vive no layout raiz, e o StrictMode (dev) monta duas vezes
    if (started) return;
    started = true;
    try {
      sessionStorage.setItem(LOADER_KEY, "1");
    } catch {}
    getLenis()?.stop();

    const o = { v: 0 };
    gsap
      .timeline()
      .to(o, {
        v: 100,
        duration: COUNT,
        ease: "power2.inOut",
        onUpdate: () => {
          const n = document.querySelector<HTMLElement>(".loader [data-num]");
          const bar = document.querySelector<HTMLElement>(".loader [data-bar]");
          if (n) n.textContent = String(Math.round(o.v)).padStart(3, "0");
          if (bar) bar.style.transform = `scaleX(${o.v / 100})`;
          window.dispatchEvent(new CustomEvent("loader:step", { detail: Math.min(4, Math.floor(o.v / 22)) }));
        },
      })
      .to(".loader", { yPercent: -100, duration: EXIT, ease: "expo.inOut" }, "+=0.1")
      // a página começa a entrar enquanto a cortina ainda sobe
      .add(() => window.dispatchEvent(new Event(LOADER_DONE)), `-=${EXIT * 0.45}`)
      .add(() => {
        html.classList.remove("loader-on");
        getLenis()?.start();
      });
  }, []);

  useEffect(() => {
    const onStep = (e: Event) => setStep((e as CustomEvent<number>).detail);
    window.addEventListener("loader:step", onStep);
    return () => window.removeEventListener("loader:step", onStep);
  }, []);

  const lang = LOCALES.find((l) => l.id === locale)?.label ?? "";
  const lines = [
    `boot portfolio ${PROFILE.version.toLowerCase()}`,
    `theme ${theme.toLowerCase()}`,
    `locale ${lang.toLowerCase()}`,
    "fonts",
    "mount /",
  ];

  return (
    <div
      aria-hidden="true"
      className="loader fixed inset-0 z-[9500] flex-col justify-between bg-bg px-5 py-6 text-fg nav:px-12 nav:py-10"
    >
      <div className="label flex justify-between !text-fg">
        <span>
          <span className="text-accent">{PROFILE.initials}</span> — {PROFILE.firstName} {PROFILE.lastName}
        </span>
        <span>{PROFILE.version}</span>
      </div>

      <ul className="font-mono text-[12px] leading-[1.9] text-muted">
        {lines.map((line, i) => (
          <li key={i} className={i <= step ? "" : "invisible"}>
            <span className="text-accent">&gt;</span> {line}
            <span className="text-fg"> {i < step ? "... ok" : i === step ? <span className="caret" /> : null}</span>
          </li>
        ))}
      </ul>

      <div>
        <div className="flex items-end justify-between gap-6">
          <p className="display [--fs:clamp(5rem,16vw,13rem)]">
            <span data-num className="tabular-nums">
              000
            </span>
            <span className="text-accent">%</span>
          </p>
          <p className="label mb-3 hidden sm:block">
            {t.loading} / {t.portfolio}
          </p>
        </div>
        <span className="mt-4 block h-px w-full bg-line">
          <span data-bar className="block h-full origin-left bg-accent" style={{ transform: "scaleX(0)" }} />
        </span>
      </div>
    </div>
  );
}
