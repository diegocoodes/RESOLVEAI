import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { PageHeader } from "@/components/page-header";
import { LeadForm } from "@/features/leads/lead-form";
import type { LeadInput } from "@/lib/validations/lead";
import { LeadRepository } from "@/repositories/lead.repository";

export const metadata = { title: "Editar lead" };

export default async function EditLeadPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user.id) notFound();
  const lead = await new LeadRepository().findById(session.user.id, id);
  if (!lead) notFound();

  const initialValues: Partial<LeadInput> = {
    name: lead.name || lead.businessName || "",
    businessName: lead.name || lead.businessName || "",
    address: lead.address || "",
    phone: lead.phone || "",
    whatsapp: lead.whatsapp || "",
    niche: lead.niche || "",
    source: lead.source,
    contactAllowed: lead.contactAllowed,
  };

  return <div className="mx-auto max-w-3xl space-y-6">
    <Link href={`/leads/${id}`} className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Voltar para o lead</Link>
    <PageHeader eyebrow="Lead" title="Editar lead" description="Atualize o contato, endereço, telefone, WhatsApp ou segmento." />
    <LeadForm leadId={id} initialValues={initialValues} />
  </div>;
}
