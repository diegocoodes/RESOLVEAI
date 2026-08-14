import { Send } from "lucide-react";
import { auth } from "@/auth";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CampaignRepository } from "@/repositories/campaign.repository";
export const metadata = { title: "Campanhas" };
export default async function CampaignsPage() { const session = await auth(); const campaigns = session?.user.id ? await new CampaignRepository().list(session.user.id) : []; return <div className="space-y-6"><PageHeader eyebrow="Prospecção" title="Campanhas" description="Agrupe leads reais, revise cada mensagem e mantenha o envio sob controle humano." />{!campaigns.length ? <EmptyState icon={Send} title="Nenhuma campanha" description="Cadastre e qualifique leads antes de criar uma campanha." /> : <div className="grid gap-4 lg:grid-cols-2">{campaigns.map((campaign) => <Card key={campaign.id}><CardContent className="p-5"><div className="flex items-start justify-between"><div><h2 className="text-sm font-medium">{campaign.name}</h2><p className="mt-1 text-xs text-muted-foreground">{campaign.leads.length} leads revisados</p></div><Badge variant="neutral">{campaign.status}</Badge></div></CardContent></Card>)}</div>}</div>; }
