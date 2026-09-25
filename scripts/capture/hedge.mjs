// Telas do Hedge com dados FICTÍCIOS: node scripts/capture/hedge.mjs [baseURL]
// O Supabase é interceptado (ver mock-supabase.mjs): nenhuma conta real é lida.
import { fakeSession, openMocked, shot } from "./mock-supabase.mjs";

const BASE = process.argv[2] ?? "https://gethedge.vercel.app";
const OUT = "public/projects/hedge";
const SUPABASE = "https://sagiylhxrqvknacwpesp.supabase.co";
const U = "00000000-0000-4000-8000-000000000001";
const session = fakeSession({ id: U, email: "marina@exemplo.com", name: "Marina Duarte" });
const own = (rows) => rows.map((r, i) => ({ id: r.id ?? `${i + 1}0000000-0000-4000-8000-00000000000${i}`, user_id: U, created_at: "2026-01-10T12:00:00Z", ...r }));

const tables = {
  pessoas: own([
    { id: "p1", nome: "Ana Lima" },
    { id: "p2", nome: "Bruno Costa" },
    { id: "p3", nome: "Carla Mendes" },
    { id: "p4", nome: "Diego Rocha" },
  ]),
  categorias_usuario: own(
    [
      ...["Mercado", "Moradia", "Transporte", "Lazer", "Saúde", "Assinaturas", "Restaurantes", "Educação"].map((nome, ordem) => ({ tipo: "gasto", nome, ordem })),
      ...["Salário", "Freelance"].map((nome, ordem) => ({ tipo: "receita", nome, ordem })),
    ].map((c, i) => ({ id: `cat${i}`, ...c })),
  ),
  contas_bancarias: own([
    { id: "c1", nome: "Conta principal", banco: "Banco Horizonte", saldo_inicial: 4200, saldo_atual: 5380.45 },
    { id: "c2", nome: "Reserva", banco: "Banco Horizonte", saldo_inicial: 8000, saldo_atual: 8650 },
    { id: "c3", nome: "Carteira digital", banco: "PayFácil", saldo_inicial: 350, saldo_atual: 212.3 },
  ]),
  cartoes_credito: own([
    { id: "k1", nome: "Cartão principal", conta_id: "c1", dia_vencimento: 10, melhor_dia_compra: 3, limite: 6000, divida_inicial: 0, cor: "#7c3aed" },
    { id: "k2", nome: "Cartão viagem", conta_id: "c2", dia_vencimento: 20, melhor_dia_compra: 13, limite: 3500, divida_inicial: 0, cor: "#0ea5e9" },
  ]),
  transacoes_cartao: own([
    { id: "t1", cartao_id: "k1", descricao: "Supermercado Bom Preço", valor: 412.8, categoria: "Mercado", data: "2026-09-06", num_parcelas: 1, parcela_atual: 1, pago: false },
    { id: "t2", cartao_id: "k1", descricao: "Posto Avenida", valor: 180, categoria: "Transporte", data: "2026-09-09", num_parcelas: 1, parcela_atual: 1, pago: false },
    { id: "t3", cartao_id: "k1", descricao: "Streaming de música", valor: 21.9, categoria: "Assinaturas", data: "2026-09-02", num_parcelas: 1, parcela_atual: 1, pago: false, recorrente: true },
    { id: "t4", cartao_id: "k1", descricao: "Notebook", valor: 3400, categoria: "Educação", data: "2026-08-04", num_parcelas: 4, parcela_atual: 2, pago: false },
    { id: "t5", cartao_id: "k1", descricao: "Farmácia Vida", valor: 96.4, categoria: "Saúde", data: "2026-09-14", num_parcelas: 1, parcela_atual: 1, pago: false },
    { id: "t6", cartao_id: "k1", descricao: "Restaurante Maré", valor: 138, categoria: "Restaurantes", data: "2026-09-17", num_parcelas: 1, parcela_atual: 1, pago: false },
    { id: "t7", cartao_id: "k2", descricao: "Passagem aérea", valor: 1260, categoria: "Lazer", data: "2026-08-22", num_parcelas: 3, parcela_atual: 2, pago: false },
    { id: "t8", cartao_id: "k2", descricao: "Hotel", valor: 540, categoria: "Lazer", data: "2026-09-11", num_parcelas: 2, parcela_atual: 1, pago: false },
  ]),
  pagamentos_fatura: own([{ id: "f1", cartao_id: "k1", mes: "2026-08", valor_pago: 1450, conta_id: "c1" }]),
  receitas: own([
    { id: "r1", conta_id: "c1", descricao: "Salário", valor: 6500, categoria: "Salário", tipo: "fixo", dia_recebimento: 5 },
    { id: "r2", conta_id: "c1", descricao: "Freelance — landing page", valor: 1800, categoria: "Freelance", tipo: "avulso", dia_recebimento: 18 },
  ]),
  metas_gasto: own([
    { id: "m1", categoria: "Mercado", limite: 1200 },
    { id: "m2", categoria: "Restaurantes", limite: 400 },
    { id: "m3", categoria: "Lazer", limite: 350 },
    { id: "m4", categoria: "Transporte", limite: 500 },
    { id: "m5", categoria: "Assinaturas", limite: 150 },
  ]),
  meus_gastos: own([
    { id: "g1", descricao: "Aluguel", valor: 1800, tipo: "debito", categoria: "fixo", categoria_gasto: "Moradia", data: "2026-09-08", pago: true, data_pagamento: "2026-09-08", dia_vencimento: 8, ativo: true, conta_id: "c1" },
    { id: "g2", descricao: "Internet", valor: 119.9, tipo: "debito", categoria: "fixo", categoria_gasto: "Moradia", data: "2026-09-15", pago: false, dia_vencimento: 15, ativo: true, conta_id: "c1" },
    { id: "g3", descricao: "Academia", valor: 99, tipo: "debito", categoria: "fixo", categoria_gasto: "Saúde", data: "2026-09-05", pago: true, data_pagamento: "2026-09-05", dia_vencimento: 5, ativo: true, conta_id: "c1" },
    { id: "g4", descricao: "Mercado da semana", valor: 356.2, tipo: "debito", categoria: "pessoal", categoria_gasto: "Mercado", data: "2026-09-13", pago: true, conta_id: "c1" },
    { id: "g5", descricao: "Cinema", valor: 64, tipo: "debito", categoria: "pessoal", categoria_gasto: "Lazer", data: "2026-09-19", pago: true, conta_id: "c3" },
    { id: "g6", descricao: "Jantar de aniversário", valor: 280, tipo: "credito", categoria: "dividido", categoria_gasto: "Restaurantes", data: "2026-09-12", pago: false, dividido_com_pessoas: ["Ana Lima", "Bruno Costa"], dividido_com: "Ana Lima", minha_parte: 93.33, cartao_id: "k1" },
    { id: "g7", descricao: "Corrida de app", valor: 42.5, tipo: "debito", categoria: "pessoal", categoria_gasto: "Transporte", data: "2026-09-21", pago: true, conta_id: "c3" },
    ...[
      ["2026-04", 2410.3],
      ["2026-05", 2688.9],
      ["2026-06", 2295.4],
      ["2026-07", 3104.75],
      ["2026-08", 2842.1],
    ].flatMap(([mes, total], i) => [
      { id: `h${i}a`, descricao: "Aluguel", valor: 1800, tipo: "debito", categoria: "pessoal", categoria_gasto: "Moradia", data: `${mes}-08`, pago: true, conta_id: "c1" },
      { id: `h${i}b`, descricao: "Mercado", valor: +(total - 1800).toFixed(2), tipo: "debito", categoria: "pessoal", categoria_gasto: "Mercado", data: `${mes}-16`, pago: true, conta_id: "c1" },
    ]),
    { id: "g8", descricao: "Curso online", valor: 197, tipo: "credito", categoria: "pessoal", categoria_gasto: "Educação", data: "2026-09-03", pago: false, num_parcelas: 1, parcela_atual: 1, cartao_id: "k1" },
  ]),
  gastos: own([
    { id: "s1", descricao: "Hospedagem — viagem de férias", pessoa: "Ana Lima", valor_total: 1800, num_parcelas: 3, data_inicio: "2026-08-15", tipo: "credito", categoria: "Lazer", cartao_id: "k2" },
    { id: "s2", descricao: "Ingressos do show", pessoa: "Bruno Costa", valor_total: 420, num_parcelas: 1, data_inicio: "2026-09-02", tipo: "credito", categoria: "Lazer", cartao_id: "k1" },
    { id: "s3", descricao: "Presente coletivo", pessoa: "Carla Mendes", valor_total: 150, num_parcelas: 1, data_inicio: "2026-09-12", tipo: "debito", categoria: "Lazer", conta_id: "c1" },
    { id: "s4", descricao: "Fone bluetooth", pessoa: "Diego Rocha", valor_total: 360, num_parcelas: 3, data_inicio: "2026-07-20", tipo: "credito", categoria: "Educação", cartao_id: "k1" },
    { id: "s5", descricao: "Compras do apartamento", pessoa: "Ana Lima", valor_total: 240, num_parcelas: 1, data_inicio: "2026-09-05", tipo: "debito", categoria: "Mercado", conta_id: "c1" },
  ]),
  saldos_devedores: own([
    { id: "d1", pessoa: "Bruno Costa", descricao: "Empréstimo", valor_original: 600, valor_atual: 350, data_criacao: "2026-07-02", historico: [{ id: "h1", valor: 250, data: "2026-08-10", observacao: "Pix" }] },
    { id: "d2", pessoa: "Diego Rocha", descricao: "Conserto do celular", valor_original: 300, valor_atual: 300, data_criacao: "2026-08-28", historico: [] },
  ]),
  pagamentos_parciais: own([{ id: "pp1", pessoa: "Ana Lima", mes: "2026-09", valor: 200, data_pagamento: "2026-09-10" }]),
  observacoes_mes: [],
  push_subscriptions: [],
};

