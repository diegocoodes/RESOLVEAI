import { Plus, Send } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { ApprovalQueue } from "@/features/campaigns/approval-queue";

export const metadata = { title: "Campanhas" };
export default function CampaignsPage() { return <div className="space-y-6"><PageHeader eyebrow="Prospecção" title="Campanhas" description="Agrupe leads qualificados, revise cada mensagem e mantenha o envio sob controle humano." actions={<Button><Plus className="size-4" />Nova campanha</Button>} /><div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]"><ApprovalQueue /><Card><CardHeader><div><h2 className="text-sm font-semibold">Campanhas recentes</h2><p className="mt-1 text-xs text-muted-foreground">Resultados consolidados</p></div></CardHeader><CardContent className="space-y-3"><Campaign name="Personais Recife — Agosto" status="Em revisão" found={35} approved={18} /><Campaign name="Clínicas Grande Recife" status="Rascunho" found={22} approved={0} /></CardContent></Card></div></div>; }
function Campaign({ name, status, found, approved }: { name: string; status: string; found: number; approved: number }) { return <div className="rounded-lg border border-border bg-background p-4"><div className="flex items-start justify-between gap-3"><div><p className="text-sm font-medium">{name}</p><p className="mt-1 text-xs text-muted-foreground">{found} encontrados · {approved} aprovados</p></div><Send className="size-4 text-subtle" /></div><Badge variant="neutral" className="mt-4">{status}</Badge></div>; }
