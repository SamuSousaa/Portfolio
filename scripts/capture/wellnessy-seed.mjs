// Wellnessy: ZERA a conta de teste e preenche com dados FICTÍCIOS, pela própria API do app.
//   STATE=<storageState.json de uma sessão logada> node scripts/capture/wellnessy-seed.mjs
// Só para conta de teste: apaga remédios, perfis, consultas, monitores, contatos, gastos e diário.
// O app não gera dose retroativa: só os horários que ainda vão chegar hoje aparecem em "Hoje"
// (por isso os horários da noite, passados em NIGHT=22:15,22:30).
import { chromium } from "playwright-core";
import { CHROME } from "./mock-supabase.mjs";

const BASE = process.env.WELLNESSY_URL ?? "http://localhost:3001";
const [T1, T2] = (process.env.NIGHT ?? "22:15,22:30").split(",");
const iso = (d) => d.toISOString().slice(0, 10);
const day = (n) => iso(new Date(Date.now() + n * 864e5 - 3 * 36e5)); // dia no fuso -03, n dias a partir de hoje

const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({ storageState: process.env.STATE, locale: "pt-BR", timezoneId: "America/Fortaleza" });
const page = await ctx.newPage();
await page.goto(BASE + "/mais", { waitUntil: "networkidle" });
if (page.url().includes("/login")) throw new Error("sessão expirada: entre de novo");

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
  console.log(r.status >= 300 ? "✗" : "✓", label, r.status >= 300 ? `${r.status} ${r.text}` : "");
  return pick(r);
};

// 1. zera
for (const kind of ["medications", "appointments", "health-trackers", "health-contacts", "expenses", "journal", "dependents"]) {
  const got = pick(await api("GET", `/api/${kind}`));
  const rows = Array.isArray(got) ? got : Object.values(got ?? {}).filter(Array.isArray).flat();
  let n = 0;
  for (const row of rows) if (row?.id && (await api("DELETE", `/api/${kind}/${row.id}`)).status < 300) n++;
  console.log(`apagados ${kind}: ${n}/${rows.length}`);
}

// 2. preenche
const helena = must("perfil Helena", await api("POST", "/api/dependents", { name: "Helena Campos", relationship: "Mãe", dateOfBirth: "1958-04-12", avatarColor: "amber" }));
const hid = helena?.id;
const daily = (times, extra = {}) => ({ frequencyType: "DAILY", specificTimes: times, doseQuantity: 1, startDate: day(0), withFood: "NONE", ...extra });
const meds = [
  { body: { name: "Metformina", activeIngredient: "Cloridrato de metformina", dosageAmount: 850, dosageUnit: "MG", form: "TABLET", totalQuantity: 46, lowStockThreshold: 10 }, schedule: daily(["08:00", T1], { withFood: "REQUIRED" }) },
  { body: { name: "Sinvastatina", activeIngredient: "Sinvastatina", dosageAmount: 20, dosageUnit: "MG", form: "TABLET", totalQuantity: 25, lowStockThreshold: 7 }, schedule: daily([T2]) },
  { body: { name: "Losartana", activeIngredient: "Losartana potássica", dosageAmount: 50, dosageUnit: "MG", form: "TABLET", totalQuantity: 42, lowStockThreshold: 10 }, schedule: daily(["08:00"]) },
  { body: { name: "Omeprazol", activeIngredient: "Omeprazol", dosageAmount: 20, dosageUnit: "MG", form: "CAPSULE", totalQuantity: 8, lowStockThreshold: 10 }, schedule: daily(["07:00"], { withFood: "AVOID" }) },
  { body: { name: "Vitamina D", activeIngredient: "Colecalciferol", dosageAmount: 7000, dosageUnit: "UNITS", form: "CAPSULE", totalQuantity: 8, lowStockThreshold: 2 }, schedule: { frequencyType: "WEEKLY", specificTimes: ["09:00"], daysOfWeek: [1], doseQuantity: 1, startDate: day(0), withFood: "RECOMMENDED" } },
  { body: { name: "Dipirona", activeIngredient: "Dipirona monoidratada", dosageAmount: 500, dosageUnit: "MG", form: "TABLET", totalQuantity: 10, lowStockThreshold: 2, notes: "Só se tiver dor ou febre" } },
  { body: { name: "Levotiroxina", activeIngredient: "Levotiroxina sódica", dosageAmount: 50, dosageUnit: "MCG", form: "TABLET", totalQuantity: 30, lowStockThreshold: 7, dependentId: hid }, schedule: daily(["06:30"], { withFood: "AVOID" }) },
  { body: { name: "Anlodipino", activeIngredient: "Besilato de anlodipino", dosageAmount: 5, dosageUnit: "MG", form: "TABLET", totalQuantity: 28, lowStockThreshold: 7, dependentId: hid }, schedule: daily(["09:00", T2]) },
];
const medIds = {};
for (const m of meds) {
  const created = must("remédio " + m.body.name, await api("POST", "/api/medications", m.body));
  medIds[m.body.name] = created?.id;
  if (m.schedule && created?.id) must("  horário " + m.body.name, await api("POST", `/api/medications/${created.id}/schedules`, m.schedule));
}

