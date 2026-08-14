"use client";

import { DndContext, type DragEndEvent, PointerSensor, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { AtSign, GripVertical, MessageCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { leads as initialLeads, type DemoLead } from "@/lib/demo-data";

const columns = [
  { id: "NEW", label: "Novo" }, { id: "ANALYZED", label: "Analisado" }, { id: "QUALIFIED", label: "Qualificado" },
  { id: "CONTACTED", label: "Contatado" }, { id: "REPLIED", label: "Respondeu" }, { id: "MEETING", label: "Reunião" },
  { id: "PROPOSAL", label: "Proposta" }, { id: "WON", label: "Fechado" }, { id: "LOST", label: "Perdido" },
];

export function PipelineBoard() {
  const [leads, setLeads] = useState(initialLeads);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  function onDragEnd(event: DragEndEvent) {
    const target = event.over?.id;
    if (!target) return;
    setLeads((current) => current.map((lead) => lead.id === event.active.id ? { ...lead, status: String(target) } : lead));
    toast.success("Etapa atualizada e registrada no histórico.");
  }
  return <DndContext sensors={sensors} onDragEnd={onDragEnd}><div className="overflow-x-auto pb-4"><div className="flex min-w-max gap-3">{columns.map((column) => <PipelineColumn key={column.id} id={column.id} label={column.label} leads={leads.filter((lead) => lead.status === column.id)} />)}</div></div></DndContext>;
}

function PipelineColumn({ id, label, leads }: { id: string; label: string; leads: DemoLead[] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return <section ref={setNodeRef} className={`w-[282px] shrink-0 rounded-xl border bg-surface transition ${isOver ? "border-accent/60" : "border-border"}`}><header className="flex items-center justify-between border-b border-border px-4 py-3"><h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{label}</h2><span className="font-mono text-xs text-subtle">{leads.length}</span></header><div className="min-h-[420px] space-y-2 p-2">{leads.map((lead) => <LeadCard key={lead.id} lead={lead} />)}{!leads.length ? <div className="grid h-24 place-items-center rounded-lg border border-dashed border-border text-[11px] text-subtle">Arraste um lead para cá</div> : null}</div></section>;
}

function LeadCard({ lead }: { lead: DemoLead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: lead.id });
  return <article ref={setNodeRef} style={{ transform: CSS.Translate.toString(transform), opacity: isDragging ? 0.65 : 1 }} {...listeners} {...attributes} className="cursor-grab rounded-lg border border-border bg-background p-3 shadow-sm outline-none active:cursor-grabbing"><div className="flex items-start justify-between gap-3"><div><h3 className="text-xs font-medium">{lead.business}</h3><p className="mt-1 text-[11px] text-subtle">{lead.segment} · {lead.location.split(",")[0]}</p></div><GripVertical className="size-3.5 text-subtle" /></div><div className="mt-4 flex items-center justify-between"><Badge variant={lead.websiteStatus === "Sem site" ? "warning" : "neutral"}>{lead.websiteStatus}</Badge><span className="font-mono text-sm font-semibold text-accent">{lead.score}</span></div><div className="mt-3 flex gap-2 text-subtle">{lead.instagram ? <AtSign className="size-3.5" /> : null}{lead.whatsapp ? <MessageCircle className="size-3.5" /> : null}</div></article>;
}
