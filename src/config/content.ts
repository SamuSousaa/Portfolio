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
  email: { user: "samusousadev", domain: "zohomail.com" }, // montado só no cliente
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
  /** Imagem em /public (ex.: "/projects/hedge/d-cover.jpg"), idealmente 16:10 */
  cover?: { src: string; alt: Localized };
  /** Feito para celular (o visor mostra o aviso "feito para celular") */
  device?: "mobile";
  /** As telas usam dados de demonstração (a galeria mostra o aviso "dados fictícios") */
  demoData?: boolean;
  /** Funcionalidades em destaque: o que cada uma faz, com a tela de celular ao lado */
  features?: Feature[];
  /** Telas de celular (390×844, até 3) numa faixa própria; para projetos sem `features` */
  mobile?: Shot[];
  /** Telas de desktop no visor (16:10, em /public/projects/<slug>/), 2 ou 3 além da capa: legenda curta + texto alternativo */
  gallery?: { src: string; caption: Localized; alt: Localized }[];
  /** Parágrafo de apresentação da página do projeto */
  overview?: Localized;
  /** Blocos livres: problema, solução, resultado... */
  sections?: { title: Localized; body: Localized }[];
};

/** Uma captura de tela: arquivo em /public + texto alternativo */
export type Shot = { src: string; alt: Localized };
export type Feature = {
  /** Aba ou área do app (rótulo curto) */
  tag: Localized;
  title: Localized;
  body: Localized;
  /** Detalhes curtos, em lista */
  points?: Localized[];
  /** Tela de celular (390×844) em que a funcionalidade aparece */
  shot: Shot;
};

