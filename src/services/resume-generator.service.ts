import { getPrisma } from "@/lib/db/prisma";
import { rankResumeFactsWithOpenAI } from "@/lib/ai/openai";
import type { AtsResumeContent } from "@/lib/resume-content";
import { JobMatchService } from "@/services/job-match.service";

function normalize(value: string) { return value.toLocaleLowerCase("pt-BR").replace(/[^a-z0-9+#.]/g, ""); }
function orderByIds<T extends { id: string }>(rows: T[], ids: string[]) {
  const position = new Map(ids.map((id, index) => [id, index]));
  return [...rows].sort((a, b) => (position.get(a.id) ?? Number.MAX_SAFE_INTEGER) - (position.get(b.id) ?? Number.MAX_SAFE_INTEGER));
}
function date(value: Date | null) { return value?.toISOString() ?? null; }

export class ResumeGeneratorService {
  async generateForJob(userId: string, jobId: string) {
    const prisma = getPrisma();
    const [resume, job] = await Promise.all([
      prisma.resume.findFirst({ where: { userId, isMaster: true }, include: { user: { select: { name: true, email: true } }, skills: true, experiences: { orderBy: { sortOrder: "asc" } }, projects: true, education: true, certifications: true } }),
      prisma.job.findFirst({ where: { id: jobId, userId }, include: { requirements: true } }),
    ]);
    if (!resume) throw new Error("MASTER_RESUME_NOT_FOUND");
    if (!job) throw new Error("JOB_NOT_FOUND");

    const ranking = await rankResumeFactsWithOpenAI({
      jobTitle: job.title,
      jobDescription: job.description,
      skills: resume.skills.map((item) => ({ id: item.id, text: item.name })),
      experiences: resume.experiences.map((item) => ({ id: item.id, text: `${item.role} | ${item.company} | ${item.description}` })),
      projects: resume.projects.map((item) => ({ id: item.id, text: `${item.name} | ${item.description} | ${item.technologies.join(", ")}` })),
    });

    const requirements = job.requirements.map((item) => item.name);
    const match = new JobMatchService().calculate(requirements, [
      ...resume.skills.map((item) => ({ value: item.name, evidence: `Competência: ${item.name}` })),
      ...resume.projects.flatMap((project) => project.technologies.map((value) => ({ value, evidence: `Projeto: ${project.name}` }))),
    ]);
    const matched = new Set(match.items.filter((item) => item.level !== "MISSING").map((item) => normalize(item.requirement)));
    const deterministicSkillIds = [...resume.skills].sort((a, b) => Number(matched.has(normalize(b.name))) - Number(matched.has(normalize(a.name)))).map((item) => item.id);
    const skillIds = ranking?.skillIds.length ? ranking.skillIds : deterministicSkillIds;

    const content: AtsResumeContent = {
      name: resume.user.name ?? "Diego Ewerton",
      email: resume.user.email,
      targetTitle: job.title,
      summary: resume.summary,
      phone: resume.phone,
      location: [resume.city, resume.state].filter(Boolean).join(", "),
      portfolioUrl: resume.portfolioUrl,
      linkedinUrl: resume.linkedinUrl,
      githubUrl: resume.githubUrl,
      skills: orderByIds(resume.skills, skillIds).map(({ id, name, category }) => ({ id, name, category })),
      experiences: orderByIds(resume.experiences, ranking?.experienceIds ?? []).map((item) => ({ id: item.id, role: item.role, company: item.company, location: item.location, description: item.description, startedAt: date(item.startedAt), endedAt: date(item.endedAt), current: item.current })),
      projects: orderByIds(resume.projects, ranking?.projectIds ?? []).map((item) => ({ id: item.id, name: item.name, description: item.description, url: item.url, repositoryUrl: item.repositoryUrl, technologies: item.technologies })),
      education: resume.education.map((item) => ({ id: item.id, institution: item.institution, course: item.course, degree: item.degree, startedAt: date(item.startedAt), endedAt: date(item.endedAt), description: item.description })),
      certifications: resume.certifications.map((item) => ({ id: item.id, name: item.name, issuer: item.issuer, issuedAt: date(item.issuedAt) })),
      relevantRequirements: match.items.filter((item) => item.level !== "MISSING").map((item) => item.requirement),
      missingRequirements: match.items.filter((item) => item.level === "MISSING").map((item) => item.requirement),
      generatedBy: ranking ? "openai" : "deterministic",
    };

    const latest = await prisma.generatedResume.aggregate({ where: { resumeId: resume.id, jobId }, _max: { version: true } });
    const generated = await prisma.generatedResume.create({ data: { resumeId: resume.id, jobId, version: (latest._max.version ?? 0) + 1, title: `${job.title} — ${job.company ?? "Empresa"}`, content, sourceFacts: { resumeId: resume.id, jobId, skillIds: content.skills.map((item) => item.id), experienceIds: content.experiences.map((item) => item.id), projectIds: content.projects.map((item) => item.id) } }, select: { id: true } });
    await prisma.job.update({ where: { id: job.id }, data: { matchScore: match.score, status: "ANALYZED" } });
    return { id: generated.id, score: match.score, provider: content.generatedBy };
  }
}
