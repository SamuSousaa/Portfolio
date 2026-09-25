// Wellnessy (Tally): preenche uma conta de TESTE com dados fictícios e captura as abas
// no formato de celular (o app é mobile-first).
//   DEMO_SECRET_FILE=<json {email, password} fora do repositório> node scripts/capture/wellnessy.mjs [seed|shots|all]
// Roda contra o app local (localhost:3001), que usa o Supabase do projeto: o que é
// gravado aqui fica só na conta de teste informada.
import { chromium } from "playwright-core";
import fs from "node:fs";
import { CHROME, shot } from "./mock-supabase.mjs";

const BASE = process.env.WELLNESSY_URL ?? "http://localhost:3001";
const OUT = "public/projects/wellnessy";
const MODE = process.argv[2] ?? "all";
const { email, password } = JSON.parse(fs.readFileSync(process.env.DEMO_SECRET_FILE, "utf8"));

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "pt-BR", timezoneId: "America/Fortaleza" });
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));

// login
await page.goto(BASE + "/login", { waitUntil: "networkidle" });
await page.waitForTimeout(3000); // espera a hidratação: preencher antes disso perde o valor
await page.locator('[name="email"]').click();
await page.keyboard.type(email, { delay: 20 });
await page.locator('[name="password"]').click();
await page.keyboard.type(password, { delay: 20 });
await page.click('[type="submit"]');
await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 20000 }).catch(() => {});
if (page.url().includes("/login")) {
  console.log("login falhou (e-mail confirmado?):", (await page.locator("[role=alert]").allInnerTexts()).join(" | "));
  await browser.close();
  process.exit(1);
}
console.log("logado:", page.url());

