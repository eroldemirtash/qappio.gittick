import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;
    const folder = formData.get("folder") as string || "brand-assets";

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Dosya tipi kontrolü
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    // Dosya adını oluştur
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name}`;
    const filePath = `${folder}/${fileName}`;

    // Supabase Storage'a yükle
    const { data, error } = await sbAdmin().storage
      .from("brand-assets")
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (error) {
      console.error("Storage upload error:", error);
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Public URL oluştur
    const { data: urlData } = sbAdmin().storage
      .from("brand-assets")
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath 
    });

  } catch (error: any) {
    console.error("Brand assets upload error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}