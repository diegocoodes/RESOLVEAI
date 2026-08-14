import { z } from "zod";

const optionalUrl = z.string().trim().url("Informe uma URL válida").optional().or(z.literal(""));

export const leadInputSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do contato").max(120),
  businessName: z.string().trim().min(2, "Informe o nome comercial").max(160),
  niche: z.string().trim().min(2, "Informe o segmento").max(100),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().min(8, "Informe o número do WhatsApp com DDD").max(30),
  instagram: z.string().trim().max(120).optional().or(z.literal("")),
  facebook: optionalUrl,
  website: optionalUrl,
  googleBusiness: optionalUrl,
  source: z.enum(["MANUAL", "GOOGLE_BUSINESS", "OPENSTREETMAP", "DIRECTORY", "REFERRAL", "IMPORT", "API"]),
  sourceUrl: optionalUrl,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  contactAllowed: z.boolean(),
});

export const leadEditSchema = leadInputSchema.pick({ name: true, whatsapp: true, niche: true });

export const leadSearchSchema = z.object({
  niche: z.string().trim().min(2).max(100),
  location: z.string().trim().min(2).max(120),
  limit: z.coerce.number().int().min(1).max(20),
  withoutWebsite: z.boolean().default(true),
});

export type LeadInput = z.infer<typeof leadInputSchema>;
export type LeadEditInput = z.infer<typeof leadEditSchema>;
