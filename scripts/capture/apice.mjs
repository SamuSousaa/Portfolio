// Telas do Ápice com dados FICTÍCIOS: node scripts/capture/apice.mjs [baseURL] [telas,separadas]
// O app traz as próprias telas de exemplo em /_telas (só no `npm run dev`, sem login e
// sem banco): rode o Ápice em modo dev e aponte para ele. Nenhuma conta real é lida.
//   MOBILE=1  → 390×844, salvas como m-<nome>.jpg (desktop: d-<nome>.jpg)      OUT=<pasta> → outra pasta de saída
import { chromium } from "playwright-core";
import { CHROME, shot } from "./mock-supabase.mjs";

const BASE = (process.argv[2] ?? "http://localhost:4174") + "/_telas";
const OUT = process.env.OUT ?? "public/projects/apice";
const MOBILE = !!process.env.MOBILE;
const PRE = MOBILE ? "m-" : "d-"; // telas de celular: m-<nome>.jpg

// [arquivo, rota, clique opcional antes da foto]
const PAGES = [
  ["inicio", ""],
  ["aulas", "/aulas"],
  ["modulo", "/aulas/biosseguranca"],
  ["topico", "/aulas/biosseguranca/assepsia-antissepsia-e-cadeia-asseptica-conceitos"],
  ["revisar", "/revisar"],
  ["questoes", "/questoes/banco"],
  ["simulados", "/simulados"],
  ["simulado-novo", "/simulados/novo"],
  ["desempenho", "/desempenho"],
  ["estudar", "/estudar"],
  ["anotacoes", "/anotacoes"],
  ["busca", "?busca=anestesia"],
  ["perfil", "/perfil"],
];

const only = process.argv[3]?.split(",");
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext(
  MOBILE
    ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "pt-BR", timezoneId: "America/Fortaleza" }
    : { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2, locale: "pt-BR", timezoneId: "America/Fortaleza" },
);
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
for (const [name, path, click] of PAGES) {
  if (only && !only.includes(name)) continue;
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 15000 }).catch(() => {});
  if (click) {
    await page.locator(click).first().click({ timeout: 5000 }).catch((e) => console.log("  sem clique:", name, String(e).slice(0, 80)));
    await page.waitForTimeout(800);
  }
  await shot(page, `${OUT}/${PRE}${name}.jpg`, { wait: 1800 });
  console.log("ok", name, "→", page.url());
}
console.log("erros:", errors.join(" | ") || "nenhum");
await browser.close();
