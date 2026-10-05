// Telas do Wellnessy (conta de TESTE, dados fictícios de wellnessy-seed.mjs).
//   STATE=<storageState.json de uma sessão logada> node scripts/capture/wellnessy.mjs [telas,separadas]
//   MOBILE=1 → 390×844, salvas como m-<nome>.jpg (desktop: d-<nome>.jpg)      OUT=<pasta> → outra pasta de saída
// O app monta as telas no servidor: não dá para simular os dados, a sessão é de verdade.
// Roda contra o app local (localhost:3001), que usa o Supabase do projeto.
import { chromium } from "playwright-core";
import { CHROME, shot } from "./mock-supabase.mjs";

const BASE = process.env.WELLNESSY_URL ?? "http://localhost:3001";
const OUT = process.env.OUT ?? "public/projects/wellnessy";
const MOBILE = !!process.env.MOBILE;
const PRE = MOBILE ? "m-" : "d-";

// [arquivo, rota, link a abrir a partir da rota, imagem a enviar para o leitor de receita]
const PAGES = [
  ["hoje", "/dashboard"],
  ["remedios", "/medicamentos"],
  ["saude", "/monitores"],
  ["monitor", "/monitores", "a:has-text('Ver medições') >> nth=-1"],
  ["agenda", "/consultas"],
  ["perfis", "/perfis"],
  ["perfil", "/perfis", "a[href^='/perfil/']"],
  ["receita", "/receitas", null, process.env.RECEITA ?? "C:/Users/Sam/Documents/Code/Wellnessy/wellnessy/docs/receitas-de-teste/receita-2-manuscrita.png"],
  ["historico", "/historico"],
  ["gastos", "/gastos"],
  ["mais", "/mais"],
];

const only = process.argv[2]?.split(",");
const browser = await chromium.launch({ executablePath: CHROME });
const ctx = await browser.newContext({
  storageState: process.env.STATE,
  locale: "pt-BR",
  timezoneId: "America/Fortaleza",
  ...(MOBILE ? { viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true } : { viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 }),
});
const page = await ctx.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
for (const [name, path, open, upload] of PAGES) {
  if (only && !only.includes(name)) continue;
  await page.goto(BASE + path, { waitUntil: "networkidle", timeout: 30000 }).catch(() => {});
  if (open) {
    await page.locator(open).first().click({ timeout: 5000 }).catch(() => console.log("  sem link:", name));
    await page.waitForLoadState("networkidle").catch(() => {});
  }
  if (upload) {
    // o OCR roda no navegador (na 1ª vez baixa o idioma): espera a sugestão aparecer
    await page.waitForTimeout(2000);
    await page.locator("input[type=file]").first().setInputFiles(upload);
    await page.getByText(/rem[ée]dios? encontrado/i).first().waitFor({ timeout: 120000 }).catch(() => console.log("  leitura não terminou:", name));
  } else await page.keyboard.press("Escape");
  await shot(page, `${OUT}/${PRE}${name}.jpg`, { wait: 2500, hideSelectors: ["nextjs-portal", "[data-nextjs-toast]", "[data-sonner-toaster]"] });
  console.log("ok", name, "→", page.url());
}
console.log("erros:", errors.join(" | ") || "nenhum");
await browser.close();
