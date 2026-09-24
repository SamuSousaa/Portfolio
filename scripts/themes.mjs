// Verificação dos temas: node scripts/themes.mjs [baseURL]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "screenshots/themes";
const THEMES = ["terminal", "blueprint", "cobalto", "forja", "sonar", "herbario"];
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

const loadedFamilies = (p) =>
  p.evaluate(() => [...new Set([...document.fonts].filter((f) => f.status === "loaded").map((f) => f.family.replace(/['"]/g, "")))].sort());

async function open(theme, viewport, mobile = false) {
  const ctx = await browser.newContext({ viewport, hasTouch: mobile, isMobile: mobile });
  await ctx.addInitScript((t) => {
    try { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("tema", t); sessionStorage.setItem("seeded", "1"); } } catch {}
    document.addEventListener("DOMContentLoaded", () => (window.__first = document.documentElement.dataset.theme));
  }, theme);
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, p, errors };
}

const report = [];

// 1. Home em 1440 nos sete temas + tema no DOMContentLoaded + estouro do título
for (const theme of THEMES) {
  const { ctx, p, errors } = await open(theme, { width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2600);
  await p.screenshot({ path: `${OUT}/${theme}-1440.png` });
  const info = await p.evaluate(() => {
    const h1 = document.querySelector("h1");
    const col = h1.closest("[class*='@container']");
    return {
      first: window.__first,
      overflowX: document.documentElement.scrollWidth - innerWidth,
      titleOverflow: Math.round(Math.max(...[...h1.querySelectorAll("[data-intro=line]")].map((l) => l.scrollWidth)) - col.clientWidth),
    };
  });
  report.push({ theme, ...info, fonts: await loadedFamilies(p), errors });
  await ctx.close();
}

// 2. Fontes sob demanda: começa no terminal e troca tema a tema pelo seletor
{
  const { ctx, p } = await open("terminal", { width: 1440, height: 900 });
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const seq = [{ theme: "terminal", fonts: await loadedFamilies(p) }];
  for (const theme of THEMES.slice(1)) {
    await p.click(`aside [aria-pressed][aria-label$=" ${theme === "herbario" ? "HERBÁRIO" : theme.toUpperCase()}"]`);
    await p.waitForTimeout(1500);
    seq.push({ theme, fonts: await loadedFamilies(p) });
  }
  // balão do seletor
  await p.hover(`aside [aria-pressed][aria-label$=" SONAR"]`);
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/selector-hover.png`, clip: { x: 0, y: 600, width: 330, height: 300 } });
  report.push({ onDemand: seq.map((s, i) => ({ theme: s.theme, newlyLoaded: s.fonts.filter((f) => !(seq[i - 1]?.fonts ?? []).includes(f)) })) });
  await ctx.close();
}

// 3. Celular com o menu aberto
for (const theme of ["forja", "herbario"]) {
  const { ctx, p, errors } = await open(theme, { width: 390, height: 844 }, true);
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2400);
  await p.screenshot({ path: `${OUT}/${theme}-390.png` });
  await p.click("button[aria-controls=menu-mobile]");
  await p.waitForTimeout(1300);
  await p.screenshot({ path: `${OUT}/${theme}-390-menu.png` });
  const overflowX = await p.evaluate(() => document.documentElement.scrollWidth - innerWidth);
  report.push({ theme, mobile: true, overflowX, errors });
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 1));
