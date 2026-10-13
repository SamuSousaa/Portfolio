import { NextResponse } from "next/server";
import { getBriefing } from "@/briefings";
import { LIMITES, limparTudo, primeiroErro } from "@/briefings/logic";
import { avisar } from "@/lib/briefing/email";
import { dentroDoLimite, ipHash } from "@/lib/briefing/rateLimit";
import { getDb } from "@/lib/briefing/supabase";

/** Corpo máximo: as respostas são só texto (os arquivos vão direto para o Storage). */
const MAX_CORPO = 64 * 1024;

const falha = (status: number, erro: string, extra?: object) => NextResponse.json({ ok: false, erro, ...extra }, { status });

/**
 * Recebe o briefing: honeypot → limite por IP → validação → banco → e-mail.
 * O banco é a fonte de verdade; se o e-mail falhar, o envio continua valendo.
 */
export async function POST(req: Request) {
  let corpo: Record<string, unknown>;
  try {
    const bruto = await req.text();
    if (bruto.length > MAX_CORPO) return falha(413, "As respostas ficaram grandes demais.");
    corpo = JSON.parse(bruto);
    if (typeof corpo !== "object" || corpo === null) throw new Error();
  } catch {
    return falha(400, "Não consegui ler as respostas.");
  }

  const briefing = typeof corpo.slug === "string" ? getBriefing(corpo.slug) : null;
  if (!briefing) return falha(404, "Briefing não encontrado.");

  // honeypot: campo invisível que só um robô preenche. Responde ok e não grava nada.
  if (typeof corpo.site === "string" && corpo.site.trim()) return NextResponse.json({ ok: true });

  const respostas = limparTudo(briefing, corpo.respostas);
  const erro = primeiroErro(briefing, respostas);
  if (erro) return falha(400, erro.erro, { chave: erro.chave });
  const extra = typeof corpo.extra === "string" ? corpo.extra.trim().slice(0, LIMITES.extra) : "";

  const db = getDb();
  if (!db) {
    console.error("[briefing] SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurada");
    return falha(503, "O envio está fora do ar no momento. Suas respostas continuam salvas aqui.");
  }

  try {
    if (!(await dentroDoLimite(db, ipHash(req), "envio"))) {
      return falha(429, "Muitos envios em pouco tempo. Tente de novo daqui a uma hora.");
    }
    const { data, error } = await db
      .from("briefings")
      .insert({ slug: briefing.slug, respostas: extra ? { ...respostas, _extra: extra } : respostas })
      .select("id")
      .single();
    if (error) throw error;

    try {
      await avisar({ id: data.id, briefing, respostas, extra }, db);
      await db.from("briefings").update({ email_enviado: true }).eq("id", data.id);
    } catch (e) {
      console.error("[briefing] registro salvo, e-mail falhou:", data.id, e);
    }
    return NextResponse.json({ ok: true, id: data.id });
  } catch (e) {
    console.error("[briefing] falha ao gravar:", e);
    return falha(500, "Não consegui salvar agora. Suas respostas continuam aqui, tente de novo.");
  }
}
