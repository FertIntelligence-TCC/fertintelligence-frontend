# FertIntelligence Frontend

Cliente React, TypeScript e Vite do FertIntelligence.

## Variáveis de ambiente

Copie `.env.example` para `.env.local` e ajuste:

- `VITE_API_URL`: URL base da API principal.
- `VITE_IMAGE_MANAGER_URL`: URL base do gerenciador de imagens.
- `VITE_FERT_AI_API_URL`: URL base do Fert-IA, sem `/api/ai/chat`.

Variáveis `VITE_*` são públicas e incorporadas ao bundle durante o build. Nunca
coloque segredos nelas. Depois de alterar uma variável no Render, faça um novo
deploy para reconstruir o site.

## Desenvolvimento e validação

```bash
npm ci
npm run dev
npm run build
npm test
npm run lint
```

O servidor local do Vite usa `http://localhost:5173`.

## Render Blueprint

O `render.yaml` cria o Static Site `fertintelligence-client`, publica `dist` e
configura o rewrite de SPA para `/index.html`.

No Render Dashboard, escolha **New + > Blueprint**, conecte este repositório,
selecione a branch `m-fertilization`, revise o `render.yaml` e aplique. Alterações
posteriores nas variáveis de build exigem novo deploy.
