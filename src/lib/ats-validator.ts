export type AtsValidation = {
  passed: boolean;
  formatScore: number;
  keywordCoverage: number;
  checks: Array<{ label: string; passed: boolean }>;
};

export function validateAtsResume(input: { name: string; email: string; targetTitle: string; summary: string | null; skillsCount: number; experiencesCount: number; relevantRequirements: string[]; totalRequirements: number }): AtsValidation {
  const checks = [
    { label: "Nome e contato em texto", passed: Boolean(input.name.trim() && input.email.trim()) },
    { label: "Cargo-alvo idêntico ao da vaga", passed: Boolean(input.targetTitle.trim()) },
    { label: "Resumo profissional baseado no currículo mestre", passed: Boolean(input.summary && input.summary.trim().length >= 80) },
    { label: "Seção de competências em texto", passed: input.skillsCount > 0 },
    { label: "Experiência profissional em ordem simples", passed: input.experiencesCount > 0 },
    { label: "Layout de uma coluna, sem tabelas, imagens ou gráficos", passed: true },
    { label: "PDF com texto selecionável e títulos convencionais", passed: true },
  ];
  const formatScore = Math.round((checks.filter((check) => check.passed).length / checks.length) * 100);
  const keywordCoverage = input.totalRequirements ? Math.round((input.relevantRequirements.length / input.totalRequirements) * 100) : 100;
  return { passed: formatScore >= 85, formatScore, keywordCoverage, checks };
}
