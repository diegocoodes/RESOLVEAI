"use client";

import { Download, ShieldOff, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LeadPrivacyActions({ leadId }: { leadId: string }) {
  const router = useRouter();
  async function exportData() {
    const response = await fetch(`/api/leads/${leadId}`);
    if (!response.ok) { toast.error("Não foi possível exportar os dados."); return; }
    const data = await response.blob();
    const href = URL.createObjectURL(data);
    const link = document.createElement("a");
    link.href = href; link.download = `lead-${leadId}.json`; link.click(); URL.revokeObjectURL(href);
    toast.success("Dados exportados.");
  }
  async function doNotContact() {
    if (!window.confirm("Marcar este lead como não contatar? Ele será bloqueado de novas campanhas.")) return;
    const response = await fetch(`/api/leads/${leadId}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ doNotContact: true }) });
    if (!response.ok) { toast.error("Não foi possível atualizar o contato."); return; }
    toast.success("Lead marcado como não contatar."); router.refresh();
  }
  async function remove() {
    if (!window.confirm("Excluir permanentemente este lead e todo o seu histórico? Esta ação não pode ser desfeita.")) return;
    const response = await fetch(`/api/leads/${leadId}`, { method: "DELETE" });
    if (!response.ok) { toast.error("Não foi possível excluir o lead."); return; }
    toast.success("Lead e dados relacionados excluídos permanentemente."); router.push("/leads"); router.refresh();
  }
  return <div className="space-y-2"><Button variant="secondary" size="sm" className="w-full justify-start" onClick={exportData}><Download className="size-3.5" />Exportar dados</Button><Button variant="secondary" size="sm" className="w-full justify-start" onClick={doNotContact}><ShieldOff className="size-3.5" />Marcar não contatar</Button><Button variant="destructive" size="sm" className="w-full justify-start" onClick={remove}><Trash2 className="size-3.5" />Excluir lead</Button></div>;
}
