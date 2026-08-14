import { getPrisma } from "@/lib/db/prisma";

export class CampaignService {
  async addApprovedLeads(userId: string, campaignId: string, leadIds: string[]) {
    const prisma = getPrisma();
    const leads = await prisma.lead.findMany({ where: { id: { in: leadIds }, userId, contactAllowed: true, doNotContact: false }, select: { id: true } });
    await prisma.campaignLead.createMany({ data: leads.map((lead) => ({ campaignId, leadId: lead.id })), skipDuplicates: true });
    return { requested: leadIds.length, accepted: leads.length, blocked: leadIds.length - leads.length };
  }
}
