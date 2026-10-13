import type { Arquivo, Briefing, Condicao, ItemLink, Opcao, Pergunta, Respostas, SubCampo, Valor, ValorGrupo } from "./types";

/*
 * Regras do briefing, sem nada de interface: quais perguntas aparecem, limpeza e
 * validação das respostas e o texto de cada resposta. O formulário e a rota de
 * API usam as mesmas funções, então o servidor confere exatamente o que a tela pede.
 */

export const LIMITES = { texto: 200, longo: 2000, link: 300, comentario: 500, outro: 80, extra: 2000 };

export const UPLOAD = {
  maxBytes: 10 * 1024 * 1024,
  tipos: ["image/png", "image/jpeg", "image/webp", "image/svg+xml", "application/pdf"],
  accept: ".png,.jpg,.jpeg,.webp,.svg,.pdf",
};

/** Caminho no Storage: <slug>/<uuid>/<nome do arquivo> */
const CAMINHO = /^[a-z0-9-]+\/[0-9a-f-]{36}\/[\w.-]{1,120}$/;

export type Item = { pergunta: Pergunta; etapa: number };

export function todas(b: Briefing): Item[] {
  return b.etapas.flatMap((e, etapa) => e.perguntas.map((pergunta) => ({ pergunta, etapa })));
}

function atende(c: Condicao, r: Respostas) {
  const v = r[c.campo];
  if ("inclui" in c) return Array.isArray(v) && (v as unknown[]).includes(c.inclui);
  if ("naoInclui" in c) return !(Array.isArray(v) && (v as unknown[]).includes(c.naoInclui));
  if (typeof v !== "string" || !v) return false;
  return "igual" in c ? v === c.igual : v !== c.diferente;
}

export function visivel(p: Pergunta, r: Respostas) {
  return !p.quando || [p.quando].flat().every((c) => atende(c, r));
}

/** Perguntas que se aplicam às respostas dadas até aqui, na ordem. */
export function visiveis(b: Briefing, r: Respostas): Item[] {
  return todas(b).filter((i) => visivel(i.pergunta, r));
}

export function subVisivel(c: SubCampo, v: ValorGrupo) {
  return !c.quando || v[c.quando.campo] === c.quando.igual;
}

/** Endereço com protocolo, ou null se não parecer um endereço. */
export function normalizarLink(s: string): string | null {
  const t = s.trim();
  if (!t) return null;
  try {
    const u = new URL(/^https?:\/\//i.test(t) ? t : `https://${t}`);
    return /^https?:$/.test(u.protocol) && u.hostname.includes(".") ? u.href : null;
  } catch {
    return null;
  }
}

const texto = (v: unknown, max: number) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const temOpcao = (opcoes: Opcao[] | undefined, v: unknown): v is string =>
  typeof v === "string" && !!opcoes?.some((o) => o.valor === v);
const ehObjeto = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null && !Array.isArray(v);

function limparArquivo(v: unknown, slug: string): Arquivo | undefined {
  if (!ehObjeto(v)) return undefined;
  const { caminho, nome, tamanho } = v;
  if (typeof caminho !== "string" || !CAMINHO.test(caminho) || !caminho.startsWith(`${slug}/`)) return undefined;
  return { caminho, nome: texto(nome, 120) || "arquivo", tamanho: typeof tamanho === "number" ? tamanho : 0 };
}

/**
 * Resposta no formato do tipo da pergunta: apara espaços, corta no limite,
 * descarta o que não pertence. Devolve undefined quando não sobra nada.
 */
export function limpar(p: Pergunta, bruto: unknown, slug: string): Valor | undefined {
  switch (p.tipo) {
    case "texto":
    case "texto_longo":
      return texto(bruto, p.tipo === "texto" ? LIMITES.texto : LIMITES.longo) || undefined;
    case "unica":
      return temOpcao(p.opcoes, bruto) ? bruto : undefined;
    case "multipla": {
      if (!Array.isArray(bruto)) return undefined;
      const marcadas = p.opcoes.filter((o) => bruto.includes(o.valor)).map((o) => o.valor);
      const outro = p.outro ? texto(bruto.find((v) => !temOpcao(p.opcoes, v)), LIMITES.outro) : "";
      const lista = outro ? [...marcadas, outro] : marcadas;
      return lista.length ? lista : undefined;
    }
    case "links": {
      if (!Array.isArray(bruto)) return undefined;
      const itens: ItemLink[] = bruto
        .filter(ehObjeto)
        .map((i) => {
          const link = texto(i.link, LIMITES.link);
          return { link: normalizarLink(link) ?? link, comentario: texto(i.comentario, LIMITES.comentario) };
        })
        .filter((i) => i.link || i.comentario)
        .slice(0, p.max);
      return itens.length ? itens : undefined;
    }
    case "grupo": {
      if (!ehObjeto(bruto)) return undefined;
      const v: ValorGrupo = {};
      for (const c of p.campos) {
        if (!subVisivel(c, v)) continue;
        const b = bruto[c.nome];
        if (c.tipo === "arquivo") v[c.nome] = limparArquivo(b, slug);
        else if (c.tipo === "unica") v[c.nome] = temOpcao(c.opcoes, b) ? b : undefined;
        else if (c.tipo === "link") v[c.nome] = (normalizarLink(texto(b, LIMITES.link)) ?? texto(b, LIMITES.link)) || undefined;
        else v[c.nome] = texto(b, c.tipo === "texto_longo" ? LIMITES.longo : LIMITES.texto) || undefined;
        if (v[c.nome] === undefined) delete v[c.nome];
      }
      return Object.keys(v).length ? v : undefined;
    }
  }
}

/** Mensagem de erro da resposta (já limpa), ou null se estiver tudo certo. */
export function validar(p: Pergunta, v: Valor | undefined): string | null {
  if (v === undefined) return p.obrigatoria ? "Preciso desta resposta para seguir." : null;
  if (p.tipo === "multipla" && p.max && (v as string[]).length > p.max) return `Escolha até ${p.max}.`;
  if (p.tipo === "links") {
    const itens = v as ItemLink[];
    if (itens.some((i) => !i.link)) return "Faltou o endereço do site.";
    if (itens.some((i) => !normalizarLink(i.link))) return "Confira o endereço do site. Ex.: g1.globo.com";
    if (p.min && itens.length < p.min) return `Coloque pelo menos ${p.min} sites.`;
  }
  if (p.tipo === "grupo") {
    const g = v as ValorGrupo;
    for (const c of p.campos) {
      if (!subVisivel(c, g)) continue;
      const s = g[c.nome];
      if (s === undefined) {
        if (c.obrigatorio) return `Faltou: ${c.rotulo.replace(/\?$/, "").toLowerCase()}.`;
        continue;
      }
      if (typeof s !== "string") continue;
      if (c.tipo === "email" && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s)) return "Confira o e-mail.";
      if (c.tipo === "tel" && s.replace(/\D/g, "").length < 10) return "Confira o número, com DDD.";
      if (c.tipo === "link" && !normalizarLink(s)) return "Confira o endereço. Ex.: www.seuportal.com.br";
      if (c.tipo === "data" && !/^\d{4}-\d{2}-\d{2}$/.test(s)) return "Confira a data.";
    }
  }
  return null;
}

