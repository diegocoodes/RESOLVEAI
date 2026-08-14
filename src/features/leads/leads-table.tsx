"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AtSign, Check, ChevronLeft, ChevronRight, CircleAlert, Globe2, Loader2, MessageCircle, Pencil, Search, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createWhatsAppUrl } from "@/lib/whatsapp";
import type { OpportunityLead } from "@/types/opportunity";

const PAGE_SIZE = 5;
const statusLabel: Record<string, string> = { NEW: "Novo", ANALYZED: "Analisado", QUALIFIED: "Qualificado", CONTACTED: "Contatado", REPLIED: "Respondeu" };

export function LeadsTable({ leads }: { leads: OpportunityLead[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [segment, setSegment] = useState("all");
  const [page, setPage] = useState(1);
  const [deletingId, setDeletingId] = useState<string>();
  const segments = useMemo(() => [...new Set(leads.map((lead) => lead.segment))].sort((a, b) => a.localeCompare(b, "pt-BR")), [leads]);
  const filtered = useMemo(() => leads
    .filter((lead) => `${lead.business} ${lead.name} ${lead.segment} ${lead.location} ${lead.phoneValue ?? ""}`.toLocaleLowerCase("pt-BR").includes(query.toLocaleLowerCase("pt-BR")) && (status === "all" || lead.status === status) && (segment === "all" || lead.segment === segment))
    .sort((a, b) => a.segment.localeCompare(b.segment, "pt-BR") || a.business.localeCompare(b.business, "pt-BR")), [leads, query, segment, status]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const visibleLeads = filtered.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);

  async function remove(lead: OpportunityLead) {
    if (!window.confirm(`Excluir permanentemente o lead “${lead.business}”? Esta ação não pode ser desfeita.`)) return;
    setDeletingId(lead.id);
    const response = await fetch(`/api/leads/${lead.id}`, { method: "DELETE" });
    setDeletingId(undefined);
    if (!response.ok) {
      toast.error("Não foi possível excluir o lead.");
      return;
    }
    toast.success("Lead excluído.");
    router.refresh();
  }

  function Actions({ lead }: { lead: OpportunityLead }) {
    const waUrl = createWhatsAppUrl(lead.whatsappValue);
    return <div className="flex flex-wrap justify-end gap-1.5">
      {waUrl ? <Button asChild variant="secondary" size="sm"><a href={waUrl} target="_blank" rel="noreferrer" aria-label={`Abrir WhatsApp de ${lead.business}`}><MessageCircle className="size-3.5" />WhatsApp</a></Button> : null}
      <Button asChild variant="ghost" size="icon" title="Editar lead"><Link href={`/leads/${lead.id}/editar`} aria-label={`Editar ${lead.business}`}><Pencil className="size-3.5" /></Link></Button>
      <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 hover:text-destructive" title="Excluir lead" onClick={() => remove(lead)} disabled={deletingId === lead.id} aria-label={`Excluir ${lead.business}`}>{deletingId === lead.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}</Button>
    </div>;
  }

  function resetPage() { setPage(1); }

  return <div className="overflow-hidden rounded-xl border border-border bg-surface">
    <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row">
      <div className="relative flex-1 lg:max-w-sm"><Search className="absolute left-3 top-3 size-4 text-subtle" /><Input className="bg-background pl-9" placeholder="Buscar nome, segmento, endereço ou telefone" value={query} onChange={(event) => { setQuery(event.target.value); resetPage(); }} /></div>
      <select className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground outline-none" value={segment} onChange={(event) => { setSegment(event.target.value); resetPage(); }}><option value="all">Todos os segmentos</option>{segments.map((item) => <option key={item} value={item}>{item}</option>)}</select>
      <select className="h-10 rounded-lg border border-border bg-background px-3 text-xs text-muted-foreground outline-none" value={status} onChange={(event) => { setStatus(event.target.value); resetPage(); }}><option value="all">Todos os status</option><option value="NEW">Novos</option><option value="ANALYZED">Analisados</option><option value="QUALIFIED">Qualificados</option><option value="CONTACTED">Contatados</option><option value="REPLIED">Responderam</option></select>
    </div>
    <div className="hidden overflow-x-auto md:block"><table className="w-full min-w-[980px] text-left"><thead><tr className="border-b border-border text-[10px] font-semibold uppercase tracking-[0.12em] text-subtle"><th className="px-5 py-3">Lead</th><th className="px-4 py-3">Presença digital</th><th className="px-4 py-3">Oportunidade</th><th className="px-4 py-3">Score</th><th className="px-4 py-3">Status</th><th className="px-5 py-3 text-right">Ações</th></tr></thead><tbody>
      {visibleLeads.map((lead) => <tr key={lead.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50"><td className="px-5 py-4"><Link href={`/leads/${lead.id}`} className="text-sm font-medium hover:text-accent">{lead.business}</Link><p className="mt-1 text-xs text-muted-foreground">{lead.segment} · {lead.location}</p>{lead.phoneValue ? <p className="mt-1 font-mono text-[11px] text-subtle">{lead.phoneValue}</p> : null}</td><td className="px-4 py-4"><div className="flex gap-2"><Presence icon={AtSign} active={lead.instagram} label="Instagram" /><Presence icon={MessageCircle} active={lead.whatsapp} label="WhatsApp" /><Presence icon={Globe2} active={lead.websiteStatus !== "Sem site" && lead.websiteStatus !== "Não verificado"} label="Site" /></div></td><td className="px-4 py-4"><Badge variant={lead.websiteStatus === "Sem site" ? "warning" : "neutral"}>{lead.websiteStatus}</Badge></td><td className="px-4 py-4"><span className="font-mono text-base font-semibold text-accent">{lead.score}</span><span className="text-xs text-subtle">/100</span></td><td className="px-4 py-4"><Badge variant={lead.status === "QUALIFIED" || lead.status === "REPLIED" ? "success" : "neutral"}>{statusLabel[lead.status] ?? lead.status}</Badge></td><td className="px-5 py-4"><Actions lead={lead} /></td></tr>)}
    </tbody></table></div>
    <div className="divide-y divide-border md:hidden">{visibleLeads.map((lead) => <article key={lead.id} className="p-4"><div className="flex justify-between gap-3"><div><Link href={`/leads/${lead.id}`} className="text-sm font-medium">{lead.business}</Link><p className="mt-1 text-xs leading-5 text-muted-foreground">{lead.segment} · {lead.location}</p>{lead.phoneValue ? <p className="mt-1 font-mono text-[11px] text-subtle">{lead.phoneValue}</p> : null}</div><span className="font-mono text-lg font-semibold text-accent">{lead.score}</span></div><div className="mt-3 flex gap-2"><Badge variant={lead.websiteStatus === "Sem site" ? "warning" : "neutral"}>{lead.websiteStatus}</Badge><Badge variant="neutral">{statusLabel[lead.status] ?? lead.status}</Badge></div><div className="mt-4"><Actions lead={lead} /></div></article>)}</div>
    {!filtered.length ? <div className="p-16 text-center"><CircleAlert className="mx-auto size-5 text-subtle" /><p className="mt-3 text-sm font-medium">Nenhum lead encontrado.</p><p className="mt-1 text-xs text-muted-foreground">Ajuste os filtros ou anexe uma planilha XLS.</p></div> : null}
    {filtered.length ? <div className="flex flex-col justify-between gap-3 border-t border-border px-5 py-3 sm:flex-row sm:items-center"><p className="text-xs text-subtle">{(activePage - 1) * PAGE_SIZE + 1}–{Math.min(activePage * PAGE_SIZE, filtered.length)} de {filtered.length} leads · 5 por página</p><div className="flex items-center gap-2"><Button type="button" size="sm" variant="secondary" onClick={() => setPage(activePage - 1)} disabled={activePage === 1}><ChevronLeft className="size-3.5" />Anterior</Button><span className="min-w-20 text-center text-xs text-muted-foreground">Página {activePage} de {pageCount}</span><Button type="button" size="sm" variant="secondary" onClick={() => setPage(activePage + 1)} disabled={activePage === pageCount}>Próxima<ChevronRight className="size-3.5" /></Button></div></div> : null}
  </div>;
}

function Presence({ icon: Icon, active, label }: { icon: typeof AtSign; active: boolean; label: string }) {
  return <span title={label} className={`grid size-7 place-items-center rounded-md border ${active ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-400" : "border-border bg-background text-subtle"}`}>{active ? <Icon className="size-3.5" /> : <Check className="size-3 opacity-0" />}</span>;
}
