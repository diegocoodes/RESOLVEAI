import Link from "next/link";
import { Plus, Radar } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { LeadsTable } from "@/features/leads/leads-table";
import { getLeadsForUser } from "@/services/opportunity-data.service";

export const metadata = { title: "Leads" };
export default async function LeadsPage() { const session = await auth(); const leads = await getLeadsForUser(session?.user.id); return <div className="space-y-6"><PageHeader eyebrow="Prospecção" title="Leads" description="Qualifique oportunidades com evidências, preserve a origem dos dados e mantenha o contato sob revisão humana." actions={<><Button asChild variant="secondary"><Link href="/prospeccao"><Radar className="size-4" />Buscar oportunidades</Link></Button><Button asChild><Link href="/leads/novo"><Plus className="size-4" />Novo lead</Link></Button></>} /><div className="grid grid-cols-2 gap-3 sm:grid-cols-4">{[["Total", leads.length], ["Qualificados", leads.filter((lead) => lead.status === "QUALIFIED").length], ["Contatados", leads.filter((lead) => lead.status === "CONTACTED").length], ["Responderam", leads.filter((lead) => lead.status === "REPLIED").length]].map(([label, value]) => <div key={label} className="rounded-lg border border-border bg-surface px-4 py-3"><p className="text-[11px] text-muted-foreground">{label}</p><p className="mt-1 font-mono text-xl font-medium">{value}</p></div>)}</div><LeadsTable leads={leads} /></div>; }
