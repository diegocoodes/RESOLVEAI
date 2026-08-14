import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { leadSearchSchema } from "@/lib/validations/lead";
import { OpenStreetMapProvider, OpenStreetMapSearchError } from "@/services/openstreetmap.provider";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const parsed = leadSearchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Busca inválida." }, { status: 400 });
  try {
    const results = await new OpenStreetMapProvider().search(parsed.data);
    return NextResponse.json({ results, transient: true, provider: "OpenStreetMap / Nominatim + Overpass" });
  } catch (error) {
    console.error("openstreetmap.search.failed", error);
    if (error instanceof OpenStreetMapSearchError) {
      if (error.code === "LOCATION_NOT_FOUND") return NextResponse.json({ error: "Não encontramos essa localização. Tente informar cidade e UF, por exemplo: Recife - PE." }, { status: 422 });
      if (error.code === "LOCATION_TOO_BROAD") return NextResponse.json({ error: "A localização está muito ampla. Informe uma cidade e a UF para limitar a busca." }, { status: 422 });
    }
    return NextResponse.json({ error: "O OpenStreetMap não concluiu a busca agora. Aguarde um instante e tente novamente." }, { status: 502 });
  }
}
