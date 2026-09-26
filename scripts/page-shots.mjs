// Screenshots de uma página interna: node scripts/page-shots.mjs [baseURL] [rota]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const ROUTE = process.argv[3] ?? "/about";
const OUT = `screenshots/${ROUTE.replace(/\//g, "") || "home"}`;
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const report = [];

for (const theme of ["terminal", "blueprint"]) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const tag = `${theme}-${w}`;
    const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile });
    await ctx.addInitScript((t) => localStorage.setItem("tema", t), theme);
    const p = await ctx.newPage();
    const errors = [];
    p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
    p.on("pageerror", (e) => errors.push(String(e)));
    await p.goto(BASE + ROUTE, { waitUntil: "networkidle" });
    await p.waitForTimeout(2400);
    await p.screenshot({ path: `${OUT}/${tag}.png` });
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/${tag}-full.png`, fullPage: true });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (ROUTE === "/contact") {
      // fluxo do e-mail: revelar, errar, acertar
      await p.evaluate(() => window.scrollTo(0, 0));
      const html = await (await p.request.get(BASE + ROUTE)).text(); // HTML servido, antes do JS
      const leaked = html.includes("samusousadev@");
      await p.locator("button.btn-primary").first().click();
      await p.waitForTimeout(300);
      await p.locator("form input").fill("99");
      await p.locator("form button[type=submit]").click();
      await p.waitForTimeout(200);
      await p.locator("form").screenshot({ path: `${OUT}/${tag}-wrong.png` });
      const q = await p.locator("form label").innerText();
      const [a, b] = q.match(/(\d+) \+ (\d+)/).slice(1).map(Number);
      await p.locator("form input").fill(String(a + b));
      await p.locator("form button[type=submit]").click();
      await p.waitForTimeout(300);
      await p.screenshot({ path: `${OUT}/${tag}-revealed.png` });
      const shown = await p.locator("ol a[href^=mailto]").first().innerText();
      report.push({ tag, leakedInHtml: leaked, shown });
    }
    report.push({ tag, overflow, errors });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
