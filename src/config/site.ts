/**
 * URL pública do site, usada em metadados, OG, sitemap e robots (só no servidor).
 * Defina SITE_URL na Vercel quando tiver domínio próprio (sem o prefixo
 * NEXT_PUBLIC_: o valor não precisa ir para o navegador). Sem ela, na Vercel
 * vale o domínio de produção do projeto (VERCEL_PROJECT_PRODUCTION_URL).
 */
export const SITE_URL = (
  process.env.SITE_URL ??
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");
