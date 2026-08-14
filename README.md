# Opportunity OS

MVP full-stack para centralizar oportunidades de emprego e prospecção comercial. A interface é responsiva, o banco é PostgreSQL via Prisma, a autenticação usa Auth.js e todos os formulários de entrada passam por Zod.

## O que já funciona

- Dashboard editorial com métricas, gráficos, follow-ups e atividade recente.
- Vagas: cadastro persistente, extração determinística de requisitos, duplicidade, listagem, detalhe e comparação por evidências.
- Currículo Mestre e versões personalizadas com regra estrita de não inventar fatos.
- Download de PDF ATS real, limpo e selecionável.
- Candidaturas com progressão manual de etapas.
- Leads: cadastro, origem, auditoria conservadora, score configurável, duplicidade, exportação, exclusão e bloqueio de contato.
- Prospecção com contrato de providers autorizados, análise baseada em fatos, mensagens revisáveis e abertura manual do WhatsApp.
- Pipeline Kanban, campanhas com fila de aprovação, clientes, histórico e análises.
- Pesquisa global, drawer mobile, estados de loading/empty/error e feedback por toast.

## Executar localmente

Requisitos: Node.js 20.9+ e Docker (ou outra instância PostgreSQL).

```bash
cp .env.example .env
docker compose up -d
npm install
npm run db:deploy
npm run db:seed
npm run dev
```

No PowerShell, use `Copy-Item .env.example .env` no primeiro passo. Acesse `http://localhost:3000`.

Antes de acessar o banco, valide a configuração:

```bash
npm run check:env
```

Se `DATABASE_URL` ou `AUTH_SECRET` estiver ausente, a aplicação mostra `/setup` com o diagnóstico em vez da página genérica de erro do Auth.js.

Credenciais criadas pelo seed:

```text
E-mail: demo@opportunityos.local
Senha: Opportunity123!
```

Troque essas credenciais antes de qualquer uso real.

## Comandos

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm run typecheck    # TypeScript estrito
npm run lint         # ESLint
npm run db:generate  # gerar Prisma Client
npm run db:migrate   # criar/aplicar migration em desenvolvimento
npm run db:deploy    # aplicar migrations versionadas
npm run db:seed      # criar dados e usuário demo
npm run db:setup     # aplicar migrations e executar o seed
```

## Deploy com Prisma Postgres

Configure no provedor de hospedagem, sem adicionar os valores ao Git:

```text
DATABASE_URL=postgres://...?...sslmode=require
AUTH_SECRET=<segredo aleatório com pelo menos 32 caracteres>
AUTH_TRUST_HOST=true
AUTH_URL=https://seu-app.prisma.build
```

Gere o segredo com `npm exec auth secret`. Em Vercel, `AUTH_TRUST_HOST` é inferido, mas mantê-lo explicitamente como `true` ajuda em outros proxies. Configure as variáveis nos ambientes de Production, Preview e Development, faça um novo deploy e aplique a migration:

```bash
npm run db:deploy
npm run db:seed
```

No Prisma Compute, `AUTH_URL` deve apontar para o endpoint público do app para impedir callbacks para o endereço interno do container. O endpoint `GET /api/health` confirma, sem expor credenciais, se o Auth.js está configurado e se o PostgreSQL responde.

## Segurança e privacidade

Segredos ficam exclusivamente em `.env`, que está ignorado pelo Git. A aplicação não automatiza LinkedIn, WhatsApp Web, CAPTCHA ou autenticação de terceiros. O contato final permanece manual. Leads guardam origem e podem ser exportados, bloqueados ou excluídos com seus relacionamentos em cascata.

Veja [docs/architecture.md](docs/architecture.md) para a separação de camadas e os invariantes do domínio.
