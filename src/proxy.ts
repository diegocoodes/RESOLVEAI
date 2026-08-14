import { NextResponse, type NextRequest } from "next/server";
import { getServerConfiguration } from "@/lib/server-config";

const PUBLIC_FILES = /\.[^/]+$/;

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (PUBLIC_FILES.test(pathname) || pathname.startsWith("/_next/")) return NextResponse.next();
  if (pathname === "/api/health") return NextResponse.next();

  const configuration = getServerConfiguration();
  if (!configuration.ready && pathname !== "/setup") {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json(
        { error: "SERVER_NOT_CONFIGURED", missing: configuration.missing },
        { status: 503 },
      );
    }
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  if (configuration.ready && pathname === "/setup") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
