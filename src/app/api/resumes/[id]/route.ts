import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { ResumeRepository } from "@/repositories/resume.repository";

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const result = await new ResumeRepository().deleteGenerated(session.user.id, id);
  if (!result.count) return NextResponse.json({ error: "Currículo não encontrado." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
