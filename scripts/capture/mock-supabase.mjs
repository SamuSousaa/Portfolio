// Utilitário das capturas de apps com Supabase: sessão falsa + respostas simuladas.
// NADA chega ao banco real: toda requisição ao host do Supabase é respondida aqui
// (leituras com os dados fictícios, escritas com sucesso vazio). Assim as telas
// mostram só dados de demonstração e ninguém precisa fazer login.
import { chromium } from "playwright-core";
import fs from "node:fs";

export const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

const b64url = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");

/** Usuário e sessão de demonstração (JWT sem assinatura: o servidor nunca o vê). */
export function fakeSession({ id = "00000000-0000-4000-8000-000000000001", email = "demo@exemplo.com", name = "Demo" } = {}) {
  const exp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365;
  const user = {
    id,
    aud: "authenticated",
    role: "authenticated",
    email,
    email_confirmed_at: "2026-01-01T00:00:00Z",
    app_metadata: { provider: "email", providers: ["email"] },
    user_metadata: { nome: name, name, full_name: name },
    created_at: "2026-01-01T00:00:00Z",
    updated_at: "2026-01-01T00:00:00Z",
  };
  const access_token = `${b64url({ alg: "HS256", typ: "JWT" })}.${b64url({ sub: id, email, role: "authenticated", aud: "authenticated", exp, session_id: "demo" })}.demo`;
  return { access_token, token_type: "bearer", expires_in: 3600 * 24 * 365, expires_at: exp, refresh_token: "demo-refresh", user };
}

/**
 * Abre o navegador com a sessão falsa no localStorage e o Supabase interceptado.
 * tables: { nome_da_tabela: [linhas] }; rpc: { nome: resultado }.
 */
export async function openMocked({ supabaseUrl, storageKey, tables = {}, rpc = {}, session, viewport = { width: 1600, height: 1000 }, dpr = 1.25, init }) {
  const ref = new URL(supabaseUrl).hostname.split(".")[0];
  const browser = await chromium.launch({ executablePath: CHROME });
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: dpr, locale: "pt-BR", timezoneId: "America/Fortaleza" });
  await ctx.addInitScript(
    ({ key, value, extra }) => {
      localStorage.setItem(key, JSON.stringify(value));
      for (const [k, v] of Object.entries(extra ?? {})) localStorage.setItem(k, v);
    },
    { key: storageKey ?? `sb-${ref}-auth-token`, value: session, extra: init }, // storageKey: quando o app troca a chave padrão
  );
  const unknown = new Set();
  await ctx.route(`${supabaseUrl}/**`, async (route) => {
    const req = route.request();
    const url = new URL(req.url());
    const path = url.pathname;
    const json = (body, status = 200) => route.fulfill({ status, contentType: "application/json", body: JSON.stringify(body) });

    if (path.startsWith("/auth/v1/user")) return json(session.user);
    if (path.startsWith("/auth/v1/token")) return json(session);
    if (path.startsWith("/auth/v1/logout")) return route.fulfill({ status: 204 });
    if (path.startsWith("/auth/v1/")) return json({});
    if (path.startsWith("/rest/v1/rpc/")) {
      const name = path.split("/").pop();
      if (!(name in rpc)) unknown.add("rpc " + name);
      return json(rpc[name] ?? null);
    }
    if (path.startsWith("/rest/v1/")) {
      const table = path.split("/").pop();
      if (req.method() !== "GET" && req.method() !== "HEAD") {
        return json(req.method() === "DELETE" ? [] : [], 201); // escrita: aceita e descarta
      }
      if (!(table in tables)) unknown.add("tabela " + table);
      let rows = tables[table] ?? [];
      // filtros simples do PostgREST: coluna=eq.valor
      for (const [col, cond] of url.searchParams) {
        if (["select", "order", "limit", "offset", "or", "and"].includes(col)) continue;
        const m = /^eq\.(.*)$/.exec(cond);
        if (m && rows.length && col in rows[0]) rows = rows.filter((r) => String(r[col]) === m[1]);
      }
      const single = (req.headers()["accept"] ?? "").includes("vnd.pgrst.object");
      // contagem (select com count: 'exact'): o PostgREST responde no Content-Range
      const headers = { "content-range": rows.length ? `0-${rows.length - 1}/${rows.length}` : "*/0", "access-control-expose-headers": "content-range" };
      if (req.method() === "HEAD") return route.fulfill({ status: 200, headers, body: "" });
      return route.fulfill({ status: single && !rows[0] ? 406 : 200, contentType: "application/json", headers, body: JSON.stringify(single ? (rows[0] ?? null) : rows) });
    }
    if (path.startsWith("/storage/v1/") || path.startsWith("/functions/v1/")) return json({});
    return json({});
  });
  return { browser, ctx, unknown };
}

/** Screenshot 16:10 sem cursor nem animações pela metade. */
export async function shot(page, file, { wait = 1800, hideSelectors = [] } = {}) {
  await page.waitForTimeout(wait);
  await page.addStyleTag({
    content: `*, *::before, *::after { caret-color: transparent !important; } ${hideSelectors.join(",") || ".__none"} { display: none !important; }`,
  });
  await page.mouse.move(2, 2);
  await page.waitForTimeout(300);
  fs.mkdirSync(file.split("/").slice(0, -1).join("/"), { recursive: true });
  await page.screenshot({ path: file, type: "jpeg", quality: 85 });
}
