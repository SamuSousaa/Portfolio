-- Briefings: rode uma vez no SQL Editor do projeto no Supabase.

create table public.briefings (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null,
  respostas     jsonb not null,
  status        text not null default 'novo' check (status in ('novo', 'lido', 'respondido')),
  criado_em     timestamptz not null default now(),
  -- false = o aviso por e-mail falhou e o registro ficou só aqui
  email_enviado boolean not null default false
);
create index briefings_slug_criado_em on public.briefings (slug, criado_em desc);

-- Limite de envios e uploads por IP. O IP fica só como hash com sal.
create table public.briefing_tentativas (
  id        bigint generated always as identity primary key,
  ip_hash   text not null,
  acao      text not null check (acao in ('envio', 'upload')),
  criado_em timestamptz not null default now()
);
create index briefing_tentativas_busca on public.briefing_tentativas (ip_hash, acao, criado_em desc);

-- RLS ligado e nenhuma policy: só a chave de serviço (rota de API) lê e grava.
alter table public.briefings enable row level security;
alter table public.briefing_tentativas enable row level security;

-- Arquivos enviados pela cliente (logo, imagens). Privado, 10 MB por arquivo.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'briefings', 'briefings', false, 10485760,
  array['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml', 'application/pdf']
);
