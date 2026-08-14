import { getPrisma } from "@/lib/db/prisma";
export class ApplicationRepository {
  list(userId: string) { return getPrisma().application.findMany({ where: { userId }, include: { job: true, generatedResume: true }, orderBy: { updatedAt: "desc" } }); }
  updateStatus(userId: string, id: string, status: "SAVED" | "ANALYZED" | "RESUME_GENERATED" | "APPLIED" | "INTERVIEW" | "TEST" | "OFFER" | "HIRED" | "REJECTED") { return getPrisma().application.updateMany({ where: { id, userId }, data: { status } }); }
}
