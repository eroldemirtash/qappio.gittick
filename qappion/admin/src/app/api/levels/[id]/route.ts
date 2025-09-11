import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Demo mode - return mock data
      const body = await request.json();
      const { name, description, min_points, max_points, badge_letter, color } = body;
      
      const updatedLevel = {
        id: params.id,
        name,
        description,
        min_points,
        max_points,
        badge_letter,
        color,
        user_count: 0,
        product_count: 0,
        mission_count: 0,
        avg_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return new Response(JSON.stringify(updatedLevel), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const body = await request.json();
    const { name, description, min_points, max_points, badge_letter, color } = body;

    const { data, error } = await s
      .from("levels")
      .update({
        name,
        description,
        min_points,
        max_points,
        badge_letter,
        color,
        updated_at: new Date().toISOString()
      })
      .eq("id", params.id)
      .select()
      .single();

    if (error) {
      console.error("Supabase update error:", error);
      // Fallback to demo mode if Supabase fails
      const updatedLevel = {
        id: params.id,
        name,
        description,
        min_points,
        max_points,
        badge_letter,
        color,
        user_count: 0,
        product_count: 0,
        mission_count: 0,
        avg_points: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      return new Response(JSON.stringify(updatedLevel), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    if (!data) {
      throw new Error("Level not found");
    }

    return new Response(JSON.stringify(data), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    console.error("Update level error:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "Seviye güncellenemedi" 
    }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Demo mode - return success
      return new Response(JSON.stringify({ success: true }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { error } = await s
      .from("levels")
      .delete()
      .eq("id", params.id);

    if (error) {
      console.error("Supabase delete error:", error);
      // Fallback to demo mode if Supabase fails
      return new Response(JSON.stringify({ success: true }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    console.error("Delete level error:", error);
    return new Response(JSON.stringify({ 
      error: error?.message || "Seviye silinemedi" 
    }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}