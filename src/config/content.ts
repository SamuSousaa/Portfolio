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
  /** Quem fez junto (aparece na ficha como "Em parceria com", com link) */
  partners?: { name: string; url: string }[];
  /** Imagem em /public (ex.: "/projects/hedge/cover.jpg"), idealmente 16:10 */
  cover?: { src: string; alt: Localized };
  /** Parágrafo de apresentação da página do projeto */
  overview?: Localized;
  /** Blocos livres: problema, solução, resultado... */
  sections?: { title: Localized; body: Localized }[];
};

export const PROJECTS: Project[] = [
  {
    slug: "wellnessy",
    name: "Wellnessy",
    description: {
      en: "Medication manager with reminders, prescription OCR and caregiver mode.",
      pt: "Gestão de medicamentos com lembretes, OCR de receitas e modo cuidador.",
      es: "Gestión de medicamentos con recordatorios, OCR de recetas y modo cuidador.",
    },
    stack: ["Next.js", "TypeScript", "Supabase", "Prisma", "TanStack Query", "Web Push", "Tesseract.js"],
    year: "2026",
    role: { en: "Full-stack · Freelance", pt: "Full-stack · Freelance", es: "Full-stack · Freelance" },
    overview: {
      en: "A web app for managing medication — for yourself or for someone you care for. It tracks medicines and schedules, sends automatic reminders, reads prescriptions from a photo and brings together the rest of a health routine: appointments, vital signs, expenses, a journal and health contacts.",
      pt: "Um app web para gerenciar medicamentos — os seus ou os de quem você cuida. Ele registra remédios e horários, envia lembretes automáticos, lê receitas a partir de uma foto e reúne o resto da rotina de saúde: consultas, sinais vitais, gastos, diário e contatos de saúde.",
      es: "Una app web para gestionar medicamentos — los tuyos o los de alguien a quien cuidas. Registra remedios y horarios, envía recordatorios automáticos, lee recetas a partir de una foto y reúne el resto de la rutina de salud: citas, signos vitales, gastos, diario y contactos de salud.",
    },
    sections: [
      {
        title: { en: "Problem", pt: "Problema", es: "Problema" },
        body: {
          en: "Forgetting a dose, losing track of a prescription and spreading health information across notes and apps is common — and worse when you look after someone else. The project also had a hard constraint: run at zero cost.",
          pt: "Esquecer uma dose, perder a receita de vista e espalhar informações de saúde entre anotações e apps é comum — e pior quando você cuida de outra pessoa. O projeto ainda tinha uma restrição firme: funcionar com custo zero.",
          es: "Olvidar una dosis, perder de vista la receta y dispersar la información de salud entre notas y apps es común — y peor cuando cuidas de otra persona. El proyecto además tenía una restricción firme: funcionar con costo cero.",
        },
      },
      {
        title: { en: "Solution", pt: "Solução", es: "Solución" },
        body: {
          en: "Reminders go out by Web Push, fired every 15 minutes by pg_cron inside Supabase. Prescription photos are read by OCR directly in the browser, with no paid API. Dependent profiles and a caregiver mode let one account look after a whole family.",
          pt: "Os lembretes saem por Web Push, disparados a cada 15 minutos pelo pg_cron dentro do Supabase. A foto da receita é lida por OCR direto no navegador, sem API paga. Perfis dependentes e o modo cuidador permitem que uma conta cuide de uma família inteira.",
          es: "Los recordatorios salen por Web Push, disparados cada 15 minutos por pg_cron dentro de Supabase. La foto de la receta se lee por OCR directo en el navegador, sin API de pago. Perfiles dependientes y el modo cuidador permiten que una cuenta cuide de toda una familia.",
        },
      },
      {
        title: { en: "Result", pt: "Resultado", es: "Resultado" },
        body: {
          en: "A complete health routine in one place, built on Next.js, Prisma and Supabase, with tests, error monitoring and product analytics — and no running cost.",
          pt: "Uma rotina de saúde completa num lugar só, construída sobre Next.js, Prisma e Supabase, com testes, monitoramento de erros e analytics de produto — e sem custo de operação.",
          es: "Una rutina de salud completa en un solo lugar, construida sobre Next.js, Prisma y Supabase, con pruebas, monitoreo de errores y analítica de producto — y sin costo de operación.",
        },
      },
    ],
  },
  {
    slug: "apice",
    name: "Ápice",
    description: {
      en: "ENARE study platform with a self-adjusting plan and AI support.",
      pt: "Plataforma de estudos para o ENARE, com plano que se reajusta e IA.",
      es: "Plataforma de estudio para el ENARE, con plan que se reajusta e IA.",
    },
    stack: ["React", "TypeScript", "Supabase", "Claude API", "Zustand", "PWA", "GitHub Actions"],
    year: "2026",
    role: { en: "Full-stack · AI · Freelance", pt: "Full-stack · IA · Freelance", es: "Full-stack · IA · Freelance" },
    overview: {
      en: "A study platform that simulates a full prep course for ENARE 2027 in Dentistry. It turns a 56-week plan into daily goals, collects questions from past exams, runs mock tests and keeps a notebook of review cards — with AI answering doubts right where they come up.",
      pt: "Uma plataforma de estudos que simula um cursinho completo para o ENARE 2027 em Odontologia. Ela transforma um plano de 56 semanas em metas diárias, reúne questões de provas anteriores, aplica simulados e mantém um caderno de cartas de revisão — com IA respondendo dúvidas no lugar onde elas surgem.",
      es: "Una plataforma de estudio que simula un curso completo para el ENARE 2027 en Odontología. Convierte un plan de 56 semanas en metas diarias, reúne preguntas de exámenes anteriores, aplica simulacros y mantiene un cuaderno de tarjetas de repaso — con IA respondiendo dudas justo donde surgen.",
    },
    sections: [
      {
        title: { en: "Problem", pt: "Problema", es: "Problema" },
        body: {
          en: "A rigid study plan breaks the first time life gets in the way: a late topic pushes everything back, and the student ends up deciding alone what to cut.",
          pt: "Um plano de estudos rígido quebra na primeira vez que a vida atrapalha: um assunto atrasado empurra todo o resto, e o aluno acaba decidindo sozinho o que cortar.",
          es: "Un plan de estudio rígido se rompe la primera vez que la vida se interpone: un tema atrasado empuja todo lo demás, y el alumno termina decidiendo solo qué recortar.",
        },
      },
      {
        title: { en: "Solution", pt: "Solução", es: "Solución" },
        body: {
          en: "A pure replanning engine moves late blocks to a free review week or the nearest week with room, and ranks what can be cut by each subject's weight in the exam. The Claude API answers open doubts and comments on questions through a server function, so the key never reaches the browser.",
          pt: "Um motor de reajuste, em função pura, move blocos atrasados para uma semana de revisão livre ou a semana mais próxima com espaço, e ordena o que pode ser cortado pelo peso de cada assunto na prova. A Claude API responde dúvidas e comenta questões por uma função no servidor, então a chave nunca chega ao navegador.",
          es: "Un motor de reajuste, en función pura, mueve bloques atrasados a una semana de repaso libre o a la semana más cercana con espacio, y ordena lo que se puede recortar según el peso de cada tema en el examen. La Claude API responde dudas y comenta preguntas mediante una función en el servidor, así la clave nunca llega al navegador.",
        },
      },
      {
        title: { en: "Result", pt: "Resultado", es: "Resultado" },
        body: {
          en: "A plan that bends instead of breaking, installable as a PWA with push reminders and automatic backups via GitHub Actions.",
          pt: "Um plano que se dobra em vez de quebrar, instalável como PWA, com lembretes por push e backups automáticos pelo GitHub Actions.",
          es: "Un plan que se dobla en lugar de romperse, instalable como PWA, con recordatorios push y copias de seguridad automáticas vía GitHub Actions.",
        },
      },
    ],
  },
  {
    slug: "hedge",
    name: "Hedge",
    description: {
      en: "Personal and shared finance tracker, with split bills and reports.",
      pt: "Controle financeiro pessoal e colaborativo, com contas divididas.",
      es: "Control financiero personal y colaborativo, con cuentas divididas.",
    },
    stack: ["React", "TypeScript", "Supabase", "Tailwind CSS", "Recharts", "Playwright"],
    year: "2025 — 2026",
    role: { en: "Full-stack · Freelance", pt: "Full-stack · Freelance", es: "Full-stack · Freelance" },
    links: { repo: "https://github.com/georgepxto/gestaofinanceira" },
    partners: [{ name: "George Peixoto", url: "https://github.com/georgepxto" }],
    overview: {
      en: "A personal and collaborative finance tracker: it records expenses, splits bills between friends while tracking who paid, manages credit cards, bank accounts and spending goals, and delivers dashboards and PDF reports. Built together with developer George Peixoto.",
      pt: "Um controle financeiro pessoal e colaborativo: registra gastos, divide contas entre amigos com rastreio de quem pagou, gerencia cartões de crédito, contas bancárias e metas de gasto, e entrega dashboards e relatórios em PDF. Construído em parceria com o desenvolvedor George Peixoto.",
      es: "Un control financiero personal y colaborativo: registra gastos, divide cuentas entre amigos con seguimiento de quién pagó, gestiona tarjetas de crédito, cuentas bancarias y metas de gasto, y entrega dashboards e informes en PDF. Construido junto al desarrollador George Peixoto.",
    },
    sections: [
      {
        title: { en: "Problem", pt: "Problema", es: "Problema" },
        body: {
          en: "Shared expenses get lost between chats and spreadsheets: who paid, who still owes, which installment ends this month. The goal was that, within 30 seconds of opening the app, you know your real balance, what you owe and what you're owed.",
          pt: "Gastos divididos se perdem entre conversas e planilhas: quem pagou, quem ainda deve, qual parcela acaba este mês. A meta era que, em 30 segundos com o app aberto, você soubesse seu saldo real, o que deve e o que tem a receber.",
          es: "Los gastos compartidos se pierden entre chats y hojas de cálculo: quién pagó, quién todavía debe, qué cuota termina este mes. La meta era que, en 30 segundos con la app abierta, supieras tu saldo real, lo que debes y lo que te deben.",
        },
      },
      {
        title: { en: "Solution", pt: "Solução", es: "Solución" },
        body: {
          en: "Installments of up to 24 payments, fixed expenses, per-category goals, month closing per person — what isn't paid becomes an open balance — plus cards, accounts, PDF export and push notifications. Supabase with Row Level Security keeps each user's data isolated.",
          pt: "Parcelamento em até 24x, gastos fixos, metas por categoria, fechamento de mês por pessoa — o que não foi pago vira saldo devedor —, além de cartões, contas, exportação em PDF e notificações push. O Supabase com Row Level Security isola os dados de cada usuário.",
          es: "Cuotas de hasta 24 pagos, gastos fijos, metas por categoría, cierre de mes por persona — lo que no se pagó se vuelve saldo pendiente —, además de tarjetas, cuentas, exportación a PDF y notificaciones push. Supabase con Row Level Security aísla los datos de cada usuario.",
        },
      },
      {
        title: { en: "Result", pt: "Resultado", es: "Resultado" },
        body: {
          en: "Numbers as the hero of every screen, one question per page, and a consistent vocabulary across the app — verified with Playwright visual end-to-end tests.",
          pt: "Números como protagonistas de cada tela, uma pergunta por página e vocabulário consistente em todo o app — verificado com testes visuais de ponta a ponta no Playwright.",
          es: "Los números como protagonistas de cada pantalla, una pregunta por página y un vocabulario coherente en toda la app — verificado con pruebas visuales de extremo a extremo en Playwright.",
        },
      },
    ],
  },
  {
    slug: "portfolio",
    name: "Portfólio",
    description: {
      en: "This site: 6 themes, 3 languages and switches that never shift a pixel.",
      pt: "Este site: 6 temas, 3 idiomas e trocas que não movem um pixel.",
      es: "Este sitio: 6 temas, 3 idiomas y cambios que no mueven un píxel.",
    },
    stack: ["Next.js", "TypeScript", "Tailwind CSS", "GSAP", "Lenis", "Vercel"],
    year: "2026",
    role: { en: "Design · Full-stack", pt: "Design · Full-stack", es: "Diseño · Full-stack" },
    status: "live",
    links: { live: "https://portfolio-three-blue-ax48x0ukqa.vercel.app", repo: "https://github.com/SamuSousaa/Portfolio" },
    cover: {
      src: "/projects/portfolio/cover.jpg",
      alt: {
        en: "Home page of the portfolio in the TERMINAL theme",
        pt: "Página inicial do portfólio no tema TERMINAL",
        es: "Página de inicio del portafolio en el tema TERMINAL",
      },
    },
    overview: {
      en: "My own portfolio, designed and built as a project in its own right. A terminal-brutalist identity with six complete themes — each with its own typography, texture and cursor — in English, Portuguese and Spanish, where changing theme or language feels like a transformation, not a jump.",
      pt: "Meu próprio portfólio, desenhado e construído como um projeto de verdade. Uma identidade terminal-brutalista com seis temas completos — cada um com tipografia, textura e cursor próprios — em inglês, português e espanhol, onde trocar de tema ou de idioma parece uma transformação, não um salto.",
      es: "Mi propio portafolio, diseñado y construido como un proyecto en sí mismo. Una identidad terminal-brutalista con seis temas completos — cada uno con su tipografía, textura y cursor — en inglés, portugués y español, donde cambiar de tema o de idioma se siente como una transformación, no un salto.",
    },
    sections: [
      {
        title: { en: "Challenge", pt: "Desafio", es: "Desafío" },
        body: {
          en: "Different fonts and translations have different sizes: a naive theme or language switch makes the whole page jump. The goal was zero layout shift in any combination.",
          pt: "Fontes e traduções diferentes têm tamanhos diferentes: uma troca ingênua de tema ou de idioma faz a página inteira pular. A meta era zero deslocamento em qualquer combinação.",
          es: "Fuentes y traducciones distintas tienen tamaños distintos: un cambio ingenuo de tema o de idioma hace saltar toda la página. La meta era cero desplazamiento en cualquier combinación.",
        },
      },
      {
        title: { en: "Solution", pt: "Solução", es: "Solución" },
        body: {
          en: "Titles are sized from a base unit so every theme keeps the same line height; each text reserves the space of its longest translation; the theme switch is a three-layer wave built on View Transitions. Scripts in Playwright measure every element across all themes and languages.",
          pt: "Os títulos partem de uma unidade-base, então todo tema mantém a mesma altura de linha; cada texto reserva o espaço da sua tradução mais longa; a troca de tema é uma onda em três camadas feita com View Transitions. Scripts no Playwright medem cada elemento em todos os temas e idiomas.",
          es: "Los títulos parten de una unidad base, así cada tema mantiene la misma altura de línea; cada texto reserva el espacio de su traducción más larga; el cambio de tema es una ola en tres capas hecha con View Transitions. Scripts en Playwright miden cada elemento en todos los temas e idiomas.",
        },
      },
      {
        title: { en: "Result", pt: "Resultado", es: "Resultado" },
        body: {
          en: "The site you're on — and material for itself: every theme doubles as a case study of the same content under a different identity.",
          pt: "O site em que você está — e material para ele mesmo: cada tema funciona como um estudo de caso do mesmo conteúdo sob outra identidade.",
          es: "El sitio en el que estás — y material para sí mismo: cada tema funciona como un caso de estudio del mismo contenido bajo otra identidad.",
        },
      },
    ],
  },
];

