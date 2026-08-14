"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, ExternalLink, Loader2, Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { jobInputSchema, type JobInput } from "@/lib/validations/job";

export function JobForm() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<JobInput>({
    resolver: zodResolver(jobInputSchema),
    defaultValues: { workMode: "Remoto", analyzeNow: true },
  });

  async function onSubmit(values: JobInput) {
    const response = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });
    const result = (await response.json()) as { id?: string; error?: string };
    if (!response.ok) {
      toast.error(result.error ?? "Não foi possível salvar a vaga.");
      return;
    }
    toast.success(values.analyzeNow ? "Vaga salva. Análise iniciada." : "Vaga salva com sucesso.");
    router.push(result.id ? `/vagas/${result.id}` : "/vagas");
    router.refresh();
  }

  const fieldError = (name: keyof JobInput) =>
    errors[name] ? <p className="mt-1 text-xs text-destructive">{errors[name]?.message}</p> : null;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5"><h2 className="text-sm font-semibold">Informações principais</h2><p className="mt-1 text-xs text-muted-foreground">Identifique a empresa e o contexto da oportunidade.</p></div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div><Label htmlFor="title">Cargo *</Label><Input id="title" placeholder="Ex.: Frontend Developer Pleno" {...register("title")} />{fieldError("title")}</div>
          <div><Label htmlFor="company">Empresa</Label><Input id="company" placeholder="Nome da empresa" {...register("company")} />{fieldError("company")}</div>
          <div className="sm:col-span-2"><Label htmlFor="url">URL da vaga</Label><div className="relative"><ExternalLink className="absolute left-3 top-3 size-4 text-subtle" /><Input id="url" className="pl-9" placeholder="https://..." {...register("url")} /></div>{fieldError("url")}</div>
          <div><Label htmlFor="location">Localização</Label><Input id="location" placeholder="Recife, PE" {...register("location")} /></div>
          <div><Label htmlFor="workMode">Modalidade *</Label><select id="workMode" className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm outline-none focus:border-accent/60" {...register("workMode")}><option>Remoto</option><option>Híbrido</option><option>Presencial</option></select></div>
          <div><Label htmlFor="salary">Salário</Label><Input id="salary" placeholder="Opcional" {...register("salary")} /></div>
          <div><Label htmlFor="source">Fonte</Label><Input id="source" placeholder="LinkedIn, Gupy, indicação..." {...register("source")} /></div>
          <div><Label htmlFor="publishedAt">Data da publicação</Label><div className="relative"><CalendarDays className="absolute left-3 top-3 size-4 text-subtle" /><Input id="publishedAt" type="date" className="pl-9" {...register("publishedAt")} /></div></div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface p-5 sm:p-6">
        <div className="mb-5"><h2 className="text-sm font-semibold">Descrição da vaga</h2><p className="mt-1 text-xs text-muted-foreground">Cole o texto integral. A análise só extrai o que estiver explícito aqui.</p></div>
        <Label htmlFor="description">Descrição completa *</Label>
        <Textarea id="description" className="min-h-72" placeholder="Cole aqui responsabilidades, requisitos, diferenciais e outras informações da vaga..." {...register("description")} />
        <div className="mt-2 flex justify-between gap-3"><div>{fieldError("description")}</div><span className="text-[11px] text-subtle">Mínimo de 40 caracteres</span></div>
      </div>

      <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
        <Button type="button" variant="secondary" onClick={() => router.back()}>Cancelar</Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : <Sparkles className="size-4" />}
          Salvar e analisar com IA
        </Button>
      </div>
    </form>
  );
}
