import { LEAD_SCORE_WEIGHTS } from "@/services/lead-score.config";

export type LeadScoreFacts = {
  websiteStatus: "NO_WEBSITE" | "GOOD" | "NEEDS_IMPROVEMENT" | "UNKNOWN";
  hasWhatsapp: boolean;
  hasInstagram: boolean;
  activeProfile?: boolean;
  localBusiness?: boolean;
  hasPoorCta?: boolean;
};

export class LeadScoringService {
  calculate(facts: LeadScoreFacts) {
    const reasons: Array<{ label: string; points: number }> = [];
    const add = (condition: boolean | undefined, label: string, points: number) => { if (condition) reasons.push({ label, points }); };
    add(facts.websiteStatus === "NO_WEBSITE", "Sem site", LEAD_SCORE_WEIGHTS.noWebsite);
    add(facts.hasWhatsapp, "WhatsApp público", LEAD_SCORE_WEIGHTS.publicWhatsapp);
    add(facts.hasInstagram, "Instagram disponível", LEAD_SCORE_WEIGHTS.instagramAvailable);
    add(facts.activeProfile, "Perfil ativo", LEAD_SCORE_WEIGHTS.activeProfile);
    add(facts.localBusiness, "Empresa local", LEAD_SCORE_WEIGHTS.localBusiness);
    add(facts.websiteStatus === "NEEDS_IMPROVEMENT", "Site precisa melhorar", LEAD_SCORE_WEIGHTS.outdatedWebsite);
    add(facts.hasPoorCta, "CTA insuficiente", LEAD_SCORE_WEIGHTS.poorCta);
    return { score: Math.min(100, reasons.reduce((sum, reason) => sum + reason.points, 0)), reasons };
  }
}
