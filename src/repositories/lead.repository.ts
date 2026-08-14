import type { LeadEditInput, LeadInput } from "@/lib/validations/lead";
import { getPrisma } from "@/lib/db/prisma";
import type { WebsiteAudit } from "@/services/website-audit.service";
import { LeadScoringService } from "@/services/lead-scoring.service";

function normalize(value?: string | null) { return value?.toLowerCase().replace(/\D/g, "") || undefined; }

export class DuplicateLeadError extends Error {}

export class LeadRepository {
  async list(userId: string) {
    return getPrisma().lead.findMany({ where: { userId }, orderBy: [{ score: "desc" }, { createdAt: "desc" }], take: 200 });
  }

  async findById(userId: string, id: string) {
    return getPrisma().lead.findFirst({ where: { id, userId }, include: { audits: { orderBy: { checkedAt: "desc" }, take: 1 }, activities: { orderBy: { createdAt: "desc" }, take: 20 } } });
  }

  async create(userId: string, input: LeadInput, audit: WebsiteAudit) {
    const prisma = getPrisma();
    const domain = input.website ? new URL(input.website).hostname.replace(/^www\./, "").toLowerCase() : undefined;
    const phone = normalize(input.phone);
    const whatsapp = normalize(input.whatsapp);
    const duplicate = await prisma.lead.findFirst({ where: { userId, OR: [
      ...(phone ? [{ phone: { contains: phone } }] : []), ...(whatsapp ? [{ whatsapp: { contains: whatsapp } }] : []),
      ...(domain ? [{ duplicateKey: domain }] : []), ...(input.instagram ? [{ instagram: input.instagram }] : []),
      { businessName: { equals: input.businessName, mode: "insensitive" }, city: { equals: input.city || undefined, mode: "insensitive" } },
    ] } });
    if (duplicate) throw new DuplicateLeadError("Possível lead duplicado.");
    const score = new LeadScoringService().calculate({ websiteStatus: audit.status, hasWhatsapp: Boolean(input.whatsapp), hasInstagram: Boolean(input.instagram), localBusiness: Boolean(input.city) });
    return prisma.lead.create({ data: {
      userId, name: input.name || null, businessName: input.businessName, niche: input.niche, city: input.city || null, state: input.state?.toUpperCase() || null,
      phone: input.phone || null, whatsapp: input.whatsapp || null, instagram: input.instagram || null, facebook: input.facebook || null,
      website: input.website || null, googleBusiness: input.googleBusiness || null, websiteStatus: audit.status, score: score.score,
      source: input.source, sourceUrl: input.sourceUrl || null, notes: input.notes || null, contactAllowed: input.contactAllowed, duplicateKey: domain,
      audits: { create: { status: audit.status, url: input.website || null, isReachable: audit.isReachable, hasHttps: audit.hasHttps, responseTimeMs: audit.responseTimeMs, title: audit.title, metaDescription: audit.metaDescription, hasContactCta: audit.hasContactCta, hasWhatsapp: audit.hasWhatsapp, rawEvidence: { note: audit.note ?? null } } },
      activities: { create: { type: "LEAD_CREATED", title: "Lead criado", metadata: { source: input.source, scoreReasons: score.reasons } } },
    }, select: { id: true } });
  }

  async update(userId: string, id: string, input: LeadEditInput) {
    const prisma = getPrisma();
    return prisma.$transaction(async (transaction) => {
      const current = await transaction.lead.findFirst({ where: { id, userId } });
      if (!current) return null;

      const whatsapp = normalize(input.whatsapp);
      const duplicate = await transaction.lead.findFirst({ where: {
        userId,
        id: { not: id },
        OR: [
          ...(whatsapp ? [{ whatsapp: { contains: whatsapp } }] : []),
          { businessName: { equals: input.name, mode: "insensitive" } },
        ],
      } });
      if (duplicate) throw new DuplicateLeadError("Possível lead duplicado.");

      const score = new LeadScoringService().calculate({
        websiteStatus: current.websiteStatus,
        hasWhatsapp: true,
        hasInstagram: Boolean(current.instagram),
        localBusiness: Boolean(current.city),
      });
      return transaction.lead.update({
        where: { id },
        data: {
          name: input.name,
          businessName: input.name,
          niche: input.niche,
          whatsapp: input.whatsapp,
          score: score.score,
          activities: { create: { type: "LEAD_UPDATED", title: "Lead atualizado", metadata: { fields: ["name", "whatsapp", "niche"] } } },
        },
        select: { id: true },
      });
    });
  }
}
