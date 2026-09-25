// Teste do loader: node scripts/loader.mjs [baseURL]
// Desliga navigator.webdriver (o loader pula em navegador automatizado) e confere:
// aparece na 1ª visita, some sozinho em ~2 s, a home entra depois, não volta na mesma sessão
// nem no Ctrl+R, e volta no Ctrl+Shift+R.
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "screenshots/loader";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

for (const [theme, w, h, mobile] of [["terminal", 1440, 900, false], ["blueprint", 390, 844, true], ["cobalto", 1440, 900, false]]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile });
  await ctx.addInitScript((t) => {
    Object.defineProperty(navigator, "webdriver", { get: () => false });
    try { if (!localStorage.getItem("tema")) localStorage.setItem("tema", t); } catch {}
  }, theme);
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  const t0 = Date.now();
  await p.goto(BASE + "/", { waitUntil: "commit" });
  const tag = `${theme}-${w}`;
  const shots = [];
  for (const at of [150, 700, 1350, 1700]) {
    await p.waitForTimeout(Math.max(0, at - (Date.now() - t0)));
    await p.screenshot({ path: `${OUT}/${tag}-${at}ms.png` });
    shots.push(at);
  }
  await p.waitForFunction(() => !document.documentElement.classList.contains("loader-on"), null, { timeout: 5000 });
  const gone = Date.now() - t0;
  await p.waitForTimeout(1500);
  const heroVisible = await p.evaluate(() => getComputedStyle(document.querySelector("h1 [data-intro=line]")).visibility);
  await p.screenshot({ path: `${OUT}/${tag}-after.png` });
  await p.goto(BASE + "/about", { waitUntil: "domcontentloaded" });
  const again = await p.evaluate(() => document.documentElement.classList.contains("loader-on"));
  // recarga comum (Ctrl+R manda max-age=0): não mostra; forçada (Ctrl+Shift+R manda no-cache): mostra
  const reloadWith = async (cacheControl, pragma) => {
    await p.setExtraHTTPHeaders(pragma ? { "cache-control": cacheControl, pragma } : { "cache-control": cacheControl });
    await p.reload({ waitUntil: "domcontentloaded" });
    await p.setExtraHTTPHeaders({});
    return p.evaluate(() => document.documentElement.classList.contains("loader-on"));
  };
  const onReload = await reloadWith("max-age=0");
  const onHardReload = await reloadWith("no-cache", "no-cache");
  console.log(JSON.stringify({ tag, loaderGoneMs: gone, heroVisible, shownAgainSameSession: again, onReload, onHardReload, errors }));
  await ctx.close();
}
await browser.close();