/** Quantos cartões o painel da home reserva; o que faltar vira slot vazio. */
export const FEATURED_SLOTS = 3;

export type Experience = { period: string; role: Localized; org: string };

/** Da mais recente para a mais antiga. Vazio = o painel mostra "aguardando dados". */
export const EXPERIENCE: Experience[] = [
  {
    period: "2026",
    role: { en: "Full-stack Developer", pt: "Desenvolvedor Full-stack", es: "Desarrollador Full-stack" },
    org: "Wellnessy · Freelance",
  },
  {
    period: "2026",
    role: { en: "Full-stack & AI Developer", pt: "Desenvolvedor Full-stack & IA", es: "Desarrollador Full-stack e IA" },
    org: "Ápice · Freelance",
  },
  {
    period: "2025 — 2026",
    role: {
      en: "Full-stack Developer · with George Peixoto",
      pt: "Desenvolvedor Full-stack · com George Peixoto",
      es: "Desarrollador Full-stack · con George Peixoto",
    },
    org: "Hedge · Freelance",
  },
];

/** Item da stack: nome de tecnologia (igual nos 3 idiomas) ou conceito traduzido. */
export type Skill = string | Localized;
export type SkillGroup = { group: Localized; items: Skill[] };

/** Stack da página Sobre, por grupo. Levantada dos projetos (Hedge, Ápice, Radar de Editais, Tally, TeethSync, este site). */
export const SKILLS: SkillGroup[] = [
  {
    group: { en: "LANGUAGES", pt: "LINGUAGENS", es: "LENGUAJES" },
    items: ["TypeScript", "JavaScript", "SQL", "HTML/CSS"],
  },
  {
    group: { en: "FRONT-END", pt: "FRONT-END", es: "FRONT-END" },
    items: ["React", "Next.js", "Vite", "Tailwind CSS", "shadcn/ui", "TanStack Query", "Zustand", "GSAP"],
  },
  {
    group: { en: "BACK-END & DATA", pt: "BACK-END & DADOS", es: "BACK-END Y DATOS" },
    items: ["Supabase", "PostgreSQL", "Prisma", "Firebase", "Zod", "Web Push"],
  },
  {
    group: { en: "AI & LLM", pt: "IA & LLM", es: "IA Y LLM" },
    items: [
      "Claude API",
      "Claude Code",
      { en: "Agentic systems", pt: "Sistemas agênticos", es: "Sistemas agénticos" },
      { en: "LLM integration", pt: "Integração com LLM", es: "Integración con LLM" },
      { en: "Prompt engineering", pt: "Engenharia de prompt", es: "Ingeniería de prompts" },
      "OCR (Tesseract.js)",
    ],
  },
  {
    group: { en: "INFRA & DEPLOY", pt: "INFRA & DEPLOY", es: "INFRA Y DEPLOY" },
    items: ["Vercel", "GitHub Actions", "PWA", "Sentry", "PostHog"],
  },
  {
    group: { en: "QUALITY & TOOLS", pt: "QUALIDADE & FERRAMENTAS", es: "CALIDAD Y HERRAMIENTAS" },
    items: ["Git", "Playwright", "Vitest", "Testing Library", "ESLint"],
  },
];

/** Principais (os que mais se repetem nos projetos): aparecem no acento. */
export const SKILL_HIGHLIGHTS = ["TypeScript", "React", "Supabase", "Claude API"];

export const MARQUEE: Localized<string[]> = {
  en: ["AGENTIC SYSTEMS", "DEVELOPER TOOLS", "TYPESCRIPT", "NEXT.JS", "LLM INTEGRATION", "THOUGHTFUL PRODUCTS"],
  pt: ["SISTEMAS AGÊNTICOS", "FERRAMENTAS DEV", "TYPESCRIPT", "NEXT.JS", "INTEGRAÇÃO COM LLM", "PRODUTOS BEM PENSADOS"],
  es: ["SISTEMAS AGÉNTICOS", "HERRAMIENTAS DEV", "TYPESCRIPT", "NEXT.JS", "INTEGRACIÓN CON LLM", "PRODUCTOS BIEN PENSADOS"],
};
