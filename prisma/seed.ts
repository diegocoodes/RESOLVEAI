import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DIRECT_URL?.trim() || process.env.DATABASE_URL?.trim();
if (!connectionString) throw new Error("DIRECT_URL ou DATABASE_URL não configurada.");
const adminName = process.env.SEED_ADMIN_NAME?.trim() || "Administrador";
const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
if (!adminEmail || !adminEmail.includes("@")) throw new Error("SEED_ADMIN_EMAIL deve conter um e-mail válido.");
if (!adminPassword || adminPassword.length < 9) throw new Error("SEED_ADMIN_PASSWORD deve ter pelo menos 9 caracteres.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });

async function main() {
  const passwordHash = await bcrypt.hash(adminPassword!, 12);
  const user = await prisma.user.upsert({ where: { email: adminEmail! }, update: { name: adminName, passwordHash }, create: { email: adminEmail!, name: adminName, passwordHash } });
  for (const [index, stage] of ["NEW", "ANALYZED", "QUALIFIED", "CONTACTED", "REPLIED", "MEETING", "PROPOSAL", "WON", "LOST"].entries()) {
    await prisma.pipelineStage.upsert({ where: { userId_code: { userId: user.id, code: stage } }, update: { sortOrder: index }, create: { userId: user.id, code: stage, label: stage, sortOrder: index } });
  }
  const example = await prisma.lead.findFirst({ where: { userId: user.id, businessName: "EXEMPLO VISUAL — Negócio sem site" } });
  if (!example) await prisma.lead.create({ data: { userId: user.id, businessName: "EXEMPLO VISUAL — Negócio sem site", niche: "Exemplo", city: "Recife", state: "PE", websiteStatus: "NO_WEBSITE", score: 40, status: "NEW", source: "MANUAL", notes: "Registro fictício único mantido apenas para visualizar o layout. Não contatar.", contactAllowed: false, doNotContact: true, activities: { create: { type: "LEAD_CREATED", title: "Exemplo visual criado" } } } });
}

main().finally(() => prisma.$disconnect());
