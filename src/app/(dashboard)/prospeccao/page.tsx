import Link from "next/link";
import { DatabaseZap, Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LeadSearchForm } from "@/features/leads/lead-search-form";

export const metadata = { title: "Buscar leads" };

export default function ProspectingPage() {
  const googleConfigured = Boolean(process.env.GOOGLE_PLACES_API_KEY);
  return <div className="space-y-6"><PageHeader eyebrow="Prospecção" title="Buscar oportunidades" description="Encontre negócios sem site usando a integração oficial do Google Places, com revisão humana antes de qualquer cadastro." actions={<Button asChild variant="secondary"><Link href="/leads/novo"><Plus className="size-4" />Cadastrar manualmente</Link></Button>} /><div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]"><LeadSearchForm configured={googleConfigured} /><div className="space-y-5"><Card><CardHeader><div><h2 className="text-sm font-semibold">Providers</h2><p className="mt-1 text-xs text-muted-foreground">Fontes de descoberta</p></div><DatabaseZap className="size-4 text-accent" /></CardHeader><CardContent className="space-y-3"><Provider name="Cadastro manual" status="Ativo" active /><Provider name="Google Places API (New)" status={googleConfigured ? "Ativo" : "Configurar"} active={googleConfigured} /></CardContent></Card><Card><CardHeader><h2 className="text-sm font-semibold">Uso responsável</h2></CardHeader><CardContent><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><p className="text-xs leading-5 text-muted-foreground">Os resultados não são importados automaticamente. Revise a empresa, respeite pedidos de não contato e consulte os <Link className="text-accent hover:underline" href="/termos">termos</Link> e a <Link className="text-accent hover:underline" href="/privacidade">privacidade</Link>.</p></div></CardContent></Card></div></div></div>;
}

function Provider({ name, status, active }: { name: string; status: string; active?: boolean }) { return <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-xs"><span>{name}</span><span className={active ? "text-emerald-400" : "text-subtle"}>{status}</span></div>; }
