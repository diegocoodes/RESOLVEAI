import { MessageSquareText, ShieldCheck } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { getPrisma } from "@/lib/db/prisma";
export const metadata = { title: "Mensagens" };
export default async function MessagesPage() { const session = await auth(); const messages = session?.user.id ? await getPrisma().message.findMany({ where: { lead: { userId: session.user.id } }, include: { lead: true }, orderBy: { createdAt: "desc" } }) : []; return <div className="space-y-6"><PageHeader eyebrow="Prospecção" title="Mensagens" description="Revise abordagens baseadas em dados verificáveis antes de abrir o canal de contato." />{!messages.length ? <EmptyState icon={MessageSquareText} title="Nenhuma mensagem" description="Mensagens aparecerão aqui somente depois de serem criadas para um lead real." /> : <div className="space-y-3">{messages.map((message) => <article key={message.id} className="rounded-xl border border-border bg-surface p-5"><div className="flex items-center gap-2"><h2 className="text-sm font-medium">{message.lead.businessName ?? message.lead.name}</h2><Badge variant="neutral">{message.status}</Badge></div><p className="mt-3 whitespace-pre-line text-sm leading-6 text-muted-foreground">{message.content}</p></article>)}</div>}<p className="inline-flex items-center gap-2 text-xs text-subtle"><ShieldCheck className="size-3.5" />Nenhum envio automático.</p></div>; }
