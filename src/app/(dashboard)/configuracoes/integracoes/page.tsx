import { Bot, Check, Database, MapPinned } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { isOpenAIConfigured } from "@/lib/ai/openai";
export const metadata = { title: "Integrações" };
export default function IntegrationsPage() {
  const integrations = [
    { name: "PostgreSQL / Prisma", description: "Persistência principal da aplicação.", icon: Database, active: Boolean(process.env.DATABASE_URL) },
    { name: "Google Places API (New)", description: "Pesquisa oficial e temporária de empresas sem site.", icon: MapPinned, active: Boolean(process.env.GOOGLE_PLACES_API_KEY) },
    { name: "OpenAI", description: `Análise estruturada e ordenação ATS. Modelo: ${process.env.OPENAI_MODEL || "gpt-5.4-nano"}.`, icon: Bot, active: isOpenAIConfigured() },
  ];
  return <div className="space-y-6"><PageHeader eyebrow="Configurações" title="Integrações" description="Segredos ficam em variáveis de ambiente no servidor e nunca chegam ao navegador." /><div className="grid gap-4 lg:grid-cols-2">{integrations.map(({ name, description, icon: Icon, active }) => <Card key={name}><CardContent className="flex items-start gap-4 p-5"><span className="grid size-10 place-items-center rounded-lg border border-border bg-background"><Icon className="size-4 text-accent" /></span><div className="min-w-0 flex-1"><div className="flex items-center gap-2"><h2 className="text-sm font-medium">{name}</h2><Badge variant={active ? "success" : "neutral"}>{active ? "Configurado" : "Aguardando chave"}</Badge></div><p className="mt-2 text-xs leading-5 text-muted-foreground">{description}</p>{active ? <p className="mt-4 inline-flex items-center gap-1.5 text-xs text-emerald-400"><Check className="size-3.5" />Disponível</p> : <p className="mt-4 text-xs text-subtle">Adicione a variável correspondente no Vercel.</p>}</div></CardContent></Card>)}</div></div>;
}
