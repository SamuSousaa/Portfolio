import { createHash } from "node:crypto";
import type { SupabaseClient } from "@supabase/supabase-js";

/*
 * Limite por IP, contado no banco (tabela briefing_tentativas): na Vercel cada
 * requisição pode cair numa instância diferente, então um contador em memória
 * não serve. O IP nunca é gravado, só o hash com sal.
 */

const JANELA_MS = 60 * 60 * 1000;
export const LIMITE = { envio: 5, upload: 20 } as const;

export function ipHash(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || req.headers.get("x-real-ip") || "desconhecido";
  const sal = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";
  return createHash("sha256").update(`${sal}:${ip}`).digest("hex");
}

/** Registra a tentativa e devolve false se o IP já passou do limite na última hora. */
export async function dentroDoLimite(db: SupabaseClient, hash: string, acao: keyof typeof LIMITE) {
  const desde = new Date(Date.now() - JANELA_MS).toISOString();
  const { count, error } = await db
    .from("briefing_tentativas")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", hash)
    .eq("acao", acao)
    .gte("criado_em", desde);
  if (error) throw error;
  if ((count ?? 0) >= LIMITE[acao]) return false;
  const { error: erroInsert } = await db.from("briefing_tentativas").insert({ ip_hash: hash, acao });
  if (erroInsert) throw erroInsert;
  return true;
}