/** Só as respostas das perguntas que se aplicam, já limpas. É isto que vai para o banco. */
export function limparTudo(b: Briefing, bruto: unknown): Respostas {
  const origem = ehObjeto(bruto) ? bruto : {};
  const tudo: Respostas = {};
  for (const { pergunta: p } of todas(b)) tudo[p.chave] = limpar(p, origem[p.chave], b.slug);
  const r: Respostas = {};
  for (const { pergunta: p } of visiveis(b, tudo)) if (tudo[p.chave] !== undefined) r[p.chave] = tudo[p.chave];
  return r;
}

/** Primeira pergunta com problema nas respostas limpas, ou null. */
export function primeiroErro(b: Briefing, r: Respostas): { chave: string; erro: string } | null {
  for (const { pergunta: p } of visiveis(b, r)) {
    const erro = validar(p, r[p.chave]);
    if (erro) return { chave: p.chave, erro };
  }
  return null;
}

/** Uma linha da resposta, para o resumo, o PDF e o e-mail. */
export type Linha = { texto: string; href?: string; nota?: string; arquivo?: Arquivo };

const rotulo = (opcoes: Opcao[] | undefined, v: string) => opcoes?.find((o) => o.valor === v)?.rotulo ?? v;
const semProtocolo = (url: string) => url.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "");
const dataBr = (iso: string) => iso.split("-").reverse().join("/");

export function linhas(p: Pergunta, v: Valor | undefined): Linha[] {
  if (v === undefined) return [];
  switch (p.tipo) {
    case "texto":
    case "texto_longo":
      return [{ texto: v as string }];
    case "unica":
      return [{ texto: rotulo(p.opcoes, v as string) }];
    case "multipla":
      return [{ texto: (v as string[]).map((s) => rotulo(p.opcoes, s)).join(", ") }];
    case "links":
      return (v as ItemLink[]).map((i) => ({ texto: semProtocolo(i.link), href: normalizarLink(i.link) ?? undefined, nota: i.comentario || undefined }));
    case "grupo": {
      const g = v as ValorGrupo;
      return p.campos.flatMap((c): Linha[] => {
        const s = g[c.nome];
        if (s === undefined) return [];
        const nome = c.rotulo.replace(/\?$/, "");
        if (typeof s !== "string") return [{ texto: `Arquivo: ${s.nome}`, arquivo: s }];
        if (c.tipo === "unica") return [{ texto: p.campos[0] === c ? rotulo(c.opcoes, s) : `${nome}: ${rotulo(c.opcoes, s)}` }];
        if (c.tipo === "link") return [{ texto: semProtocolo(s), href: normalizarLink(s) ?? undefined }];
        if (c.tipo === "data") return [{ texto: `${nome}: ${dataBr(s)}` }];
        if (c.tipo === "texto_longo") return [{ texto: s }];
        return [{ texto: `${nome}: ${s}` }];
      });
    }
  }
}
