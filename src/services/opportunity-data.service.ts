import type { OpportunityJob, OpportunityLead } from "@/types/opportunity";
import { JobRepository } from "@/repositories/job.repository";
import { LeadRepository } from "@/repositories/lead.repository";
import { normalizeWhatsAppNumber } from "@/lib/whatsapp";

function getDiscoverySource(source: string, instagram?: string | null): OpportunityLead["discoverySource"] {
  if (source === "IMPORT" || source === "GOOGLE_BUSINESS") return "Google";
  return instagram ? "Instagram" : undefined;
}

export async function getJobsForUser(userId?: string): Promise<OpportunityJob[]> {
  if (!userId || !process.env.DATABASE_URL) return [];
  const rows = await new JobRepository().list(userId);
  return rows.map((job) => ({ id: job.id, title: job.title, company: job.company ?? "Empresa não informada", location: job.location ?? "Não informada", mode: job.workMode ?? "Não informada", source: job.source ?? "Manual", date: job.createdAt.toISOString(), match: job.matchScore ?? 0, status: job.status === "ANALYZED" ? "Analisada" : "Salva", skills: job.requirements.filter((item) => item.category === "TECHNOLOGY").map((item) => item.name).slice(0, 6) }));
}

export async function getJobForUser(userId: string | undefined, id: string): Promise<OpportunityJob | undefined> {
  if (!userId || !process.env.DATABASE_URL) return undefined;
  const job = await new JobRepository().findById(userId, id);
  if (!job) return undefined;
  return { id: job.id, title: job.title, company: job.company ?? "Empresa não informada", location: job.location ?? "Não informada", mode: job.workMode ?? "Não informada", source: job.source ?? "Manual", date: job.createdAt.toISOString(), match: job.matchScore ?? 0, status: job.status === "ANALYZED" ? "Analisada" : "Salva", skills: job.requirements.filter((item) => item.category === "TECHNOLOGY").map((item) => item.name), missing: [] };
}

export async function getLeadsForUser(userId?: string): Promise<OpportunityLead[]> {
  if (!userId || !process.env.DATABASE_URL) return [];
  const rows = await new LeadRepository().list(userId);
  const labels = { NO_WEBSITE: "Sem site", NEEDS_IMPROVEMENT: "Precisa melhorar", GOOD: "Bom site", UNKNOWN: "Não verificado" } as const;
  return rows.map((lead) => { const whatsapp = normalizeWhatsAppNumber(lead.whatsapp); const cityAndState = [lead.city, lead.state].filter(Boolean).join(", "); return { id: lead.id, name: lead.name ?? "Contato não informado", business: lead.businessName ?? lead.name ?? "Lead sem nome", segment: lead.niche ?? "Sem segmento", location: lead.address || cityAndState || "Não informada", address: lead.address ?? undefined, city: lead.city ?? undefined, state: lead.state ?? undefined, discoverySource: getDiscoverySource(lead.source, lead.instagram), score: lead.score, status: lead.status, websiteStatus: labels[lead.websiteStatus], whatsapp: Boolean(whatsapp), instagram: Boolean(lead.instagram), whatsappValue: whatsapp, instagramValue: lead.instagram ?? undefined, phoneValue: lead.phone ?? undefined, nextFollowUp: lead.nextFollowUpAt?.toISOString() }; });
}

export async function getLeadForUser(userId: string | undefined, id: string): Promise<OpportunityLead | undefined> {
  if (!userId || !process.env.DATABASE_URL) return undefined;
  const lead = await new LeadRepository().findById(userId, id);
  if (!lead) return undefined;
  const labels = { NO_WEBSITE: "Sem site", NEEDS_IMPROVEMENT: "Precisa melhorar", GOOD: "Bom site", UNKNOWN: "Não verificado" } as const;
  const whatsapp = normalizeWhatsAppNumber(lead.whatsapp);
  const cityAndState = [lead.city, lead.state].filter(Boolean).join(", ");
  return { id: lead.id, name: lead.name ?? "Contato não informado", business: lead.businessName ?? lead.name ?? "Lead sem nome", segment: lead.niche ?? "Sem segmento", location: lead.address || cityAndState || "Não informada", address: lead.address ?? undefined, city: lead.city ?? undefined, state: lead.state ?? undefined, discoverySource: getDiscoverySource(lead.source, lead.instagram), score: lead.score, status: lead.status, websiteStatus: labels[lead.websiteStatus], whatsapp: Boolean(whatsapp), instagram: Boolean(lead.instagram), whatsappValue: whatsapp, instagramValue: lead.instagram ?? undefined, phoneValue: lead.phone ?? undefined, nextFollowUp: lead.nextFollowUpAt?.toISOString() };
}
