// Telas do próprio portfólio para a galeria do projeto: node scripts/capture-portfolio.mjs [baseURL]
// Cada página num tema diferente (o site vira material para ele mesmo). 16:10, 2000 × 1250, sem cursor.
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const OUT = "public/projects/portfolio";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });

const SHOTS = [
  { file: "cover", path: "/", theme: "terminal" },
  { file: "about", path: "/about", theme: "blueprint" },
  { file: "projects", path: "/projects", theme: "cobalto" },
  { file: "project", path: "/projects/hedge", theme: "forja" },
  { file: "contact", path: "/contact", theme: "sonar", reveal: true },
  { file: "home-herbario", path: "/", theme: "herbario" },
  { file: "loader", path: "/", theme: "terminal", loader: true },
];

for (const s of SHOTS) {
  const ctx = await browser.newContext({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
  await ctx.addInitScript(({ theme, loader }) => {
    localStorage.setItem("tema", theme);
    if (loader) Object.defineProperty(navigator, "webdriver", { get: () => false });
  }, s);
  const p = await ctx.newPage();
  await p.goto(BASE + s.path, { waitUntil: s.loader ? "commit" : "networkidle" });
  await p.addStyleTag({ content: ".cursor, .vt-cursor { display: none !important; }" }).catch(() => {});
  if (s.loader) {
    await p.waitForTimeout(900); // contador no meio, linhas de boot aparecendo
  } else {
    await p.waitForTimeout(2600);
    await p.addStyleTag({ content: ".cursor, .vt-cursor { display: none !important; }" });
  }
  if (s.reveal) {
    // e-mail revelado: resolve o desafio
    await p.locator("ol button.btn-primary").click();
    const q = await p.locator("form label").innerText();
    const [a, b] = q.match(/(\d+) \+ (\d+)/).slice(1).map(Number);
    await p.locator("form input").fill(String(a + b));
    await p.locator("form button[type=submit]").click();
    await p.evaluate(() => window.scrollTo(0, 420));
    await p.waitForTimeout(800);
  }
  await p.mouse.move(1000, 4); // tira o mouse de cima de links (sem hover preenchido na foto)
  await p.waitForTimeout(400);
  await p.screenshot({ path: `${OUT}/${s.file}.jpg`, type: "jpeg", quality: 92 });
  console.log("ok", s.file);
  await ctx.close();
}
await browser.close();
