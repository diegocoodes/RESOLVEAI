import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";
import { LeadForm } from "@/features/leads/lead-form";
import type { LeadInput } from "@/lib/validations/lead";

export const metadata = { title: "Novo lead" };
const first = (value: string | string[] | undefined) => Array.isArray(value) ? value[0] : value;

export default async function NewLeadPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams;
  const source = first(query.source);
  const contactName = first(query.businessName)?.slice(0, 120);
  const phone = first(query.phone);
  const whatsapp = first(query.whatsapp);
  const initialValues: Partial<LeadInput> = {
    name: contactName, businessName: contactName, niche: first(query.niche)?.slice(0, 100), city: first(query.city)?.slice(0, 100), state: first(query.state)?.slice(0, 2), phone: phone?.slice(0, 30), whatsapp: whatsapp?.slice(0, 30),
    googleBusiness: first(query.googleBusiness)?.slice(0, 2048), sourceUrl: first(query.sourceUrl)?.slice(0, 2048), source: source === "OPENSTREETMAP" ? "OPENSTREETMAP" : "MANUAL", contactAllowed: true,
  };
  return <div className="mx-auto max-w-3xl space-y-6"><Link href="/leads" className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"><ChevronLeft className="size-3.5" />Voltar para leads</Link><PageHeader eyebrow="Nova oportunidade comercial" title="Cadastrar lead" description="Informe o contato, o WhatsApp e o segmento." /><LeadForm initialValues={initialValues} /></div>;
}
