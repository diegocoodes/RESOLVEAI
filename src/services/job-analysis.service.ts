import { extractJobFacts } from "@/lib/ai/jobs";

export class JobAnalysisService {
  analyze(input: { title: string; description: string }) {
    return { ...extractJobFacts(input.description, input.title), sourceFacts: input };
  }
}
