// Telas do Ápice com dados FICTÍCIOS: node scripts/capture/apice.mjs [baseURL] [telas,separadas]
// O plano (semanas e blocos), o catálogo e as provas saem dos próprios arquivos do app;
// o progresso de estudo (sessões, cartas, simulados) é inventado aqui.
// O Supabase é interceptado (ver mock-supabase.mjs): nenhuma conta real é lida.
import fs from "node:fs";
import { pathToFileURL } from "node:url";
import { fakeSession, openMocked, shot } from "./mock-supabase.mjs";

const BASE = process.argv[2] ?? "https://apice-ten.vercel.app";
const OUT = "public/projects/apice";
const APP = "C:/Users/Sam/Documents/Code/Ápice/src/data";
const { WEEKS, BLOCKS } = await import(pathToFileURL(`${APP}/plan.ts`).href);
const { CATALOG } = await import(pathToFileURL(`${APP}/catalog.ts`).href);

const bundle = await (await fetch(BASE)).text();
const jsPath = bundle.match(/\/assets\/index-[\w-]+\.js/)[0];
const SUPABASE = (await (await fetch(BASE + jsPath)).text()).match(/https:\/\/[a-z0-9]+\.supabase\.co/)[0];

const U = "00000000-0000-4000-8000-000000000002";
const session = fakeSession({ id: U, email: "lara@exemplo.com", name: "Lara" });
const TODAY = "2026-09-25";
const T = "2026-08-17T12:00:00Z";
const uuid = (p, i) => `${p}000000-0000-4000-8000-${String(i).padStart(12, "0")}`.slice(-36).replace(/^.{8}/, (s) => s);
const id = (tag, i) => `${tag.padEnd(8, "0").slice(0, 8)}-0000-4000-8000-${String(i).padStart(12, "0")}`;
const addDays = (d, n) => new Date(Date.parse(d + "T12:00:00Z") + n * 864e5).toISOString().slice(0, 10);
const rnd = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();

// plano
const weeks = WEEKS.map((w, i) => ({ id: id("wk", i), user_id: U, n: w.n, phase: w.phase, start_date: w.start, end_date: addDays(w.start, 6), target_hours: w.targetHours, work_type: w.type, focus: w.focus, created_at: T, updated_at: T }));
const currentWeek = WEEKS.filter((w) => w.start <= TODAY).at(-1).n;
const MASTERY = { 1: 5, 2: 4, 3: 4, 4: 3, 5: 3, 6: 2 };
const blocks = BLOCKS.map((b, i) => ({
  id: id("bl", b.id), user_id: U, seq: b.id, axis: b.axis, title: b.title, planned_week: b.plannedWeek,
  effective_week: null, dropped_at: null, mastery: MASTERY[b.id] ?? null,
  first_pass_at: MASTERY[b.id] ? `${addDays(WEEKS[b.plannedWeek - 1].start, 3)}T20:00:00Z` : null,
  source: null, notes: null, exam_focus: null, created_at: T, updated_at: T,
}));
const blockBySeq = new Map(blocks.map((b) => [b.seq, b]));

