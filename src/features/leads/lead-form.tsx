"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, ShieldCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LEAD_SEGMENTS } from "@/lib/constants";
import { leadInputSchema, type LeadInput } from "@/lib/validations/lead";

type LeadFormProps = {
  initialValues?: Partial<LeadInput>;
  leadId?: string;
};

export function LeadForm({ initialValues = {}, leadId }: LeadFormProps) {
  const router = useRouter();
  const contactName = initialValues.name || initialValues.businessName || "";
  const { register, setValue, handleSubmit, formState: { errors, isSubmitting } } = useForm<LeadInput>({
    resolver: zodResolver(leadInputSchema),
    defaultValues: {
      source: "MANUAL",
      contactAllowed: true,
      ...initialValues,
      name: contactName,
      businessName: contactName,
      whatsapp: initialValues.whatsapp || initialValues.phone || "",
    },
  });

  async function onSubmit(values: LeadInput) {
    const response = await fetch(leadId ? `/api/leads/${leadId}` : "/api/leads", {
      method: leadId ? "PATCH" : "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(leadId
        ? { name: values.name, whatsapp: values.whatsapp, niche: values.niche }
        : { ...values, businessName: values.name }),
    });
    const result = (await response.json()) as { id?: string; error?: string; duplicate?: boolean };
    if (!response.ok) {
      toast.error(result.error ?? `Não foi possível ${leadId ? "atualizar" : "salvar"} o lead.`);
      return;
    }
    if (result.duplicate) {
      toast.warning("Possível lead duplicado. Revise antes de salvar.");
      return;
    }
    toast.success(leadId ? "Lead atualizado." : "Lead salvo.");
    const savedId = leadId ?? result.id;
    router.push(savedId ? `/leads/${savedId}` : "/leads");
    router.refresh();
  }

  const error = (field: keyof LeadInput) => errors[field]
    ? <p className="mt-1 text-xs text-destructive">{errors[field]?.message}</p>
    : null;

  const nameField = register("name", {
    onChange: (event) => setValue("businessName", event.target.value, { shouldValidate: true }),
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <section className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5">
          <h2 className="text-sm font-semibold">Dados do lead</h2>
          <p className="mt-1 text-xs text-muted-foreground">Somente as informações essenciais para organizar e contatar o lead.</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Nome do contato *</Label>
            <Input id="name" autoComplete="name" placeholder="Ex.: Diego Silva" {...nameField} />
            {error("name")}
          </div>
          <div>
            <Label htmlFor="whatsapp">Número do WhatsApp *</Label>
            <Input id="whatsapp" type="tel" inputMode="tel" autoComplete="tel" placeholder="Ex.: 5581999999999" {...register("whatsapp")} />
            {error("whatsapp")}
          </div>
          <div>
            <Label htmlFor="niche">Segmento *</Label>
            <Input id="niche" list="lead-form-segments" placeholder="Ex.: Personal Trainer" {...register("niche")} />
            <datalist id="lead-form-segments">{LEAD_SEGMENTS.map((segment) => <option key={segment} value={segment} />)}</datalist>
            {error("niche")}
          </div>
        </div>
      </section>

      <div className="flex flex-col-reverse justify-between gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 text-[11px] text-subtle"><ShieldCheck className="size-3.5" />Nenhuma mensagem será enviada automaticamente.</div>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Save className="size-4" />}{leadId ? "Salvar alterações" : "Salvar lead"}</Button>
        </div>
      </div>
    </form>
  );
}
