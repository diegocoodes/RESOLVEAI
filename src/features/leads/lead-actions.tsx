"use client";

import { Check, Copy, ExternalLink, Loader2, MessageCircle, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export function LeadActions({ whatsapp, message }: { leadId: string; whatsapp?: string; message: string }) {
  const [working, setWorking] = useState<string | null>(null);
  async function simulate(action: string, success: string) {
    setWorking(action);
    await new Promise((resolve) => setTimeout(resolve, 650));
    setWorking(null);
    toast.success(success);
  }
  const waUrl = whatsapp ? `https://wa.me/${whatsapp.replace(/\D/g, "")}?text=${encodeURIComponent(message)}` : undefined;
  return (
    <div className="flex flex-wrap gap-2">
      <Button variant="secondary" onClick={() => simulate("analyze", "Análise concluída e registrada no histórico.")} disabled={!!working}>{working === "analyze" ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}Analisar oportunidade</Button>
      <Button variant="secondary" onClick={() => simulate("approve", "Mensagem aprovada para contato manual.")} disabled={!!working}>{working === "approve" ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}Aprovar mensagem</Button>
      {waUrl ? <Button asChild><a href={waUrl} target="_blank" rel="noreferrer" onClick={() => toast.info("WhatsApp aberto. Confirme o envio manualmente.")}><MessageCircle className="size-4" />Abrir no WhatsApp<ExternalLink className="size-3" /></a></Button> : <Button disabled><MessageCircle className="size-4" />WhatsApp indisponível</Button>}
    </div>
  );
}

export function CopyMessageButton({ message }: { message: string }) {
  async function copy() { await navigator.clipboard.writeText(message); toast.success("Mensagem copiada."); }
  return <Button variant="ghost" size="sm" onClick={copy}><Copy className="size-3.5" />Copiar</Button>;
}
