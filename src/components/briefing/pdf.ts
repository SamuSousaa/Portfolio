import { linhas, visiveis } from "@/briefings/logic";
import type { Briefing, Respostas } from "@/briefings/types";

/* As fontes padrão do PDF só têm Latin-1: aspas curvas, travessões e emojis são trocados ou removidos. */
const latin1 = (s: string) =>
  s
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/[–—]/g, "-")
    .replace(/…/g, "...")
    .replace(/[^\x09\x0A\x20-\xFF]/g, "");

/** Cópia das respostas em PDF (A4, papel claro). A biblioteca só é baixada no clique. */
export async function baixarPdf(briefing: Briefing, respostas: Respostas, extra: string, autor: string, enviadoEm: number) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const M = 20;
  const L = 210 - M * 2;
  const FIM = 297 - M;
  let y = M;

  const cabe = (altura: number) => {
    if (y + altura > FIM) {
      doc.addPage();
      y = M;
    }
  };
  const escrever = (texto: string, o: { tamanho: number; estilo?: "normal" | "bold"; cinza?: number; x?: number; href?: string }) => {
    doc.setFont("helvetica", o.estilo ?? "normal");
    doc.setFontSize(o.tamanho);
    doc.setTextColor(o.cinza ?? 20);
    const x = o.x ?? M;
    const passo = o.tamanho * 0.48;
    for (const linha of doc.splitTextToSize(latin1(texto), L - (x - M)) as string[]) {
      cabe(passo);
      if (o.href) doc.textWithLink(linha, x, y + passo * 0.75, { url: o.href });
      else doc.text(linha, x, y + passo * 0.75);
      y += passo;
    }
  };

  escrever(briefing.titulo, { tamanho: 18, estilo: "bold" });
  y += 2;
  escrever(`Enviado em ${new Intl.DateTimeFormat("pt-BR", { dateStyle: "long" }).format(enviadoEm)} para ${autor}`, { tamanho: 10, cinza: 110 });

  const itens = visiveis(briefing, respostas);
  for (const [n, etapa] of briefing.etapas.entries()) {
    const daEtapa = itens.filter((i) => i.etapa === n);
    if (!daEtapa.length) continue;
    y += 9;
    cabe(20);
    escrever(`${String(n + 1).padStart(2, "0")} - ${etapa.curto}`, { tamanho: 10, estilo: "bold" });
    y += 1.5;
    doc.setDrawColor(20);
    doc.setLineWidth(0.3);
    doc.line(M, y, M + L, y);
    y += 3;
    for (const { pergunta } of daEtapa) {
      cabe(12);
      escrever(pergunta.curto, { tamanho: 9, cinza: 110 });
      const ls = linhas(pergunta, respostas[pergunta.chave]);
      if (!ls.length) escrever("Não respondida", { tamanho: 11, cinza: 150 });
      for (const l of ls) {
        escrever(l.texto, { tamanho: 11, href: l.href });
        if (l.nota) escrever(l.nota, { tamanho: 10, cinza: 90, x: M + 4 });
      }
      y += 3.5;
    }
  }

  if (extra.trim()) {
    y += 9;
    cabe(20);
    escrever("ALGO A MAIS", { tamanho: 10, estilo: "bold" });
    y += 4;
    escrever(extra.trim(), { tamanho: 11 });
  }

  doc.save(`briefing-${briefing.slug}.pdf`);
}
