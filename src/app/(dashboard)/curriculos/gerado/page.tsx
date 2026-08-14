import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Download, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isAtsResumeContent } from "@/lib/resume-content";
import { ResumeRepository } from "@/repositories/resume.repository";

export const metadata = { title: "Currículo personalizado" };
export default async function GeneratedResumePage({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const session = await auth();
  if (!id || !session?.user.id) notFound();
  const row = await new ResumeRepository().findGenerated(session.user.id, id);
  if (!row || !isAtsResumeContent(row.content)) notFound();
  const resume = row.content;
  return <div className="mx-auto max-w-5xl space-y-6"><Link href="/curriculos" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Voltar para currículos</Link><header className="flex flex-col justify-between gap-4 border-b border-border pb-5 sm:flex-row sm:items-end"><div><div className="mb-2 flex flex-wrap gap-2">{row.job.matchScore !== null ? <Badge>{row.job.matchScore}% aderência</Badge> : null}<Badge variant={resume.atsValidation.passed ? "success" : "warning"}>Formato ATS {resume.atsValidation.formatScore}/100</Badge><Badge variant="neutral">Palavras-chave {resume.atsValidation.keywordCoverage}%</Badge><Badge variant="neutral">Versão {row.version}</Badge></div><h1 className="text-2xl font-semibold">{row.job.title}</h1><p className="mt-1 text-sm text-muted-foreground">{row.job.company ?? "Empresa não informada"}</p></div><Button asChild><a href={`/api/resumes/${row.id}/pdf`} download><Download className="size-4" />Baixar PDF ATS</a></Button></header>
    <div className="flex gap-3 rounded-lg border border-accent/20 bg-accent/[0.06] p-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><div><p className="text-xs font-medium">Validado pelo modelo ATS interno · {resume.generatedBy === "openai" ? "organização com OpenAI" : "organização determinística"}</p><p className="mt-1 text-xs leading-5 text-muted-foreground">Uma coluna, texto selecionável, títulos convencionais e palavras-chave comprovadas. Requisitos ausentes não foram adicionados.</p></div></div>
    <section className="grid gap-2 sm:grid-cols-2">{resume.atsValidation.checks.map((check) => <div key={check.label} className="flex items-center gap-2 rounded-lg border border-border bg-surface px-3 py-2 text-xs"><span className={check.passed ? "text-emerald-400" : "text-amber-400"}>{check.passed ? "✓" : "!"}</span>{check.label}</div>)}</section>
    <article className="mx-auto max-w-[820px] bg-white p-8 text-neutral-900 shadow-xl sm:p-12 print:shadow-none"><h2 className="text-2xl font-bold tracking-tight">{resume.name.toUpperCase()}</h2><p className="mt-1 text-sm font-semibold">{resume.targetTitle.toUpperCase()}</p><p className="mt-2 text-xs text-neutral-600">{[resume.location, resume.phone, resume.email, resume.linkedinUrl, resume.githubUrl].filter(Boolean).join(" · ")}</p>
      {resume.summary ? <ResumeSection title="RESUMO PROFISSIONAL"><p>{resume.summary}</p></ResumeSection> : null}
      {resume.relevantRequirements.length ? <ResumeSection title="COMPETÊNCIAS ALINHADAS À VAGA"><p>{resume.relevantRequirements.join(" · ")}</p></ResumeSection> : null}
      <ResumeSection title="COMPETÊNCIAS"><p>{resume.skills.map((item) => item.name).join(" · ")}</p></ResumeSection>
      <ResumeSection title="EXPERIÊNCIA">{resume.experiences.map((item) => <div key={item.id} className="mb-4 last:mb-0"><p className="font-semibold">{item.role} · {item.company}</p><p className="text-neutral-600">{item.location ?? "Brasil"} · {item.current ? "Atual" : "Período não informado"}</p><p className="mt-1 whitespace-pre-line">{item.description}</p></div>)}</ResumeSection>
      {resume.projects.length ? <ResumeSection title="PROJETOS">{resume.projects.map((item) => <div key={item.id} className="mb-3"><p className="font-semibold">{item.name}</p><p>{item.description}</p></div>)}</ResumeSection> : null}
      <ResumeSection title="FORMAÇÃO">{resume.education.map((item) => <p key={item.id}><strong>{item.course}</strong> · {item.institution}</p>)}</ResumeSection>
      {resume.certifications.length ? <ResumeSection title="CERTIFICAÇÕES"><ul>{resume.certifications.map((item) => <li key={item.id}>{item.name} · {item.issuer}</li>)}</ul></ResumeSection> : null}
    </article>
  </div>;
}
function ResumeSection({ title, children }: { title: string; children: React.ReactNode }) { return <section className="mt-7 border-t border-neutral-300 pt-3 text-xs leading-5"><h3 className="mb-2 text-[11px] font-bold tracking-widest">{title}</h3>{children}</section>; }
