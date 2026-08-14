import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { ResumeGeneratorService } from "@/services/resume-generator.service";

const schema = z.object({ jobId: z.string().min(1) });

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Vaga inválida." }, { status: 400 });
  try {
    return NextResponse.json(await new ResumeGeneratorService().generateForJob(session.user.id, parsed.data.jobId), { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "MASTER_RESUME_NOT_FOUND") return NextResponse.json({ error: "Cadastre o currículo mestre antes de gerar uma versão." }, { status: 409 });
    if (error instanceof Error && error.message === "JOB_NOT_FOUND") return NextResponse.json({ error: "Vaga não encontrada." }, { status: 404 });
    console.error("resume.generate.failed", error);
    return NextResponse.json({ error: "Não foi possível gerar o currículo." }, { status: 500 });
  }
}
