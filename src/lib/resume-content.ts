export type AtsExperience = { id: string; role: string; company: string; location: string | null; description: string; startedAt: string | null; endedAt: string | null; current: boolean };
export type AtsResumeContent = {
  name: string;
  email: string;
  targetTitle: string;
  summary: string | null;
  phone: string | null;
  location: string;
  portfolioUrl: string | null;
  linkedinUrl: string | null;
  githubUrl: string | null;
  skills: Array<{ id: string; name: string; category: string | null }>;
  experiences: AtsExperience[];
  projects: Array<{ id: string; name: string; description: string; url: string | null; repositoryUrl: string | null; technologies: string[] }>;
  education: Array<{ id: string; institution: string; course: string; degree: string | null; startedAt: string | null; endedAt: string | null; description: string | null }>;
  certifications: Array<{ id: string; name: string; issuer: string; issuedAt: string | null }>;
  relevantRequirements: string[];
  missingRequirements: string[];
  generatedBy: "openai" | "deterministic";
};

export function isAtsResumeContent(value: unknown): value is AtsResumeContent {
  if (!value || typeof value !== "object") return false;
  const item = value as Partial<AtsResumeContent>;
  return typeof item.name === "string" && typeof item.targetTitle === "string" && Array.isArray(item.skills) && Array.isArray(item.experiences);
}
