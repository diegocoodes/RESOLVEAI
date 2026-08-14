export type ResumeFactSet = {
  summary?: string | null;
  skills: string[];
  experiences: Array<{ role: string; company: string; description: string }>;
  projects: Array<{ name: string; description: string; technologies: string[] }>;
  education: Array<{ institution: string; course: string }>;
};

export type TailoredResume = ResumeFactSet & {
  relevantSkills: string[];
  missingRequirements: string[];
};

const normalize = (value: string) => value.trim().toLocaleLowerCase("pt-BR");

export function tailorResumeFromFacts(resume: ResumeFactSet, requirements: string[]): TailoredResume {
  const known = new Set([
    ...resume.skills,
    ...resume.projects.flatMap((project) => project.technologies),
  ].map(normalize));
  const relevantSkills = requirements.filter((requirement) => known.has(normalize(requirement)));
  const missingRequirements = requirements.filter((requirement) => !known.has(normalize(requirement)));
  const priority = new Set(relevantSkills.map(normalize));
  return {
    ...resume,
    skills: [...resume.skills].sort((a, b) => Number(priority.has(normalize(b))) - Number(priority.has(normalize(a)))),
    projects: [...resume.projects].sort((a, b) => {
      const aMatches = a.technologies.filter((item) => priority.has(normalize(item))).length;
      const bMatches = b.technologies.filter((item) => priority.has(normalize(item))).length;
      return bMatches - aMatches;
    }),
    relevantSkills,
    missingRequirements,
  };
}
