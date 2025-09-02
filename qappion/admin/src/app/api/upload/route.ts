import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(request: NextRequest) {
  try {
    const { bucket, fileName, fileBase64 } = await request.json();

    if (!bucket || !fileName || !fileBase64) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    if (!["brands", "missions"].includes(bucket)) {
      return new Response(JSON.stringify({ error: "Invalid bucket" }), {
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    // Check if Supabase is configured
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      // Return demo URL when Supabase is not configured
      return new Response(JSON.stringify({ 
        url: `https://via.placeholder.com/400x300/2da2ff/ffffff?text=${fileName}` 
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    const s = sbAdmin();
    
    // Decode base64
    const base64Data = fileBase64.replace(/^data:image\/[a-z]+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');
    
    // Upload to Supabase Storage
    const { data, error } = await s.storage
      .from(bucket)
      .upload(fileName, buffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (error) {
      throw error;
    }

    // Get public URL
    const { data: { publicUrl } } = s.storage
      .from(bucket)
      .getPublicUrl(fileName);

    return new Response(JSON.stringify({ url: publicUrl }), {
      headers: { "content-type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}
