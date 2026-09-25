// Capa 16:10 com três telas de celular lado a lado (para apps mobile-first).
// node scripts/capture/phones-cover.mjs <saída.jpg> <fundo css> <tela1> <tela2> <tela3>
import { chromium } from "playwright-core";
import fs from "node:fs";
import { CHROME } from "./mock-supabase.mjs";

const [out, bg, ...shots] = process.argv.slice(2);
const img = (f) => `data:image/jpeg;base64,${fs.readFileSync(f).toString("base64")}`;
const phone = (f, i) => `
  <div style="width:360px;border-radius:44px;background:#111;padding:12px;box-shadow:0 30px 80px rgba(0,0,0,.25);
              transform:translateY(${[40, -20, 40][i]}px)">
    <img src="${img(f)}" style="display:block;width:100%;border-radius:32px">
  </div>`;
const html = `<body style="margin:0;width:1600px;height:1000px;background:${bg};display:flex;align-items:center;justify-content:center;gap:56px;overflow:hidden">
  ${shots.map(phone).join("")}</body>`;
const b = await chromium.launch({ executablePath: CHROME });
const p = await b.newPage({ viewport: { width: 1600, height: 1000 }, deviceScaleFactor: 2 });
await p.setContent(html);
await p.waitForTimeout(300);
await p.screenshot({ path: out, type: "jpeg", quality: 92 });
await b.close();
console.log("ok", out);
