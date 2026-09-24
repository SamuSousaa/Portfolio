// Screenshots da página Sobre: node scripts/about-shots.mjs [baseURL]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "screenshots/about";
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
    await p.goto(BASE + "/about", { waitUntil: "networkidle" });
    await p.waitForTimeout(2400);
    await p.screenshot({ path: `${OUT}/${tag}.png` });
    await p.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
    });
    await p.waitForTimeout(1200);
    await p.screenshot({ path: `${OUT}/${tag}-full.png`, fullPage: true });
    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    report.push({ tag, overflow, errors });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
