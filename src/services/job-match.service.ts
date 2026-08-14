export type MatchEvidence = { requirement: string; level: "MATCHED" | "PARTIAL" | "MISSING"; evidence?: string };

const normalize = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").replace(/[^a-z0-9+#.]/g, "").replace(/\.js/g, "").replace(/apis/g, "api");
const tokens = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("pt-BR").split(/[^a-z0-9+#.]+/).filter((item) => item.length > 2 && !["com", "para", "das", "dos", "uma", "the", "and", "experiencia", "conhecimento"].includes(item));

export class JobMatchService {
  calculate(requirements: string[], profileFacts: Array<{ value: string; evidence: string }>) {
    if (!requirements.length) return { score: 0, items: [] as MatchEvidence[] };
    const facts = profileFacts.map((fact) => ({ ...fact, normalized: normalize(fact.value) }));
    const items: MatchEvidence[] = requirements.map((requirement) => {
      const target = normalize(requirement);
      const exact = facts.find((fact) => fact.normalized === target);
      if (exact) return { requirement, level: "MATCHED" as const, evidence: exact.evidence };
      const partial = facts.find((fact) => fact.normalized.includes(target) || target.includes(fact.normalized));
      if (partial) return { requirement, level: "PARTIAL" as const, evidence: partial.evidence };
      const targetTokens = tokens(requirement);
      const related = facts.find((fact) => {
        if (!targetTokens.length) return false;
        const factTokens = new Set(tokens(fact.value));
        return targetTokens.filter((token) => factTokens.has(token)).length / targetTokens.length >= 0.6;
      });
      if (related) return { requirement, level: "PARTIAL" as const, evidence: related.evidence };
      return { requirement, level: "MISSING" as const };
    });
    const points = items.reduce((sum, item) => sum + (item.level === "MATCHED" ? 1 : item.level === "PARTIAL" ? 0.5 : 0), 0);
    return { score: Math.round((points / requirements.length) * 100), items };
  }
}
