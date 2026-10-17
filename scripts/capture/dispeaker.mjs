// Telas do Dispeaker com dados FICTÍCIOS: node scripts/capture/dispeaker.mjs [baseURL] [demo.json] [telas,separadas]
// Antes: `pnpm dev` no Dispeaker e `node scripts/capture/dispeaker-seed.mjs` (cria as contas e o
// servidor de demonstração e grava demo.json). Cada pessoa é um contexto do navegador logado.
//   MOBILE=1  → 390×844, salvas como m-<nome>.jpg (desktop: d-<nome>.jpg)      OUT=<pasta> → outra pasta de saída
import { chromium } from "playwright-core";
import fs from "node:fs";
import { CHROME, shot } from "./mock-supabase.mjs";

const BASE = process.argv[2] ?? "http://localhost:5173";
const DEMO = JSON.parse(fs.readFileSync(process.argv[3] ?? "dispeaker-demo.json", "utf8"));
const only = process.argv[4]?.split(",");
const OUT = process.env.OUT ?? "public/projects/dispeaker";
const MOBILE = !!process.env.MOBILE;
const PRE = MOBILE ? "m-" : "d-";
const PASSWORD = "demo-portfolio-2026";
const VIDEO = process.env.VIDEO; // .y4m usado como câmera falsa
// o que a Beatriz transmite: o Chrome ignora o .y4m na captura de tela (mostra o padrão verde de
// teste), então o getDisplayMedia dela vira um canvas 1920×1080 com esta imagem
const STREAM_IMAGE = process.env.STREAM_IMAGE ?? "public/projects/apice/d-desempenho.jpg";
const fakeDisplay = (dataUrl) => {
  navigator.mediaDevices.getDisplayMedia = async () => {
    const canvas = Object.assign(document.createElement("canvas"), { width: 1920, height: 1080 });
    const g = canvas.getContext("2d");
    const img = new Image();
    img.src = dataUrl;
    await img.decode();
    const draw = () => {
      const s = Math.max(1920 / img.width, 1080 / img.height);
      g.drawImage(img, (1920 - img.width * s) / 2, (1080 - img.height * s) / 2, img.width * s, img.height * s);
    };
    draw();
    setInterval(draw, 1000 / 30); // quadros novos o tempo todo, como uma tela de verdade
    return canvas.captureStream(30);
  };
};

const browser = await chromium.launch({
  executablePath: CHROME,
  args: [
    "--use-fake-ui-for-media-stream",
    "--use-fake-device-for-media-stream",
    "--auto-accept-this-tab-capture",
    ...(VIDEO ? [`--use-file-for-fake-video-capture=${VIDEO}`] : []),
  ],
});

async function login(username, { viewport, streams } = {}) {
  const ctx = await browser.newContext(
    MOBILE && !viewport
      ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, locale: "pt-BR", timezoneId: "America/Fortaleza", permissions: ["microphone", "camera"] }
      : { viewport: viewport ?? { width: 1600, height: 1000 }, deviceScaleFactor: 2, locale: "pt-BR", timezoneId: "America/Fortaleza", permissions: ["microphone", "camera"] },
  );
  if (streams) await ctx.addInitScript(fakeDisplay, `data:image/jpeg;base64,${fs.readFileSync(STREAM_IMAGE).toString("base64")}`);
  const page = await ctx.newPage();
  await page.goto(BASE + "/login", { waitUntil: "networkidle" });
  await page.getByLabel("USUÁRIO").fill(username);
  await page.getByLabel("SENHA").fill(PASSWORD);
  await page.getByRole("button", { name: /ENTRAR/ }).click();
  await page.waitForURL((u) => !u.pathname.startsWith("/login"), { timeout: 15000 });
  await page.waitForTimeout(1200);
  return page;
}

const sam = await login("samuel.demo");
const ch = (key) => `${BASE}/app/${DEMO.guildId}/${DEMO.channels[key]}`;

const joinVoice = async (page, name) => {
  await page.getByRole("navigation", { name: "Canais" }).getByRole("link", { name: new RegExp(name) }).first().click();
  await page.getByTestId("voice-status").filter({ hasText: "CONECTADO" }).first().waitFor({ timeout: 20000 });
};

// canal de voz "Cinema": a Beatriz transmite (a tela vem de STREAM_IMAGE), o resto assiste
if (!only || only.some((n) => n.startsWith("voz"))) {
  const small = { viewport: { width: 1100, height: 700 } };
  const others = {};
  for (const u of ["beatriz.demo", "ana.demo", "leo.demo", "caio.demo"]) {
    others[u] = await login(u, { ...small, streams: u === "beatriz.demo" });
    await others[u].goto(ch("text:geral"), { waitUntil: "networkidle" });
    await joinVoice(others[u], "Cinema");
  }
  const bia = others["beatriz.demo"];
  await bia.getByRole("button", { name: "TRANSMITIR", exact: true }).first().click();
  await bia.getByRole("menuitem", { name: /1080P60/ }).click();
  await bia.getByRole("button", { name: "PARAR TRANSMISSÃO" }).first().waitFor({ timeout: 20000 });
  await others["ana.demo"].getByRole("button", { name: "MUTAR" }).first().click().catch(() => {});
  for (const u of ["leo.demo", "caio.demo"]) await others[u].getByRole("button", { name: "Assistir Beatriz" }).click().catch(() => {});

  await sam.goto(ch("text:geral"), { waitUntil: "networkidle" });
  await joinVoice(sam, "Cinema");
  await sam.getByRole("button", { name: "Assistir Beatriz" }).click();
  await sam.waitForTimeout(6000); // a camada de 1080p chega
  // painel de estatísticas reais (getStats): clique direito na transmissão → Estatísticas
  if (!MOBILE) {
    await sam.locator('[data-stream="Beatriz"]').click({ button: "right" });
    await sam.getByRole("menuitem", { name: "Estatísticas" }).click();
    await sam.waitForTimeout(2500);
  }
  await shot(sam, `${OUT}/${PRE}voz.jpg`, { wait: 1500 });
  console.log("ok voz →", sam.url());
}

// conversa privada com a Ana (amigos à esquerda)
if ((!only || only.includes("amigos")) && DEMO.dmId) {
  await sam.goto(`${BASE}/app/${DEMO.dmId}`, { waitUntil: "networkidle" });
  await shot(sam, `${OUT}/${PRE}amigos.jpg`, { wait: 1800 });
  console.log("ok amigos →", sam.url());
}

if (!only || only.includes("chat")) {
  await sam.goto(ch("text:geral"), { waitUntil: "networkidle" });
  await shot(sam, `${OUT}/${PRE}chat.jpg`, { wait: 1800 });
  console.log("ok chat →", sam.url());
}
await browser.close();
