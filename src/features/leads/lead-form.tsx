"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LEAD_SEGMENTS } from "@/lib/constants";
import { leadInputSchema, type LeadInput } from "@/lib/validations/lead";

export function LeadForm() {
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadInput>({ resolver: zodResolver(leadInputSchema), defaultValues: { source: "MANUAL", contactAllowed: true } });

  async function onSubmit(values: LeadInput) {
    const response = await fetch("/api/leads", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) });
    const result = (await response.json()) as { id?: string; error?: string; duplicate?: boolean };
    if (!response.ok) { toast.error(result.error ?? "Não foi possível salvar o lead."); return; }
    if (result.duplicate) { toast.warning("Possível lead duplicado. Revise antes de salvar."); return; }
    toast.success("Lead salvo.");
    router.push(result.id ? `/leads/${result.id}` : "/leads");
    router.refresh();
  }

  const error = (field: keyof LeadInput) => errors[field] ? <p className="mt-1 text-xs text-destructive">{errors[field]?.message}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5"><h2 className="text-sm font-semibold">Dados principais</h2><p className="mt-1 text-xs text-muted-foreground">Cadastre apenas informações comerciais necessárias e de origem legítima.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="businessName">Nome comercial *</Label><Input id="businessName" placeholder="Ex.: Studio Movimento" {...register("businessName")} />{error("businessName")}</div>
          <div><Label htmlFor="name">Nome do contato</Label><Input id="name" placeholder="Se estiver publicamente disponível" {...register("name")} /></div>
          <div><Label htmlFor="niche">Segmento *</Label><select id="niche" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" {...register("niche")}><option value="">Selecione</option>{LEAD_SEGMENTS.map((segment) => <option key={segment}>{segment}</option>)}</select>{error("niche")}</div>
          <div className="grid grid-cols-[1fr_90px] gap-3"><div><Label htmlFor="city">Cidade</Label><Input id="city" placeholder="Recife" {...register("city")} /></div><div><Label htmlFor="state">UF</Label><Input id="state" maxLength={2} placeholder="PE" {...register("state")} /></div></div>
          <div><Label htmlFor="phone">Telefone</Label><Input id="phone" placeholder="(81) 0000-0000" {...register("phone")} /></div>
          <div><Label htmlFor="whatsapp">WhatsApp</Label><Input id="whatsapp" placeholder="5581999999999" {...register("whatsapp")} /></div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5"><h2 className="text-sm font-semibold">Presença digital</h2><p className="mt-1 text-xs text-muted-foreground">Os endereços serão usados somente para verificação e contextualização.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="website">Site</Label><Input id="website" placeholder="https://..." {...register("website")} />{error("website")}</div>
          <div><Label htmlFor="instagram">Instagram</Label><Input id="instagram" placeholder="@perfil ou URL" {...register("instagram")} /></div>
          <div><Label htmlFor="facebook">Facebook</Label><Input id="facebook" placeholder="https://..." {...register("facebook")} />{error("facebook")}</div>
          <div><Label htmlFor="googleBusiness">Google Business</Label><Input id="googleBusiness" placeholder="https://..." {...register("googleBusiness")} />{error("googleBusiness")}</div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="source">Origem *</Label><select id="source" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none" {...register("source")}><option value="MANUAL">Cadastro manual</option><option value="GOOGLE_BUSINESS">Google Business</option><option value="DIRECTORY">Diretório público</option><option value="REFERRAL">Indicação</option><option value="IMPORT">Importação autorizada</option><option value="API">API autorizada</option></select></div>
          <div><Label htmlFor="sourceUrl">URL de origem</Label><Input id="sourceUrl" placeholder="https://..." {...register("sourceUrl")} />{error("sourceUrl")}</div>
          <div className="sm:col-span-2"><Label htmlFor="notes">Observações</Label><Textarea id="notes" placeholder="Contexto útil e verificável sobre o lead" {...register("notes")} /></div>
        </div>
        <label className="mt-4 flex items-start gap-3 rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground"><input type="checkbox" className="mt-0.5 accent-[#6d95ff]" {...register("contactAllowed")} /><span><strong className="block text-foreground">Contato permitido</strong>Este contato poderá entrar na fila de aprovação. Nenhuma mensagem será disparada automaticamente.</span></label>
      </section>

      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-[11px] text-subtle"><ShieldCheck className="size-3.5" />Origem registrada para conformidade e auditoria.</div>
        <div className="flex gap-2"><Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button><Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}Salvar lead</Button></div>
      </div>
    </form>
  );
}