// sessões dos últimos dias (quase todo dia, 1–3 h) → minutos por dia, streak, horas por eixo
const sessions = [];
for (let d = 0; d < 40; d++) {
  const day = addDays("2026-08-17", d);
  if (day > TODAY || (d % 7 === 6 && d !== 34)) continue; // folga no domingo
  const n = 1 + (rnd() > 0.6 ? 1 : 0);
  for (let k = 0; k < n; k++) {
    const week = WEEKS.filter((w) => w.start <= day).at(-1).n;
    const blk = blocks.find((b) => b.planned_week === week) ?? blocks[0];
    const minutes = 50 + Math.round(rnd() * 70);
    const qt = Math.round(rnd() * 20);
    sessions.push({ id: id("se", sessions.length), user_id: U, block_id: blk.id, started_at: `${day}T${18 + k}:00:00Z`, ended_at: `${day}T${19 + k}:00:00Z`, minutes, questions_total: qt, questions_correct: Math.round(qt * (0.55 + rnd() * 0.3)), origin: "timer", notes: null, created_at: `${day}T20:00:00Z` });
  }
}
const byDay = new Map();
for (const s of sessions) {
  const day = s.started_at.slice(0, 10);
  const r = byDay.get(day) ?? { user_id: U, day, minutes: 0, session_count: 0, questions_total: 0, questions_correct: 0 };
  r.minutes += s.minutes; r.session_count++; r.questions_total += s.questions_total; r.questions_correct += s.questions_correct;
  byDay.set(day, r);
}
const v_daily_minutes = [...byDay.values()];
const v_streak_days = v_daily_minutes.map((d) => ({ user_id: U, day: d.day }));
const v_week_adherence = weeks.map((w) => {
  const mins = v_daily_minutes.filter((d) => d.day >= w.start_date && d.day <= w.end_date).reduce((a, d) => a + d.minutes, 0);
  return { user_id: U, week_id: w.id, n: w.n, phase: w.phase, start_date: w.start_date, end_date: w.end_date, target_hours: w.target_hours, work_type: w.work_type, focus: w.focus, done_minutes: mins, done_hours: +(mins / 60).toFixed(1), adherence: +(mins / 60 / w.target_hours).toFixed(2) };
});
const axes = [...new Set(BLOCKS.map((b) => b.axis))];
const v_axis_hours = axes.map((axis) => {
  const minutes = sessions.filter((s) => blocks.find((b) => b.id === s.block_id)?.axis === axis).reduce((a, s) => a + s.minutes, 0);
  return { user_id: U, axis, hours: +(minutes / 60).toFixed(1), minutes };
});
const v_axis_mastery = axes.map((axis) => {
  const bs = blocks.filter((b) => b.axis === axis);
  const started = bs.filter((b) => b.mastery != null);
  return { user_id: U, axis, blocks_total: bs.length, blocks_started: started.length, blocks_consolidated: started.filter((b) => b.mastery >= 4).length, mastery_avg: started.length ? started.reduce((a, b) => a + b.mastery, 0) / started.length : null };
});

// revisões, cartas e materiais
const reviews = blocks.filter((b) => b.mastery).flatMap((b, i) => [
  { id: id("rv", i * 2), user_id: U, block_id: b.id, due_at: addDays(b.first_pass_at.slice(0, 10), 1), interval_days: 1, completed_at: addDays(b.first_pass_at.slice(0, 10), 1) + "T21:00:00Z", outcome: "ok", skipped: false, created_at: T },
  { id: id("rv", i * 2 + 1), user_id: U, block_id: b.id, due_at: i < 3 ? TODAY : addDays(TODAY, 2 + i), interval_days: 7, completed_at: null, outcome: null, skipped: false, created_at: T },
]);
const CARDS = [
  [1, "estudo", "Quais são os princípios doutrinários do SUS?", "Universalidade, integralidade e equidade.", "revisado"],
  [2, "erro", "Competência da direção municipal do SUS segundo a Lei 8.080", "Planejar, organizar, controlar e avaliar as ações e os serviços de saúde e gerir e executar os serviços públicos de saúde.", "pendente"],
  [2, "estudo", "O que define a Lei 8.080/90?", "Condições para promoção, proteção e recuperação da saúde e a organização dos serviços.", "dominado"],
  [3, "estudo", "Periodicidade das Conferências de Saúde", "A cada 4 anos, convocadas pelo Executivo ou, extraordinariamente, pela Conferência ou pelo Conselho.", "revisado"],
  [3, "erro", "Composição paritária dos Conselhos de Saúde", "50% usuários; 25% trabalhadores; 25% gestores e prestadores.", "pendente"],
  [4, "estudo", "Músculos da mastigação e inervação", "Masseter, temporal, pterigóideos medial e lateral — nervo mandibular (V3).", "revisado"],
  [4, "estudo", "Nervo responsável pela sensibilidade dos dentes inferiores", "Nervo alveolar inferior, ramo do V3.", "dominado"],
  [5, "estudo", "Etapas do exame clínico odontológico", "Anamnese, exame físico extrabucal e intrabucal, exames complementares e diagnóstico.", "pendente"],
  [5, "erro", "Diferença entre sinal e sintoma", "Sinal é observado pelo profissional; sintoma é relatado pelo paciente.", "pendente"],
  [6, "estudo", "O que o Decreto 7.508/2011 regulamenta?", "A Lei 8.080: organização do SUS, planejamento, assistência e articulação interfederativa.", "pendente"],
  [5, "estudo", "Por que a lesão fundamental 'mácula' não é palpável?", null, "aberta"],
];
const cards = CARDS.map(([seq, origin, front, back, status], i) => ({ id: id("cd", i), user_id: U, block_id: blockBySeq.get(seq).id, session_id: null, origin, front, back, why_wrong: origin === "erro" ? "Confundi as competências das esferas." : null, ease: 2.5, interval_days: status === "dominado" ? 21 : 3, due_at: i % 3 ? addDays(TODAY, i % 5) : TODAY, reps: status === "aberta" ? 0 : 1 + (i % 4), good_streak: status === "dominado" ? 3 : 1, last_review_at: status === "aberta" ? null : `${addDays(TODAY, -2)}T21:00:00Z`, status, created_at: T, updated_at: T }));
const materials = CATALOG.filter((c) => blockBySeq.has(c.block)).map((c, i) => ({ id: id("mt", i), user_id: U, block_id: blockBySeq.get(c.block).id, kind: c.kind, title: c.title, url: c.url, minutes: null, done_at: c.block <= 4 && i % 3 !== 0 ? `${addDays(TODAY, -10)}T20:00:00Z` : null, sort: i, catalog_key: c.key, dismissed_at: null, created_at: T, updated_at: T }));

