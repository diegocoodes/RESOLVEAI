import { createHash } from "node:crypto";
import type { JobInput } from "@/lib/validations/job";
import type { ExtractedJob } from "@/lib/ai/jobs";
import { getPrisma } from "@/lib/db/prisma";

export class DuplicateJobError extends Error {}

export class JobRepository {
  async list(userId: string) {
    return getPrisma().job.findMany({ where: { userId }, include: { requirements: true }, orderBy: { createdAt: "desc" }, take: 100 });
  }

  async findById(userId: string, id: string) {
    return getPrisma().job.findFirst({ where: { id, userId }, include: { requirements: true } });
  }

  async create(userId: string, input: JobInput, extracted: ExtractedJob) {
    const prisma = getPrisma();
    const descriptionHash = createHash("sha256").update(input.description.toLowerCase().replace(/\s+/g, " ").trim()).digest("hex");
    const duplicate = await prisma.job.findFirst({ where: { userId, OR: [
      ...(input.url ? [{ url: input.url }] : []),
      { company: { equals: input.company || undefined, mode: "insensitive" }, title: { equals: input.title, mode: "insensitive" } },
      { descriptionHash },
    ] } });
    if (duplicate) throw new DuplicateJobError("Possível vaga duplicada.");
    const requirements = [...new Map([...extracted.technologies, ...extracted.hardSkills, ...extracted.softSkills].map((name) => [name.trim().toLocaleLowerCase("pt-BR"), name.trim()])).values()].filter(Boolean);
    return prisma.job.create({ data: {
      userId, title: input.title, company: input.company || null, url: input.url || null, location: input.location || null,
      workMode: input.workMode, description: input.description, salary: input.salary || null, source: input.source || "Manual",
      publishedAt: input.publishedAt ? new Date(input.publishedAt) : null, descriptionHash, status: input.analyzeNow ? "ANALYZED" : "SAVED",
      requirements: { create: requirements.map((name) => ({ name, normalized: name.toLocaleLowerCase("pt-BR"), category: extracted.softSkills.includes(name) ? "SOFT_SKILL" : extracted.technologies.includes(name) ? "TECHNOLOGY" : "HARD_SKILL", level: "REQUIRED" })) },
    }, select: { id: true } });
  }
}
