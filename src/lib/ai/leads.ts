export type LeadFacts = {
  name?: string | null;
  businessName?: string | null;
  niche?: string | null;
  city?: string | null;
  state?: string | null;
  websiteStatus?: "NO_WEBSITE" | "GOOD" | "NEEDS_IMPROVEMENT" | "UNKNOWN";
  whatsapp?: string | null;
  instagram?: string | null;
};

export function buildLeadOpportunity(facts: LeadFacts) {
  const business = facts.businessName || facts.name || "O negócio";
  const location = [facts.city, facts.state].filter(Boolean).join(", ");
  const need = facts.websiteStatus === "NO_WEBSITE"
    ? "Pode se beneficiar de uma presença digital própria."
    : facts.websiteStatus === "NEEDS_IMPROVEMENT"
      ? "Pode existir espaço para melhorar a experiência e a conversão do site atual."
      : "Não há evidência suficiente para indicar uma necessidade de site.";
  return {
    businessSummary: `${business}${facts.niche ? ` atua no segmento ${facts.niche}` : ""}${location ? ` em ${location}` : ""}.`,
    possibleNeed: need,
    recommendedService: facts.websiteStatus === "NO_WEBSITE" ? "Site institucional" : facts.websiteStatus === "NEEDS_IMPROVEMENT" ? "Auditoria e redesign" : "Diagnóstico inicial",
    opportunityReason: facts.websiteStatus === "UNKNOWN" ? "Presença digital ainda não verificada." : need,
    sourceFacts: facts,
  };
}

export function buildOutreachMessage(facts: LeadFacts) {
  const greeting = facts.name ? `Olá, ${facts.name}!` : "Olá!";
  const context = facts.businessName ? ` Conheci o trabalho da ${facts.businessName}` : facts.niche ? ` Encontrei seu trabalho na área de ${facts.niche}` : " Encontrei o seu negócio";
  const local = facts.city ? ` em ${facts.city}` : "";
  const observation = facts.websiteStatus === "NO_WEBSITE"
    ? " e não encontrei um site próprio nas informações públicas consultadas."
    : facts.websiteStatus === "NEEDS_IMPROVEMENT"
      ? " e identifiquei alguns pontos que podem melhorar a experiência do site."
      : ".";
  return `${greeting}${context}${local}${observation} Trabalho com criação de experiências web claras e profissionais. Você tem interesse em conversar sobre a presença digital do seu negócio?`;
}
