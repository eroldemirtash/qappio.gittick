// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";

export const runtime = "nodejs";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  try {
    // ENV şart: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (Prod/Preview'da da)
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get: (name: string) => req.cookies.get(name)?.value,
          set: (name: string, value: string, options: any) => {
            res.cookies.set(name, value, options);
          },
          remove: (name: string, options: any) => {
            res.cookies.set(name, '', { ...options, maxAge: 0 });
          },
        },
      }
    );
    await supabase.auth.getSession(); // token refresh
  } catch (e) {
    console.error("middleware error:", e);
    // PRODUCTION'DA ASLA throw etme
  }
  return res;
}

// Sadece gerekli path'lerde çalışsın, statikleri ve health'i es geç:
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
