import { Resend } from "resend";
import type { SupabaseClient } from "@supabase/supabase-js";
import { linhas, visiveis } from "@/briefings/logic";
import type { Briefing, Respostas, ValorGrupo } from "@/briefings/types";
import { BUCKET, painelUrl } from "./supabase";

/** Validade dos links dos arquivos no e-mail (o arquivo em si continua no Storage). */
const LINK_ARQUIVO_S = 60 * 60 * 24 * 7;

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const comQuebras = (s: string) => esc(s).replace(/\n/g, "<br>");

type Envio = { id: string; briefing: Briefing; respostas: Respostas; extra: string };

async function html({ id, briefing, respostas, extra }: Envio, db: SupabaseClient) {
  const itens = visiveis(briefing, respostas);
  const blocos: string[] = [];

  for (const [n, etapa] of briefing.etapas.entries()) {
    const pares: string[] = [];
    for (const { pergunta } of itens.filter((i) => i.etapa === n)) {
      const partes: string[] = [];
      for (const l of linhas(pergunta, respostas[pergunta.chave])) {
        let href = l.href;
        if (l.arquivo) href = (await db.storage.from(BUCKET).createSignedUrl(l.arquivo.caminho, LINK_ARQUIVO_S)).data?.signedUrl;
        const texto = href ? `<a href="${esc(href)}" style="color:#0a0a0a">${esc(l.texto)}</a>` : comQuebras(l.texto);
        partes.push(texto + (l.nota ? `<br><span style="color:#555">${comQuebras(l.nota)}</span>` : ""));
      }
      pares.push(
        `<tr><td style="padding:8px 16px 8px 0;vertical-align:top;color:#555;width:38%">${esc(pergunta.curto)}</td>` +
          `<td style="padding:8px 0;vertical-align:top">${partes.join("<br>") || '<span style="color:#999">Não respondida</span>'}</td></tr>`,
      );
    }
    blocos.push(
      `<h2 style="font:700 12px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.12em;margin:28px 0 4px;padding-bottom:8px;border-bottom:1px solid #0a0a0a">` +
        `${String(n + 1).padStart(2, "0")} — ${esc(etapa.curto)}</h2>` +
        `<table style="width:100%;border-collapse:collapse;font-size:14px;line-height:1.5">${pares.join("")}</table>`,
    );
  }

  const painel = painelUrl();
  return (
    `<div style="font-family:system-ui,-apple-system,Segoe UI,sans-serif;color:#0a0a0a;max-width:640px">` +
    `<h1 style="font-size:20px;margin:0 0 4px">${esc(briefing.titulo)}</h1>` +
    `<p style="margin:0;color:#555;font-size:13px">Registro ${esc(id)}</p>` +
    blocos.join("") +
    (extra ? `<h2 style="font:700 12px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.12em;margin:28px 0 8px">ALGO A MAIS</h2><p style="font-size:14px;line-height:1.5;margin:0">${comQuebras(extra)}</p>` : "") +
    `<p style="margin:32px 0 0;font-size:13px;color:#555">` +
    (painel ? `<a href="${painel}" style="color:#0a0a0a">Abrir a tabela briefings no Supabase</a> e procurar pelo id acima. ` : "") +
    `Os links de arquivo valem por 7 dias; o arquivo continua no Storage.</p></div>`
  );
}

/** Avisa por e-mail. Lança em caso de falha: quem chama decide o que fazer (o registro já está salvo). */
export async function avisar(envio: Envio, db: SupabaseClient) {
  const key = process.env.RESEND_API_KEY;
  const para = process.env.BRIEFING_EMAIL_TO;
  if (!key || !para) throw new Error("RESEND_API_KEY ou BRIEFING_EMAIL_TO não configurada");

  const nome = typeof envio.respostas.nome === "string" ? envio.respostas.nome : "sem nome";
  const email = (envio.respostas.contato as ValorGrupo | undefined)?.email;
  const { error } = await new Resend(key).emails.send({
    from: process.env.BRIEFING_EMAIL_FROM ?? "Briefing <onboarding@resend.dev>",
    to: para,
    subject: `${envio.briefing.titulo}: ${nome}`,
    html: await html(envio, db),
    replyTo: typeof email === "string" ? email : undefined,
  });
  if (error) throw new Error(error.message);
}
