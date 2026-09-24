# Pendências

Lista viva do que ainda falta. Quando algo for concluído, sai daqui.

## Conteúdo para preencher

Tudo em `src/config/content.ts`. Campo vazio = a página mostra "aguardando dados".

- [ ] **Foto (retrato)**: `PROFILE.portrait`. Coloque a imagem em `public/about/` (4:5, ex.: `portrait.jpg`) e preencha `{ src: "/about/portrait.jpg", alt: { en, pt, es } }`. Aparece em P&B e ganha cor no hover.
- [ ] **Texto "sobre mim"**: `PROFILE.about`. Um item por parágrafo, cada um com `{ en, pt, es }`.
- [ ] **Stack**: `SKILLS`. Hoje só tem o que o site já citava (TypeScript, Next.js, integração com LLM, sistemas agênticos). Complete os grupos ou crie novos (`group` nos 3 idiomas + `items`).
- [ ] **Experiência**: `EXPERIENCE`. Cada item: `{ period: "2024 — 2026", role: { en, pt, es }, org: "Empresa" }`. Aparece no painel da home e na trajetória do Sobre.
- [ ] **Projetos**: o Hedge só tem os campos mínimos. Opcionais: `role`, `status`, `links` (site/código), `cover` (imagem 16:10 em `public/projects/<slug>/`), `overview` e `sections`.

## Fases

- [ ] Fase 4: Contato
- [ ] Fase 5: acabamento (loader, SEO/OG, deploy na Vercel). O deploy precisa de um repositório no GitHub (o `gh` CLI não está instalado).