/** Captura com dados de demonstração: o texto alternativo sai do nome do app + nome da tela. */
const shot = (app: string, src: string, name: Localized): Shot => ({
  src,
  alt: { en: `${app} — ${name.en} (demo data)`, pt: `${app} — ${name.pt} (dados fictícios)`, es: `${app} — ${name.es} (datos ficticios)` },
});
/** Tela da galeria: a legenda é o próprio nome da tela. */
const screen = (app: string, src: string, name: Localized) => ({ ...shot(app, src, name), caption: name });

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
    status: "wip",
    cover: {
      src: "/projects/wellnessy/d-hoje.jpg",
      alt: { en: "Wellnessy — Today's doses (demo data)", pt: "Wellnessy — Doses de hoje (dados fictícios)", es: "Wellnessy — Dosis de hoy (datos ficticios)" },
    },
    device: "mobile",
    demoData: true,
    gallery: [
      screen("Wellnessy", "/projects/wellnessy/d-remedios.jpg", { en: "Medicines", pt: "Remédios", es: "Medicamentos" }),
      screen("Wellnessy", "/projects/wellnessy/d-monitor.jpg", { en: "Blood pressure", pt: "Pressão arterial", es: "Presión arterial" }),
    ],
    features: [
      {
        tag: { en: "Today", pt: "Hoje", es: "Hoy" },
        title: { en: "The next dose, first", pt: "A dose de agora, primeiro", es: "La dosis de ahora, primero" },
        body: {
          en: "The screen opens by answering what the person came to find out: which medicine is next, and whether this one has already been taken. Each dose is confirmed with one tap, and its state is told by shape and word, never by colour alone.",
          pt: "A tela abre respondendo o que a pessoa veio saber: qual é o próximo remédio e se este já foi tomado. Cada dose é confirmada com um toque, e o estado dela é dito pela forma e pela palavra, nunca só pela cor.",
          es: "La pantalla abre respondiendo lo que la persona vino a saber: cuál es el próximo remedio y si este ya fue tomado. Cada dosis se confirma con un toque, y su estado se dice con la forma y la palabra, nunca solo con el color.",
        },
        points: [
          { en: "Reminders by Web Push, with the app closed", pt: "Lembrete por Web Push, com o app fechado", es: "Recordatorio por Web Push, con la app cerrada" },
          { en: "A larger-text mode for older users", pt: "Modo de letras maiores para quem precisa", es: "Modo de letras grandes para quien lo necesita" },
        ],
        shot: shot("Wellnessy", "/projects/wellnessy/m-hoje.jpg", { en: "Today's doses", pt: "Doses de hoje", es: "Dosis de hoy" }),
      },
      {
        tag: { en: "Prescription", pt: "Receita", es: "Receta" },
        title: { en: "The prescription, read on the phone", pt: "A receita, lida no aparelho", es: "La receta, leída en el móvil" },
        body: {
          en: "Take a photo of the prescription and the app suggests the medicines, with name, dose and form already filled in. The reading happens in the browser itself: the photo is never uploaded, and no paid service is involved.",
          pt: "Fotografe a receita e o app sugere os remédios, com nome, dose e forma já preenchidos. A leitura acontece no próprio navegador: a foto não é enviada para lugar nenhum e não há serviço pago no meio.",
          es: "Fotografía la receta y la app sugiere los remedios, con nombre, dosis y forma ya completados. La lectura ocurre en el propio navegador: la foto no se envía a ningún lado y no hay servicio de pago de por medio.",
        },
        points: [
          { en: "OCR with Tesseract.js, on the device", pt: "OCR com Tesseract.js, no aparelho", es: "OCR con Tesseract.js, en el dispositivo" },
          { en: "You check each item before saving", pt: "Você confere cada item antes de salvar", es: "Revisas cada ítem antes de guardar" },
        ],
        shot: shot("Wellnessy", "/projects/wellnessy/m-receita.jpg", { en: "Prescription scan", pt: "Leitura de receita", es: "Lectura de receta" }),
      },
      {
        tag: { en: "Profiles", pt: "Perfis", es: "Perfiles" },
        title: { en: "The whole family in one place", pt: "A família num lugar só", es: "La familia en un solo lugar" },
        body: {
          en: "One account looks after the medicines of people who don't use the app — an elderly mother, a child — each in a separate profile, with their own doses and history. Those who do use it can invite a caregiver, who follows along in read-only mode.",
          pt: "Uma conta cuida dos remédios de quem não usa o app — uma mãe idosa, uma criança — cada um num perfil separado, com as próprias doses e o próprio histórico. Quem usa pode convidar um cuidador, que acompanha em modo só leitura.",
          es: "Una cuenta cuida los remedios de quien no usa la app — una madre mayor, un niño — cada uno en un perfil separado, con sus propias dosis e historial. Quien la usa puede invitar a un cuidador, que acompaña en modo solo lectura.",
        },
        points: [
          { en: "Caregiver access by invitation and approval", pt: "Cuidador entra por convite e aprovação", es: "El cuidador entra por invitación y aprobación" },
          { en: "Archiving a profile can be undone", pt: "Arquivar um perfil pode ser desfeito", es: "Archivar un perfil se puede deshacer" },
        ],
        shot: shot("Wellnessy", "/projects/wellnessy/m-perfil.jpg", { en: "Profile of a person under care", pt: "Perfil de quem você cuida", es: "Perfil de una persona bajo cuidado" }),
      },
    ],
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
      en: "ENARE study platform: topic tracks, spaced review and AI support.",
      pt: "Plataforma de estudos para o ENARE: trilhas, revisão espaçada e IA.",
      es: "Plataforma de estudio para el ENARE: rutas, repaso espaciado e IA.",
    },
    stack: ["React", "TypeScript", "Supabase", "Claude API", "TanStack Query", "Zustand", "PWA", "GitHub Actions"],
    year: "2026",
    role: { en: "Full-stack · AI · Freelance", pt: "Full-stack · IA · Freelance", es: "Full-stack · IA · Freelance" },
    status: "live",
    links: { live: "https://apice-ten.vercel.app" },
    cover: {
      src: "/projects/apice/d-inicio.jpg",
      alt: { en: "Ápice — Home (demo data)", pt: "Ápice — Início (dados fictícios)", es: "Ápice — Inicio (datos ficticios)" },
    },
    demoData: true,
    gallery: [
      screen("Ápice", "/projects/apice/d-modulo.jpg", { en: "Topics of a module", pt: "Tópicos de um módulo", es: "Temas de un módulo" }),
      screen("Ápice", "/projects/apice/d-desempenho.jpg", { en: "Performance", pt: "Desempenho", es: "Rendimiento" }),
    ],
    mobile: [
      shot("Ápice", "/projects/apice/m-inicio.jpg", { en: "Home on a phone", pt: "Início no celular", es: "Inicio en el móvil" }),
      shot("Ápice", "/projects/apice/m-modulo.jpg", { en: "Topics of a module on a phone", pt: "Tópicos de um módulo no celular", es: "Temas de un módulo en el móvil" }),
      shot("Ápice", "/projects/apice/m-revisar.jpg", { en: "Review queue on a phone", pt: "Fila de revisão no celular", es: "Cola de repaso en el móvil" }),
    ],
    overview: {
      en: "A prep platform for ENARE in Dentistry, built for a study group: each person joins by invitation and keeps their own study data, while the question bank is shared. Study is organised by topic — 243 of them, each the size of one sitting, across three tracks — with lessons, questions from past exams, mock tests and reviews that come back at the right time.",
      pt: "Uma plataforma de preparação para o ENARE em Odontologia, feita para uma turma: cada pessoa entra por convite e tem os próprios dados de estudo, e o banco de questões é compartilhado. O estudo é por tópico — 243, cada um do tamanho de uma sentada, em três trilhas — com aulas, questões de provas anteriores, simulados e revisões que voltam na hora certa.",
      es: "Una plataforma de preparación para el ENARE en Odontología, hecha para un grupo de estudio: cada persona entra por invitación y tiene sus propios datos, y el banco de preguntas es compartido. El estudio es por tema — 243, cada uno del tamaño de una sentada, en tres rutas — con clases, preguntas de exámenes anteriores, simulacros y repasos que vuelven en el momento justo.",
    },
    sections: [
      {
        title: { en: "Problem", pt: "Problema", es: "Problema" },
        body: {
          en: "A study plan with deadlines turns into pressure: one late topic pushes everything back, the countdown weighs, and the student starts studying for the tool. The decision was to invert it — showing what has been done is a reward; showing what is missing is pressure.",
          pt: "Plano de estudo com prazo vira cobrança: um assunto atrasado empurra todo o resto, a contagem regressiva pesa e a pessoa passa a estudar para a ferramenta. A decisão foi inverter — mostrar o que já foi feito é recompensa; mostrar o que falta é pressão.",
          es: "Un plan de estudio con plazos se vuelve presión: un tema atrasado empuja todo lo demás, la cuenta regresiva pesa y la persona termina estudiando para la herramienta. La decisión fue invertirlo — mostrar lo que ya se hizo es recompensa; mostrar lo que falta es presión.",
        },
      },
      {
        title: { en: "Solution", pt: "Solução", es: "Solución" },
        body: {
          en: "Three review engines written as pure functions: topic review, where the score decides whether you advance, repeat or restart; SM-2 flashcards; and an error notebook that brings a missed question back without the answer key. The home screen asks how much time you have today and builds the session that fits. The Claude API answers doubts through a server function with a daily cap, so the key never reaches the browser.",
          pt: "Três motores de revisão em funções puras: a revisão de tópico, em que o acerto decide se você avança, repete ou recomeça; cartas em SM-2; e um caderno de erros que devolve a questão errada sem o gabarito. A tela inicial pergunta quanto tempo há hoje e monta a sessão que cabe nele. A Claude API responde dúvidas por uma função no servidor, com teto diário, então a chave nunca chega ao navegador.",
          es: "Tres motores de repaso en funciones puras: el repaso por tema, donde el acierto decide si avanzas, repites o reinicias; tarjetas en SM-2; y un cuaderno de errores que devuelve la pregunta fallada sin la respuesta. La pantalla de inicio pregunta cuánto tiempo hay hoy y arma la sesión que cabe en él. La Claude API responde dudas mediante una función en el servidor, con tope diario, así la clave nunca llega al navegador.",
        },
      },
      {
        title: { en: "Result", pt: "Resultado", es: "Resultado" },
        body: {
          en: "No screen shows a delay, a target or a countdown; reviews stay available and never expire. Installable as a PWA, with search across all content and automatic backups via GitHub Actions.",
          pt: "Nenhuma tela mostra atraso, meta ou contagem regressiva; as revisões ficam disponíveis e nunca vencem. Instalável como PWA, com busca em todo o conteúdo e backups automáticos pelo GitHub Actions.",
          es: "Ninguna pantalla muestra atraso, meta o cuenta regresiva; los repasos quedan disponibles y nunca vencen. Instalable como PWA, con búsqueda en todo el contenido y copias de seguridad automáticas vía GitHub Actions.",
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
    status: "live",
    links: { live: "https://gethedge.vercel.app", repo: "https://github.com/georgepxto/gestaofinanceira" },
    cover: {
      src: "/projects/hedge/d-cover.jpg",
      alt: { en: "Hedge landing page: “Seu dinheiro deixa pistas.” beside the dashboard (demo data)", pt: "Landing page do Hedge: “Seu dinheiro deixa pistas.” ao lado do dashboard (dados fictícios)", es: "Landing page de Hedge: “Seu dinheiro deixa pistas.” junto al dashboard (datos ficticios)" },
    },
    demoData: true,
    features: [
      {
        tag: { en: "Home", pt: "Início", es: "Inicio" },
        title: { en: "Month-end, seen today", pt: "O fim do mês, hoje", es: "El fin de mes, hoy" },
        body: {
          en: "The home screen starts from today's balance and adds what still comes in and goes out until the last day — salary, what friends will pay back, fixed bills and the card statement — to show how much is really left.",
          pt: "A tela inicial parte do saldo de hoje e soma o que ainda entra e sai até o último dia — salário, o que vão te devolver, contas fixas e a fatura do cartão — para mostrar quanto sobra de verdade.",
          es: "La pantalla de inicio parte del saldo de hoy y suma lo que aún entra y sale hasta el último día — sueldo, lo que te van a devolver, cuentas fijas y la factura de la tarjeta — para mostrar cuánto queda de verdad.",
        },
        points: [
          { en: "Balance computed from the entry history", pt: "Saldo calculado do histórico de lançamentos", es: "Saldo calculado del historial de movimientos" },
          { en: "Asks whether the salary has landed", pt: "Pergunta se o salário já caiu na conta", es: "Pregunta si el sueldo ya entró a la cuenta" },
        ],
        shot: shot("Hedge", "/projects/hedge/m-inicio.jpg", { en: "Home on a phone", pt: "Início no celular", es: "Inicio en el móvil" }),
      },
      {
        tag: { en: "People", pt: "Pessoas", es: "Personas" },
        title: { en: "Who owes you, by person", pt: "Quem te deve, por pessoa", es: "Quién te debe, por persona" },
        body: {
          en: "When you log a split expense, each share becomes a charge under that person's name. The screen adds everything up per person — this month's and what was left from earlier ones — so nobody has to remember who paid for what.",
          pt: "Ao lançar um gasto dividido, a parte de cada um vira uma cobrança no nome da pessoa. A tela soma tudo por pessoa — o que é do mês e o que ficou de meses anteriores — e ninguém precisa lembrar quem pagou o quê.",
          es: "Al registrar un gasto dividido, la parte de cada uno se vuelve un cobro a nombre de la persona. La pantalla suma todo por persona — lo del mes y lo que quedó de meses anteriores — y nadie tiene que recordar quién pagó qué.",
        },
        points: [
          { en: "Installments of up to 24 payments", pt: "Parcelamento em até 24 vezes", es: "Cuotas de hasta 24 pagos" },
          { en: "Fixed expenses can be split too", pt: "Gasto fixo também pode ser dividido", es: "El gasto fijo también se puede dividir" },
        ],
        shot: shot("Hedge", "/projects/hedge/m-pessoas.jpg", { en: "People on a phone", pt: "Pessoas no celular", es: "Personas en el móvil" }),
      },
      {
        tag: { en: "Collections", pt: "Cobranças", es: "Cobros" },
        title: { en: "Partial payments, on record", pt: "Pagou uma parte? Fica anotado", es: "¿Pagó una parte? Queda anotado" },
        body: {
          en: "A charge can be paid bit by bit: every payment goes into its history, the bar shows how much has come back, and the rest stays open. When the month closes, what wasn't paid becomes an outstanding balance instead of disappearing.",
          pt: "Uma cobrança pode ser paga aos poucos: cada pagamento entra no histórico, a barra mostra quanto já voltou e o resto continua em aberto. No fechamento do mês, o que não foi pago vira saldo devedor em vez de sumir.",
          es: "Un cobro puede pagarse de a poco: cada pago entra en el historial, la barra muestra cuánto ya volvió y el resto sigue abierto. Al cerrar el mes, lo que no se pagó se vuelve saldo pendiente en vez de desaparecer.",
        },
        points: [
          { en: "Payment history, with undo", pt: "Histórico de pagamentos, com reversão", es: "Historial de pagos, con reversión" },
          { en: "Filter by person and by status", pt: "Filtro por pessoa e por situação", es: "Filtro por persona y por estado" },
        ],
        shot: shot("Hedge", "/projects/hedge/m-cobrancas.jpg", { en: "Collections on a phone", pt: "Cobranças no celular", es: "Cobros en el móvil" }),
      },
    ],
    gallery: [
      screen("Hedge", "/projects/hedge/d-inicio.jpg", { en: "Home", pt: "Início", es: "Inicio" }),
      screen("Hedge", "/projects/hedge/d-lancamentos.jpg", { en: "Expenses", pt: "Lançamentos", es: "Gastos" }),
    ],
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
    links: { live: "https://samuelsousadev.com.br", repo: "https://github.com/SamuSousaa/Portfolio" },
    cover: {
      src: "/projects/portfolio/cover.jpg",
      alt: {
        en: "Home page of the portfolio in the TERMINAL theme",
        pt: "Página inicial do portfólio no tema TERMINAL",
        es: "Página de inicio del portafolio en el tema TERMINAL",
      },
    },
    gallery: [
      {
        src: "/projects/portfolio/about.jpg",
        caption: { en: "About · BLUEPRINT", pt: "Sobre · BLUEPRINT", es: "Sobre mí · BLUEPRINT" },
        alt: { en: "About page in the BLUEPRINT theme", pt: "Página Sobre no tema BLUEPRINT", es: "Página Sobre mí en el tema BLUEPRINT" },
      },
      {
        src: "/projects/portfolio/projects.jpg",
        caption: { en: "Projects · COBALTO", pt: "Projetos · COBALTO", es: "Proyectos · COBALTO" },
        alt: { en: "Project index in the COBALTO theme", pt: "Índice de projetos no tema COBALTO", es: "Índice de proyectos en el tema COBALTO" },
      },
      {
        src: "/projects/portfolio/project.jpg",
        caption: { en: "Project page · FORJA", pt: "Página de projeto · FORJA", es: "Página de proyecto · FORJA" },
        alt: { en: "Project page in the FORJA theme", pt: "Página de projeto no tema FORJA", es: "Página de proyecto en el tema FORJA" },
      },
      {
        src: "/projects/portfolio/contact.jpg",
        caption: { en: "Contact · SONAR", pt: "Contato · SONAR", es: "Contacto · SONAR" },
        alt: { en: "Contact page with the e-mail revealed, SONAR theme", pt: "Página de contato com o e-mail revelado, tema SONAR", es: "Página de contacto con el correo revelado, tema SONAR" },
      },
      {
        src: "/projects/portfolio/home-herbario.jpg",
        caption: { en: "Home · HERBÁRIO", pt: "Home · HERBÁRIO", es: "Inicio · HERBÁRIO" },
        alt: { en: "Home page in the HERBÁRIO theme", pt: "Página inicial no tema HERBÁRIO", es: "Página de inicio en el tema HERBÁRIO" },
      },
      {
        src: "/projects/portfolio/loader.jpg",
        caption: { en: "Boot loader", pt: "Loader de boot", es: "Loader de arranque" },
        alt: { en: "Boot loader counting to 100%", pt: "Loader de boot contando até 100%", es: "Loader de arranque contando hasta 100%" },
      },
    ],
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
