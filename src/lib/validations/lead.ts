import { z } from "zod";
import { isValidBrazilianWhatsAppNumber } from "@/lib/whatsapp";

const optionalUrl = z.string().trim().url("Informe uma URL válida").optional().or(z.literal(""));
const optionalWhatsapp = z.string().trim().max(30).refine((value) => !value || isValidBrazilianWhatsAppNumber(value), "Informe um número brasileiro válido com DDD");
const optionalPhone = z.string().trim().max(30).optional().or(z.literal("")).refine((value) => !value || isValidBrazilianWhatsAppNumber(value), "Informe um telefone brasileiro válido com DDD");

const leadBaseSchema = z.object({
  name: z.string().trim().min(2, "Informe o nome do contato").max(120),
  businessName: z.string().trim().min(2, "Informe o nome comercial").max(160),
  niche: z.string().trim().min(2, "Informe o segmento").max(100),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  city: z.string().trim().max(100).optional().or(z.literal("")),
  state: z.string().trim().max(2).optional().or(z.literal("")),
  phone: optionalPhone,
  whatsapp: optionalWhatsapp,
  instagram: z.string().trim().max(120).optional().or(z.literal("")),
  facebook: optionalUrl,
  website: optionalUrl,
  googleBusiness: optionalUrl,
  source: z.enum(["MANUAL", "GOOGLE_BUSINESS", "OPENSTREETMAP", "DIRECTORY", "REFERRAL", "IMPORT", "API"]),
  sourceUrl: optionalUrl,
  notes: z.string().trim().max(2000).optional().or(z.literal("")),
  contactAllowed: z.boolean(),
});

export const leadInputSchema = leadBaseSchema.superRefine((value, context) => {
  if (value.source === "MANUAL" && !value.whatsapp) context.addIssue({ code: "custom", path: ["whatsapp"], message: "Informe o número do WhatsApp com DDD" });
});

export const leadEditSchema = leadBaseSchema.pick({ name: true, whatsapp: true, niche: true, phone: true, address: true });

export type LeadInput = z.infer<typeof leadInputSchema>;
export type LeadEditInput = z.infer<typeof leadEditSchema>;
