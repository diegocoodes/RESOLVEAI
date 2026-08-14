import { z } from "zod";

export const jobInputSchema = z.object({
  title: z.string().trim().min(3, "Informe um cargo válido").max(120),
  company: z.string().trim().max(120).optional().or(z.literal("")),
  url: z.string().trim().url("Informe uma URL válida").optional().or(z.literal("")),
  location: z.string().trim().max(120).optional().or(z.literal("")),
  workMode: z.enum(["Remoto", "Híbrido", "Presencial"]),
  description: z.string().trim().min(40, "Cole a descrição completa da vaga"),
  salary: z.string().trim().max(80).optional().or(z.literal("")),
  source: z.string().trim().max(80).optional().or(z.literal("")),
  publishedAt: z.string().optional(),
  analyzeNow: z.boolean(),
});

export type JobInput = z.infer<typeof jobInputSchema>;