const rpc = {
  get_my_role: [{ role: "user", is_active: true }],
  admin_get_user_features: [{}],
  check_login_blocked: { blocked: false },
};

const PAGES = [
  ["cover", "/"],
  ["lancamentos", "/gastos/lancamentos"],
  ["metas", "/gastos/metas"],
  ["a-receber", "/a-receber/mes"],
  ["pessoas", "/a-receber/pessoas"],
  ["em-aberto", "/a-receber/aberto"],
  ["contas", "/carteira/contas"],
  ["cartoes", "/carteira/cartoes"],
];

const only = process.argv[3]?.split(",");
// tutoriais guiados de cada aba já "vistos" (senão abrem por cima da tela)
const TUTORIALS = ["cartoes_credito", "contas_bancarias", "dashboard", "devedores", "dividas", "gastos", "metas_gasto", "meus_gastos"];
const init = Object.fromEntries(TUTORIALS.map((k) => [`${k}_tutorial_seen_v1`, JSON.stringify({ seen: true, lastStepIndex: null })]));
const { browser, ctx, unknown } = await openMocked({ supabaseUrl: SUPABASE, tables, rpc, session, init });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
for (const [name, path] of PAGES) {
  if (only && !only.includes(name)) continue;
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.keyboard.press("Escape"); // fecha tour/tutorial, se abrir
  await shot(page, `${OUT}/${name}.jpg`, { wait: 1500 });
  console.log("ok", name, "→", page.url());
}
console.log("não simulados:", [...unknown].join(", ") || "nenhum");
console.log("erros:", errors.join(" | ") || "nenhum");
await browser.close();
