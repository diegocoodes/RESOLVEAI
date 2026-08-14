import Link from "next/link";
import { notFound } from "next/navigation";
import { AtSign, CalendarClock, Check, ChevronLeft, Circle, Globe2, MapPin, MessageCircle, Phone, ShieldAlert, Sparkles, X } from "lucide-react";
import { auth } from "@/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CopyMessageButton, LeadActions } from "@/features/leads/lead-actions";
import { LeadPrivacyActions } from "@/features/leads/lead-privacy-actions";
import { buildLeadOpportunity, buildOutreachMessage } from "@/lib/ai/leads";
import { LEAD_SCORE_WEIGHTS } from "@/services/lead-score.config";
import { getLeadForUser } from "@/services/opportunity-data.service";

export default async function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  const lead = await getLeadForUser(session?.user.id, id);
  if (!lead) notFound();
  const facts = { name: lead.name, businessName: lead.business, niche: lead.segment, city: lead.location.split(",")[0], state: "PE", websiteStatus: lead.websiteStatus === "Sem site" ? "NO_WEBSITE" as const : lead.websiteStatus === "Precisa melhorar" ? "NEEDS_IMPROVEMENT" as const : "UNKNOWN" as const, whatsapp: lead.whatsapp ? "5581999999999" : null, instagram: lead.instagram ? "@perfil_publico" : null };
  const analysis = buildLeadOpportunity(facts);
  const message = buildOutreachMessage(facts);
  return (
    <div className="space-y-6">
      <Link href="/leads" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Voltar para leads</Link>
      <header className="flex flex-col justify-between gap-5 border-b border-border pb-6 lg:flex-row lg:items-end"><div><div className="mb-3 flex gap-2"><Badge variant="success">Qualificado</Badge><Badge variant="neutral">Origem registrada</Badge></div><h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{lead.business}</h1><div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground"><span>{lead.segment}</span><span className="inline-flex items-center gap-1"><MapPin className="size-3.5" />{lead.location}</span></div></div><LeadActions leadId={lead.id} whatsapp={facts.whatsapp ?? undefined} message={message} /></header>

      <div className="grid gap-5 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-5">
          <Card><CardHeader><div><h2 className="text-sm font-semibold">Presença digital</h2><p className="mt-1 text-xs text-muted-foreground">Somente dados verificados ou informados</p></div><Badge variant={lead.websiteStatus === "Sem site" ? "warning" : "neutral"}>{lead.websiteStatus}</Badge></CardHeader><CardContent><div className="grid gap-3 sm:grid-cols-3"><PresenceCard icon={AtSign} label="Instagram" value={lead.instagram ? "Disponível" : "Não informado"} active={lead.instagram} /><PresenceCard icon={MessageCircle} label="WhatsApp" value={lead.whatsapp ? "Disponível" : "Não informado"} active={lead.whatsapp} /><PresenceCard icon={Globe2} label="Site" value={lead.websiteStatus} active={lead.websiteStatus !== "Sem site"} /></div></CardContent></Card>

          <Card><CardHeader><div><h2 className="text-sm font-semibold">Auditoria do site</h2><p className="mt-1 text-xs text-muted-foreground">Última verificação: hoje, 09:42</p></div></CardHeader><CardContent>{lead.websiteStatus === "Sem site" ? <div className="flex gap-3 rounded-lg border border-amber-500/20 bg-amber-500/[0.06] p-4"><ShieldAlert className="mt-0.5 size-4 shrink-0 text-amber-400" /><div><p className="text-sm font-medium">Nenhum site próprio encontrado</p><p className="mt-1 text-xs leading-5 text-muted-foreground">A origem consultada não informou um domínio. Isso não prova que o negócio não possui site em outra fonte.</p></div></div> : <div className="grid gap-3 sm:grid-cols-2"><AuditItem label="HTTPS" value="Sim" ok /><AuditItem label="Site responde" value="Sim" ok /><AuditItem label="Meta description" value="Não encontrada" /><AuditItem label="CTA de contato" value="Não encontrado" /></div>}<p className="mt-4 text-[11px] text-subtle">Performance e mobile não são pontuados sem uma medição confiável. Quando indisponíveis, permanecem como “Não foi possível verificar”.</p></CardContent></Card>

          <Card><CardHeader><div><h2 className="text-sm font-semibold">Análise da oportunidade</h2><p className="mt-1 text-xs text-muted-foreground">Hipóteses baseadas nos fatos coletados</p></div><Sparkles className="size-4 text-accent" /></CardHeader><CardContent className="grid gap-4 sm:grid-cols-2"><Insight label="Resumo do negócio" text={analysis.businessSummary} /><Insight label="Possível necessidade" text={analysis.possibleNeed} /><Insight label="Serviço recomendado" text={analysis.recommendedService} /><Insight label="Motivo da oportunidade" text={analysis.opportunityReason} /></CardContent></Card>

          <Card><CardHeader><div><h2 className="text-sm font-semibold">Mensagem para revisão</h2><p className="mt-1 text-xs text-muted-foreground">Gerada somente com os fatos disponíveis</p></div><CopyMessageButton message={message} /></CardHeader><CardContent><div className="rounded-lg border border-border bg-background p-4 text-sm leading-6 text-muted-foreground">{message}</div><div className="mt-3 flex items-center gap-2 text-[11px] text-subtle"><ShieldAlert className="size-3.5" />A mensagem precisa de aprovação antes de abrir o canal de contato.</div></CardContent></Card>
        </div>

        <div className="space-y-5">
          <Card><CardHeader><div><h2 className="text-sm font-semibold">Lead score</h2><p className="mt-1 text-xs text-muted-foreground">Critérios centralizados</p></div><span className="font-mono text-3xl font-semibold text-accent">{lead.score}</span></CardHeader><CardContent><Progress value={lead.score} className="h-2" /><div className="mt-5 space-y-3"><ScoreRow label="Sem site" points={LEAD_SCORE_WEIGHTS.noWebsite} active={lead.websiteStatus === "Sem site"} /><ScoreRow label="WhatsApp público" points={LEAD_SCORE_WEIGHTS.publicWhatsapp} active={lead.whatsapp} /><ScoreRow label="Instagram disponível" points={LEAD_SCORE_WEIGHTS.instagramAvailable} active={lead.instagram} /><ScoreRow label="Empresa local" points={LEAD_SCORE_WEIGHTS.localBusiness} active /></div></CardContent></Card>
          <Card><CardHeader><h2 className="text-sm font-semibold">Contato</h2></CardHeader><CardContent className="space-y-3 text-xs"><Info icon={Phone} label="WhatsApp" value={lead.whatsapp ? "+55 81 99999-9999" : "Não informado"} /><Info icon={AtSign} label="Instagram" value={lead.instagram ? "@perfil_publico" : "Não informado"} /><Info icon={CalendarClock} label="Follow-up" value={lead.nextFollowUp ?? "Não agendado"} /></CardContent></Card>
          <Card><CardHeader><h2 className="text-sm font-semibold">Histórico</h2></CardHeader><CardContent className="space-y-4">{[["Lead qualificado", "Hoje, 10:02"], ["Análise gerada", "Hoje, 09:45"], ["Lead criado", "Hoje, 09:41"]].map(([title,time]) => <div key={title} className="flex gap-3"><Circle className="mt-1 size-2.5 fill-accent text-accent" /><div><p className="text-xs text-foreground">{title}</p><p className="mt-0.5 text-[11px] text-subtle">{time}</p></div></div>)}</CardContent></Card>
          <Card><CardHeader><div><h2 className="text-sm font-semibold">Privacidade e dados</h2><p className="mt-1 text-xs text-muted-foreground">Controles LGPD deste contato</p></div></CardHeader><CardContent><LeadPrivacyActions leadId={lead.id} /></CardContent></Card>
        </div>
      </div>
    </div>
  );
}

