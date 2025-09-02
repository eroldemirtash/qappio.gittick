import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        theme: {
          primary: "#2da2ff",
          secondary: "#1b8ae6",
          dark_mode: false
        },
        error: "Supabase configuration missing - using default theme"
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { data, error } = await s
      .from("app_settings")
      .select("value")
      .eq("key", "theme")
      .single();

    if (error || !data) {
      return new Response(JSON.stringify({ 
        theme: {
          primary: "#2da2ff",
          secondary: "#1b8ae6",
          dark_mode: false
        }
      }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ theme: data.value }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      theme: {
        primary: "#2da2ff",
        secondary: "#1b8ae6",
        dark_mode: false
      },
      error: error.message || "Unknown error"
    }), { 
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        error: "Supabase configuration missing"
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const body = await request.json();
    const { primary, secondary, dark_mode } = body;

    const themeData = {
      primary: primary || "#2da2ff",
      secondary: secondary || "#1b8ae6",
      dark_mode: dark_mode || false
    };

    const { data, error } = await s
      .from("app_settings")
      .upsert({
        key: "theme",
        value: themeData
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ success: true, theme: data.value }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
