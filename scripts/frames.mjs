// Mede a regularidade dos quadros durante a troca de tema. node scripts/frames.mjs [baseURL]
import { chromium } from "playwright-core";
const BASE = process.argv[2] ?? "http://localhost:3100";
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe", args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist"] });
const pairs = [["cobalto", "forja"], ["forja", "herbario"], ["herbario", "sonar"]];
const NAME = { forja: "FORJA", herbario: "HERBÁRIO", sonar: "SONAR" };
for (const [from, to] of pairs) {
  const ctx = await b.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((t) => { try { if (!sessionStorage.getItem("s")) { localStorage.setItem("tema", t); sessionStorage.setItem("s", "1"); } } catch {} }, from);
  const p = await ctx.newPage();
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const dot = p.locator(`aside [aria-pressed][aria-label$=" ${NAME[to]}"]`);
  await dot.hover(); await p.waitForTimeout(200);
  // referência: quadros parados, antes da troca
  const idle = await p.evaluate(() => new Promise((res) => { const d = []; let last = performance.now(); const t0 = last;
    const tick = (t) => { d.push(t - last); last = t; t - t0 < 600 ? requestAnimationFrame(tick) : res(d); }; requestAnimationFrame(tick); }));
  const run = p.evaluate(() => new Promise((res) => { const d = []; let last; let t0;
    new MutationObserver((_, o) => { o.disconnect(); last = t0 = performance.now();
      const tick = (t) => { d.push(t - last); last = t; t - t0 < 650 ? requestAnimationFrame(tick) : res(d); }; requestAnimationFrame(tick);
    }).observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] }); }));
  await dot.click();
  const d = await run;
  const stat = (a) => { const s = [...a].sort((x, y) => x - y); return `quadros ${a.length}, média ${(a.reduce((m, v) => m + v, 0) / a.length).toFixed(1)}ms, pior ${s.at(-1).toFixed(0)}ms, >20ms: ${a.filter((v) => v > 20).length}`; };
  console.log(`${from} → ${to}\n  parado:  ${stat(idle.slice(1))}\n  troca:   ${stat(d)}`);
  await ctx.close();
}
await b.close();
