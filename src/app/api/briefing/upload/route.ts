import { randomUUID } from "node:crypto";
import { NextResponse } from "next/server";
import { getBriefing } from "@/briefings";
import { UPLOAD } from "@/briefings/logic";
import { dentroDoLimite, ipHash } from "@/lib/briefing/rateLimit";
import { BUCKET, getDb } from "@/lib/briefing/supabase";

const falha = (status: number, erro: string) => NextResponse.json({ ok: false, erro }, { status });

/** Nome seguro para o caminho: sem acentos, espaços ou barras. */
const nomeSeguro = (nome: string) =>
  nome
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .replace(/[^\w.-]+/g, "-")
    .replace(/^[-.]+/, "")
    .slice(-100) || "arquivo";

/**
 * Autoriza o upload de um arquivo: confere tipo e tamanho e devolve uma URL
 * assinada. O navegador envia o arquivo direto ao Storage (a rota de API da
 * Vercel não aceita corpo acima de 4,5 MB) sem nunca ver a chave do banco.
 */
export async function POST(req: Request) {
  let corpo: Record<string, unknown>;
  try {
    corpo = await req.json();
  } catch {
    return falha(400, "Pedido inválido.");
  }

  const briefing = typeof corpo.slug === "string" ? getBriefing(corpo.slug) : null;
  if (!briefing) return falha(404, "Briefing não encontrado.");
  if (typeof corpo.nome !== "string" || typeof corpo.tipo !== "string" || typeof corpo.tamanho !== "number") {
    return falha(400, "Pedido inválido.");
  }
  if (!UPLOAD.tipos.includes(corpo.tipo)) return falha(415, "Envie uma imagem (PNG, JPG, WebP, SVG) ou um PDF.");
  if (corpo.tamanho <= 0 || corpo.tamanho > UPLOAD.maxBytes) return falha(413, "O arquivo passa de 10 MB. Se preferir, cole um link.");

  const db = getDb();
  if (!db) return falha(503, "O envio de arquivos está fora do ar. Se preferir, cole um link.");

  try {
    if (!(await dentroDoLimite(db, ipHash(req), "upload"))) return falha(429, "Muitos arquivos em pouco tempo. Tente mais tarde ou cole um link.");
    const caminho = `${briefing.slug}/${randomUUID()}/${nomeSeguro(corpo.nome)}`;
    const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(caminho);
    if (error) throw error;
    return NextResponse.json({ ok: true, caminho, url: data.signedUrl });
  } catch (e) {
    console.error("[briefing] falha ao autorizar upload:", e);
    return falha(500, "Não consegui receber o arquivo agora. Se preferir, cole um link.");
  }
}
