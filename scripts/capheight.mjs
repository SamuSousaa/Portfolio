// Mede altura de maiúscula e largura de "SAMUEL" de cada fonte de título (a 100px).
import { chromium } from "playwright-core";
const fonts = [
  ["Aldrich", 400, "normal", "100%"],
  ["Space Grotesk", 700, "normal", "100%"],
  ["Unbounded", 800, "normal", "100%"],
  ["Oswald", 600, "normal", "100%"],
  ["Turret Road", 800, "normal", "100%"],
  ["Archivo", 900, "normal", "125%"],
];
const q = "family=Aldrich&family=Space+Grotesk:wght@700&family=Unbounded:wght@800&family=Oswald:wght@600&family=Turret+Road:wght@800&family=Archivo:wdth,wght@125,900";
const b = await chromium.launch({ executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" });
const p = await b.newPage();
const spans = fonts.map(([f, w, s, st]) => `<span style="font-family:'${f}';font-weight:${w};font-stretch:${st};font-size:100px">SAMUEL</span>`).join("<br>");
await p.setContent(`<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${q}&display=block"><body>${spans}</body>`, { waitUntil: "networkidle" });
await p.evaluate(() => document.fonts.ready);
const r = await p.evaluate((fonts) => {
  const c = document.createElement("canvas").getContext("2d");
  const spans = [...document.querySelectorAll("span")];
  return fonts.map(([f, w, s, st], i) => {
    c.font = `${w} 100px '${f}'`;
    c.fontStretch = st === "125%" ? "expanded" : "normal";
    const cap = c.measureText("H").actualBoundingBoxAscent;
    return { font: f, cap: +cap.toFixed(1), width: Math.round(spans[i].getBoundingClientRect().width) };
  });
}, fonts);
console.table(r);
await b.close();
