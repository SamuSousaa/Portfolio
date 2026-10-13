# Pendências

Lista viva do que ainda falta. Quando algo for concluído, sai daqui.

## Conteúdo para preencher

Tudo em `src/config/content.ts`. Campo vazio = a página mostra "aguardando dados".

- [ ] **Formação**: você avisa quando quiser incluir (faculdade, cursos).


## Projetos

- [ ] **Hedge**: as telas vieram da branch local `redesign-app`, um commit à frente da produção (a aba "Limites" ainda não está em gethedge.vercel.app).
- [ ] **Wellnessy**: trocar a senha da conta de teste `samusousaaicloud@gmail.com` (foi passada em conversa). Ela está com os dados fictícios das capturas.

## Briefing (`/briefing/portal-noticias`)

Código pronto e testado de ponta a ponta no ambiente local (banco, upload e e-mail), ainda sem commit.

- [ ] **Vercel**: cadastrar as quatro variáveis do `.env.local` em Settings → Environment Variables antes de publicar.
- [ ] **Registro de teste**: apagar a linha de teste da tabela `briefings` e o arquivo `icon.svg` do bucket `briefings`.
- [ ] **Remetente próprio** (opcional): verificar `samuelsousadev.com.br` no Resend e definir `BRIEFING_EMAIL_FROM`. Hoje o aviso sai de `onboarding@resend.dev` e só chega no e-mail da conta do Resend.
- [ ] **`/briefing/admin`**: página com login listando os envios. Fica para depois; por enquanto, a consulta é pelo painel do Supabase.

## Fases

Site no ar: https://samuelsousadev.com.br (cada push na `main` publica).
