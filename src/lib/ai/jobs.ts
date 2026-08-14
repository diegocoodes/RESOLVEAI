const TECHNOLOGIES = [
  "React", "TypeScript", "JavaScript", "Next.js", "Node.js", "PostgreSQL",
  "Docker", "AWS", "REST API", "GraphQL", "Git", "Tailwind CSS", "Figma",
  "Testing Library", "Jest", "Playwright", "Kubernetes",
];

const SOFT_SKILLS = ["comunicação", "colaboração", "proatividade", "autonomia", "organização", "pensamento crítico"];

export type ExtractedJob = {
  technologies: string[];
  hardSkills: string[];
  softSkills: string[];
  seniority: string;
  keywords: string[];
};

export function extractJobFacts(description: string, title: string): ExtractedJob {
  const haystack = `${title} ${description}`.toLowerCase();
  const technologies = TECHNOLOGIES.filter((tech) => haystack.includes(tech.toLowerCase()));
  const softSkills = SOFT_SKILLS.filter((skill) => haystack.includes(skill));
  const seniority = /s[eê]nior|senior/.test(haystack) ? "Sênior" : /pleno/.test(haystack) ? "Pleno" : /j[uú]nior|junior|jr\.?/.test(haystack) ? "Júnior" : "Não informado";
  return {
    technologies,
    hardSkills: technologies,
    softSkills,
    seniority,
    keywords: [...new Set([...technologies, ...softSkills])],
  };
}
