// Percorre o briefing inteiro com a API simulada: node scripts/briefing.mjs [baseURL] [slug]
// Com REAL=1 não simula nada: grava no Supabase, envia um arquivo e dispara o e-mail (só desktop).
import { chromium } from "playwright-core";
import fs from "node:fs";

const BASE = process.argv[2] ?? "http://localhost:3100";
const SLUG = process.argv[3] ?? "portal-noticias";
const OUT = "screenshots/briefing";
fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const REAL = !!process.env.REAL;
const report = [];

const rotulo = (p) => p.locator("main p.label").first().innerText();
const naPergunta = (p) => p.locator("nav[aria-label='Navegação do briefing']").count();

/** Preenche a tela atual conforme os campos que encontrar. */
async function preencher(p) {
  const titulo = await p.locator("main h2").innerText();
  const grupos = p.locator("main [role=radiogroup]");
  for (let g = 0; g < (await grupos.count()); g++) {
    // "Sim" na identidade (abre upload + link); nas demais, a 2ª opção (abre as perguntas condicionais)
    const alvo = /logo ou identidade/i.test(titulo) ? 0 : 1;
    await grupos.nth(g).locator("[role=radio]").nth(alvo).click();
    await p.waitForTimeout(80);
  }
  if (REAL && (await p.locator("main input[type=file]").count())) {
    await p.locator("main input[type=file]").setInputFiles("src/app/icon.svg");
    await p.getByRole("button", { name: "Remover" }).waitFor({ timeout: 20000 });
  }
  const caixas = p.locator("main [role=checkbox]");
  for (let i = 0; i < Math.min(2, await caixas.count()); i++) await caixas.nth(i).click();
  const campos = p.locator("main .bf-input");
  for (let i = 0; i < (await campos.count()); i++) {
    const c = campos.nth(i);
    if (!(await c.isVisible()) || (await c.inputValue())) continue;
    const tipo = await c.getAttribute("type");
    const modo = await c.getAttribute("inputmode");
    await c.fill(tipo === "date" ? "2027-03-01" : tipo === "tel" ? "86999990000" : modo === "email" ? "ana@exemplo.com" : modo === "url" ? "g1.globo.com" : "Resposta de teste");
  }
}

for (const [w, h, mobile] of REAL ? [[1440, 900, false]] : [[1440, 900, false], [390, 844, true]]) {
  const tag = String(w);
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, hasTouch: mobile, isMobile: mobile, acceptDownloads: true });
  const p = await ctx.newPage();
  const errors = [];
  p.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  p.on("pageerror", (e) => errors.push(String(e)));

  // 1ª tentativa de envio falha, a 2ª passa: cobre o "tentar de novo sem perder as respostas"
  let envios = 0;
  let corpo = null;
  if (!REAL) await p.route("**/api/briefing", async (route) => {
    envios++;
    corpo = route.request().postDataJSON();
    if (envios === 1) return route.fulfill({ status: 500, json: { ok: false, erro: "Não consegui salvar agora. Suas respostas continuam aqui, tente de novo." } });
    return route.fulfill({ json: { ok: true, id: "teste" } });
  });

  await p.goto(`${BASE}/briefing/${SLUG}`, { waitUntil: "networkidle" });
  const robots = await p.locator("meta[name=robots]").getAttribute("content");
  const semSidebar = (await p.locator(".sidebar").count()) === 0;
  await p.waitForTimeout(500);
  await p.screenshot({ path: `${OUT}/${tag}-01-abertura.png` });
  await p.locator("button.bf-primary").click();
  await p.waitForTimeout(600);

  // obrigatória em branco: erro na tela
  await p.locator("nav button.bf-primary").click();
  await p.waitForTimeout(200);
  const erroVazio = await p.locator("#bf-erro").innerText();
  await p.screenshot({ path: `${OUT}/${tag}-02-erro.png` });

  const vistas = [];
  let recarregou = false;
  for (let passo = 0; passo < 40 && (await naPergunta(p)); passo++) {
    const antes = await rotulo(p);
    const titulo = await p.locator("main h2").innerText();
    vistas.push(titulo);
    await preencher(p);
    await p.waitForTimeout(150);
    if ((await naPergunta(p)) && (await rotulo(p)) === antes) {
      const n = vistas.length;
      if ([2, 7, 12, 19, 20, 27].includes(n)) await p.screenshot({ path: `${OUT}/${tag}-p${String(n).padStart(2, "0")}.png` });
      // teclado no desktop (Enter), botão no celular
      if (!mobile && (await p.locator("main textarea").count()) === 0) await p.keyboard.press("Enter");
      else await p.locator("nav button.bf-primary").click();
    }
    await p.waitForFunction((a) => document.querySelector("main p.label")?.innerText !== a, antes, { timeout: 3000 }).catch(() => {});
    await p.waitForTimeout(350);

    // no meio do caminho: recarrega e continua do rascunho
    if (!recarregou && vistas.length === 9) {
      recarregou = true;
      await p.reload({ waitUntil: "networkidle" });
      await p.waitForTimeout(400);
      await p.screenshot({ path: `${OUT}/${tag}-03-retomar.png` });
      await p.locator("button.bf-primary").click();
      await p.waitForTimeout(600);
    }
  }

  await p.waitForTimeout(400);
  const noResumo = (await rotulo(p)) === "RESUMO";
  await p.screenshot({ path: `${OUT}/${tag}-04-resumo.png` });
  await p.locator("main").evaluate((el) => el.scrollTo(0, el.scrollHeight));
  await p.waitForTimeout(200);
  await p.screenshot({ path: `${OUT}/${tag}-05-resumo-fim.png` });

  // editar a partir do resumo e voltar
  await p.locator("main").evaluate((el) => el.scrollTo(0, 0));
  await p.locator("main dl button").first().click();
  await p.waitForTimeout(600);
  await p.locator("main .bf-input").first().fill("Ana Clara");
  await p.locator("nav button.bf-primary").click();
  await p.waitForTimeout(600);
  const editou = (await p.locator("main dl dd").first().innerText()).includes("Ana Clara");

  const enviar = p.locator("main button.bf-primary");
  await enviar.scrollIntoViewIfNeeded();
  await enviar.click();
  await p.waitForTimeout(500);
  const falhou = REAL ? "" : await p.locator("main [role=alert]").last().innerText();
  await p.screenshot({ path: `${OUT}/${tag}-06-falha.png` });
  if (REAL) await p.locator("main h2", { hasText: "Recebi" }).waitFor({ timeout: 30000 }).catch(() => {});
  else await enviar.click();
  await p.waitForTimeout(900);
  await p.screenshot({ path: `${OUT}/${tag}-07-enviado.png` });
  const enviado = await p.locator("main h2").innerText();

  let pdf = null;
  if (!mobile) {
    const [download] = await Promise.all([p.waitForEvent("download", { timeout: 15000 }), p.locator("main button.bf-primary").click()]);
    const caminho = `${OUT}/copia.pdf`;
    await download.saveAs(caminho);
    pdf = `${download.suggestedFilename()} (${fs.statSync(caminho).size} bytes)`;
  }

  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  report.push({ tag, robots, semSidebar, erroVazio, perguntas: vistas.length, noResumo, editou, falhou, envios, enviado, pdf, chaves: Object.keys(corpo?.respostas ?? {}).length, overflow, errors });
  if (!mobile) fs.writeFileSync(`${OUT}/corpo.json`, JSON.stringify(corpo, null, 2));
  await ctx.close();
}

await browser.close();
console.log(JSON.stringify(report, null, 2));
