# Deploy e configuração do servidor

## Por que aparecia “There was a problem with the server configuration”

O Auth.js exige `AUTH_SECRET` para criptografar JWTs e cookies. O login por credenciais também depende de `DATABASE_URL`, pois usuários e hashes de senha são consultados pelo Prisma. Se uma dessas variáveis estiver ausente, o servidor não consegue concluir o fluxo de autenticação.

O Opportunity OS agora intercepta esse estado e mostra `/setup`. O endpoint `/api/health` retorna apenas estados (`configured`, `connected`, `unavailable`) e nunca retorna segredos.

## Prisma Postgres + Vercel

### Configuração do projeto

1. Importe `diegocoodes/RESOLVEAI` na Vercel e mantenha `main` como Production Branch.
2. Confirme Framework Preset `Next.js`, Root Directory `./` e Node.js `24.x`.
3. O `vercel.json` seleciona `iad1`, região da Vercel próxima ao banco em `us-east-1`.
4. Pelo Marketplace da Vercel, conecte o banco primário do projeto Prisma Postgres. A integração deve criar `DATABASE_URL` com a conexão pooled.
5. Crie `AUTH_SECRET` com `npm exec auth secret` e adicione o valor somente no painel da Vercel.

Variáveis de **Production**:

```text
DATABASE_URL=<URL pooled do Prisma Postgres>
AUTH_SECRET=<segredo aleatório com pelo menos 32 caracteres>
OPENAI_API_KEY=<chave server-side da OpenAI>
OPENAI_MODEL=gpt-5.4-nano
AI_PROVIDER=openai
NOMINATIM_BASE_URL=https://nominatim.openstreetmap.org
```

`NOMINATIM_BASE_URL` é opcional. O padrão público funciona sem chave para uso manual e leve; uma instância própria é necessária para volume maior.

Não copie o `AUTH_URL` do Prisma Compute para a Vercel. O Auth.js reconhece a plataforma e deriva o domínio correto, inclusive nas Previews. `AUTH_TRUST_HOST` é opcional na Vercel; se configurado, use `true`.

Não compartilhe o banco de produção com Preview. Conecte um banco separado para branches de Preview ou deixe `DATABASE_URL` habilitada apenas para Production.

### Migrations e conta inicial

O build da Vercel executa `prisma generate` e `next build`, mas deliberadamente não executa migrations. Antes de publicar uma mudança de schema, carregue as variáveis do ambiente seguro e rode:

```bash
npm run db:deploy
```

Para criar ou atualizar a conta inicial, as etapas do pipeline e um único lead claramente marcado como exemplo visual, defina temporariamente `SEED_ADMIN_NAME`, `SEED_ADMIN_EMAIL` e `SEED_ADMIN_PASSWORD` (mínimo de 9 caracteres), execute `npm run db:seed` e remova essas variáveis do terminal. O repositório não contém senha nem currículo pessoal.

### Prisma Compute

O mesmo repositório permanece compatível com Prisma Compute. Fora da Vercel, `AUTH_URL` deve apontar para a URL HTTPS pública do app para impedir callbacks para o endereço interno do container.

## Verificação

```powershell
npm run check:env
npm run db:deploy
$env:VERCEL="1"; npm run vercel-build
```

Depois do deploy:

```text
GET https://seu-dominio/api/health
```

Resposta saudável:

```json
{
  "status": "ok",
  "checks": {
    "database": "connected",
    "authSecret": "configured",
    "trustedHost": "configured"
  },
  "missing": []
}
```
