// Teste da sidebar encolhível: node scripts/sidebar.mjs [baseURL]
// Confere que logo e ícones não mudam de x, que o estado persiste no reload
// (classe aplicada antes da pintura) e tira fotos aberta / no meio / encolhida.
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "screenshots/sidebar";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

for (const theme of ["terminal", "blueprint"]) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((t) => {
    try { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("tema", t); localStorage.removeItem("sidebar"); sessionStorage.setItem("seeded", "1"); } } catch {}
    document.addEventListener("DOMContentLoaded", () => {
      window.__collapsedAtParse = document.documentElement.classList.contains("sb-collapsed");
    });
  }, theme);
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(BASE + "/about", { waitUntil: "networkidle" });
  await p.waitForTimeout(2200);

  const box = (sel) => p.locator(sel).first().boundingBox().then((b) => b && Math.round(b.x));
  const before = { logo: await box("aside a[href='/'] > span"), social: await box("aside ul a[aria-label=GitHub]") };
  await p.screenshot({ path: `${OUT}/${theme}-open.png` });

  const toggle = p.locator("aside button[aria-expanded]");
  await toggle.click();
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/${theme}-mid.png` });
  await p.waitForTimeout(600);
  await p.screenshot({ path: `${OUT}/${theme}-collapsed.png` });
  const width = await p.evaluate(() => document.querySelector("aside").getBoundingClientRect().width);
  const after = { logo: await box("aside a[href='/'] > span"), icon: await box("aside nav li:nth-child(2) .sb-mini") };

  await p.locator("aside nav li:nth-child(3) a").hover();
  await p.waitForTimeout(300);
  await p.screenshot({ path: `${OUT}/${theme}-tip.png`, clip: { x: 0, y: 100, width: 360, height: 260 } });

  await p.reload({ waitUntil: "networkidle" });
  const persisted = await p.evaluate(() => window.__collapsedAtParse);
  const ariaExpanded = await toggle.getAttribute("aria-expanded");

  // atalho dos ajustes reabre
  await p.locator("aside .sb-mini button").click();
  await p.waitForTimeout(700);
  const reopened = await p.evaluate(() => !document.documentElement.classList.contains("sb-collapsed"));
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

  console.log(JSON.stringify({ theme, width, before, after, persistedBeforePaint: persisted, ariaExpanded, reopened, overflow, errors }));
  await ctx.close();
}
await browser.close();
