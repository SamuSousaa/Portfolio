import type { MetadataRoute } from "next";
import { NAV } from "@/config/nav";
import { PROJECTS } from "@/config/content";
import { SITE_URL } from "@/config/site";

/** Abas da navegação + uma página por projeto. */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...NAV.map((item) => ({ url: `${SITE_URL}${item.href === "/" ? "" : item.href}`, priority: item.href === "/" ? 1 : 0.8 })),
    ...PROJECTS.map((p) => ({ url: `${SITE_URL}/projects/${p.slug}`, priority: 0.6 })),
  ];
}
