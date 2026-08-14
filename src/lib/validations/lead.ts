import { z } from "zod";

const optionalUrl = z.string().trim().url("Informe uma URL válida").optional().or(z.literal(""));

export const leadInputSchema = z.object({
  name: z.string().trim().max(120).optional().or(z.literal("")),
  businessName: z.string().trim().min(2, "Informe o nome comercial").max(160),
  niche: z.string().trim().min(2, "Informe o segmento").max(100),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  whatsapp: z.string().trim().max(30).optional().or(z.literal("")),
  instagram: z.string().trim().max(120).optional().or(z.literal("")),
  facebook: optionalUrl,
  website: optionalUrl,
  googleBusiness: optionalUrl,
  source: z.enum(["MANUAL", "GOOGLE_BUSINESS", "DIRECTORY", "REFERRAL", "IMPORT", "API"]),
  sourceUrl: optionalUrl,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  contactAllowed: z.boolean(),
});

export const leadSearchSchema = z.object({
  niche: z.string().min(2),
  location: z.string().min(2),
  limit: z.number().int().min(1).max(100),
  withoutWebsite: z.boolean().optional(),
  hasInstagram: z.boolean().optional(),
  hasWhatsapp: z.boolean().optional(),
  poorWebsite: z.boolean().optional(),
});

export type LeadInput = z.infer<typeof leadInputSchema>;