/** Chama a API do app com a sessão da conta demo. */
const api = (method, path, body) =>
  page.evaluate(
    async ({ method, path, body }) => {
      const r = await fetch(path, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
      const text = await r.text();
      let json = null;
      try { json = JSON.parse(text); } catch {}
      return { status: r.status, json, text: text.slice(0, 300) };
    },
    { method, path, body },
  );
const pick = (r) => r.json?.data ?? r.json;
const must = (label, r) => {
  if (r.status >= 300) console.log("✗", label, r.status, r.text);
  else console.log("✓", label);
  return pick(r);
};

if (MODE === "seed" || MODE === "all") {
  const existing = pick(await api("GET", "/api/medications")) ?? [];
  // restos de teste com nome sem sentido: arquivados (reversível no app), não apagados
  for (const m of existing) if (/^(lalala|losartanas)$/i.test(m.name?.trim() ?? "") && m.isActive !== false) must("arquivar " + m.name, await api("PATCH", `/api/medications/${m.id}`, { isActive: false }));
  if (existing.some((m) => m.name === "Omeprazol")) {
    console.log("dados fictícios já preenchidos — pulando");
  } else {
    const helena = must("dependente Helena", await api("POST", "/api/dependents", { name: "Helena Campos", relationship: "Mãe", dateOfBirth: "1958-04-12", avatarColor: "amber" }));
    const hid = helena?.id;

    const meds = [
      { body: { name: "Losartana", activeIngredient: "Losartana potássica", dosageAmount: 50, dosageUnit: "MG", form: "TABLET", totalQuantity: 42, lowStockThreshold: 10 }, schedule: { frequencyType: "DAILY", specificTimes: ["08:00"], doseQuantity: 1, startDate: "2026-08-01", withFood: "NONE" } },
      { body: { name: "Omeprazol", activeIngredient: "Omeprazol", dosageAmount: 20, dosageUnit: "MG", form: "CAPSULE", totalQuantity: 8, lowStockThreshold: 10 }, schedule: { frequencyType: "DAILY", specificTimes: ["07:00"], doseQuantity: 1, startDate: "2026-09-01", withFood: "AVOID" } },
      { body: { name: "Vitamina D", activeIngredient: "Colecalciferol", dosageAmount: 7000, dosageUnit: "UNITS", form: "CAPSULE", totalQuantity: 8, lowStockThreshold: 2 }, schedule: { frequencyType: "WEEKLY", specificTimes: ["09:00"], daysOfWeek: [1], doseQuantity: 1, startDate: "2026-08-03", withFood: "RECOMMENDED" } },
      { body: { name: "Metformina", activeIngredient: "Cloridrato de metformina", dosageAmount: 850, dosageUnit: "MG", form: "TABLET", totalQuantity: 96, lowStockThreshold: 20, dependentId: hid }, schedule: { frequencyType: "DAILY", specificTimes: ["08:00", "20:00"], doseQuantity: 1, startDate: "2026-07-15", withFood: "REQUIRED" } },
      { body: { name: "Sinvastatina", activeIngredient: "Sinvastatina", dosageAmount: 20, dosageUnit: "MG", form: "TABLET", totalQuantity: 25, lowStockThreshold: 7, dependentId: hid }, schedule: { frequencyType: "DAILY", specificTimes: ["21:00"], doseQuantity: 1, startDate: "2026-07-15", withFood: "NONE" } },
      { body: { name: "Dipirona", activeIngredient: "Dipirona monoidratada", dosageAmount: 500, dosageUnit: "MG", form: "TABLET", totalQuantity: 10, lowStockThreshold: 2, notes: "Só se tiver dor ou febre" } },
    ];
    const medIds = {};
    for (const m of meds.filter((m) => !existing.some((e) => e.name === m.body.name && e.isActive !== false))) {
      const created = must("remédio " + m.body.name, await api("POST", "/api/medications", m.body));
      medIds[m.body.name] = created?.id;
      if (m.schedule && created?.id) must("  horário " + m.body.name, await api("POST", `/api/medications/${created.id}/schedules`, m.schedule));
    }

    must("consulta cardiologia", await api("POST", "/api/appointments", { title: "Cardiologista — retorno", scheduledAt: "2026-10-02T14:30:00-03:00", reminderOffset: "DAY_1", location: "Clínica Centro, sala 204", notes: "Levar o histórico de pressão das últimas semanas." }));
    must("consulta exame Helena", await api("POST", "/api/appointments", { title: "Exame de sangue em jejum", scheduledAt: "2026-09-29T07:00:00-03:00", reminderOffset: "HOUR_12", location: "Laboratório Vida", dependentId: hid }));
    must("consulta clínico", await api("POST", "/api/appointments", { title: "Clínico geral", scheduledAt: "2026-10-15T10:00:00-03:00", reminderOffset: "DAY_1", location: "UBS Centro" }));

    const pressao = must("monitor pressão", await api("POST", "/api/health-trackers", { name: "Pressão arterial", kind: "MEASUREMENT", unit: "mmHg" }));
    const glicemia = must("monitor glicemia", await api("POST", "/api/health-trackers", { name: "Glicemia em jejum", kind: "MEASUREMENT", unit: "mg/dL", dependentId: hid }));
    const enxaqueca = must("monitor enxaqueca", await api("POST", "/api/health-trackers", { name: "Enxaqueca", kind: "SYMPTOM" }));
    const PA = [[128, 84], [124, 82], [131, 86], [122, 80], [119, 79], [125, 81], [121, 78], [118, 77]];
    for (const [i, [s, d]] of PA.entries()) if (pressao?.id) await api("POST", `/api/health-trackers/${pressao.id}/entries`, { valueNumeric: s, valueSecondary: d, measuredAt: `2026-09-${String(10 + i * 2).padStart(2, "0")}T08:15:00-03:00` });
    for (const [i, v] of [132, 128, 121, 126, 118, 115, 119].entries()) if (glicemia?.id) await api("POST", `/api/health-trackers/${glicemia.id}/entries`, { valueNumeric: v, measuredAt: `2026-09-${String(11 + i * 2).padStart(2, "0")}T07:05:00-03:00` });
    for (const [i, v] of [4, 2, 5, 2].entries()) if (enxaqueca?.id) await api("POST", `/api/health-trackers/${enxaqueca.id}/entries`, { severity: v, measuredAt: `2026-09-${String(6 + i * 5).padStart(2, "0")}T16:00:00-03:00`, notes: i === 2 ? "Depois de dormir pouco" : undefined });
    console.log("✓ medições registradas");

    must("contato cardiologista", await api("POST", "/api/health-contacts", { contactType: "DOCTOR", name: "Dra. Paula Rezende", specialty: "Cardiologia", phoneWork: "(86) 3322-0000", address: "Clínica Centro, sala 204" }));
    must("contato farmácia", await api("POST", "/api/health-contacts", { contactType: "PHARMACY", name: "Farmácia Vida", phoneWork: "(86) 3322-1111" }));
    must("contato emergência", await api("POST", "/api/health-contacts", { contactType: "EMERGENCY", name: "SAMU", phoneWork: "192" }));

    if (medIds.Losartana) must("gasto Losartana", await api("POST", "/api/expenses", { medicationId: medIds.Losartana, amount: 18.9, quantityPurchased: 30, purchasedAt: "2026-09-02", pharmacyName: "Farmácia Vida" }));
    if (medIds.Metformina) must("gasto Metformina", await api("POST", "/api/expenses", { medicationId: medIds.Metformina, amount: 24.5, quantityPurchased: 60, purchasedAt: "2026-09-08", pharmacyName: "Farmácia Vida" }));
    if (medIds.Omeprazol) must("gasto Omeprazol", await api("POST", "/api/expenses", { medicationId: medIds.Omeprazol, amount: 15.8, quantityPurchased: 28, purchasedAt: "2026-08-28", pharmacyName: "Drogaria Popular" }));

    must("diário 1", await api("POST", "/api/journal", { content: "Dormi melhor depois de passar o omeprazol para antes do café.", loggedAt: "2026-09-20T21:30:00-03:00" }));
    must("diário 2", await api("POST", "/api/journal", { content: "Pressão mais baixa a semana toda. Caminhada de manhã ajudando.", loggedAt: "2026-09-23T20:10:00-03:00" }));
  }
}

if (MODE === "shots" || MODE === "all") {
  const PAGES = [
    ["cover", "/dashboard"],
    ["medicamentos", "/medicamentos"],
    ["historico", "/historico"],
    ["consultas", "/consultas"],
    ["monitores", "/monitores"],
    ["perfis", "/perfis"],
    ["gastos", "/gastos"],
    ["contatos", "/contatos"],
    ["diario", "/diario"],
  ];
  for (const [name, path] of PAGES) {
    await page.goto(BASE + path, { waitUntil: "networkidle" });
    await page.keyboard.press("Escape");
    await shot(page, `${OUT}/${name}.jpg`, { wait: 2000, hideSelectors: ["nextjs-portal", "[data-nextjs-toast]"] });
    console.log("ok", name, "→", page.url());
  }
}
console.log("erros:", errors.join(" | ") || "nenhum");
await browser.close();
