import Link from "next/link";
import { DatabaseZap, Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LeadSearchForm } from "@/features/leads/lead-search-form";

export const metadata = { title: "Buscar leads" };
export default function ProspectingPage() {
  return <div className="space-y-6"><PageHeader eyebrow="Prospecção" title="Buscar oportunidades" description="Configure a busca para encontrar negócios com potencial real, usando fontes públicas e integrações autorizadas." actions={<Button asChild variant="secondary"><Link href="/leads/novo"><Plus className="size-4" />Cadastrar manualmente</Link></Button>} /><div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]"><LeadSearchForm /><div className="space-y-5"><Card><CardHeader><div><h2 className="text-sm font-semibold">Providers</h2><p className="mt-1 text-xs text-muted-foreground">Fontes de descoberta</p></div><DatabaseZap className="size-4 text-accent" /></CardHeader><CardContent className="space-y-3"><Provider name="Cadastro manual" status="Ativo" active /><Provider name="Google Business API" status="Configurar" /><Provider name="Diretório autorizado" status="Configurar" /></CardContent></Card><Card><CardHeader><h2 className="text-sm font-semibold">Uso responsável</h2></CardHeader><CardContent><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><p className="text-xs leading-5 text-muted-foreground">Todo lead passa por análise, mensagem em rascunho, revisão e aprovação manual. Contatos marcados como “não contatar” são bloqueados de campanhas.</p></div></CardContent></Card></div></div></div>;
}
function Provider({ name, status, active }: { name: string; status: string; active?: boolean }) { return <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-xs"><span>{name}</span><span className={active ? "text-emerald-400" : "text-subtle"}>{status}</span></div>; }
