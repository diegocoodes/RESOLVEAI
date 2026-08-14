import { Circle, History } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { formatDate } from "@/lib/utils";
import { getPrisma } from "@/lib/db/prisma";
export const metadata = { title: "Histórico" };
export default async function HistoryPage() { const session = await auth(); const events = session?.user.id ? await getPrisma().leadActivity.findMany({ where: { lead: { userId: session.user.id } }, include: { lead: true }, orderBy: { createdAt: "desc" }, take: 50 }) : []; return <div className="space-y-6"><PageHeader eyebrow="Inteligência" title="Histórico" description="Eventos reais registrados no workspace." />{!events.length ? <EmptyState icon={History} title="Nenhum evento" description="As ações realizadas no sistema aparecerão aqui." /> : <div className="rounded-xl border border-border bg-surface p-5">{events.map((event, index) => <div key={event.id} className="relative flex gap-4 pb-7 last:pb-0">{index < events.length - 1 ? <span className="absolute left-[5px] top-4 h-full w-px bg-border" /> : null}<Circle className="mt-1 size-[11px] shrink-0 fill-accent text-accent" /><div><p className="text-sm font-medium">{event.title}</p><p className="mt-1 text-xs text-muted-foreground">{event.lead.businessName ?? event.lead.name} · {formatDate(event.createdAt)}</p></div></div>)}</div>}</div>; }
