import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  CalendarClock,
  CheckCircle2,
  Circle,
  Radar,
  Sparkles,
} from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { EvolutionChart } from "@/features/dashboard/evolution-chart";
import { StatCard } from "@/features/dashboard/stat-card";
import {
  dashboardStats,
  employmentEvolution,
  jobs,
  leads,
  prospectingEvolution,
} from "@/lib/demo-data";

export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow="Visão geral"
        title="Bom dia, Diego."
        description="Suas oportunidades mais importantes, em um só lugar."
        actions={
          <>
            <Button asChild variant="secondary" size="sm"><Link href="/prospeccao"><Radar className="size-3.5" />Buscar leads</Link></Button>
            <Button asChild size="sm"><Link href="/vagas/nova"><BriefcaseBusiness className="size-3.5" />Cadastrar vaga</Link></Button>
          </>
        }
      />

      <section aria-labelledby="employment-title" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 id="employment-title" className="text-base font-semibold">Emprego</h2>
            <p className="mt-0.5 text-xs text-muted-foreground">Do radar até a entrevista</p>
          </div>
          <Button asChild variant="ghost" size="sm"><Link href="/vagas">Ver vagas<ArrowRight className="size-3.5" /></Link></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.jobs.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader>
              <div><h3 className="text-sm font-medium">Evolução das oportunidades</h3><p className="mt-1 text-xs text-muted-foreground">Vagas salvas e candidaturas por mês</p></div>
              <Badge variant="neutral">Últimos 6 meses</Badge>
            </CardHeader>
            <CardContent><EvolutionChart data={employmentEvolution} primaryKey="vagas" secondaryKey="candidaturas" primaryLabel="Vagas" secondaryLabel="Candidaturas" /></CardContent>
          </Card>
          <Card>
            <CardHeader><div><h3 className="text-sm font-medium">Melhores matches</h3><p className="mt-1 text-xs text-muted-foreground">Priorizadas para você</p></div></CardHeader>
            <CardContent className="space-y-1">
              {jobs.slice(0, 3).map((job) => (
                <Link href={`/vagas/${job.id}`} key={job.id} className="group flex items-center gap-3 rounded-lg p-2.5 transition hover:bg-surface-hover">
                  <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-border bg-background text-xs font-semibold">{job.company.charAt(0)}</span>
                  <span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium">{job.title}</span><span className="block truncate text-xs text-muted-foreground">{job.company}</span></span>
                  <span className="font-mono text-sm font-semibold text-accent">{job.match}%</span>
                </Link>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-labelledby="prospecting-title" className="space-y-4 border-t border-border pt-8">
        <div className="flex items-center justify-between">
          <div><h2 id="prospecting-title" className="text-base font-semibold">Prospecção</h2><p className="mt-0.5 text-xs text-muted-foreground">Do lead ao cliente</p></div>
          <Button asChild variant="ghost" size="sm"><Link href="/leads">Ver leads<ArrowRight className="size-3.5" /></Link></Button>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {dashboardStats.leads.map((stat) => <StatCard key={stat.label} {...stat} />)}
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
          <Card>
            <CardHeader><div><h3 className="text-sm font-medium">Evolução da prospecção</h3><p className="mt-1 text-xs text-muted-foreground">Leads descobertos e respostas recebidas</p></div><Badge variant="neutral">Últimos 6 meses</Badge></CardHeader>
            <CardContent><EvolutionChart data={prospectingEvolution} primaryKey="leads" secondaryKey="respostas" primaryLabel="Leads" secondaryLabel="Respostas" /></CardContent>
          </Card>
          <Card>
            <CardHeader><div><h3 className="text-sm font-medium">Próximas ações</h3><p className="mt-1 text-xs text-muted-foreground">3 itens precisam da sua atenção</p></div></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-accent/10"><CalendarClock className="size-3.5 text-accent" /></span><div className="min-w-0"><p className="text-sm">Follow-up com Clínica Vitta</p><p className="mt-0.5 text-xs text-destructive">Vence hoje, 14:00</p></div></div>
              <div className="flex gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-accent/10"><Sparkles className="size-3.5 text-accent" /></span><div><p className="text-sm">Revisar 6 mensagens geradas</p><p className="mt-0.5 text-xs text-muted-foreground">Fila de aprovação</p></div></div>
              <div className="flex gap-3"><span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-md bg-accent/10"><CheckCircle2 className="size-3.5 text-accent" /></span><div><p className="text-sm">Registrar resposta do Studio Move</p><p className="mt-0.5 text-xs text-muted-foreground">Recebida ontem</p></div></div>
            </CardContent>
          </Card>
        </div>
      </section>

      <Card>
        <CardHeader><div><h3 className="text-sm font-medium">Atividade recente</h3><p className="mt-1 text-xs text-muted-foreground">Histórico unificado das suas oportunidades</p></div><Button variant="ghost" size="sm" asChild><Link href="/historico">Ver histórico</Link></Button></CardHeader>
        <CardContent>
          <div className="grid gap-0 md:grid-cols-3">
            {[
              ["Currículo personalizado criado", "Nimbus Tecnologia", "Há 18 min"],
              ["Lead qualificado", leads[0].business, "Há 1h"],
              ["Vaga analisada com 84% de match", "Atlas Commerce", "Há 3h"],
            ].map(([title, detail, time]) => (
              <div key={title} className="flex gap-3 border-border py-2 md:border-r md:px-4 md:first:pl-0 md:last:border-r-0">
                <Circle className="mt-1 size-2.5 shrink-0 fill-accent text-accent" />
                <div><p className="text-sm font-medium">{title}</p><p className="mt-0.5 text-xs text-muted-foreground">{detail} · {time}</p></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
