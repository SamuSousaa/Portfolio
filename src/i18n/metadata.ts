import type { Metadata } from "next";
import { findNav } from "@/config/nav";
import { getServerLocale } from "./server";

/** Título da aba do navegador a partir da lista de navegação, no idioma do cookie. */
export async function navMetadata(href: string): Promise<Metadata> {
  const locale = await getServerLocale();
  const label = findNav(href)?.item.label[locale] ?? "";
  return { title: label.charAt(0) + label.slice(1).toLowerCase() };
}
