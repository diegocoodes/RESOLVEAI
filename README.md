# Opportunity OS

MVP full-stack para centralizar oportunidades de emprego e prospecção comercial. A interface é responsiva, o banco é PostgreSQL via Prisma, a autenticação usa Auth.js e todos os formulários de entrada passam por Zod.

## O que já funciona

- Dashboard com contagens e registros reais do workspace, sem métricas fictícias.
- Vagas: cadastro persistente, extração estruturada com OpenAI e fallback determinístico, duplicidade, detalhe e comparação por evidências.
- Currículo Mestre importado de uma fonte verificada e versões personalizadas com regra estrita de não inventar fatos.
- Download de PDF ATS em coluna única, limpo, selecionável e rastreável até os fatos de origem.
- Candidaturas exibidas a partir do banco, sem processos fictícios.
- Leads: cadastro, origem, auditoria conservadora, score configurável, duplicidade, exportação, exclusão e bloqueio de contato.
- Prospecção pela Google Places API (New), com resultados temporários, filtro de negócio sem site, atribuição e cadastro manual após revisão.
- Pipeline Kanban, campanhas, clientes, histórico e análises alimentados somente por registros persistidos.
- Pesquisa de módulos, drawer mobile, estados de loading/empty/error e feedback por toast.

## Executar localmente

Requisitos: Node.js 24.x e Docker (ou outra instância PostgreSQL).

```bash
cp .env.example .env
# Edite .env e defina AUTH_SECRET e as credenciais SEED_ADMIN_*.
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

O seed exige credenciais definidas por você. Antes de executá-lo, configure:

```text
SEED_ADMIN_NAME=Administrador
SEED_ADMIN_EMAIL=seu-email@dominio.com
SEED_ADMIN_PASSWORD=<senha única com pelo menos 9 caracteres>
```

Esses valores não precisam ficar configurados no runtime da aplicação.

## Comandos

```bash
npm run dev          # desenvolvimento
npm run build        # build de produção
npm run typecheck    # TypeScript estrito
npm run lint         # ESLint
npm run db:generate  # gerar Prisma Client
npm run db:migrate   # criar/aplicar migration em desenvolvimento
npm run db:deploy    # aplicar migrations versionadas
npm run db:seed      # criar a conta, etapas e um único lead marcado como exemplo visual
npm run db:setup     # aplicar migrations e executar o seed
```

## Deploy na Vercel com Prisma Postgres

O repositório inclui `vercel.json`, build nativo da Vercel e Functions em `iad1`, próximo ao Prisma Postgres em `us-east-1`. Conecte o banco primário ao projeto pelo Marketplace da Vercel e configure em **Production**:

```text
DATABASE_URL=<URL pooled criada pela integração Prisma Postgres>
AUTH_SECRET=<segredo aleatório com pelo menos 32 caracteres>
GOOGLE_PLACES_API_KEY=<chave server-side da Places API (New)>
OPENAI_API_KEY=<chave server-side da OpenAI>
OPENAI_MODEL=gpt-5.4-nano
AI_PROVIDER=openai
```

Gere `AUTH_SECRET` com `npm exec auth secret`. Não configure `AUTH_URL` na Vercel: o Auth.js deriva corretamente as URLs de Production e Preview. `AUTH_TRUST_HOST` também é inferido pela plataforma.

As migrations não rodam durante o build para impedir que uma Preview altere o banco principal. Aplique-as de um ambiente seguro antes do primeiro deploy:

```bash
npm run db:deploy
```

Use um banco separado para Preview ou deixe `DATABASE_URL` restrita a Production. Depois do deploy, `GET /api/health` confirma, sem expor credenciais, se o Auth.js está configurado e se o PostgreSQL responde. Veja o checklist completo em [docs/deployment.md](docs/deployment.md).

O Prisma Compute continua compatível. Nesse destino, `AUTH_URL` deve apontar para o endpoint público terminado em `.prisma.build`.

## Segurança e privacidade

Segredos ficam exclusivamente em `.env`, que está ignorado pelo Git. A aplicação não automatiza LinkedIn, WhatsApp Web, CAPTCHA ou autenticação de terceiros. O contato final permanece manual. Leads guardam origem e podem ser exportados, bloqueados ou excluídos com seus relacionamentos em cascata.

Veja [docs/architecture.md](docs/architecture.md) para a separação de camadas e os invariantes do domínio.
