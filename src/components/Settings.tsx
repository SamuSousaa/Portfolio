"use client";

import { useState } from "react";
import { THEMES } from "@/config/themes";
import { LOCALES } from "@/i18n/config";
import { useTheme } from "./ThemeProvider";
import { useI18n } from "./I18nProvider";
import { Swap } from "./Swap";

/**
 * Bolinhas de tema, numa linha só. Um balão único acima da linha mostra
 * nome e frase do tema sob o mouse/foco.
 */
export function ThemeSwitcher({ align = "start" }: { align?: "start" | "center" }) {
  const { theme, setTheme, preload } = useTheme();
  const { t, pick } = useI18n();
  const [hovered, setHovered] = useState<string | null>(null);
  const shown = THEMES.find((th) => th.id === hovered);

  return (
    <div className="relative">
      <div
        aria-hidden="true"
        className={`pointer-events-none absolute bottom-full z-10 mb-3 w-56 border border-line-strong bg-bg p-3 text-left transition-[opacity,transform] duration-200 ${
          align === "center" ? "left-1/2 -translate-x-1/2" : "left-0"
        } ${shown ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
      >
        {shown ? (
          <>
            <p className="label !text-fg">
              {shown.name}
              {shown.id !== theme ? <span className="text-muted"> · {t.preview}</span> : null}
            </p>
            <p className="mt-1 font-mono text-[11px] leading-snug text-muted">{pick(shown.description)}</p>
          </>
        ) : null}
      </div>

      <div
        role="radiogroup"
        aria-label={t.a11y.themeGroup}
        className={`flex items-center ${align === "center" ? "justify-center gap-2.5" : "justify-between"}`}
        onMouseLeave={() => setHovered(null)}
      >
        {THEMES.map((th) => {
          const active = th.id === theme;
          return (
            <button
              key={th.id}
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${th.name}: ${pick(th.description)}`}
              onClick={() => setTheme(th.id)}
              onMouseEnter={() => {
                setHovered(th.id);
                preload(th.id); // fontes já na intenção
              }}
              onFocus={() => {
                setHovered(th.id);
                preload(th.id);
              }}
              onBlur={() => setHovered(null)}
              className={`grid size-[22px] shrink-0 place-items-center rounded-full border transition-[border-color,transform] duration-200 hover:scale-110 ${
                active ? "border-accent" : "border-transparent"
              }`}
            >
              <span
                className="grid size-3.5 place-items-center rounded-full ring-1 ring-line-strong"
                style={{ background: th.swatch[0] }}
              >
                <span className="size-1.5 rounded-full" style={{ background: th.swatch[1] }} />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Botões segmentados EN / PT / ES. A troca é um crossfade (View Transition), sem mexer no layout. */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  return (
    <div role="radiogroup" aria-label={t.a11y.languageGroup} className="flex gap-1.5">
      {LOCALES.map((l) => {
        const active = l.id === locale;
        return (
          <button
            key={l.id}
            type="button"
            role="radio"
            aria-checked={active}
            aria-label={l.name}
            lang={l.htmlLang}
            data-fill={active ? undefined : ""}
            onClick={() => !active && setLocale(l.id)}
            className={`h-7 min-w-9 border px-2 font-mono text-[11px] tracking-[0.1em] transition-colors duration-200 ${
              active
                ? "border-fg bg-fg text-bg"
                : "border-line-strong text-muted hover:border-accent hover:bg-accent hover:text-on-accent"
            }`}
          >
            {l.label}
          </button>
        );
      })}
    </div>
  );
}

/** Bloco de ajustes (referência: Hans Honlonkou). `center` = versão do menu mobile. */
export function Settings({ variant = "sidebar" }: { variant?: "sidebar" | "center" }) {
  const { t, pick } = useI18n();
  const { theme } = useTheme();
  const current = THEMES.find((th) => th.id === theme) ?? THEMES[0];

  if (variant === "center") {
    return (
      <div className="flex flex-col items-center gap-4 text-center">
        <div className="space-y-3">
          <p className="label">
            {t.theme} / <span className="text-fg">{current.name}</span>
          </p>
          <ThemeSwitcher align="center" />
          <Swap block align="center" className="font-mono text-[11px] text-muted" v={current.description} />
        </div>
        <div className="flex items-center gap-4">
          <span className="label">{t.language}</span>
          <LanguageSwitcher />
        </div>
      </div>
    );
  }

  return (
    <div>
      <p className="label mb-4">{t.settings}</p>
      <div className="mb-2.5 flex items-baseline justify-between">
        <span className="label">{t.theme}</span>
        <span className="label !text-fg">{current.name}</span>
      </div>
      <ThemeSwitcher />
      <div className="mt-4 flex items-center justify-between">
        <span className="label">{t.language}</span>
        <LanguageSwitcher />
      </div>
    </div>
  );
}
