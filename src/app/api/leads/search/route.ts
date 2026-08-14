import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { leadSearchSchema } from "@/lib/validations/lead";
import { OpenStreetMapProvider } from "@/services/openstreetmap.provider";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const parsed = leadSearchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Busca inválida." }, { status: 400 });
  try {
    const results = await new OpenStreetMapProvider().search(parsed.data);
    return NextResponse.json({ results, transient: true, provider: "OpenStreetMap / Nominatim" });
  } catch (error) {
    console.error("openstreetmap.search.failed", error);
    return NextResponse.json({ error: "O OpenStreetMap não concluiu a busca agora. Aguarde um instante e tente novamente." }, { status: 502 });
  }
}
