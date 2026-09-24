import type { Locale, Localized } from "@/i18n/config";

/**
 * Fonte única da navegação.
 * Sidebar, menu mobile, caminho no topo e texto da transição leem SÓ desta lista.
 * Para adicionar/remover/renomear uma aba: edite aqui e crie (ou apague)
 * a pasta correspondente em src/app/.
 */
export type NavItem = {
  /** Rótulo por idioma, em caixa alta */
  label: Localized;
  /** Rota do App Router */
  href: string;
};

export const NAV: NavItem[] = [
  { label: { en: "HOME", pt: "HOME", es: "INICIO" }, href: "/" },
  { label: { en: "ABOUT", pt: "SOBRE", es: "SOBRE MÍ" }, href: "/about" },
  { label: { en: "PROJECTS", pt: "PROJETOS", es: "PROYECTOS" }, href: "/projects" },
  { label: { en: "CONTACT", pt: "CONTATO", es: "CONTACTO" }, href: "/contact" },
];

/** Numeração derivada da ordem: 01, 02, 03... */
export const navNumber = (index: number) => String(index + 1).padStart(2, "0");

export function findNav(pathname: string) {
  const index = NAV.findIndex((item) =>
    item.href === "/" ? pathname === "/" : pathname === item.href || pathname.startsWith(item.href + "/"),
  );
  return index === -1 ? null : { item: NAV[index], index };
}

/** Caminho exibido no topo: "/ PROJECTS / HEDGE". Segmentos além da aba vêm da URL. */
export function pagePath(pathname: string, locale: Locale): string[] {
  const nav = findNav(pathname);
  if (!nav) return ["404"];
  const rest = pathname.slice(nav.item.href.length).split("/").filter(Boolean);
  return [nav.item.label[locale], ...rest.map((s) => decodeURIComponent(s).replace(/-/g, " ").toUpperCase())];
}
