"use client";

import { createContext, useCallback, useContext, useState } from "react";
import { useRouter } from "next/navigation";
import { LOCALES, LOCALE_COOKIE, htmlLang, type Locale, type Localized } from "@/i18n/config";
import { DICTS, type Dict } from "@/i18n/ui";
import { withViewTransition } from "@/lib/viewTransition";

type Ctx = {
  locale: Locale;
  t: Dict;
  setLocale: (l: Locale) => void;
  pick: <T>(v: Localized<T>) => T;
  /** Mesma chave do dicionário nos três idiomas (para o <Swap>) */
  tr: <T>(sel: (d: Dict) => T) => Localized<T>;
};
const I18nContext = createContext<Ctx | null>(null);

const tr = <T,>(sel: (d: Dict) => T) =>
  Object.fromEntries(LOCALES.map((l) => [l.id, sel(DICTS[l.id])])) as Localized<T>;

export function I18nProvider({ initial, children }: { initial: Locale; children: React.ReactNode }) {
  const router = useRouter();
  const [locale, setState] = useState<Locale>(initial);

  const setLocale = useCallback(
    (l: Locale) => {
      document.cookie = `${LOCALE_COOKIE}=${l}; path=/; max-age=31536000; samesite=lax`;
      withViewTransition("vt-lang", () => {
        document.documentElement.lang = htmlLang(l);
        setState(l);
      }).then(() => router.refresh()); // atualiza o que vem do servidor (título da aba)
    },
    [router],
  );

  const pick = useCallback(<T,>(v: Localized<T>) => v[locale], [locale]);

  return <I18nContext.Provider value={{ locale, t: DICTS[locale], setLocale, pick, tr }}>{children}</I18nContext.Provider>;
}

export function useI18n() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useI18n fora do I18nProvider");
  return ctx;
}
