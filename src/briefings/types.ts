/*
 * BRIEFINGS
 * Cada cliente tem um arquivo de configuração (src/briefings/<slug>.ts) com as
 * etapas, perguntas, tipos de campo e condições. Os componentes e a rota de API
 * leem só estes tipos: nenhum texto de pergunta mora no componente.
 *
 * Para criar um briefing novo: copie um arquivo existente, troque o slug e as
 * perguntas, e registre em src/briefings/index.ts.
 */

/** Arquivo já enviado ao Storage: no banco fica só o caminho. */
export type Arquivo = { caminho: string; nome: string; tamanho: number };
export type ItemLink = { link: string; comentario: string };
export type ValorGrupo = Record<string, string | Arquivo | undefined>;

/**
 * Formato da resposta por tipo de pergunta:
 *   texto, texto_longo, unica ... string (em "unica", o `valor` da opção)
 *   multipla ................... string[] (valores das opções; texto livre = "outro")
 *   links ...................... ItemLink[]
 *   grupo ...................... ValorGrupo (um item por campo, pelo `nome`)
 */
export type Valor = string | string[] | ItemLink[] | ValorGrupo;
export type Respostas = Record<string, Valor | undefined>;

/**
 * Condição para a pergunta aparecer, sobre a resposta de outra pergunta
 * ("unica" ou "multipla"). Uma lista de condições exige todas.
 * Sem resposta na pergunta de origem, a condição não é atendida.
 */
export type Condicao = { campo: string } & (
  | { igual: string }
  | { diferente: string }
  | { inclui: string }
  | { naoInclui: string }
);

export type Opcao = { valor: string; rotulo: string };

type Base = {
  /** Chave do dado em `respostas` */
  chave: string;
  /** Pergunta como aparece na tela */
  titulo: string;
  /** Versão curta, para o resumo, o PDF e o e-mail */
  curto: string;
  /** Linha de ajuda com exemplo */
  ajuda?: string;
  obrigatoria?: boolean;
  quando?: Condicao | Condicao[];
};

export type PerguntaTexto = Base & { tipo: "texto" | "texto_longo"; placeholder?: string };
export type PerguntaUnica = Base & { tipo: "unica"; opcoes: Opcao[] };
export type PerguntaMultipla = Base & {
  tipo: "multipla";
  opcoes: Opcao[];
  /** Máximo de opções marcadas */
  max?: number;
  /** Campo "Outro", de texto livre */
  outro?: boolean;
};
export type PerguntaLinks = Base & {
  tipo: "links";
  /** Mínimo de links quando a pergunta é respondida */
  min?: number;
  max: number;
  placeholderComentario?: string;
};

/** Campo dentro de um grupo (vários campos na mesma tela, numa chave só). */
export type SubCampo = {
  nome: string;
  rotulo: string;
  tipo: "texto" | "texto_longo" | "email" | "tel" | "link" | "data" | "unica" | "arquivo";
  opcoes?: Opcao[];
  placeholder?: string;
  /** Exigido sempre que a pergunta for respondida */
  obrigatorio?: boolean;
  /** Só aparece quando outro campo do mesmo grupo tem este valor */
  quando?: { campo: string; igual: string };
};
export type PerguntaGrupo = Base & {
  tipo: "grupo";
  campos: SubCampo[];
  /** Basta um dos campos preenchido (ex.: e-mail ou WhatsApp) */
  exigirUm?: boolean;
};

export type Pergunta = PerguntaTexto | PerguntaUnica | PerguntaMultipla | PerguntaLinks | PerguntaGrupo;

export type Etapa = {
  /** Nome completo da etapa */
  titulo: string;
  /** Nome curto, em caixa alta, para o HUD e o resumo */
  curto: string;
  perguntas: Pergunta[];
};

export type Briefing = {
  slug: string;
  /** Título da aba do navegador e assunto do e-mail */
  titulo: string;
  /** Tempo estimado, em minutos */
  minutos: number;
  abertura: { rotulo: string; titulo: string; texto: string; botao: string };
  etapas: Etapa[];
  resumo: { titulo: string; texto: string; extra: string };
  final: { titulo: string; texto: string };
};
