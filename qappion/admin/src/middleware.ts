import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const isApi = request.nextUrl.pathname.startsWith("/api");
  const origin = request.headers.get("origin") || "*";

  // Preflight requests
  if (isApi && request.method === "OPTIONS") {
    const preflight = new NextResponse(null, { status: 204 });
    preflight.headers.set("Access-Control-Allow-Origin", origin);
    preflight.headers.set("Vary", "Origin");
    preflight.headers.set("Access-Control-Allow-Credentials", "true");
    preflight.headers.set(
      "Access-Control-Allow-Headers",
      request.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization"
    );
    preflight.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PATCH,PUT,DELETE,OPTIONS"
    );
    return preflight;
  }

  const response = NextResponse.next();

  // Allow CORS for API routes in development to enable mobile app access
  if (isApi) {
    response.headers.set("Access-Control-Allow-Origin", origin);
    response.headers.set("Vary", "Origin");
    response.headers.set("Access-Control-Allow-Credentials", "true");
    response.headers.set(
      "Access-Control-Allow-Headers",
      request.headers.get("Access-Control-Request-Headers") || "Content-Type, Authorization"
    );
    response.headers.set(
      "Access-Control-Allow-Methods",
      "GET,POST,PATCH,PUT,DELETE,OPTIONS"
    );
  }

  return response;
}

export const config = {
  matcher: ["/api/:path*"],
};


