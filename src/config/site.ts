/**
 * URL pública do site, usada em metadados, OG, sitemap e robots.
 * Defina NEXT_PUBLIC_SITE_URL quando tiver domínio próprio; na Vercel, sem ela,
 * vale o domínio de produção do projeto (VERCEL_PROJECT_PRODUCTION_URL).
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
).replace(/\/+$/, "");
