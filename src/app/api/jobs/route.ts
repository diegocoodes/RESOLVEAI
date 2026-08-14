import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { extractJobFacts } from "@/lib/ai/jobs";
import { analyzeJobWithOpenAI } from "@/lib/ai/openai";
import { jobInputSchema } from "@/lib/validations/job";
import { DuplicateJobError, JobRepository } from "@/repositories/job.repository";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const parsed = jobInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  try {
    const facts = await analyzeJobWithOpenAI(parsed.data.title, parsed.data.description) ?? extractJobFacts(parsed.data.description, parsed.data.title);
    const job = await new JobRepository().create(session.user.id, parsed.data, facts);
    return NextResponse.json(job, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateJobError) return NextResponse.json({ error: error.message, duplicate: true }, { status: 409 });
    console.error("job.create.failed", error);
    return NextResponse.json({ error: "Não foi possível salvar a vaga." }, { status: 500 });
  }
}
