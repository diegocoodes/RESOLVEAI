import Link from "next/link";
import { ArrowRight, BriefcaseBusiness, FileText, Radar, UsersRound } from "lucide-react";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { getPrisma } from "@/lib/db/prisma";

export default async function DashboardPage() {
  const session = await auth();
  const userId = session?.user.id;
  const data = userId ? await Promise.all([
    getPrisma().job.count({ where: { userId } }),
    getPrisma().lead.count({ where: { userId } }),
    getPrisma().generatedResume.count({ where: { resume: { userId } } }),
    getPrisma().application.count({ where: { userId } }),
    getPrisma().job.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
    getPrisma().lead.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, take: 3 }),
  ]) : [0, 0, 0, 0, [], []] as const;
  const [jobsCount, leadsCount, resumesCount, applicationsCount, jobs, leads] = data;

  return <div className="space-y-8"><PageHeader eyebrow="Visão geral" title={`Olá, ${session?.user.name?.split(" ")[0] ?? "Diego"}.`} description="Dados reais do seu workspace, sem métricas fictícias." actions={<><Button asChild variant="secondary" size="sm"><Link href="/prospeccao"><Radar className="size-3.5" />Buscar leads</Link></Button><Button asChild size="sm"><Link href="/vagas/nova"><BriefcaseBusiness className="size-3.5" />Cadastrar vaga</Link></Button></>} />
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric icon={BriefcaseBusiness} label="Vagas" value={jobsCount} /><Metric icon={UsersRound} label="Leads" value={leadsCount} /><Metric icon={FileText} label="Currículos ATS" value={resumesCount} /><Metric icon={ArrowRight} label="Candidaturas" value={applicationsCount} /></section>
    <div className="grid gap-5 lg:grid-cols-2"><Card><CardHeader><div><h2 className="text-sm font-semibold">Vagas recentes</h2><p className="mt-1 text-xs text-muted-foreground">Descrições adicionadas por você</p></div><Button asChild variant="ghost" size="sm"><Link href="/vagas">Ver todas</Link></Button></CardHeader><CardContent className="space-y-2">{jobs.length ? jobs.map((job) => <Link key={job.id} href={`/vagas/${job.id}`} className="block rounded-lg border border-border bg-background p-3 hover:bg-surface-hover"><p className="text-sm font-medium">{job.title}</p><p className="mt-1 text-xs text-muted-foreground">{job.company ?? "Empresa não informada"}</p></Link>) : <p className="py-8 text-center text-xs text-subtle">Nenhuma vaga cadastrada.</p>}</CardContent></Card>
      <Card><CardHeader><div><h2 className="text-sm font-semibold">Leads recentes</h2><p className="mt-1 text-xs text-muted-foreground">Somente registros revisados e cadastrados</p></div><Button asChild variant="ghost" size="sm"><Link href="/leads">Ver todos</Link></Button></CardHeader><CardContent className="space-y-2">{leads.length ? leads.map((lead) => <Link key={lead.id} href={`/leads/${lead.id}`} className="block rounded-lg border border-border bg-background p-3 hover:bg-surface-hover"><p className="text-sm font-medium">{lead.businessName ?? lead.name}</p><p className="mt-1 text-xs text-muted-foreground">{lead.niche ?? "Segmento não informado"} · {lead.websiteStatus === "NO_WEBSITE" ? "Sem site informado" : "Site não verificado"}</p></Link>) : <p className="py-8 text-center text-xs text-subtle">Nenhum lead cadastrado.</p>}</CardContent></Card></div>
  </div>;
}
function Metric({ icon: Icon, label, value }: { icon: typeof BriefcaseBusiness; label: string; value: number }) { return <div className="rounded-xl border border-border bg-surface p-5"><Icon className="size-4 text-accent" /><p className="mt-5 text-xs text-muted-foreground">{label}</p><p className="mt-1 font-mono text-2xl font-semibold">{value}</p></div>; }
