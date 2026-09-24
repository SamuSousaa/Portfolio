// Screenshots de verificação: node scripts/shots.mjs [baseURL]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "screenshots";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const report = [];

async function page(theme, width, height, mobile) {
  const ctx = await browser.newContext({ viewport: { width, height }, deviceScaleFactor: 1, hasTouch: mobile, isMobile: mobile });
  await ctx.addInitScript((t) => {
    try { if (!sessionStorage.getItem("seeded")) { localStorage.setItem("tema", t); sessionStorage.setItem("seeded", "1"); } } catch {}
    document.addEventListener("DOMContentLoaded", () => {
      window.__firstTheme = document.documentElement.dataset.theme;
      window.__firstBg = getComputedStyle(document.body).backgroundColor;
    });
  }, theme);
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));
  return { ctx, p, errors };
}

const scrollThrough = async (p) => {
  await p.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 300) { window.scrollTo(0, y); await new Promise((r) => setTimeout(r, 60)); }
  });
  await p.waitForTimeout(1200);
};

for (const theme of ["terminal", "blueprint"]) {
  for (const [w, h, mobile] of [[1440, 900, false], [390, 844, true]]) {
    const tag = `${theme}-${w}`;
    const { ctx, p, errors } = await page(theme, w, h, mobile);
    await p.goto(BASE + "/", { waitUntil: "networkidle" });
    const first = await p.evaluate(() => ({ theme: window.__firstTheme, bg: window.__firstBg }));
    await p.waitForTimeout(2200);
    await p.screenshot({ path: `${OUT}/${tag}-home.png` });
    await scrollThrough(p);
    await p.screenshot({ path: `${OUT}/${tag}-home-full.png`, fullPage: true });
    await p.evaluate(() => window.scrollTo(0, 0));

    const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);

    if (mobile) {
      await p.click("button[aria-controls=menu-mobile]");
      await p.waitForTimeout(1200);
      await p.screenshot({ path: `${OUT}/${tag}-menu.png` });
      const focusInside = await p.evaluate(() => document.getElementById("menu-mobile").contains(document.activeElement));
      for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
      const trapped = await p.evaluate(() => document.getElementById("menu-mobile").contains(document.activeElement));
      await p.keyboard.press("Escape");
      await p.waitForTimeout(900);
      const closed = await p.evaluate(() => getComputedStyle(document.getElementById("menu-mobile")).visibility);
      report.push({ tag, focusInside, trapped, closedVisibility: closed });
      // navegar pelo menu
      await p.click("button[aria-controls=menu-mobile]");
      await p.waitForTimeout(1100);
      await p.click('#menu-mobile a[href="/projects"]');
      await p.waitForTimeout(250);
      await p.screenshot({ path: `${OUT}/${tag}-transition.png` });
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${OUT}/${tag}-projects.png` });
    } else {
      await p.click('aside a[href="/projects"]');
      await p.waitForTimeout(300);
      await p.screenshot({ path: `${OUT}/${tag}-transition.png` });
      await p.waitForTimeout(1500);
      await p.screenshot({ path: `${OUT}/${tag}-projects.png` });
      // cursor sobre botão preenchido
      await p.goto(BASE + "/", { waitUntil: "networkidle" });
      await p.waitForTimeout(2200);
      const btn = await p.locator(".btn-bracket").boundingBox();
      await p.mouse.move(btn.x + 40, btn.y + btn.height / 2, { steps: 8 });
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${OUT}/${tag}-cursor-fill.png`, clip: { x: btn.x - 30, y: btn.y - 30, width: btn.width + 60, height: btn.height + 60 } });
      // idioma
      await p.click("aside [role=radio][aria-label=Português]");
      await p.waitForTimeout(1500);
      const pt = await p.evaluate(() => ({ lang: document.documentElement.lang, btn: document.querySelector(".btn-bracket")?.textContent }));
      await p.screenshot({ path: `${OUT}/${tag}-pt.png` });
      await p.click("aside [role=radio][aria-label=Español]");
      await p.waitForTimeout(1500);
      await p.reload({ waitUntil: "networkidle" });
      const es = await p.evaluate(() => ({ lang: document.documentElement.lang, btn: document.querySelector(".btn-bracket")?.textContent, title: document.title }));
      report.push({ tag, pt, esAfterReload: es });
      await p.click("aside [role=radio][aria-label=English]");
      await p.waitForTimeout(1500);
      // troca de tema ao vivo
      const other = theme === "terminal" ? "BLUEPRINT" : "TERMINAL";
      await p.hover(`aside [role=radio][aria-label^="${other}"]`);
      await p.waitForTimeout(300);
      await p.screenshot({ path: `${OUT}/${tag}-theme-hover.png`, clip: { x: 0, y: 560, width: 300, height: 340 } });
      await p.click(`aside [role=radio][aria-label^="${other}"]`);
      await p.waitForTimeout(500);
      await p.screenshot({ path: `${OUT}/${tag}-switched.png` });
      await p.reload({ waitUntil: "networkidle" });
      const after = await p.evaluate(() => ({ theme: window.__firstTheme }));
      report.push({ tag, persistedAfterReload: after.theme });
    }
    report.push({ tag, first, overflow, errors });
    await ctx.close();
  }
}
await browser.close();
console.log(JSON.stringify(report, null, 1));
