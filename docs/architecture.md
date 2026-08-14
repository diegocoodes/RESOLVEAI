# Arquitetura do Opportunity OS

## Direção

O projeto usa App Router e separa interface, casos de uso, acesso a dados, IA e integrações. Componentes React não acessam o Prisma. Toda consulta persistente passa por `repositories/`; regras de match, scoring, auditoria, geração e campanhas ficam em `services/`.

```text
src/
├── app/                  # rotas, layouts, Route Handlers e Server Components
├── components/           # shell e UI reutilizável no padrão shadcn/ui
├── features/             # componentes organizados por domínio
├── lib/
│   ├── ai/               # contratos, prompts e regras evidence-only
│   ├── db/               # criação isolada do Prisma Client
│   └── validations/      # schemas Zod
├── repositories/         # acesso ao PostgreSQL
├── services/             # regras e casos de uso
└── types/                # extensões de tipos
```

## Agregados iniciais

- Identidade: `User`, `Account`, `Session`, `VerificationToken`.
- Currículo: `Resume`, `Experience`, `Education`, `Skill`, `Project`, `Certification`, `GeneratedResume`.
- Emprego: `Job`, `JobRequirement`, `JobMatch`, `JobMatchItem`, `Application`.
- Prospecção: `Lead`, `LeadSocial`, `LeadWebsiteAudit`, `LeadAnalysis`, `LeadActivity`, `Client`.
- Campanhas: `Campaign`, `CampaignLead`, `Conversation`, `Message`, `PipelineStage`.
- Auditoria de IA: `AIAnalysis`, que preserva `sourceFacts` e `result` a cada execução.

## Regras invariantes

1. Currículos personalizados são subconjuntos reorganizados do currículo mestre; requisitos ausentes permanecem ausentes.
2. Auditorias não preenchem performance/mobile quando não há medição confiável.
3. Mensagens começam como rascunho e exigem aprovação. O provider inicial apenas abre `wa.me`.
4. `doNotContact` e `contactAllowed = false` bloqueiam inclusão em campanhas.
5. Leads e vagas têm heurísticas de duplicidade antes da criação.
6. Toda consulta de domínio recebe `userId`, preparando isolamento multiusuário.
