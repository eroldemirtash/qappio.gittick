import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function POST(request: NextRequest) {
  const s = sbAdmin();
  const formData = await request.formData();
  const file = formData.get("file") as File;
  const brandId = formData.get("brandId") as string;
  const type = formData.get("type") as string; // "avatar" or "cover"

  if (!file || !brandId || !type) {
    return new Response(JSON.stringify({ error: "Missing required fields" }), { 
      status: 400,
      headers: { "content-type": "application/json" }
    });
  }

  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${brandId}/${type}.${fileExt}`;
    const filePath = fileName; // Remove duplicate brand-assets prefix

    const { error: uploadError } = await s.storage
      .from("brand-assets")
      .upload(filePath, file, { upsert: true });

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = s.storage
      .from("brand-assets")
      .getPublicUrl(filePath);

    return new Response(JSON.stringify({ 
      success: true, 
      url: publicUrl,
      path: filePath 
    }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
