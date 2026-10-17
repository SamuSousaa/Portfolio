// Dados FICTÍCIOS para as telas do Dispeaker: node scripts/capture/dispeaker-seed.mjs [baseURL] [saida.json]
// Cria (ou reaproveita) cinco contas de demonstração, um servidor com canais e conversas,
// e grava os tokens em <saida.json> para o dispeaker.mjs. Rode contra o `pnpm dev` do
// Dispeaker (nunca contra produção: as contas seriam criadas de verdade lá).
import fs from "node:fs";

const BASE = (process.argv[2] ?? "http://localhost:5173") + "/api";
const OUT = process.argv[3] ?? "dispeaker-demo.json";
const PASSWORD = "demo-portfolio-2026";

if (!/localhost|127\.0\.0\.1/.test(BASE)) throw new Error("só contra o Dispeaker local");

async function call(method, path, token, body) {
  const res = await fetch(BASE + path, {
    method,
    headers: { ...(body ? { "content-type": "application/json" } : {}), ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`${method} ${path} → ${res.status} ${text.slice(0, 200)}`);
  return text ? JSON.parse(text) : null;
}

const PEOPLE = [
  ["samuel.demo", "Samuel"],
  ["ana.demo", "Ana Clara"],
  ["beatriz.demo", "Beatriz"],
  ["leo.demo", "Leonardo"],
  ["caio.demo", "Caio"],
];

const users = {};
for (const [username, displayName] of PEOPLE) {
  const auth = await call("POST", "/auth/register", null, { username, displayName, password: PASSWORD }).catch(() =>
    call("POST", "/auth/login", null, { username, password: PASSWORD }),
  );
  users[username] = { token: auth.accessToken, id: auth.user.id, username, displayName };
}
const [sam, ana, bia, leo, caio] = PEOPLE.map(([u]) => users[u]);

// servidor novo a cada execução (o antigo, se existir, sai)
for (const g of (await call("GET", "/guilds", sam.token)).guilds ?? (await call("GET", "/guilds", sam.token))) {
  if (g.name === "Turma do Sábado") await call("DELETE", `/guilds/${g.id}`, sam.token).catch(() => {});
}
const guild = await call("POST", "/guilds", sam.token, { name: "Turma do Sábado" });
const guildId = guild.id ?? guild.guild?.id;
let full = await call("GET", `/guilds/${guildId}`, sam.token);
const byName = (type, name) => full.channels.find((c) => c.type === type && c.name === name);
const textCat = byName("category", "Texto").id;
const voiceCat = byName("category", "Voz").id;

// canais: dois de texto e dois de voz além dos padrões
for (const [type, name, parentId] of [
  ["text", "jogos", textCat],
  ["text", "clipes", textCat],
  ["voice", "Jogatina", voiceCat],
  ["voice", "Cinema", voiceCat],
])
  await call("POST", `/guilds/${guildId}/channels`, sam.token, { name, type, parentId });

// todos entram por convite
const invite = await call("POST", `/guilds/${guildId}/invites`, sam.token, { maxUses: 10, expiresInSeconds: 3600 });
for (const u of [ana, bia, leo, caio]) await call("POST", `/invites/${invite.code}/accept`, u.token).catch(() => {});

// cargo de moderação para a Beatriz
const role = await call("POST", `/guilds/${guildId}/roles`, sam.token, { name: "Moderação", color: 0xccf200 }).catch(() =>
  call("POST", `/guilds/${guildId}/roles`, sam.token, { name: "Moderação" }),
);
await call("PATCH", `/guilds/${guildId}/members/${bia.id}`, sam.token, { roleIds: [role.id] }).catch((e) => console.log("cargo:", e.message));

// amizades
for (const u of [ana, bia, leo, caio]) {
  await call("POST", "/friends/requests", sam.token, { username: u.username }).catch(() => {});
  const { requests } = await call("GET", "/friends/requests", u.token);
  for (const r of requests.filter((r) => r.direction === "incoming" || r.user?.id === sam.id))
    await call("POST", `/friends/requests/${r.id}/accept`, u.token).catch(() => {});
}

// conversa no #geral
full = await call("GET", `/guilds/${guildId}`, sam.token);
const geral = byName("text", "geral").id;
const say = (u, content, extra = {}) => call("POST", `/channels/${geral}/messages`, u.token, { content, ...extra });
await say(caio, "alguém online pra jogatina hoje?");
await say(leo, "eu! mas só depois das 21h");
const q = await say(bia, "testei a transmissão em 1080p60 ontem, ficou liso até com o jogo em tela cheia");
await say(ana, "pelo app de desktop né? no navegador o meu caía pra 30 fps", { replyToId: q.id });
await say(bia, "isso, pelo app. a diferença é absurda");
const plan = await say(sam, `boa! <@${bia.id}> transmite o campeonato hoje à noite pra gente assistir no Cinema?`);
await say(bia, "fechado, 21h no canal Cinema");
await say(caio, "", { poll: { question: "Qual jogo depois do campeonato?", options: ["Sea of Thieves", "Valorant", "Minecraft"] } });
for (const [u, emoji] of [[ana, "🔥"], [leo, "🔥"], [caio, "👍"], [bia, "🔥"]])
  await call("PUT", `/messages/${plan.id}/reactions/${encodeURIComponent(emoji)}`, u.token).catch((e) => console.log("reação:", e.message));

// votos na enquete
const poll = (await call("GET", `/channels/${geral}/messages`, sam.token)).messages?.find((m) => m.poll) ?? null;
if (poll) {
  const opt = poll.poll.options;
  for (const [u, i] of [[ana, 0], [leo, 0], [bia, 1], [sam, 0]])
    await call("PUT", `/messages/${poll.id}/poll/votes`, u.token, { optionIds: [opt[i].id] }).catch((e) => console.log("voto:", e.message));
}

// conversa privada: a Ana manda mensagem para o Samuel
const dm = await call("POST", `/users/${sam.id}/conversation`, ana.token).catch((e) => (console.log("dm:", e.message), null));
let dmId = null;
if (dm) {
  dmId = dm.id ?? dm.guild?.id ?? dm.guildId;
  const dmGuild = await call("GET", `/guilds/${dmId}`, ana.token);
  const dmText = dmGuild.channels.find((c) => c.type === "text").id;
  const dmSay = (u, content) => call("POST", `/channels/${dmText}/messages`, u.token, { content });
  await dmSay(ana, "ei, me manda o link do instalador do app?");
  await dmSay(sam, "tá na página de download, ele se atualiza sozinho depois");
  await dmSay(ana, "instalei! o atalho de mutar funciona até com o jogo aberto");
  await dmSay(sam, "isso, os atalhos são globais. define os teus em Configurações → Atalhos");
  await dmSay(ana, "perfeito, te vejo às 21h no Cinema");
  // o pedido de conversa precisa ser aceito por quem recebeu
  await call("POST", `/conversations/${dmId}/accept`, sam.token).catch(() => {});
}

fs.writeFileSync(OUT, JSON.stringify({ guildId, dmId, channels: Object.fromEntries(full.channels.map((c) => [`${c.type}:${c.name}`, c.id])), users }, null, 2));
console.log("ok:", guildId, "canais", full.channels.length, "membros", full.members?.length);
