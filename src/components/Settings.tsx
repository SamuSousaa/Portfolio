"use client";

import { useState } from "react";
import { THEMES } from "@/config/themes";
import { LOCALES } from "@/i18n/config";
import { useTheme } from "./ThemeProvider";
import { useI18n } from "./I18nProvider";
import { usePageTransition } from "./PageTransition";

/** Bolinhas de tema; nome e descrição aparecem num balão sobre a bolinha (mouse ou foco). */
export function ThemeSwitcher({ align = "start" }: { align?: "start" | "center" }) {
  const { theme, setTheme } = useTheme();
  const { t, pick } = useI18n();
  const [hovered, setHovered] = useState<string | null>(null);

  return (
    <div role="radiogroup" aria-label={t.a11y.themeGroup} className="flex items-center gap-2.5" onMouseLeave={() => setHovered(null)}>
      {THEMES.map((th) => {
        const active = th.id === theme;
        const open = hovered === th.id;
        return (
          <div key={th.id} className="relative">
            <button
              type="button"
              role="radio"
              aria-checked={active}
              aria-label={`${th.name}: ${pick(th.description)}`}
              onClick={() => setTheme(th.id)}
              onMouseEnter={() => setHovered(th.id)}
              onFocus={() => setHovered(th.id)}
              onBlur={() => setHovered(null)}
              className={`grid size-[22px] place-items-center rounded-full border transition-[border-color,transform] duration-200 hover:scale-110 ${
                active ? "border-accent" : "border-line-strong"
              }`}
            >
              <span className="grid size-3.5 place-items-center rounded-full" style={{ background: th.swatch[0] }}>
                <span className="size-1.5 rounded-full" style={{ background: th.swatch[1] }} />
              </span>
            </button>
            {/* balão */}
            <div
              aria-hidden="true"
              className={`pointer-events-none absolute bottom-full z-10 mb-2.5 w-52 border border-line-strong bg-bg p-3 text-left transition-[opacity,transform] duration-200 ${
                align === "center" ? "left-1/2 -translate-x-1/2" : "-left-1"
              } ${open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0"}`}
            >
              <p className="label !text-fg">
                {th.name}
                {!active ? <span className="text-muted"> · {t.preview}</span> : null}
              </p>
              <p className="mt-1 font-mono text-[11px] leading-snug text-muted">{pick(th.description)}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/** Botões segmentados EN / PT / ES. A troca acontece por baixo da transição em blocos. */
export function LanguageSwitcher() {
  const { locale, setLocale, t } = useI18n();
  const { runCovered } = usePageTransition();
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
            onClick={() => !active && runCovered(l.name.toUpperCase(), () => setLocale(l.id))}
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
  const { t } = useI18n();
  const { theme } = useTheme();
  const current = THEMES.find((th) => th.id === theme);

  if (variant === "center") {
    return (
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-4">
          <span className="label">{t.theme}</span>
          <ThemeSwitcher align="center" />
          <span className="label !text-fg">{current?.name}</span>
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
      <dl className="grid grid-cols-[5.5rem_1fr] items-center gap-y-3.5">
        <dt className="label">{t.theme}</dt>
        <dd>
          <ThemeSwitcher />
        </dd>
        <dt className="label">{t.language}</dt>
        <dd>
          <LanguageSwitcher />
        </dd>
      </dl>
    </div>
  );
}
