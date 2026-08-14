import Link from "next/link";
import { Download, Eye, FileText, Pencil } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DeleteResumeButton } from "@/features/resume/delete-resume-button";
import { formatDate } from "@/lib/utils";
import { ResumeRepository } from "@/repositories/resume.repository";

export const metadata = { title: "Currículos" };
export default async function ResumesPage() {
  const session = await auth();
  const versions = session?.user.id ? await new ResumeRepository().listGenerated(session.user.id) : [];
  return <div className="space-y-6"><PageHeader eyebrow="Oportunidades" title="Currículos" description="Versões ATS rastreáveis, limitadas aos fatos do currículo mestre." actions={<Button asChild variant="secondary"><Link href="/configuracoes/curriculo"><Pencil className="size-4" />Ver currículo mestre</Link></Button>} />
    {!versions.length ? <EmptyState icon={FileText} title="Nenhuma versão gerada" description="Cadastre uma vaga com a descrição completa e gere a primeira versão ATS." action={<Button asChild><Link href="/vagas/nova">Adicionar vaga</Link></Button>} /> : <div className="grid gap-4 lg:grid-cols-2">{versions.map((resume) => <Card key={resume.id}><CardContent className="p-5"><div className="flex items-start gap-4"><span className="grid size-11 place-items-center rounded-lg border border-border bg-background"><FileText className="size-5 text-accent" /></span><div className="min-w-0 flex-1"><div className="flex flex-wrap items-center gap-2"><h2 className="text-sm font-medium">{resume.job.title}</h2>{resume.job.matchScore !== null ? <Badge>{resume.job.matchScore}% match</Badge> : null}</div><p className="mt-1 text-xs text-muted-foreground">{resume.job.company ?? "Empresa não informada"} · Versão {resume.version} · {formatDate(resume.createdAt)}</p></div></div><div className="mt-5 flex flex-wrap gap-2"><Button asChild size="sm" variant="secondary"><Link href={`/curriculos/gerado?id=${resume.id}`}><Eye className="size-3.5" />Visualizar</Link></Button><Button asChild size="sm"><a href={`/api/resumes/${resume.id}/pdf`} download><Download className="size-3.5" />Baixar PDF</a></Button><DeleteResumeButton resumeId={resume.id} /></div></CardContent></Card>)}</div>}
  </div>;
}
