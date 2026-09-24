// Teste de fluidez: trocar tema/idioma não pode mover nada. node scripts/fluid.mjs [baseURL]
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "screenshots/fluid";
fs.mkdirSync(OUT, { recursive: true });
const THEMES = ["terminal", "blueprint", "cobalto", "forja", "manuscrito", "sonar", "herbario"];
const NAMES = { herbario: "HERBÁRIO" };
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

// elementos cujo lugar/tamanho não pode mudar
const PROBES = {
  "hero-line-1": "h1 [data-intro=line] >> nth=0",
  "hero-line-2": "h1 [data-intro=line] >> nth=1",
  bio: "section .font-mono.text-muted >> nth=0",
  button: ".btn-primary",
  marquee: ".trilho",
  panels: "[aria-label] dl >> nth=0",
  "topbar-hud": "header .status-dot >> nth=0",
  "topbar-path": "header p.label >> nth=-1",
  "sidebar-settings": "aside >> text=/SETTINGS|AJUSTES/",
};

async function rects(p) {
  const out = {};
  for (const [k, sel] of Object.entries(PROBES)) {
    const loc = p.locator(sel);
    if (!(await loc.count())) continue;
    const b = await loc.first().boundingBox();
    if (b) out[k] = { x: Math.round(b.x), y: Math.round(b.y), w: Math.round(b.width), h: Math.round(b.height) };
  }
  return out;
}
function diff(a, b) {
  const d = [];
  for (const k of Object.keys(a)) {
    if (!b[k]) continue;
    for (const f of ["x", "y", "w", "h"]) if (Math.abs(a[k][f] - b[k][f]) > 1) d.push(`${k}.${f} ${a[k][f]}→${b[k][f]}`);
  }
  return d;
}

const results = [];
for (const [w, h] of [[1440, 900], [390, 844]]) {
  const mobile = w < 900;
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2600);
  const base = await rects(p);

  // o seletor fica na sidebar (desktop) ou no menu (celular)
  const scope = mobile ? "#menu-mobile" : "aside";
  const openMenu = async () => {
    if (!mobile) return;
    await p.click("button[aria-controls=menu-mobile]");
    await p.waitForTimeout(1200);
  };
  const closeMenu = async () => {
    if (!mobile) return;
    await p.keyboard.press("Escape");
    await p.waitForTimeout(700);
  };

  // temas
  for (const theme of THEMES.slice(1).concat("terminal")) {
    await openMenu();
    const dot = p.locator(`${scope} [role=radio][aria-label^="${NAMES[theme] ?? theme.toUpperCase()}"]`);
    await dot.hover().catch(() => {});
    await dot.click();
    if (!mobile && theme === "forja") {
      // quadro no meio da subida
      await p.waitForTimeout(230);
      await p.screenshot({ path: `${OUT}/wipe-mid-${w}.png` });
    }
    await p.waitForTimeout(1300);
    await closeMenu();
    const r = await rects(p);
    results.push({ w, change: `tema → ${theme}`, applied: await p.evaluate(() => document.documentElement.dataset.theme), shifts: diff(base, r) });
  }

  // idiomas
  for (const lang of ["Português", "Español", "English"]) {
    await openMenu();
    await p.click(`${scope} [role=radio][aria-label="${lang}"]`);
    await p.waitForTimeout(900);
    await closeMenu();
    const r = await rects(p);
    results.push({ w, change: `idioma → ${lang}`, applied: await p.evaluate(() => document.documentElement.lang), shifts: diff(base, r) });
  }
  results.push({ w, errors });
  await ctx.close();
}
await browser.close();
for (const r of results) {
  if (r.errors) console.log(`${r.w}px erros: ${r.errors.length ? r.errors.join(" | ") : "nenhum"}`);
  else console.log(`${r.w}px ${r.change.padEnd(22)} [${r.applied}] ${r.shifts.length ? "MOVEU: " + r.shifts.join(", ") : "ok, nada se moveu"}`);
}