// provas: as questões públicas que o app já traz
const exams = [];
const exam_questions = [];
for (const file of fs.readdirSync(`${APP}/provas`)) {
  const p = JSON.parse(fs.readFileSync(`${APP}/provas/${file}`, "utf8"));
  const eid = id("ex", exams.length);
  const qs = p.questoes;
  exams.push({ id: eid, slug: p.slug, label: p.label, applied_on: p.aplicadaEm, duration_minutes: p.duracaoMinutos, question_count: qs.length, general_count: qs.filter((q) => q.secao === "gerais").length, source_url: p.fonte ?? null, checked_on: p.conferidaEm ?? null, answer_key_version: p.gabaritoVersao ?? "desconhecida", bank_only: false, created_at: T });
  qs.forEach((q) => exam_questions.push({ id: id("eq", exam_questions.length), exam_id: eid, number: q.numero, section: q.secao, stem: q.enunciado, alternatives: q.alternativas, correct: q.correta ?? null, annulled: !!q.anulada, block_seq: q.bloco ?? null, commentary: null, needs_figure: !!q.dependeDeFigura, created_at: T }));
}
const enare = exams.find((e) => e.slug === "enare-2024") ?? exams[0];
const enare23 = exams.find((e) => e.slug === "enare-2023") ?? exams[1];
const exam_attempts = [
  { id: id("at", 1), user_id: U, exam_id: enare.id, mode: "simulado", started_at: "2026-09-13T13:00:00Z", finished_at: "2026-09-13T16:40:00Z", elapsed_seconds: 13200, created_at: T, updated_at: T },
  { id: id("at", 2), user_id: U, exam_id: enare23.id, mode: "estudo", started_at: "2026-08-19T19:00:00Z", finished_at: "2026-08-19T21:10:00Z", elapsed_seconds: 7800, created_at: T, updated_at: T },
];
const v_exam_attempt_scores = [
  { ...exam_attempts[0], slug: enare.slug, label: enare.label, question_count: enare.question_count, answered: enare.question_count, annulled: 1, correct_total: 38, correct_general: 12, correct_specific: 26 },
  { ...exam_attempts[1], slug: enare23.slug, label: enare23.label, question_count: enare23.question_count, answered: enare23.question_count, annulled: 0, correct_total: 31, correct_general: 11, correct_specific: 20 },
];
const mocks = [
  { id: id("mk", 1), user_id: U, taken_on: "2026-09-13", source: enare.label, common_correct: 12, specific_correct: 26, gaps: "Farmacologia e patologia oral", question_count: enare.question_count, general_count: enare.general_count, attempt_id: exam_attempts[0].id, created_at: T },
  { id: id("mk", 2), user_id: U, taken_on: "2026-08-19", source: enare23.label, common_correct: 11, specific_correct: 20, gaps: "Legislação do SUS", question_count: enare23.question_count, general_count: enare23.general_count, attempt_id: exam_attempts[1].id, created_at: T },
];
const v_mock_scores = mocks.map((m) => {
  const total_correct = m.common_correct + m.specific_correct;
  const pct = +((total_correct / m.question_count) * 100).toFixed(1);
  return { ...m, total_correct, pct, band: pct >= 70 ? "zona_de_vaga" : pct >= 60 ? "aprovada_sem_folga" : "abaixo_do_corte" };
});
const practiced = exam_questions.filter((q) => q.exam_id === enare.id).slice(0, 40);
const question_practice = practiced.map((q, i) => ({ id: id("qp", i), user_id: U, question_id: q.id, last_chosen: i % 3 ? q.correct : "A", attempts: 1 + (i % 2), last_answered_at: `${addDays(TODAY, -(i % 9))}T20:00:00Z`, created_at: T }));
const v_question_practice = question_practice.map((p) => {
  const q = practiced.find((x) => x.id === p.question_id);
  return { ...p, exam_id: q.exam_id, number: q.number, section: q.section, block_seq: q.block_seq, annulled: q.annulled, hit: p.last_chosen === q.correct };
});
const weightBySeq = new Map();
for (const q of exam_questions) if (q.block_seq) weightBySeq.set(q.block_seq, (weightBySeq.get(q.block_seq) ?? 0) + 1);
const v_block_weight = BLOCKS.map((b) => ({ seq: b.id, enare_questions: weightBySeq.get(b.id) ?? Math.round(2 + rnd() * 8), total_questions: (weightBySeq.get(b.id) ?? 0) + Math.round(4 + rnd() * 10) }));

