export const APP_NAME = "Opportunity OS";

export const JOB_STATUSES = [
  { value: "SAVED", label: "Salva" },
  { value: "ANALYZED", label: "Analisada" },
  { value: "RESUME_GENERATED", label: "Currículo gerado" },
  { value: "APPLIED", label: "Candidatura" },
  { value: "INTERVIEW", label: "Entrevista" },
  { value: "TEST", label: "Teste" },
  { value: "OFFER", label: "Proposta" },
  { value: "HIRED", label: "Contratado" },
] as const;

export const LEAD_STATUSES = [
  { value: "NEW", label: "Novo" },
  { value: "ANALYZED", label: "Analisado" },
  { value: "QUALIFIED", label: "Qualificado" },
  { value: "CONTACTED", label: "Contatado" },
  { value: "REPLIED", label: "Respondeu" },
  { value: "MEETING", label: "Reunião" },
  { value: "PROPOSAL", label: "Proposta" },
  { value: "WON", label: "Fechado" },
  { value: "LOST", label: "Perdido" },
] as const;

export const LEAD_SEGMENTS = [
  "Personal Trainer",
  "Nutricionista",
  "Psicólogo",
  "Fisioterapeuta",
  "Dentista",
  "Advogado",
  "Contador",
  "Corretor",
  "Imobiliária",
  "Barbearia",
  "Salão",
  "Estética",
  "Academia",
  "Clínica",
  "Restaurante",
  "Oficina",
  "Assistência Técnica",
  "Fotógrafo",
] as const;
