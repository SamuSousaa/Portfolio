/**
 * Idiomas do site. O escolhido fica num cookie ("lang"), então o servidor já
 * renderiza no idioma certo (sem piscar). Para adicionar um idioma: inclua-o
 * aqui, acrescente a chave em cada `Localized` (TypeScript aponta onde falta)
 * e um bloco em src/i18n/ui.ts.
 */
export const LOCALES = [
  { id: "en", label: "EN", name: "English", htmlLang: "en" },
  { id: "pt", label: "PT", name: "Português", htmlLang: "pt-BR" },
  { id: "es", label: "ES", name: "Español", htmlLang: "es" },
] as const;

export type Locale = (typeof LOCALES)[number]["id"];
export type Localized<T = string> = Record<Locale, T>;

export const DEFAULT_LOCALE: Locale = "en";
export const LOCALE_COOKIE = "lang";

export const isLocale = (v: unknown): v is Locale => LOCALES.some((l) => l.id === v);
export const resolveLocale = (v: unknown): Locale => (isLocale(v) ? v : DEFAULT_LOCALE);
export const htmlLang = (l: Locale) => LOCALES.find((x) => x.id === l)!.htmlLang;
