"use client";

import Link from "next/link";
import { AtSign, Check, CircleAlert, Globe2, MessageCircle, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { DemoLead } from "@/lib/demo-data";

const statusLabel: Record<string, string> = { NEW: "Novo", ANALYZED: "Analisado", QUALIFIED: "Qualificado", CONTACTED: "Contatado", REPLIED: "Respondeu" };

export function LeadsTable({ leads }: { leads: DemoLead[] }) {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const filtered = useMemo(() => leads.filter((lead) => `${lead.business} ${lead.name} ${lead.segment} ${lead.location}`.toLowerCase().includes(query.toLowerCase()) && (status === "all" || lead.status === status)), [leads, query, status]);
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row">
        <div className="relative flex-1 sm:max-w-sm"><Search className="absolute left-3 top-3 size-4 text-subtle" /><Input className="bg-background pl-9" placeholder="Buscar lead, segmento ou cidade" value={query} onChange={(event) => setQuery(event.target.value)} /></div>
        <select className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground outline-none" value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">Todos os status</option><option value="NEW">Novos</option><option value="ANALYZED">Analisados</option><option value="QUALIFIED">Qualificados</option><option value="CONTACTED">Contatados</option><option value="REPLIED">Responderam</option></select>
      </div>
      <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[900px] text-left"><thead><tr className="border-b border-border text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle"><th className="px-5 py-3">Lead</th><th className="px-4 py-3">Presença digital</th><th className="px-4 py-3">Oportunidade</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Ação</th></tr></thead><tbody>
        {filtered.map((lead) => <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50"><td className="px-5 py-4"><Link href={`/leads/${lead.id}`} className="text-sm font-medium hover:text-accent">{lead.business}</Link><p className="mt-1 text-xs text-muted-foreground">{lead.segment} · {lead.location}</p></td><td className="px-4 py-4"><div className="flex gap-2"><Presence icon={AtSign} active={lead.instagram} label="Instagram" /><Presence icon={MessageCircle} active={lead.whatsapp} label="WhatsApp" /><Presence icon={Globe2} active={lead.websiteStatus !== "Sem site"} label="Site" /></div></td><td className="px-4 py-4"><Badge variant={lead.websiteStatus === "Sem site" ? "warning" : "neutral"}>{lead.websiteStatus}</Badge></td><td className="px-4 py-4"><span className="font-mono text-base font-semibold text-accent">{lead.score}</span><span className="text-xs text-subtle">/100</span></td><td className="px-4 py-4"><Badge variant={lead.status === "QUALIFIED" || lead.status === "REPLIED" ? "success" : "neutral"}>{statusLabel[lead.status] ?? lead.status}</Badge></td><td className="px-5 py-4 text-right"><Button asChild variant="ghost" size="sm"><Link href={`/leads/${lead.id}`}>Analisar</Link></Button></td></tr>)}
      </tbody></table></div>
      <div className="divide-y divide-border md:hidden">{filtered.map((lead) => <article key={lead.id} className="p-4"><div className="flex justify-between gap-3"><div><Link href={`/leads/${lead.id}`} className="text-sm font-medium">{lead.business}</Link><p className="mt-1 text-xs text-muted-foreground">{lead.segment} · {lead.location}</p></div><span className="font-mono text-lg font-semibold text-accent">{lead.score}</span></div><div className="mt-3 flex gap-2"><Badge variant={lead.websiteStatus === "Sem site" ? "warning" : "neutral"}>{lead.websiteStatus}</Badge><Badge variant="neutral">{statusLabel[lead.status]}</Badge></div></article>)}</div>
      {!filtered.length ? <div className="p-16 text-center"><CircleAlert className="mx-auto size-5 text-subtle" /><p className="mt-3 text-sm font-medium">Nenhum lead encontrado.</p><p className="mt-1 text-xs text-muted-foreground">Ajuste os filtros ou inicie uma nova prospecção.</p></div> : null}
      <div className="border-t border-border px-5 py-3 text-xs text-subtle">{filtered.length} de {leads.length} leads</div>
    </div>
  );
}

function Presence({ icon: Icon, active, label }: { icon: typeof AtSign; active: boolean; label: string }) { return <span title={label} className={`grid size-7 place-items-center rounded-md border ${active ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-border bg-background text-subtle"}`}>{active ? <Icon className="size-3.5" /> : <Check className="size-3 opacity-0" />}</span>; }
