import type { Briefing } from "./types";
import { portalNoticias } from "./portal-noticias";

/** Registro slug → configuração. Um briefing novo entra aqui e já ganha a rota /briefing/<slug>. */
const BRIEFINGS: Briefing[] = [portalNoticias];

export const BRIEFING_SLUGS = BRIEFINGS.map((b) => b.slug);

export function getBriefing(slug: string) {
  return BRIEFINGS.find((b) => b.slug === slug) ?? null;
}
