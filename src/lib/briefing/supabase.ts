import { createClient, type SupabaseClient } from "@supabase/supabase-js";

/*
 * Cliente do Supabase com a chave de serviço. SÓ no servidor (rotas de API):
 * a chave ignora o RLS e nunca pode chegar ao navegador, por isso as variáveis
 * não têm o prefixo NEXT_PUBLIC_.
 */

export const BUCKET = "briefings";

/** null quando as variáveis de ambiente não estão configuradas. */
export function getDb(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}

/** Endereço do editor de tabelas do projeto no painel do Supabase. */
export function painelUrl() {
  const ref = process.env.SUPABASE_URL?.match(/^https:\/\/([a-z0-9]+)\.supabase\.co/)?.[1];
  return ref ? `https://supabase.com/dashboard/project/${ref}/editor` : null;
}
