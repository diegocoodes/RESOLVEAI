import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowUpRight, Check, ChevronLeft, CircleAlert, FileText, MapPin, Minus, RefreshCw, Sparkles, X } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { formatDate } from "@/lib/utils";
import { getJobForUser } from "@/services/opportunity-data.service";

export default async function JobDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const job = await getJobForUser(session?.user.id, id);
  if (!job) notFound();
  const partial = ["Docker"];
  const missing = job.missing ?? ["AWS"];

  return (
    <div className="space-y-6">
      <Link href="/vagas" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Voltar para vagas</Link>
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 lg:flex-row lg:items-end">
        <div>
          <div className="mb-3 flex flex-wrap gap-2"><Badge>{job.match}% de compatibilidade</Badge><Badge variant="neutral">{job.status}</Badge></div>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{job.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-muted-foreground"><span>{job.company}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{job.location} · {job.mode}</span><span>{formatDate(job.date)}</span></div>
        </div>
        <div className="flex flex-wrap gap-2"><Button variant="secondary"><RefreshCw className="size-3.5" />Reanalisar</Button><Button asChild><Link href={`/curriculos/gerado?job=${job.id}`}><FileText className="size-4" />Gerar currículo</Link></Button>{/* envio final permanece manual */}<Button asChild variant="secondary" size="icon"><a href="https://www.linkedin.com/jobs/" target="_blank" rel="noreferrer" aria-label="Abrir vaga"><ArrowUpRight className="size-4" /></a></Button></div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card>
            <CardHeader><div><h2 className="text-sm font-semibold">Compatibilidade</h2><p className="mt-1 text-xs text-muted-foreground">Comparação com o Currículo Mestre · análise de hoje</p></div><span className="font-mono text-3xl font-semibold text-accent">{job.match}%</span></CardHeader>
            <CardContent>
              <Progress value={job.match} className="h-2" />
              <div className="mt-6 grid gap-5 sm:grid-cols-3">
                <RequirementGroup icon={Check} label="Compatível" tone="success" items={job.skills} />
                <RequirementGroup icon={Minus} label="Parcial" tone="warning" items={partial} />
                <RequirementGroup icon={X} label="Não encontrado" tone="danger" items={missing} />
              </div>
              <div className="mt-6 flex gap-3 rounded-lg border border-border bg-background p-3"><CircleAlert className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><p className="text-xs leading-5 text-muted-foreground">Competências ausentes permanecem fora do currículo gerado. Você pode desenvolver essas habilidades, mas o sistema nunca as apresentará como experiência existente.</p></div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><div><h2 className="text-sm font-semibold">Resumo da oportunidade</h2><p className="mt-1 text-xs text-muted-foreground">Estruturado a partir da descrição original</p></div><Sparkles className="size-4 text-accent" /></CardHeader>
            <CardContent className="space-y-5 text-sm leading-6 text-muted-foreground">
              <p>A {job.company} busca uma pessoa desenvolvedora para construir interfaces web escaláveis, colaborar com produto e contribuir com decisões técnicas do frontend.</p>
              <div className="grid gap-4 sm:grid-cols-2"><InfoBlock label="Senioridade" value="Pleno" /><InfoBlock label="Experiência desejada" value="2+ anos com aplicações web" /><InfoBlock label="Formação" value="Não especificada" /><InfoBlock label="Idiomas" value="Inglês técnico" /></div>
              <div><h3 className="mb-2 text-xs font-semibold uppercase tracking-wider text-foreground">Responsabilidades</h3><ul className="list-disc space-y-1 pl-5"><li>Desenvolver e manter interfaces em React e Next.js.</li><li>Colaborar com design e backend na evolução do produto.</li><li>Escrever testes e participar de revisões de código.</li></ul></div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card>
            <CardHeader><div><h2 className="text-sm font-semibold">Próxima ação</h2><p className="mt-1 text-xs text-muted-foreground">Recomendação do sistema</p></div></CardHeader>
            <CardContent><div className="rounded-lg border border-accent/20 bg-accent/[0.06] p-4"><p className="text-sm font-medium">Personalize seu currículo</p><p className="mt-2 text-xs leading-5 text-muted-foreground">Priorize os projetos com Next.js e evidências de colaboração em produto.</p><Button asChild className="mt-4 w-full" size="sm"><Link href={`/curriculos/gerado?job=${job.id}`}>Gerar versão para a vaga</Link></Button></div></CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Palavras-chave</h2></CardHeader>
            <CardContent className="flex flex-wrap gap-2">{[...job.skills, "Design System", "REST API", "Testes", "Agile"].map((skill) => <Badge key={skill} variant="neutral">{skill}</Badge>)}</CardContent>
          </Card>
          <Card>
            <CardHeader><h2 className="text-sm font-semibold">Dados da vaga</h2></CardHeader>
            <CardContent className="space-y-3 text-xs"><DataRow label="Origem" value={job.source} /><DataRow label="Modalidade" value={job.mode} /><DataRow label="Localização" value={job.location} /><DataRow label="Salário" value="Não informado" /></CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function RequirementGroup({ icon: Icon, label, items, tone }: { icon: typeof Check; label: string; items: string[]; tone: "success" | "warning" | "danger" }) {
  const tones = { success: "text-emerald-400 bg-emerald-500/10", warning: "text-amber-400 bg-amber-500/10", danger: "text-red-400 bg-red-500/10" };
  return <div><h3 className="mb-3 text-[10px] font-semibold uppercase tracking-wider text-subtle">{label}</h3><div className="space-y-2">{items.map((item) => <div key={item} className="flex items-center gap-2 text-xs"><span className={`grid size-5 place-items-center rounded ${tones[tone]}`}><Icon className="size-3" /></span><span>{item}</span></div>)}</div></div>;
}

function InfoBlock({ label, value }: { label: string; value: string }) { return <div className="rounded-lg border border-border bg-background p-3"><p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">{label}</p><p className="mt-1 text-xs text-foreground">{value}</p></div>; }
function DataRow({ label, value }: { label: string; value: string }) { return <div className="flex justify-between gap-4"><span className="text-muted-foreground">{label}</span><span className="text-right text-foreground">{value}</span></div>; }
