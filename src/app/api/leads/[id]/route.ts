import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db/prisma";
import { leadEditSchema } from "@/lib/validations/lead";
import { DuplicateLeadError, LeadRepository } from "@/repositories/lead.repository";

const patchSchema = z.object({ doNotContact: z.literal(true) }).strict();

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const lead = await getPrisma().lead.findFirst({ where: { id, userId: session.user.id }, include: { socials: true, audits: true, analyses: true, activities: true, messages: true } });
  if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return new Response(JSON.stringify(lead, null, 2), { headers: { "Content-Type": "application/json", "Content-Disposition": `attachment; filename=lead-${id}.json`, "Cache-Control": "no-store" } });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const body: unknown = await request.json();
  const { id } = await params;
  const privacyAction = patchSchema.safeParse(body);
  if (privacyAction.success) {
    const result = await getPrisma().lead.updateMany({ where: { id, userId: session.user.id }, data: { doNotContact: true, contactAllowed: false, status: "DO_NOT_CONTACT" } });
    if (!result.count) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    await getPrisma().leadActivity.create({ data: { leadId: id, type: "DO_NOT_CONTACT", title: "Lead marcado como não contatar" } });
    return NextResponse.json({ ok: true });
  }

  const parsed = leadEditSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Dados inválidos." }, { status: 400 });
  try {
    const lead = await new LeadRepository().update(session.user.id, id, parsed.data);
    if (!lead) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
    return NextResponse.json(lead);
  } catch (error) {
    if (error instanceof DuplicateLeadError) return NextResponse.json({ error: error.message, duplicate: true }, { status: 409 });
    console.error("lead.update.failed", error);
    return NextResponse.json({ error: "Não foi possível atualizar o lead." }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const result = await getPrisma().lead.deleteMany({ where: { id, userId: session.user.id } });
  if (!result.count) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
