// Grava a troca de tema quadro a quadro (CDP screencast) e procura "piscadas":
// quadros em que uma região sai da trajetória entre a cor inicial e a final.
// node scripts/flicker.mjs [baseURL] [de] [para]
import { chromium } from "playwright-core";
import zlib from "node:zlib";
import fs from "node:fs";

const [BASE = "http://localhost:3100", FROM = "cobalto", TO = "forja"] = process.argv.slice(2);
const NAME = { terminal: "TERMINAL", blueprint: "BLUEPRINT", cobalto: "COBALTO", forja: "FORJA", manuscrito: "MANUSCRITO", sonar: "SONAR", herbario: "HERBÁRIO" };
const OUT = "screenshots/flicker";
fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(OUT, { recursive: true });

// decodificador PNG mínimo (8 bits, RGB/RGBA)
function decode(buf) {
  let i = 8, w, h, type, idat = [];
  while (i < buf.length) {
    const len = buf.readUInt32BE(i), kind = buf.toString("ascii", i + 4, i + 8);
    if (kind === "IHDR") { w = buf.readUInt32BE(i + 8); h = buf.readUInt32BE(i + 12); type = buf[i + 17]; }
    if (kind === "IDAT") idat.push(buf.subarray(i + 8, i + 8 + len));
    i += 12 + len;
  }
  const bpp = type === 6 ? 4 : 3, stride = w * bpp, raw = zlib.inflateSync(Buffer.concat(idat)), px = Buffer.alloc(h * stride);
  for (let y = 0; y < h; y++) {
    const f = raw[y * (stride + 1)], row = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
    for (let x = 0; x < stride; x++) {
      const a = x >= bpp ? px[y * stride + x - bpp] : 0, b = y ? px[(y - 1) * stride + x] : 0, c = x >= bpp && y ? px[(y - 1) * stride + x - bpp] : 0;
      let v = row[x];
      if (f === 1) v += a; else if (f === 2) v += b; else if (f === 3) v += (a + b) >> 1;
      else if (f === 4) { const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c); v += pa <= pb && pa <= pc ? a : pb <= pc ? b : c; }
      px[y * stride + x] = v & 255;
    }
  }
  return { w, h, bpp, px };
}
const REGIONS = {};
for (let gy = 0; gy < 8; gy++) for (let gx = 0; gx < 12; gx++) REGIONS[`${gx},${gy}`] = [gx * 120, gy * 112, gx * 120 + 120, gy * 112 + 112];
function means(img) {
  const out = {};
  for (const [k, [x0, y0, x1, y1]] of Object.entries(REGIONS)) {
    let s = 0, n = 0;
    for (let y = y0; y < y1; y += 3) for (let x = x0; x < x1; x += 3) { const o = (y * img.w + x) * img.bpp; s += img.px[o] + img.px[o + 1] + img.px[o + 2]; n++; }
    out[k] = Math.round(s / n / 3);
  }
  return out;
}

const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
await ctx.addInitScript((t) => { try { if (!sessionStorage.getItem("s")) { localStorage.setItem("tema", t); sessionStorage.setItem("s", "1"); } } catch {} }, FROM);
const p = await ctx.newPage();
await p.goto(BASE + "/", { waitUntil: "networkidle" });
await p.waitForTimeout(2500);
const dot = p.locator(`aside [aria-pressed][aria-label$=" ${NAME[TO]}"]`);
await dot.hover();
await p.waitForTimeout(300);

const cdp = await ctx.newCDPSession(p);
const frames = [];
cdp.on("Page.screencastFrame", async (f) => {
  frames.push({ t: f.metadata.timestamp * 1000, data: f.data });
  await cdp.send("Page.screencastFrameAck", { sessionId: f.sessionId }).catch(() => {});
});
await cdp.send("Page.startScreencast", { format: "png", everyNthFrame: 1, maxWidth: 1440, maxHeight: 900 });
await p.waitForTimeout(400);
const clickAt = Date.now();
await dot.click();
await p.waitForTimeout(1400);
await cdp.send("Page.stopScreencast");
await browser.close();

const t0 = frames.find((f) => f.t >= clickAt)?.t ?? frames[0].t;
const series = frames.map((f, i) => ({ i, t: Math.round(f.t - t0), m: means(decode(Buffer.from(f.data, "base64"))), data: f.data }));
const first = series[0].m, last = series.at(-1).m;
console.log(`${FROM} → ${TO}: ${series.length} quadros`);

const flagged = [];
for (const s of series) {
  // fora da faixa [inicial, final] (com folga) = piscada
  const odd = Object.keys(REGIONS).filter((k) => {
    const lo = Math.min(first[k], last[k]) - 12, hi = Math.max(first[k], last[k]) + 12;
    return s.m[k] < lo || s.m[k] > hi;
  });
  if (odd.length) flagged.push(s);
  if (odd.length) console.log(`  ${String(s.t).padStart(5)}ms fora da trajetória: ` + odd.map((k) => `[${k}] ${first[k]}→${s.m[k]}→${last[k]}`).join("  "));
}
const seq = series.filter((x) => x.t >= 0 && x.t <= 900);
for (const [n, x] of seq.filter((_, k) => k % 3 === 0).entries()) fs.writeFileSync(`${OUT}/sequencia-${String(n).padStart(2, "0")}-${x.t}ms.png`, Buffer.from(x.data, "base64"));
for (const s of flagged.slice(0, 6)) fs.writeFileSync(`${OUT}/quadro-${String(s.t).padStart(5, "0")}ms.png`, Buffer.from(s.data, "base64"));
console.log(flagged.length ? `\n${flagged.length} quadros fora da trajetória (salvos em ${OUT})` : "\nnenhuma piscada detectada");
