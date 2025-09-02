import { NextRequest } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  // Sadece development ortamında çalışsın
  if (process.env.NODE_ENV === 'production') {
    return new Response(JSON.stringify({ error: "Migration endpoint disabled in production" }), {
      status: 403,
      headers: { "content-type": "application/json" }
    });
  }

  // Authorization kontrolü
  const authHeader = request.headers.get('authorization');
  const expectedToken = process.env.LOCAL_MIGRATION_SECRET || 'dev-migration-token';
  
  if (authHeader !== `Bearer ${expectedToken}`) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" }
    });
  }

  try {
    const supabase = sbAdmin();
    
    // Migration SQL'ini çalıştır
    const migrationSQL = `
      -- Gerekli kolonlar
      ALTER TABLE public.missions
      ADD COLUMN IF NOT EXISTS cover_url text,
      ADD COLUMN IF NOT EXISTS is_from_panel boolean NOT NULL DEFAULT false,
      ADD COLUMN IF NOT EXISTS is_active boolean NOT NULL DEFAULT true,
      ADD COLUMN IF NOT EXISTS starts_at timestamptz,
      ADD COLUMN IF NOT EXISTS ends_at timestamptz;

      -- RLS aktif ve sadece panel+aktif kayıtlar seçilebilsin
      ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;

      DROP POLICY IF EXISTS missions_select_only_panel_active ON public.missions;
      CREATE POLICY missions_select_only_panel_active
      ON public.missions
      FOR SELECT
      TO anon
      USING (is_from_panel = true AND is_active = true);

      -- Mevcut görevleri panel görevi olarak işaretle
      UPDATE public.missions 
      SET is_from_panel = true 
      WHERE is_from_panel = false;
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration error:', error);
      return new Response(JSON.stringify({ 
        error: "Migration failed", 
        details: error.message,
        instruction: "Please run the SQL manually in Supabase Dashboard → SQL Editor"
      }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Migration completed successfully" 
    }), {
      headers: { "content-type": "application/json" }
    });

  } catch (error: any) {
    console.error('Migration endpoint error:', error);
    return new Response(JSON.stringify({ 
      error: "Migration failed", 
      details: error.message,
      instruction: "Please run the SQL manually in Supabase Dashboard → SQL Editor"
    }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
