import Link from "next/link";
import { FileCode2, FileUp, Plus, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { LeadXmlImport } from "@/features/leads/lead-xml-import";

export const metadata = { title: "Importar leads" };

export default function ProspectingPage() {
  return <div className="space-y-6">
    <PageHeader eyebrow="Prospecção" title="Importar leads por XML" description="Anexe sua lista e deixe o sistema validar, separar e organizar os contatos pelo segmento informado no arquivo." actions={<Button asChild variant="secondary"><Link href="/leads/novo"><Plus className="size-4" />Cadastrar manualmente</Link></Button>} />
    <div className="grid gap-5 xl:grid-cols-[1.4fr_0.6fr]">
      <LeadXmlImport />
      <div className="space-y-5">
        <Card><CardHeader><div><h2 className="text-sm font-semibold">Estrutura obrigatória</h2><p className="mt-1 text-xs text-muted-foreground">Dados verificados antes da importação</p></div><FileCode2 className="size-4 text-accent" /></CardHeader><CardContent className="space-y-3 text-xs leading-5 text-muted-foreground"><Requirement label="Nome" /><Requirement label="Endereço completo" /><Requirement label="Telefone brasileiro com DDD" /><Requirement label="Segmento" /><p className="pt-1 text-[11px] text-subtle">Também aceitamos nomes equivalentes de campos, como name, address, phone, categoria, nicho ou profissão.</p></CardContent></Card>
        <Card><CardHeader><h2 className="text-sm font-semibold">Como os dados serão tratados</h2></CardHeader><CardContent><div className="flex gap-3"><ShieldCheck className="mt-0.5 size-4 shrink-0 text-accent" /><p className="text-xs leading-5 text-muted-foreground">O segmento é obrigatório e padronizado para manter a lista organizada. Telefones inválidos, linhas incompletas e contatos duplicados são separados e não entram no cadastro.</p></div></CardContent></Card>
      </div>
    </div>
  </div>;
}

function Requirement({ label }: { label: string }) {
  return <div className="flex items-center justify-between rounded-lg border border-border bg-background px-3 py-2.5"><span>{label}</span><span className="inline-flex items-center gap-1 text-emerald-400"><FileUp className="size-3" />Obrigatório</span></div>;
}
