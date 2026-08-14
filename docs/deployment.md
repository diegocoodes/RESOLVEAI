# Deploy e configuração do servidor

## Por que aparecia “There was a problem with the server configuration”

O Auth.js exige `AUTH_SECRET` para criptografar JWTs e cookies. O login por credenciais também depende de `DATABASE_URL`, pois usuários e hashes de senha são consultados pelo Prisma. Se uma dessas variáveis estiver ausente, o servidor não consegue concluir o fluxo de autenticação.

O Opportunity OS agora intercepta esse estado e mostra `/setup`. O endpoint `/api/health` retorna apenas estados (`configured`, `connected`, `unavailable`) e nunca retorna segredos.

## Prisma Postgres + Vercel

1. Crie uma instância Prisma Postgres pelo Marketplace da Vercel ou no Prisma Data Platform.
2. Vincule-a ao projeto para criar `DATABASE_URL`.
3. Adicione `AUTH_SECRET` em Production, Preview e Development.
4. No Prisma Compute, defina `AUTH_URL` com a URL pública terminada em `.prisma.build`.
5. Gere o segredo com `npm exec auth secret`.
6. Faça o deploy do commit.
7. Em um ambiente seguro com as mesmas variáveis, execute `npm run db:deploy`.
8. Execute `npm run db:seed` somente quando quiser criar a conta de demonstração.

Para produção real, remova ou troque a senha do usuário demo depois do primeiro acesso.

## Verificação

```bash
npm run check:env
npm run db:deploy
npm run build
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
