import { z } from "zod";

export const masterResumeSchema = z.object({
  title: z.string().min(3).max(120),
  summary: z.string().min(40, "Escreva um resumo com pelo menos 40 caracteres").max(2000),
  phone: z.string().max(30).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(2).optional(),
  portfolioUrl: z.string().url().optional().or(z.literal("")),
  linkedinUrl: z.string().url().optional().or(z.literal("")),
  githubUrl: z.string().url().optional().or(z.literal("")),
  skills: z.string().min(2),
  experienceRole: z.string().min(2),
  experienceCompany: z.string().min(2),
  experienceDescription: z.string().min(20),
  projectName: z.string().optional(),
  projectDescription: z.string().optional(),
  educationInstitution: z.string().optional(),
  educationCourse: z.string().optional(),
});

export type MasterResumeInput = z.infer<typeof masterResumeSchema>;
