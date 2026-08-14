import { buildLeadOpportunity, type LeadFacts } from "@/lib/ai/leads";
export class LeadAnalysisService { analyze(facts: LeadFacts) { return buildLeadOpportunity(facts); } }
