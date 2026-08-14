export type DemoJob = {
  id: string;
  title: string;
  company: string;
  location: string;
  mode: string;
  source: string;
  date: string;
  match: number;
  status: "Analisada" | "Currículo gerado" | "Salva";
  skills: string[];
  missing?: string[];
};

export type DemoLead = {
  id: string;
  name: string;
  business: string;
  segment: string;
  location: string;
  score: number;
  status: string;
  websiteStatus: "Sem site" | "Precisa melhorar" | "Bom site" | "Não verificado";
  whatsapp: boolean;
  instagram: boolean;
  nextFollowUp?: string;
};

export const jobs: DemoJob[] = [
  {
    id: "frontend-pleno-nimbus",
    title: "Frontend Developer Pleno",
    company: "Nimbus Tecnologia",
    location: "Recife, PE",
    mode: "Remoto",
    source: "LinkedIn",
    date: "2026-08-12",
    match: 91,
    status: "Analisada",
    skills: ["React", "TypeScript", "Next.js"],
    missing: ["AWS"],
  },
  {
    id: "fullstack-atlas",
    title: "Desenvolvedor Full Stack",
    company: "Atlas Commerce",
    location: "São Paulo, SP",
    mode: "Híbrido",
    source: "Gupy",
    date: "2026-08-11",
    match: 84,
    status: "Currículo gerado",
    skills: ["Node.js", "React", "PostgreSQL"],
    missing: ["Kubernetes"],
  },
  {
    id: "frontend-jr-pulse",
    title: "Frontend Engineer Jr.",
    company: "Pulse Health",
    location: "Brasil",
    mode: "Remoto",
    source: "Indeed",
    date: "2026-08-10",
    match: 78,
    status: "Salva",
    skills: ["React", "JavaScript", "REST API"],
  },
  {
    id: "react-aurora",
    title: "React Developer",
    company: "Aurora Labs",
    location: "Belo Horizonte, MG",
    mode: "Remoto",
    source: "Manual",
    date: "2026-08-09",
    match: 73,
    status: "Analisada",
    skills: ["React", "Testing Library", "Git"],
  },
  {
    id: "webdev-orbit",
    title: "Web Developer",
    company: "Orbit Studio",
    location: "Recife, PE",
    mode: "Presencial",
    source: "Indicação",
    date: "2026-08-08",
    match: 69,
    status: "Salva",
    skills: ["TypeScript", "CSS", "Figma"],
  },
];

export const leads: DemoLead[] = [
  {
    id: "joao-performance",
    name: "João Henrique",
    business: "João Performance",
    segment: "Personal Trainer",
    location: "Recife, PE",
    score: 92,
    status: "QUALIFIED",
    websiteStatus: "Sem site",
    whatsapp: true,
    instagram: true,
    nextFollowUp: "2026-08-14",
  },
  {
    id: "clinica-vitta",
    name: "Marina Alves",
    business: "Clínica Vitta",
    segment: "Clínica",
    location: "Olinda, PE",
    score: 86,
    status: "CONTACTED",
    websiteStatus: "Precisa melhorar",
    whatsapp: true,
    instagram: true,
    nextFollowUp: "2026-08-13",
  },
  {
    id: "nutri-carla",
    name: "Carla Menezes",
    business: "Nutri Carla Menezes",
    segment: "Nutricionista",
    location: "Recife, PE",
    score: 81,
    status: "ANALYZED",
    websiteStatus: "Sem site",
    whatsapp: true,
    instagram: true,
  },
  {
    id: "studio-move",
    name: "Renata Lima",
    business: "Studio Move",
    segment: "Fisioterapeuta",
    location: "Jaboatão, PE",
    score: 76,
    status: "REPLIED",
    websiteStatus: "Precisa melhorar",
    whatsapp: true,
    instagram: false,
    nextFollowUp: "2026-08-16",
  },
  {
    id: "barbearia-norte",
    name: "Rafael Costa",
    business: "Barbearia Norte",
    segment: "Barbearia",
    location: "Paulista, PE",
    score: 68,
    status: "NEW",
    websiteStatus: "Não verificado",
    whatsapp: true,
    instagram: true,
  },
];

export const employmentEvolution = [
  { month: "Mar", vagas: 7, candidaturas: 2 },
  { month: "Abr", vagas: 10, candidaturas: 4 },
  { month: "Mai", vagas: 9, candidaturas: 5 },
  { month: "Jun", vagas: 14, candidaturas: 7 },
  { month: "Jul", vagas: 18, candidaturas: 9 },
  { month: "Ago", vagas: 22, candidaturas: 12 },
];

export const prospectingEvolution = [
  { month: "Mar", leads: 14, respostas: 2 },
  { month: "Abr", leads: 21, respostas: 4 },
  { month: "Mai", leads: 32, respostas: 6 },
  { month: "Jun", leads: 28, respostas: 8 },
  { month: "Jul", leads: 46, respostas: 11 },
  { month: "Ago", leads: 58, respostas: 15 },
];

export const dashboardStats = {
  jobs: [
    { label: "Novas vagas", value: 22, delta: "+18%" },
    { label: "Match acima de 80%", value: 8, delta: "+3" },
    { label: "Currículos gerados", value: 12, delta: "+5" },
    { label: "Entrevistas", value: 3, delta: "+1" },
  ],
  leads: [
    { label: "Novos leads", value: 58, delta: "+24%" },
    { label: "Qualificados", value: 31, delta: "53%" },
    { label: "Responderam", value: 15, delta: "43%" },
    { label: "Reuniões", value: 5, delta: "+2" },
  ],
};
