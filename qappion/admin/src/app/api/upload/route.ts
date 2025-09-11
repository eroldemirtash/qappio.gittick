import { NextRequest, NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const folder = formData.get('folder') as string || 'uploads';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Check file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = file.name.split('.').pop();
    const fileName = `${timestamp}-${randomString}.${fileExtension}`;
    const filePath = `${folder}/${fileName}`;

    // Convert File to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('product-assets')
      .upload(filePath, uint8Array, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      });

    if (error) {
      console.error('Supabase upload error:', error);
      return NextResponse.json({ error: 'Upload failed: ' + error.message }, { status: 500 });
    }

    // Get public URL
    const { data: urlData } = supabase.storage
      .from('product-assets')
      .getPublicUrl(filePath);

    return NextResponse.json({ 
      url: urlData.publicUrl,
      path: filePath,
      message: 'Upload successful'
    });

  } catch (error) {
    console.error('Upload API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}