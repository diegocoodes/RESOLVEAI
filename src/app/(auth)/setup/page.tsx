import { Check, CircleAlert, Database, KeyRound, ServerCog, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { getServerConfiguration } from "@/lib/server-config";

export const metadata = { title: "Configurar servidor" };
export const dynamic = "force-dynamic";

export default function SetupPage() {
  const configuration = getServerConfiguration();

  return (
    <main className="min-h-screen bg-background px-4 py-12 sm:py-20">
      <div className="mx-auto max-w-2xl">
        <span className="grid size-10 place-items-center rounded-lg bg-accent text-sm font-bold text-accent-foreground">OS</span>
        <p className="mt-8 text-xs font-semibold uppercase tracking-[0.16em] text-accent">Configuração necessária</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Conecte o Opportunity OS ao Prisma</h1>
        <p className="mt-3 max-w-xl text-sm leading-6 text-muted-foreground">
          O servidor está online, mas faltam variáveis protegidas. Adicione-as ao ambiente de hospedagem e faça um novo deploy. Nenhum segredo deve ser salvo no Git.
        </p>

        <div className="mt-8 overflow-hidden rounded-xl border border-border bg-surface">
          <ConfigurationRow
            icon={Database}
            name="DATABASE_URL"
            description="Conexão PostgreSQL ou Prisma Postgres"
            configured={configuration.databaseConfigured}
          />
          <ConfigurationRow
            icon={KeyRound}
            name="AUTH_SECRET"
            description="Segredo aleatório com pelo menos 32 caracteres"
            configured={configuration.authSecretConfigured}
          />
          <ConfigurationRow
            icon={ShieldCheck}
            name="AUTH_TRUST_HOST"
            description="Obrigatório em proxy próprio; Vercel é detectado automaticamente"
            configured={configuration.trustedHostConfigured}
            optional
          />
        </div>

        <section className="mt-6 rounded-xl border border-border bg-surface p-5">
          <div className="flex items-center gap-2">
            <ServerCog className="size-4 text-accent" />
            <h2 className="text-sm font-semibold">Depois de configurar</h2>
          </div>
          <pre className="mt-4 overflow-x-auto rounded-lg border border-border bg-background p-4 font-mono text-xs leading-6 text-muted-foreground">{`npm run check:env
npm run db:deploy
npm run db:seed`}</pre>
          <p className="mt-3 text-xs leading-5 text-muted-foreground">
            Em Vercel, configure as variáveis para Production, Preview e Development, então execute as migrations uma única vez contra o banco correto.
          </p>
        </section>

        <div className="mt-5 flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-4">
          <CircleAlert className="mt-0.5 size-4 shrink-0 text-amber-400" />
          <p className="text-xs leading-5 text-muted-foreground">
            Esta tela não mostra valores ou credenciais. Ela desaparece automaticamente quando as variáveis obrigatórias estão válidas.
          </p>
        </div>
      </div>
    </main>
  );
}

function ConfigurationRow({
  icon: Icon,
  name,
  description,
  configured,
  optional,
}: {
  icon: typeof Database;
  name: string;
  description: string;
  configured: boolean;
  optional?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 border-b border-border p-4 last:border-b-0 sm:p-5">
      <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background">
        <Icon className="size-4 text-muted-foreground" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-mono text-xs font-medium text-foreground">{name}</p>
        <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>
      </div>
      <Badge variant={configured ? "success" : optional ? "neutral" : "danger"}>
        {configured ? <Check className="mr-1 size-3" /> : null}
        {configured ? "Configurado" : optional ? "Recomendado" : "Ausente"}
      </Badge>
    </div>
  );
}
