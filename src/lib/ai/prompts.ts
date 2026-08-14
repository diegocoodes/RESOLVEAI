export const EVIDENCE_ONLY_RULES = `
REGRAS OBRIGATÓRIAS:
- Use exclusivamente os fatos fornecidos na entrada.
- Não invente competências, experiências, métricas, clientes, resultados ou contexto.
- Quando não houver evidência, retorne explicitamente "Não informado".
- Preserve uma lista dos fatos usados para auditoria.
`;

export const jobAnalysisPrompt = `${EVIDENCE_ONLY_RULES}
Extraia cargo, senioridade, tecnologias, hard skills, soft skills, experiência,
formação, idiomas, responsabilidades, diferenciais e palavras-chave da vaga.`;

export const resumeGenerationPrompt = `${EVIDENCE_ONLY_RULES}
Reorganize o currículo mestre para a vaga. Você pode priorizar fatos e melhorar a
redação, mas não pode introduzir um único fato ausente no currículo mestre.`;

export const leadAnalysisPrompt = `${EVIDENCE_ONLY_RULES}
Analise a oportunidade comercial e produza resumo, necessidade possível, serviço
recomendado, motivo e abordagem. Trate hipóteses como hipóteses.`;

export const outreachPrompt = `${EVIDENCE_ONLY_RULES}
Crie uma mensagem curta, específica e respeitosa. Não afirme ter auditado algo
que não foi verificado e nunca prometa resultados garantidos.`;
