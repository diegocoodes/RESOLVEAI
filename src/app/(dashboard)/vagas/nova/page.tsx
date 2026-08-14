import Link from "next/link";
import { ChevronLeft, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { JobForm } from "@/features/jobs/job-form";

export const metadata = { title: "Cadastrar vaga" };

export default function NewJobPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link href="/vagas" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Voltar para vagas</Link>
      <PageHeader eyebrow="Nova oportunidade" title="Cadastrar vaga" description="Adicione os dados da oportunidade para extrair requisitos e calcular a compatibilidade com seu currículo mestre." />
      <div className="flex gap-3 rounded-lg border border-accent/20 bg-accent/[0.06] p-4"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><p className="text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Análise baseada em evidências.</strong> O sistema não adiciona competências ao seu perfil e identifica claramente os requisitos ausentes.</p></div>
      <JobForm />
    </div>
  );
}