const cardio = must("contato cardiologista", await api("POST", "/api/health-contacts", { contactType: "DOCTOR", name: "Dra. Paula Rezende", specialty: "Cardiologia", phoneWork: "(86) 3322-0000", address: "Clínica Centro, sala 204" }));
must("contato farmácia", await api("POST", "/api/health-contacts", { contactType: "PHARMACY", name: "Farmácia Vida", phoneWork: "(86) 3322-1111" }));
must("contato emergência", await api("POST", "/api/health-contacts", { contactType: "EMERGENCY", name: "SAMU", phoneWork: "192" }));

must("consulta cardiologia", await api("POST", "/api/appointments", { title: "Cardiologista — retorno", scheduledAt: `${day(4)}T14:30:00-03:00`, reminderOffset: "DAY_1", location: "Clínica Centro, sala 204", notes: "Levar as medições de pressão das últimas semanas.", contactId: cardio?.id }));
must("consulta exame Helena", await api("POST", "/api/appointments", { title: "Exame de sangue em jejum", scheduledAt: `${day(2)}T07:00:00-03:00`, reminderOffset: "HOUR_12", location: "Laboratório Vida", dependentId: hid }));
must("consulta clínico", await api("POST", "/api/appointments", { title: "Clínico geral", scheduledAt: `${day(11)}T10:00:00-03:00`, reminderOffset: "DAY_1", location: "UBS Centro" }));

const pressao = must("monitor pressão", await api("POST", "/api/health-trackers", { name: "Pressão arterial", kind: "MEASUREMENT", unit: "MMHG" }));
const glicemia = must("monitor glicemia", await api("POST", "/api/health-trackers", { name: "Glicemia em jejum", kind: "MEASUREMENT", unit: "MG_DL", dependentId: hid }));
const enxaqueca = must("monitor enxaqueca", await api("POST", "/api/health-trackers", { name: "Enxaqueca", kind: "SYMPTOM" }));
const PA = [[134, 88], [131, 86], [128, 84], [129, 85], [124, 82], [126, 81], [122, 80], [119, 79], [121, 78], [118, 77]];
let ok = 0;
for (const [i, [s, d]] of PA.entries()) if (pressao?.id && (await api("POST", `/api/health-trackers/${pressao.id}/entries`, { valueNumeric: s, valueSecondary: d, measuredAt: `${day(-18 + i * 2)}T08:15:00-03:00` })).status < 300) ok++;
for (const [i, v] of [132, 128, 121, 126, 118, 115, 119].entries()) if (glicemia?.id && (await api("POST", `/api/health-trackers/${glicemia.id}/entries`, { valueNumeric: v, measuredAt: `${day(-13 + i * 2)}T07:05:00-03:00` })).status < 300) ok++;
for (const [i, v] of [4, 2, 5, 2].entries()) if (enxaqueca?.id && (await api("POST", `/api/health-trackers/${enxaqueca.id}/entries`, { severity: v, measuredAt: `${day(-20 + i * 5)}T16:00:00-03:00`, notes: i === 2 ? "Depois de dormir pouco" : undefined })).status < 300) ok++;
console.log("medições gravadas:", ok, "/ 21");

if (medIds.Losartana) must("gasto Losartana", await api("POST", "/api/expenses", { medicationId: medIds.Losartana, amount: 18.9, quantityPurchased: 30, purchasedAt: day(-2), pharmacyName: "Farmácia Vida" }));
if (medIds.Metformina) must("gasto Metformina", await api("POST", "/api/expenses", { medicationId: medIds.Metformina, amount: 24.5, quantityPurchased: 60, purchasedAt: day(-3), pharmacyName: "Farmácia Vida" }));
if (medIds.Omeprazol) must("gasto Omeprazol", await api("POST", "/api/expenses", { medicationId: medIds.Omeprazol, amount: 15.8, quantityPurchased: 28, purchasedAt: day(-1), pharmacyName: "Drogaria Popular" }));

must("diário 1", await api("POST", "/api/journal", { content: "Dormi melhor depois de passar o omeprazol para antes do café.", loggedAt: `${day(-3)}T21:30:00-03:00` }));
must("diário 2", await api("POST", "/api/journal", { content: "Pressão mais baixa a semana toda. Caminhada de manhã ajudando.", loggedAt: `${day(-1)}T20:10:00-03:00` }));
await browser.close();
