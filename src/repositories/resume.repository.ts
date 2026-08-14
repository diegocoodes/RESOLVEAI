import { getPrisma } from "@/lib/db/prisma";
export class ResumeRepository {
  findMaster(userId: string) { return getPrisma().resume.findFirst({ where: { userId, isMaster: true }, include: { skills: true, experiences: true, projects: true, education: true, certifications: true } }); }
}
