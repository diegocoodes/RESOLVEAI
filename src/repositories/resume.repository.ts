import { getPrisma } from "@/lib/db/prisma";
export class ResumeRepository {
  findMaster(userId: string) { return getPrisma().resume.findFirst({ where: { userId, isMaster: true }, include: { user: { select: { name: true, email: true } }, skills: true, experiences: { orderBy: { sortOrder: "asc" } }, projects: true, education: true, certifications: true } }); }
  listGenerated(userId: string) { return getPrisma().generatedResume.findMany({ where: { resume: { userId } }, include: { job: true }, orderBy: { createdAt: "desc" }, take: 50 }); }
  findGenerated(userId: string, id: string) { return getPrisma().generatedResume.findFirst({ where: { id, resume: { userId } }, include: { job: true, resume: { include: { user: { select: { name: true, email: true } } } } } }); }
  deleteGenerated(userId: string, id: string) { return getPrisma().generatedResume.deleteMany({ where: { id, resume: { userId } } }); }
}
