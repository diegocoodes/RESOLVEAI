import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/db/prisma";
import { getServerConfiguration } from "@/lib/server-config";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const configuration = getServerConfiguration();
  let database: "connected" | "unavailable" | "not_configured" = configuration.databaseConfigured
    ? "unavailable"
    : "not_configured";

  if (configuration.databaseConfigured) {
    try {
      await Promise.race([
        getPrisma().$queryRaw`SELECT 1`,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Database health check timeout")), 5_000)),
      ]);
      database = "connected";
    } catch {
      database = "unavailable";
    }
  }

  const healthy = configuration.ready && database === "connected";
  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      checks: {
        database,
        authSecret: configuration.authSecretConfigured ? "configured" : "not_configured",
        trustedHost: configuration.trustedHostConfigured ? "configured" : "not_configured",
      },
      missing: configuration.missing,
    },
    { status: healthy ? 200 : 503, headers: { "Cache-Control": "no-store" } },
  );
}