const tables = {
  settings: [{ id: id("st", 1), user_id: U, exam_date: "2027-09-19", plan_start: "2026-08-17", study_days_per_week: 6, daily_target_minutes: null, floor_hours: 10, theme: "light", reminder_enabled: true, reminder_hour: 19, reminder_last_sent_on: addDays(TODAY, -1), created_at: T, updated_at: T }],
  weeks, blocks, sessions, reviews, cards, materials, mocks, exams, exam_questions, exam_attempts,
  exam_answers: [], question_practice, plan_adjustments: [], push_subscriptions: [],
  v_daily_minutes, v_week_adherence, v_streak_days, v_axis_mastery, v_axis_hours, v_mock_scores, v_exam_attempt_scores, v_question_practice, v_block_weight,
};

const PAGES = [
  ["cover", "/"],
  ["semana", "/semana"],
  ["plano", "/plano"],
  ["progresso", "/progresso"],
  ["questoes", "/questoes"],
  ["simulados", "/simulados"],
  ["bloco", "/bloco/5"],
];

const only = process.argv[3]?.split(",");
const { browser, ctx, unknown } = await openMocked({ supabaseUrl: SUPABASE, storageKey: "apice.auth", tables, session, init: { "apice:tour": "done" } });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
for (const [name, path] of PAGES) {
  if (only && !only.includes(name)) continue;
  await page.goto(BASE + path, { waitUntil: "networkidle" });
  await page.keyboard.press("Escape");
  await shot(page, `${OUT}/${name}.jpg`, { wait: 1800 });
  console.log("ok", name, "→", page.url());
}
console.log("supabase:", SUPABASE);
console.log("não simulados:", [...unknown].join(", ") || "nenhum");
console.log("erros:", errors.join(" | ") || "nenhum");
await browser.close();