function PresenceCard({ icon: Icon, label, value, active }: { icon: typeof AtSign; label: string; value: string; active: boolean }) { return <div className="rounded-lg border border-border bg-background p-3"><div className="flex items-center justify-between"><Icon className="size-4 text-muted-foreground" />{active ? <Check className="size-3.5 text-emerald-400" /> : <X className="size-3.5 text-subtle" />}</div><p className="mt-4 text-[10px] uppercase tracking-wider text-subtle">{label}</p><p className="mt-1 text-xs font-medium">{value}</p></div>; }
function AuditItem({ label, value, ok }: { label: string; value: string; ok?: boolean }) { return <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5 text-xs"><span className="text-muted-foreground">{label}</span><span className={ok ? "text-emerald-400" : "text-amber-400"}>{value}</span></div>; }
function Insight({ label, text }: { label: string; text: string }) { return <div><p className="text-[10px] font-semibold uppercase tracking-wider text-subtle">{label}</p><p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p></div>; }
function ScoreRow({ label, points, active }: { label: string; points: number; active: boolean }) { return <div className={`flex justify-between text-xs ${active ? "text-foreground" : "text-subtle"}`}><span>{label}</span><span className="font-mono">{active ? `+${points}` : "+0"}</span></div>; }
function Info({ icon: Icon, label, value }: { icon: typeof Phone; label: string; value: string }) { return <div className="flex gap-3"><Icon className="size-3.5 text-subtle" /><div><p className="text-subtle">{label}</p><p className="mt-0.5 text-foreground">{value}</p></div></div>; }
