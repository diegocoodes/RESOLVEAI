import { getPrisma } from "@/lib/db/prisma";
export class CampaignRepository {
  list(userId: string) { return getPrisma().campaign.findMany({ where: { userId }, include: { leads: { include: { lead: true } } }, orderBy: { createdAt: "desc" } }); }
}
