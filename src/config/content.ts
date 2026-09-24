/**
 * Conteúdo pessoal. Nenhum componente tem texto pessoal fixo; tudo sai daqui.
 * Campos `Localized` têm uma versão por idioma (en / pt / es).
 */
import type { Localized } from "@/i18n/config";

export const PROFILE = {
  firstName: "SAMUEL",
  lastName: "SOUSA",
  initials: "SS",
  role: { en: "Software Developer", pt: "Desenvolvedor de Software", es: "Desarrollador de Software" } as Localized,
  bio: {
    en: "AI-focused software engineer building agentic systems, developer tools, and thoughtful products.",
    pt: "Engenheiro de software focado em IA, construindo sistemas agênticos, ferramentas para desenvolvedores e produtos bem pensados.",
    es: "Ingeniero de software enfocado en IA, construyendo sistemas agénticos, herramientas para desarrolladores y productos bien pensados.",
  } as Localized,
  location: {
    city: "Parnaíba, PI",
    lat: -2.9055,
    lng: -41.7734,
  },
  status: { en: "Accepting Proposals", pt: "Aceitando propostas", es: "Aceptando propuestas" } as Localized,
  version: "V.1.0",
};

export const CONTACT = {
  email: { user: "samusousaaicloud", domain: "gmail.com" }, // montado só no cliente
  github: "https://github.com/SamuSousaa",
  linkedin: "https://www.linkedin.com/in/samuel-sousa-33153443a/",
};

export type Project = {
  slug: string;
  name: string;
  description: Localized;
  stack: string[];
  year: string;
};

export const PROJECTS: Project[] = [
  {
    slug: "hedge",
    name: "Hedge",
    description: {
      en: "Financial management app.",
      pt: "App de gestão financeira.",
      es: "App de gestión financiera.",
    },
    stack: ["Next.js"],
    year: "2026",
  },
];

/** Quantos cartões o painel da home reserva; o que faltar vira slot vazio. */
export const FEATURED_SLOTS = 3;

export type Experience = { period: string; role: Localized; org: string };

/** TODO: preencher. Vazio = o painel mostra o estado "aguardando dados". */
export const EXPERIENCE: Experience[] = [];

export const MARQUEE: Localized<string[]> = {
  en: ["AGENTIC SYSTEMS", "DEVELOPER TOOLS", "TYPESCRIPT", "NEXT.JS", "LLM INTEGRATION", "THOUGHTFUL PRODUCTS"],
  pt: ["SISTEMAS AGÊNTICOS", "FERRAMENTAS DEV", "TYPESCRIPT", "NEXT.JS", "INTEGRAÇÃO COM LLM", "PRODUTOS BEM PENSADOS"],
  es: ["SISTEMAS AGÉNTICOS", "HERRAMIENTAS DEV", "TYPESCRIPT", "NEXT.JS", "INTEGRACIÓN CON LLM", "PRODUCTOS BIEN PENSADOS"],
};
