import { buildOutreachMessage, type LeadFacts } from "@/lib/ai/leads";
export class MessageGeneratorService { generate(facts: LeadFacts) { return { content: buildOutreachMessage(facts), sourceFacts: facts, status: "DRAFT" as const }; } }
