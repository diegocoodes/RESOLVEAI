import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { leadInputSchema } from "@/lib/validations/lead";
import { DuplicateLeadError, LeadRepository } from "@/repositories/lead.repository";
import { WebsiteAuditService } from "@/services/website-audit.service";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const parsed = leadInputSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  try {
    const audit = await new WebsiteAuditService().audit(parsed.data.website);
    const lead = await new LeadRepository().create(session.user.id, parsed.data, audit);
    return NextResponse.json(lead, { status: 201 });
  } catch (error) {
    if (error instanceof DuplicateLeadError) return NextResponse.json({ error: error.message, duplicate: true }, { status: 409 });
    console.error("lead.create.failed", error);
    return NextResponse.json({ error: "Não foi possível salvar o lead." }, { status: 500 });
  }
}
