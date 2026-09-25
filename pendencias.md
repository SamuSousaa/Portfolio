# Pendências

Lista viva do que ainda falta. Quando algo for concluído, sai daqui.

## Conteúdo para preencher

Tudo em `src/config/content.ts`. Campo vazio = a página mostra "aguardando dados".

- [ ] **Texto "sobre mim"**: `PROFILE.about`. A bio curta já foi refeita (opção C). Falta aprovar o rascunho dos parágrafos longos.
- [ ] **Stack**: `SKILLS`. Hoje só tem o que o site já citava (TypeScript, Next.js, integração com LLM, sistemas agênticos). Complete os grupos ou crie novos (`group` nos 3 idiomas + `items`).
- [ ] **Experiência**: `EXPERIENCE`. Cada item: `{ period: "2024 — 2026", role: { en, pt, es }, org: "Empresa" }`. Aparece no painel da home e na trajetória do Sobre.
- [ ] **Projetos**: o Hedge só tem os campos mínimos. Opcionais: `role`, `status`, `links` (site/código), `cover` (imagem 16:10 em `public/projects/<slug>/`), `overview` e `sections`.

## Fases

Site no ar: https://portfolio-three-blue-ax48x0ukqa.vercel.app (cada push na `main` publica).

- [ ] Domínio próprio (opcional, você avisa quando tiver): defina `NEXT_PUBLIC_SITE_URL` na Vercel para os links de OG/sitemap usarem ele.
