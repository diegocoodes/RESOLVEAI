import { tailorResumeFromFacts, type ResumeFactSet } from "@/lib/ai/resume";

export class ResumeGeneratorService {
  generate(resume: ResumeFactSet, requirements: string[]) {
    return tailorResumeFromFacts(resume, requirements);
  }
}
