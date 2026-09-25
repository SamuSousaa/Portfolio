/**
 * Conteúdo pessoal. Nenhum componente tem texto pessoal fixo; tudo sai daqui.
 * Campos `Localized` têm uma versão por idioma (en / pt / es).
 */
import type { Localized } from "@/i18n/config";

export type Photo = { src: string; alt: Localized; position?: string };

export const PROFILE = {
  firstName: "SAMUEL",
  lastName: "SOUSA",
  initials: "SS",
  role: { en: "Software Developer", pt: "Desenvolvedor de Software", es: "Desarrollador de Software" } as Localized,
  bio: {
    en: "I build software where AI does real work — agentic systems, developer tools and precise, well-crafted interfaces.",
    pt: "Construo software em que a IA trabalha de verdade — sistemas agênticos, ferramentas para desenvolvedores e interfaces precisas e bem-acabadas.",
    es: "Construyo software en el que la IA trabaja de verdad — sistemas agénticos, herramientas para desarrolladores e interfaces precisas y bien acabadas.",
  } as Localized,
  location: {
    city: "Parnaíba, PI",
    lat: -2.9055,
    lng: -41.7734,
    timeZone: "America/Fortaleza",
    utc: "UTC−03",
  },
  status: { en: "Accepting Proposals", pt: "Aceitando propostas", es: "Aceptando proyectos" } as Localized,
  version: "V.1.0",
  /**
   * Foto em /public, idealmente 4:5 (sem ela, o retrato vira prancha técnica).
   * `position` = object-position do recorte (ex.: "50% 20%" puxa o corte para cima).
   */
  portrait: {
    src: "/about/portrait.jpg",
    alt: { en: "Portrait of Samuel Sousa", pt: "Retrato de Samuel Sousa", es: "Retrato de Samuel Sousa" },
    position: "50% 20%",
  } as Photo | undefined,
  /** Foto do quadro do hero da home (FIG.01), quadrada. Sem ela, o quadro mostra o monograma. */
  heroPhoto: {
    src: "/about/hero.jpg",
    alt: { en: "Samuel Sousa", pt: "Samuel Sousa", es: "Samuel Sousa" },
  } as Photo | undefined,
  /** Parágrafos da página Sobre (um item por parágrafo); vazio = "aguardando dados". */
  about: [
    {
      en: "I'm a software engineer based in Parnaíba, Brazil, working where code and language models meet. I like building agentic systems — software that doesn't just answer, but plans, uses tools and gets tasks done — and the tools that make that work faster for other developers.",
      pt: "Sou engenheiro de software em Parnaíba, no Piauí, e trabalho onde código e modelos de linguagem se encontram. Gosto de construir sistemas agênticos — software que não só responde, mas planeja, usa ferramentas e conclui tarefas — e as ferramentas que tornam esse trabalho mais rápido para outros desenvolvedores.",
      es: "Soy ingeniero de software en Parnaíba, Brasil, y trabajo donde el código y los modelos de lenguaje se encuentran. Me gusta construir sistemas agénticos — software que no solo responde, sino que planifica, usa herramientas y completa tareas — y las herramientas que hacen ese trabajo más rápido para otros desarrolladores.",
    },
    {
      en: "I treat the interface with the same rigor as the architecture. In Hedge, a financial management app, that means clear numbers and frictionless flows; in this portfolio, themes that switch without moving a pixel and animations that respect people who prefer less motion. Detail isn't decoration: it's what makes a product feel trustworthy.",
      pt: "Trato a interface com o mesmo rigor da arquitetura. No Hedge, um app de gestão financeira, isso significa números claros e fluxos sem atrito; neste portfólio, temas que trocam sem mover um pixel e animações que respeitam quem prefere menos movimento. Detalhe não é enfeite: é o que faz um produto parecer confiável.",
      es: "Trato la interfaz con el mismo rigor que la arquitectura. En Hedge, una app de gestión financiera, eso significa números claros y flujos sin fricción; en este portafolio, temas que cambian sin mover un píxel y animaciones que respetan a quien prefiere menos movimiento. El detalle no es adorno: es lo que hace que un producto inspire confianza.",
    },
    {
      en: "I'm currently open to proposals — applied AI, internal tools, or products that need to move from prototype to real use. If you have a problem like that, the contact tab is one click away.",
      pt: "Hoje estou aberto a propostas — IA aplicada, ferramentas internas ou produtos que precisam sair do protótipo e chegar ao uso real. Se você tem um problema assim, a aba de contato está a um clique.",
      es: "Hoy estoy abierto a propuestas — IA aplicada, herramientas internas o productos que necesitan pasar del prototipo al uso real. Si tienes un problema así, la pestaña de contacto está a un clic.",
    },
  ] as Localized[],
};

/** "Samuel Sousa": nome em caixa normal, para títulos de aba, metadados e buscadores. */
const cap = (w: string) => w.charAt(0) + w.slice(1).toLowerCase();
export const fullName = `${cap(PROFILE.firstName)} ${cap(PROFILE.lastName)}`;

export const CONTACT = {
  email: { user: "samusousaaicloud", domain: "gmail.com" }, // montado só no cliente
  github: "https://github.com/SamuSousaa",
  linkedin: "https://www.linkedin.com/in/samuel-sousa-33153443a/",
};

export type ProjectStatus = "live" | "wip" | "archived";

/**
 * Um projeto. Só slug, name, description, stack e year são obrigatórios;
 * o resto aparece na página quando existir (senão, o bloco mostra "aguardando dados").
 */
export type Project = {
  slug: string;
  name: string;
  /** Uma linha, usada no índice e nos cards */
  description: Localized;
  stack: string[];
  year: string;
  /** Seu papel no projeto (ex.: "Full-stack · Design") */
  role?: Localized;
  status?: ProjectStatus;
  links?: { live?: string; repo?: string };
  /** Imagem em /public (ex.: "/projects/hedge/cover.jpg"), idealmente 16:10 */
  cover?: { src: string; alt: Localized };
  /** Parágrafo de apresentação da página do projeto */
  overview?: Localized;
  /** Blocos livres: problema, solução, resultado... */
  sections?: { title: Localized; body: Localized }[];
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

export type SkillGroup = { group: Localized; items: string[] };

/** Stack da página Sobre, por grupo. TODO: completar (por ora, só o que já aparece no site). */
export const SKILLS: SkillGroup[] = [
  { group: { en: "LANGUAGES", pt: "LINGUAGENS", es: "LENGUAJES" }, items: ["TypeScript"] },
  { group: { en: "FRAMEWORKS", pt: "FRAMEWORKS", es: "FRAMEWORKS" }, items: ["Next.js"] },
  {
    group: { en: "AI", pt: "IA", es: "IA" },
    items: ["LLM integration", "Agentic systems"],
  },
];

export const MARQUEE: Localized<string[]> = {
  en: ["AGENTIC SYSTEMS", "DEVELOPER TOOLS", "TYPESCRIPT", "NEXT.JS", "LLM INTEGRATION", "THOUGHTFUL PRODUCTS"],
  pt: ["SISTEMAS AGÊNTICOS", "FERRAMENTAS DEV", "TYPESCRIPT", "NEXT.JS", "INTEGRAÇÃO COM LLM", "PRODUTOS BEM PENSADOS"],
  es: ["SISTEMAS AGÉNTICOS", "HERRAMIENTAS DEV", "TYPESCRIPT", "NEXT.JS", "INTEGRACIÓN CON LLM", "PRODUCTOS BIEN PENSADOS"],
};
