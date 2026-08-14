import { Building2 } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { getPrisma } from "@/lib/db/prisma";
export const metadata = { title: "Clientes" };
export default async function ClientsPage() { const session = await auth(); const clients = session?.user.id ? await getPrisma().client.findMany({ where: { userId: session.user.id }, orderBy: { createdAt: "desc" } }) : []; return <div className="space-y-6"><PageHeader eyebrow="CRM" title="Clientes" description="Oportunidades reais fechadas no pipeline comercial." />{!clients.length ? <EmptyState icon={Building2} title="Nenhum cliente" description="Leads fechados aparecerão aqui como clientes." /> : <div className="grid gap-4 lg:grid-cols-2">{clients.map((client) => <article key={client.id} className="rounded-xl border border-border bg-surface p-5"><h2 className="text-sm font-medium">{client.name}</h2><p className="mt-1 text-xs text-muted-foreground">{client.company ?? "Empresa não informada"} · {client.projectType ?? "Projeto não informado"}</p></article>)}</div>}</div>; }
