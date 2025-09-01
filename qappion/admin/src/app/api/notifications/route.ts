import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  try {
    // Check if environment variables are set
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return new Response(JSON.stringify({ 
        items: [],
        error: "Supabase configuration missing - using placeholder data"
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { data, error } = await s
      .from("notifications")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return new Response(JSON.stringify({ 
        items: [],
        error: error.message 
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ items: data || [] }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      items: [],
      error: error.message || "Unknown error"
    }), { 
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function POST(request: NextRequest) {
  const s = sbAdmin();
  const body = await request.json();
  const { title, message, channel, scheduled_at, is_active } = body;

  if (!title || !message || !channel) {
    return new Response(JSON.stringify({ error: "Title, message and channel are required" }), { 
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  try {
    const { data: notification, error } = await s
      .from("notifications")
      .insert({
        title,
        message,
        channel,
        scheduled_at,
        is_active: is_active || false
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, notification }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}