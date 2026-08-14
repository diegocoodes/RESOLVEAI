import { Sparkles } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { getPrisma } from "@/lib/db/prisma";
export const metadata = { title: "Análises IA" };
export default async function AnalysesPage() { const session = await auth(); const analyses = session?.user.id ? await getPrisma().aIAnalysis.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" }, take: 50 }) : []; return <div className="space-y-6"><PageHeader eyebrow="Inteligência" title="Análises IA" description="Resultados reais e rastreáveis por provedor e fatos de origem." />{!analyses.length ? <EmptyState icon={Sparkles} title="Nenhuma análise registrada" description="As próximas análises serão registradas aqui para auditoria." /> : <div className="grid gap-4 lg:grid-cols-2">{analyses.map((item) => <article key={item.id} className="rounded-xl border border-border bg-surface p-5"><h2 className="text-sm font-medium">{item.type}</h2><p className="mt-1 text-xs text-muted-foreground">{item.entityType} · {item.createdAt.toLocaleDateString("pt-BR")}</p><Badge variant="neutral" className="mt-3">{item.provider}</Badge></article>)}</div>}</div>; }
