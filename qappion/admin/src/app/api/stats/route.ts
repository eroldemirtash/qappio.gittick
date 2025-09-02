import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Return demo data when Supabase is not configured
      return new Response(JSON.stringify({
        total_brands: 12,
        active_missions: 45,
        total_users: 1250,
        total_notifications: 8
      }), {
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    
    // Get stats from database
    const [brandsResult, missionsResult, usersResult, notificationsResult] = await Promise.all([
      s.from("brands").select("id", { count: "exact" }),
      s.from("missions").select("id", { count: "exact" }).eq("published", true),
      s.from("profiles").select("id", { count: "exact" }),
      s.from("notifications").select("id", { count: "exact" })
    ]);

    const stats = {
      total_brands: brandsResult.count || 0,
      active_missions: missionsResult.count || 0,
      total_users: usersResult.count || 0,
      total_notifications: notificationsResult.count || 0
    };

    return new Response(JSON.stringify(stats), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}