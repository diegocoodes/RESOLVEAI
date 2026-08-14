"use client";

import { Check, MessageSquareText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const queue = [
  { id: "1", name: "João Performance", detail: "Personal Trainer · Recife", score: 92 },
  { id: "2", name: "Clínica Vitta", detail: "Clínica · Olinda", score: 86 },
  { id: "3", name: "Nutri Carla Menezes", detail: "Nutricionista · Recife", score: 81 },
];

export function ApprovalQueue() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  return <div className="rounded-xl border border-border bg-surface"><div className="flex items-center justify-between border-b border-border p-5"><div><h2 className="text-sm font-semibold">Fila de prospecção</h2><p className="mt-1 text-xs text-muted-foreground">{queue.length} leads aguardando revisão</p></div><Badge variant="warning">Revisão manual</Badge></div><div className="divide-y divide-border">{queue.map((lead) => <label key={lead.id} className="flex cursor-pointer items-center gap-3 p-4 hover:bg-surface-hover/50"><input type="checkbox" checked={selected.includes(lead.id)} onChange={() => toggle(lead.id)} className="accent-[#6d95ff]" /><span className="min-w-0 flex-1"><span className="block text-sm font-medium">{lead.name}</span><span className="text-xs text-muted-foreground">{lead.detail}</span></span><span className="font-mono text-sm text-accent">{lead.score}</span></label>)}</div><div className="flex flex-col justify-between gap-3 border-t border-border p-4 sm:flex-row sm:items-center"><p className="inline-flex items-center gap-2 text-[11px] text-subtle"><ShieldCheck className="size-3.5" />Nenhum envio automático</p><div className="flex gap-2"><Button variant="secondary" size="sm" disabled={!selected.length} onClick={() => toast.success("Mensagens geradas como rascunho.")}><MessageSquareText className="size-3.5" />Gerar mensagens</Button><Button size="sm" disabled={!selected.length} onClick={() => toast.success(`${selected.length} contatos aprovados para ação manual.`)}><Check className="size-3.5" />Aprovar contatos</Button></div></div></div>;
}
