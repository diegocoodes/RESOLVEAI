import Link from "next/link";
import { FileCode2, FileUp, Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LeadSpreadsheetImport } from "@/features/leads/lead-xml-import";

export const metadata = { title: "Importar leads" };

export default function ProspectingPage() {
  return <div className="space-y-6">
    <PageHeader eyebrow="Prospecção" title="Importar leads por XLS" description="Anexe sua planilha e deixe o sistema validar, separar e organizar os contatos pelo segmento informado em cada linha." actions={<Button asChild variant="secondary"><Link href="/leads/novo"><Plus className="size-4" />Cadastrar manualmente</Link></Button>} />
    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
      <LeadSpreadsheetImport />
      <div className="space-y-5">
        <Card><CardHeader><div><h2 className="text-sm font-semibold">Estrutura obrigatória</h2><p className="mt-1 text-xs text-muted-foreground">Dados verificados antes da importação</p></div><FileCode2 className="size-4 text-accent" /></CardHeader><CardContent className="space-y-3 text-xs leading-5 text-muted-foreground"><Requirement label="Nome" /><Requirement label="Endereço completo" /><Requirement label="Telefone brasileiro com DDD" /><Requirement label="Segmento ou profissão no nome" /><p className="pt-1 text-[11px] text-subtle">A coluna Segmento é usada quando existir. Sem ela, o sistema identifica somente profissões claras no nome e separa os casos incertos para revisão.</p></CardContent></Card>
        <Card><CardHeader><h2 className="text-sm font-semibold">Como os dados serão tratados</h2></CardHeader><CardContent><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><p className="text-xs leading-5 text-muted-foreground">O segmento é validado pela coluna correspondente ou identificado no nome profissional. Telefones inválidos, linhas incompletas, categorias incertas e contatos duplicados são separados e não entram no cadastro.</p></div></CardContent></Card>
      </div>
    </div>
  </div>;
}

function Requirement({ label }: { label: string }) {
  return <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5"><span>{label}</span><span className="inline-flex items-center gap-1 text-emerald-400"><FileUp className="size-3" />Obrigatório</span></div>;
}
