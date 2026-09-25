// Cria a conta de demonstração do Wellnessy (dados fictícios): node scripts/capture/wellnessy-signup.mjs
// A senha fica só no scratchpad local (nunca no repositório). O Supabase envia um e-mail de
// confirmação para o apelido +demo do Gmail do dono; depois do clique, wellnessy.mjs entra e captura.
import { chromium } from "playwright-core";
import fs from "node:fs";
import crypto from "node:crypto";
import { CHROME } from "./mock-supabase.mjs";

const BASE = process.env.WELLNESSY_URL ?? "http://localhost:3001";
const SECRET = process.env.DEMO_SECRET_FILE; // arquivo local com e-mail e senha da conta demo
const email = "samusousaaicloud+demo@gmail.com";
const password = `Demo-${crypto.randomBytes(9).toString("base64url")}9!`;
fs.writeFileSync(SECRET, JSON.stringify({ email, password }, null, 2));

const b = await chromium.launch({ executablePath: CHROME });
const p = await (await b.newContext({ viewport: { width: 1280, height: 900 }, locale: "pt-BR" })).newPage();
await p.goto(BASE + "/cadastro", { waitUntil: "networkidle" });
await p.fill('[name="name"]', "Lara Campos");
await p.fill('[name="email"]', email);
await p.fill('[name="password"]', password);
await p.fill('[name="passwordConfirmation"]', password);
await p.click('[type="submit"]');
await p.waitForTimeout(5000);
await p.screenshot({ path: process.env.SHOT ?? "signup.png" });
console.log("url:", p.url());
console.log("mensagens:", (await p.locator("[role=status], [data-sonner-toast], [role=alert], main p").allInnerTexts()).slice(0, 6).join(" | "));
await b.close();
