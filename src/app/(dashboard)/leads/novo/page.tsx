import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { LeadForm } from "@/features/leads/lead-form";

export const metadata = { title: "Novo lead" };
export default function NewLeadPage() { return <div className="mx-auto max-w-4xl space-y-6"><Link href="/leads" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Voltar para leads</Link><PageHeader eyebrow="Nova oportunidade comercial" title="Cadastrar lead" description="Registre os dados essenciais, a origem pública e a permissão de contato." /><LeadForm /></div>; }
