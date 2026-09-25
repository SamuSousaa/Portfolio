# Pendências

Lista viva do que ainda falta. Quando algo for concluído, sai daqui.

## Conteúdo para preencher

Tudo em `src/config/content.ts`. Campo vazio = a página mostra "aguardando dados".

- [ ] **Wellnessy — capa e galeria**: conta demo com dados fictícios em localhost:3001 (em andamento).
- [ ] **Formação**: você avisa quando quiser incluir (faculdade, cursos).

## Ajustes guardados


## Fases

Site no ar: https://portfolio-three-blue-ax48x0ukqa.vercel.app (cada push na `main` publica).

- [ ] **Domínio samuelsousadev.com.br** (DNS do Registro.br em transição até ~25/09 às 03h; depois disso dá para editar):
  1. Vercel → Settings → Domains → Add `samuelsousadev.com.br` (aceitar o `www` redirecionando). Anotar o IP (registro A) e o CNAME que ela mostrar.
  2. Vercel → Settings → Environment Variables: `SITE_URL` = `https://samuelsousadev.com.br` (Production). Sem o prefixo `NEXT_PUBLIC_`.
  3. Registro.br → domínio → DNS → Configurar endereçamento → Modo avançado → Nova entrada: **A** (nome vazio → IP da Vercel) e **CNAME** (`www` → valor da Vercel). Salvar.
  4. Eu: trocar o link "no ar" do projeto Portfólio e conferir sitemap, OG e links no domínio novo.
