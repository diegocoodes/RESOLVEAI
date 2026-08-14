import type { DemoJob, DemoLead } from "@/lib/demo-data";
import { jobs as demoJobs, leads as demoLeads } from "@/lib/demo-data";
import { JobRepository } from "@/repositories/job.repository";
import { LeadRepository } from "@/repositories/lead.repository";

export async function getJobsForUser(userId?: string): Promise<DemoJob[]> {
  if (!userId || !process.env.DATABASE_URL) return demoJobs;
  const rows = await new JobRepository().list(userId);
  return rows.map((job) => ({
    id: job.id, title: job.title, company: job.company ?? "Empresa não informada", location: job.location ?? "Não informada",
    mode: job.workMode ?? "Não informada", source: job.source ?? "Manual", date: job.createdAt.toISOString(), match: job.matchScore ?? 0,
    status: job.status === "ANALYZED" ? "Analisada" : "Salva", skills: job.requirements.filter((item) => item.category === "TECHNOLOGY").map((item) => item.name).slice(0, 6),
  }));
}

export async function getJobForUser(userId: string | undefined, id: string): Promise<DemoJob | undefined> {
  const demo = demoJobs.find((job) => job.id === id);
  if (demo || !userId || !process.env.DATABASE_URL) return demo;
  const job = await new JobRepository().findById(userId, id);
  if (!job) return undefined;
  return { id: job.id, title: job.title, company: job.company ?? "Empresa não informada", location: job.location ?? "Não informada", mode: job.workMode ?? "Não informada", source: job.source ?? "Manual", date: job.createdAt.toISOString(), match: job.matchScore ?? 0, status: job.status === "ANALYZED" ? "Analisada" : "Salva", skills: job.requirements.filter((item) => item.category === "TECHNOLOGY").map((item) => item.name), missing: [] };
}

export async function getLeadsForUser(userId?: string): Promise<DemoLead[]> {
  if (!userId || !process.env.DATABASE_URL) return demoLeads;
  const rows = await new LeadRepository().list(userId);
  const labels = { NO_WEBSITE: "Sem site", NEEDS_IMPROVEMENT: "Precisa melhorar", GOOD: "Bom site", UNKNOWN: "Não verificado" } as const;
  return rows.map((lead) => ({ id: lead.id, name: lead.name ?? "Contato não informado", business: lead.businessName ?? lead.name ?? "Lead sem nome", segment: lead.niche ?? "Sem segmento", location: [lead.city, lead.state].filter(Boolean).join(", ") || "Não informada", score: lead.score, status: lead.status, websiteStatus: labels[lead.websiteStatus], whatsapp: Boolean(lead.whatsapp), instagram: Boolean(lead.instagram), nextFollowUp: lead.nextFollowUpAt?.toISOString() }));
}

export async function getLeadForUser(userId: string | undefined, id: string): Promise<DemoLead | undefined> {
  const demo = demoLeads.find((lead) => lead.id === id);
  if (demo || !userId || !process.env.DATABASE_URL) return demo;
  const lead = await new LeadRepository().findById(userId, id);
  if (!lead) return undefined;
  const labels = { NO_WEBSITE: "Sem site", NEEDS_IMPROVEMENT: "Precisa melhorar", GOOD: "Bom site", UNKNOWN: "Não verificado" } as const;
  return { id: lead.id, name: lead.name ?? "Contato não informado", business: lead.businessName ?? lead.name ?? "Lead sem nome", segment: lead.niche ?? "Sem segmento", location: [lead.city, lead.state].filter(Boolean).join(", ") || "Não informada", score: lead.score, status: lead.status, websiteStatus: labels[lead.websiteStatus], whatsapp: Boolean(lead.whatsapp), instagram: Boolean(lead.instagram), nextFollowUp: lead.nextFollowUpAt?.toISOString() };
}
