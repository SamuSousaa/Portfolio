// Recortes da página de projeto (visor, funcionalidades, faixa de celulares): node scripts/detail-shots.mjs [baseURL] [slug] [tema] [idioma]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const SLUG = process.argv[3] ?? "hedge";
const THEME = process.argv[4] ?? "terminal";
const LANG = process.argv[5] ?? "pt";
const OUT = `screenshots/detail-${SLUG}`;
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile, reducedMotion: "reduce" });
  await ctx.addCookies([{ name: "lang", value: LANG, url: BASE }, { name: "locale", value: LANG, url: BASE }]);
  await ctx.addInitScript((t) => localStorage.setItem("tema", t), THEME);
  const p = await ctx.newPage();
  await p.goto(`${BASE}/projects/${SLUG}`, { waitUntil: "networkidle" });
  await p.waitForTimeout(1500);
  const targets = { viewer: "figure[aria-roledescription=carousel]", f1: "[data-probe=feature-1]", f2: "[data-probe=feature-2]", phones: "[data-probe=phones]" };
  for (const [name, sel] of Object.entries(targets)) {
    const loc = p.locator(sel).first();
    if (!(await loc.count())) continue;
    await loc.evaluate((el) => window.scrollTo(0, el.getBoundingClientRect().top + scrollY - 110));
    await p.waitForTimeout(900);
    await p.screenshot({ path: `${OUT}/${THEME}-${w}-${name}.png` });
  }
  await ctx.close();
}
await browser.close();
console.log("ok", OUT);
