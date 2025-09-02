import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
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
    const { is_active, title, message, channel, scheduled_at } = body;

    const updateData: any = {};
    if (is_active !== undefined) updateData.is_active = is_active;
    if (title !== undefined) updateData.title = title;
    if (message !== undefined) updateData.message = message;
    if (channel !== undefined) updateData.channel = channel;
    if (scheduled_at !== undefined) updateData.scheduled_at = scheduled_at;

    const { id } = await params;
    const { data, error } = await s
      .from("notifications")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ success: true, notification: data }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
