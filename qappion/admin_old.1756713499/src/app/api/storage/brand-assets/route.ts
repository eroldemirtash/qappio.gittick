import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  try {
    const s = sbAdmin();
    const formData = await req.formData();
    const file = formData.get("file") as File;
    const brandId = formData.get("brand_id") as string;
    const kind = formData.get("kind") as string;

    if (!file || !brandId || !kind) {
      return new Response(JSON.stringify({ error: "Missing required fields" }), { status: 400 });
    }

    const fileExt = file.name.split('.').pop();
    const fileName = `${brandId}/${kind}.${fileExt}`;
    
    const { data, error } = await s.storage
      .from("brand-assets")
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error("Storage upload error:", error);
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }

    const { data: { publicUrl } } = s.storage
      .from("brand-assets")
      .getPublicUrl(fileName);

    return new Response(JSON.stringify({ 
      path: data.path, 
      publicUrl 
    }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (err: any) {
    console.error("API error:", err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
}

