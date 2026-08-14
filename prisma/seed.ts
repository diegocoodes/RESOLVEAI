import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!connectionString) throw new Error("DIRECT_URL ou DATABASE_URL não configurada.");

const adminName = process.env.SEED_ADMIN_NAME?.trim() || "Administrador";
const configuredAdminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const configuredAdminPassword = process.env.SEED_ADMIN_PASSWORD;

if (!configuredAdminEmail || !configuredAdminEmail.includes("@")) {
  throw new Error("SEED_ADMIN_EMAIL deve conter um e-mail válido.");
}
if (!configuredAdminPassword || configuredAdminPassword.length < 12) {
  throw new Error("SEED_ADMIN_PASSWORD deve ter pelo menos 12 caracteres.");
}

const adminEmail: string = configuredAdminEmail;
const adminPassword: string = configuredAdminPassword;

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword, 12);
  const user = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { name: adminName, passwordHash },
    create: { email: adminEmail, name: adminName, passwordHash },
  });

  const existingResume = await prisma.resume.findFirst({ where: { userId: user.id, isMaster: true } });
  if (!existingResume) {
    await prisma.resume.create({
      data: {
        userId: user.id, title: "Currículo Mestre", summary: "Desenvolvedor frontend com experiência na construção de interfaces web acessíveis, responsivas e orientadas a produto.",
        phone: "+55 81 99999-9999", city: "Recife", state: "PE", portfolioUrl: "https://portfolio.example.com", githubUrl: "https://github.com/exemplo",
        skills: { create: ["React", "TypeScript", "Next.js", "Node.js", "PostgreSQL", "Tailwind CSS", "Git", "REST API", "Testing Library"].map((name) => ({ name, category: "Tecnologia" })) },
        experiences: { create: { role: "Desenvolvedor Frontend", company: "Studio Digital", description: "Desenvolvimento de aplicações React e Next.js, colaboração com design e integração com APIs REST.", startedAt: new Date("2024-01-01"), current: true } },
        projects: { create: { name: "Plataforma de oportunidades", description: "Aplicação web modular para vagas e prospecção comercial.", technologies: ["Next.js", "TypeScript", "PostgreSQL"] } },
        education: { create: { institution: "Faculdade de Tecnologia", course: "Análise e Desenvolvimento de Sistemas" } },
      },
    });
  }

  for (const [index, stage] of ["NEW", "ANALYZED", "QUALIFIED", "CONTACTED", "REPLIED", "MEETING", "PROPOSAL", "WON", "LOST"].entries()) {
    await prisma.pipelineStage.upsert({ where: { userId_code: { userId: user.id, code: stage } }, update: { sortOrder: index }, create: { userId: user.id, code: stage, label: stage, sortOrder: index } });
  }

  const demoJob = await prisma.job.findFirst({ where: { userId: user.id, title: "Frontend Developer Pleno", company: "Nimbus Tecnologia" } });
  if (!demoJob) {
    await prisma.job.create({ data: { userId: user.id, title: "Frontend Developer Pleno", company: "Nimbus Tecnologia", location: "Recife, PE", workMode: "Remoto", source: "LinkedIn", description: "Buscamos pessoa desenvolvedora frontend pleno com React, TypeScript, Next.js, Node.js, APIs REST, PostgreSQL, Docker e AWS. Colaboração e comunicação são importantes.", status: "ANALYZED", matchScore: 91, requirements: { create: ["React", "TypeScript", "Next.js", "Node.js", "REST API", "PostgreSQL", "Docker", "AWS"].map((name) => ({ name, category: "TECHNOLOGY", normalized: name.toLowerCase(), level: "REQUIRED" })) } } });
  }

  const demoLead = await prisma.lead.findFirst({ where: { userId: user.id, businessName: "João Performance" } });
  if (!demoLead) {
    await prisma.lead.create({ data: { userId: user.id, name: "João Henrique", businessName: "João Performance", niche: "Personal Trainer", city: "Recife", state: "PE", whatsapp: "5581999999999", instagram: "@joaoperformance", websiteStatus: "NO_WEBSITE", score: 65, status: "QUALIFIED", source: "MANUAL", sourceUrl: "https://example.com/origem-demo", activities: { create: { type: "LEAD_CREATED", title: "Lead criado pelo seed de demonstração" } } } });
  }
}

main().finally(() => prisma.$disconnect());
