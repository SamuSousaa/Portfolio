// Folha de contato: todas as imagens de uma pasta numa grade só, para revisar rápido.
// node scripts/capture/contact-sheet.mjs public/projects/apice screenshots/sheet-apice.png
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";
import { CHROME } from "./mock-supabase.mjs";

const [dir, out] = process.argv.slice(2);
const files = fs.readdirSync(dir).filter((f) => /\.(jpe?g|png)$/i.test(f)).sort();
const html = `<body style="margin:0;background:#111;display:grid;grid-template-columns:repeat(3,1fr);gap:8px;padding:8px;font:14px monospace;color:#ccc">
${files.map((f) => `<figure style="margin:0"><img src="data:image/jpeg;base64,${fs.readFileSync(path.join(dir, f)).toString("base64")}" style="width:100%;display:block"><figcaption>${f}</figcaption></figure>`).join("")}</body>`;
const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: 1800, height: 400 } });
await p.setContent(html);
await p.waitForTimeout(300);
await p.screenshot({ path: out, fullPage: true });
await b.close();
console.log(out, files.length, "imagens");
