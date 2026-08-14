export type LeadFacts = {
  name?: string | null;
  businessName?: string | null;
  niche?: string | null;
  city?: string | null;
  state?: string | null;
  discoverySource?: "Google" | "Instagram" | null;
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
  const greeting = facts.name ? `Oi, ${facts.name}! Tudo bem? 😊` : "Oi! Tudo bem? 😊";
  const source = facts.discoverySource ? ` pelo ${facts.discoverySource}` : " online";

  return `${greeting}\n\nEncontrei seu trabalho${source} e achei interessante a forma como você apresenta seus serviços.\n\nTrabalho com criação de sites e gosto de ajudar profissionais a organizarem melhor sua presença online, apresentarem seus serviços e facilitarem o contato com novos clientes.\n\nPensei que poderia ser algo interessante para o seu trabalho também. Se fizer sentido para você, podemos conversar um pouquinho sobre a ideia.`;
}
