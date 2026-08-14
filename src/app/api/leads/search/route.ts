import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { leadSearchSchema } from "@/lib/validations/lead";
import { GooglePlacesProvider } from "@/services/google-places.provider";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const session = await auth();
  if (!session?.user.id) return NextResponse.json({ error: "Não autorizado." }, { status: 401 });
  const parsed = leadSearchSchema.safeParse(await request.json());
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Busca inválida." }, { status: 400 });
  try {
    const results = await new GooglePlacesProvider().search(parsed.data);
    return NextResponse.json({ results, transient: true, provider: "Google Places API (New)" });
  } catch (error) {
    if (error instanceof Error && error.message === "GOOGLE_PLACES_API_KEY_NOT_CONFIGURED") return NextResponse.json({ error: "Google Places ainda não foi configurado pelo administrador." }, { status: 503 });
    console.error("google-places.search.failed", error);
    return NextResponse.json({ error: "O Google Places não concluiu a busca. Verifique a chave, as restrições e a cobrança do projeto." }, { status: 502 });
  }
}
