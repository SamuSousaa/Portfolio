// Onda da troca de tema (View Transition em camadas), medida em PIXELS reais.
// node scripts/theme-transition.mjs [baseURL]
import { chromium } from "playwright-core";
import fs from "node:fs";
import zlib from "node:zlib";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "screenshots/transition";
const SLOW = 0.05; // 400 ms viram 8 s
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });
const NAME = { terminal: "TERMINAL", blueprint: "BLUEPRINT", cobalto: "COBALTO", forja: "FORJA", sonar: "SONAR", herbario: "HERBÁRIO" };
const PAIRS = [
  ["cobalto", "forja", "claro → escuro"],
  ["forja", "herbario", "escuro → claro"],
  ["blueprint", "sonar", "fontes bem diferentes"],
  ["sonar", "blueprint", "fontes diferentes, escuro → claro"],
  ["herbario", "terminal", "entra o CRT"],
];
// pontos da tela (1440×900): áreas lisas de cada camada
const POINTS = { "fundo principal": [653, 133], sidebar: [203, 421], "conteúdo (marquee)": [1003, 859] };

// lê a cor de 1 pixel de um PNG de 1×1
function pixel(png) {
  let i = 8, data = [], type = 6;
  while (i < png.length) {
    const len = png.readUInt32BE(i), kind = png.toString("ascii", i + 4, i + 8);
    if (kind === "IHDR") type = png[i + 8 + 9];
    if (kind === "IDAT") data.push(png.subarray(i + 8, i + 8 + len));
    i += 12 + len;
  }
  const raw = zlib.inflateSync(Buffer.concat(data));
  return [raw[1], raw[2], raw[3]]; // byte 0 = filtro da linha
}
const progress = (a, b, c) => {
  const span = a.reduce((m, v, k) => m + Math.abs(b[k] - v), 0);
  return span < 6 ? null : Math.max(0, Math.min(100, Math.round((100 * a.reduce((m, v, k) => m + Math.abs(c[k] - v), 0)) / span)));
};

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const report = [];

for (const [from, to, label] of PAIRS) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  await ctx.addInitScript((t) => {
    try { if (!sessionStorage.getItem("s")) { localStorage.setItem("tema", t); sessionStorage.setItem("s", "1"); } } catch {}
  }, from);
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(String(e)));
  await p.goto(BASE + "/", { waitUntil: "networkidle" });
  await p.waitForTimeout(2500);
  const read = async () => {
    const out = {};
    for (const [k, [x, y]] of Object.entries(POINTS)) out[k] = pixel(await p.screenshot({ clip: { x, y, width: 1, height: 1 } }));
    return out;
  };
  const before = await read();

  // câmera lenta: assim que a View Transition começa, desacelera tudo
  await p.evaluate((slow) => {
    const orig = document.startViewTransition.bind(document);
    document.startViewTransition = (cb) => {
      const vt = orig(() => {
        const r = cb();
        const cs = getComputedStyle(document.querySelector("h1 [data-intro=line]"));
        window.__fontOk = document.fonts.check(`${cs.fontWeight} 16px ${cs.fontFamily.split(",")[0]}`);
        return r;
      });
      vt.ready.then(() => {
        const anims = document.getAnimations().filter((a) => a.effect?.pseudoElement?.startsWith("::view-transition"));
        window.__anims = anims.map((a) => ({ layer: a.effect.pseudoElement, dur: a.effect.getTiming().duration, ease: a.effect.getTiming().easing, name: a.animationName }));
        anims.forEach((a) => (a.playbackRate = slow));
        window.__vtStart = performance.now();
      });
      return vt;
    };
  }, SLOW);

  const dot = p.locator(`aside [aria-pressed][aria-label$=" ${NAME[to]}"]`);
  await dot.hover();
  await p.waitForTimeout(150);
  await dot.click();
  await p.waitForFunction(() => window.__vtStart);

  const shots = [];
  for (const realMs of [0, 100, 200, 300, 400, 500]) {
    const target = realMs / SLOW; // ms em câmera lenta
    const now = await p.evaluate(() => performance.now() - window.__vtStart);
    if (target > now) await p.waitForTimeout(target - now);
    const px = await read();
    await p.screenshot({ path: `${OUT}/${from}-to-${to}-${String(realMs).padStart(3, "0")}ms.png` });
    shots.push({ realMs, px });
  }
  await p.waitForTimeout(1500);
  const after = await read();
  const anims = await p.evaluate(() => window.__anims);
  const fontOk = await p.evaluate(() => window.__fontOk);
  await ctx.close();

  const rows = shots.map(({ realMs, px }) =>
    `${String(realMs).padStart(3)}ms: ` + Object.keys(POINTS).map((k) => `${k} ${progress(before[k], after[k], px[k]) ?? "—"}%`).join(", "),
  );
  const groups = {};
  for (const a of anims) {
    const m = a.layer.match(/::view-transition-(old|new)\((.+)\)/);
    if (!m || m[1] !== "new") continue;
    groups[m[2]] = a.name === "none" || !a.name ? "instantâneo" : `${a.dur}ms ${a.ease}`;
  }
  report.push({ par: `${from} → ${to} (${label})`, rows, groups, fontOk, errors });
}

// recarregar e trocar de rota não disparam a troca de tema
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const p = await ctx.newPage();
const watch = () =>
  p.evaluate(() => new Promise((res) => {
    const seen = new Set();
    const t0 = performance.now();
    const tick = () => {
      seen.add(document.documentElement.classList.contains("vt-theme") ? "vt-theme ATIVA" : "sem troca de tema");
      performance.now() - t0 < 1500 ? requestAnimationFrame(tick) : res([...seen]);
    };
    tick();
  }));
await p.goto(BASE + "/", { waitUntil: "commit" });
await p.waitForLoadState("domcontentloaded");
const onLoad = await watch();
await p.waitForTimeout(800);
const navP = watch();
await p.click('aside a[href="/projects"]');
const onRoute = await navP;
await ctx.close();
await browser.close();

for (const r of report) {
  console.log(`\n=== ${r.par}`);
  console.log("  camadas (getAnimations logo após o clique):");
  for (const [k, v] of Object.entries(r.groups)) console.log(`    ${k.padEnd(12)} ${v}`);
  console.log(`  fontes prontas na troca: ${r.fontOk ? "sim" : "NÃO"} | erros: ${r.errors.length}`);
  console.log("  progresso medido em pixels (tempo real equivalente):");
  r.rows.forEach((c) => console.log("    " + c));
}
console.log("\nrecarregar:", onLoad.join(" | "));
console.log("trocar de rota:", onRoute.join(" | "));
