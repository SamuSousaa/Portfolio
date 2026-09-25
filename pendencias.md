# Pendências

Lista viva do que ainda falta. Quando algo for concluído, sai daqui.

## Conteúdo para preencher

Tudo em `src/config/content.ts`. Campo vazio = a página mostra "aguardando dados".

- [ ] **Projetos — capas**: nenhum projeto tem imagem ainda. Mande uma captura de cada (16:10, ideal 2400 × 1500) de Wellnessy, Ápice e Hedge.
- [ ] **Projetos — links e status**: Wellnessy, Ápice e Hedge estão no ar? Se sim, mande as URLs (os repositórios do Ápice e do Wellnessy são privados, então ficam sem link de código).
- [ ] **Formação**: você avisa quando quiser incluir (faculdade, cursos).

## Fases

Site no ar: https://portfolio-three-blue-ax48x0ukqa.vercel.app (cada push na `main` publica).

- [ ] **Domínio samuelsousadev.com.br** (DNS do Registro.br em transição até ~25/09 às 03h; depois disso dá para editar):
  1. Vercel → Settings → Domains → Add `samuelsousadev.com.br` (aceitar o `www` redirecionando). Anotar o IP (registro A) e o CNAME que ela mostrar.
  2. Vercel → Settings → Environment Variables: `SITE_URL` = `https://samuelsousadev.com.br` (Production). Sem o prefixo `NEXT_PUBLIC_`.
  3. Registro.br → domínio → DNS → Configurar endereçamento → Modo avançado → Nova entrada: **A** (nome vazio → IP da Vercel) e **CNAME** (`www` → valor da Vercel). Salvar.
  4. Eu: trocar o link "no ar" do projeto Portfólio e conferir sitemap, OG e links no domínio novo.
