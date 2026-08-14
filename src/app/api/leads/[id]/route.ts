import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { getPrisma } from "@/lib/db/prisma";

const patchSchema = z.object({ doNotContact: z.literal(true) });

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
  const parsed = patchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: "Operação inválida." }, { status: 400 });
  const { id } = await params;
  const result = await getPrisma().lead.updateMany({ where: { id, userId: session.user.id }, data: { doNotContact: true, contactAllowed: false, status: "DO_NOT_CONTACT" } });
  if (!result.count) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  await getPrisma().leadActivity.create({ data: { leadId: id, type: "DO_NOT_CONTACT", title: "Lead marcado como não contatar" } });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const { id } = await params;
  const result = await getPrisma().lead.deleteMany({ where: { id, userId: session.user.id } });
  if (!result.count) return NextResponse.json({ error: "Lead não encontrado." }, { status: 404 });
  return NextResponse.json({ deleted: true });
}
