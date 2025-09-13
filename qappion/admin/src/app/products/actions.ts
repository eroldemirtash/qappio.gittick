'use server';

import { createClient } from '@supabase/supabase-js';

type ActionResult =
  | { ok: true; id: string; warnings?: string[] }
  | { ok: false; error: string };

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

function sanitizeName(name: string) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

async function uploadToStorage(file: File, path: string) {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const { error } = await supabaseAdmin
    .storage
    .from('product-images')
    .upload(path, buffer, { contentType: file.type || 'application/octet-stream', upsert: true });
  if (error) throw new Error(error.message);
  const { data: pub } = supabaseAdmin.storage.from('product-images').getPublicUrl(path);
  return pub.publicUrl;
}

export async function createOrUpdateProductAction(fd: FormData): Promise<ActionResult> {
  console.time('createOrUpdateProductAction');
  console.log('🔍 Starting product action with form data');
  const warnings: string[] = [];
  let createdId: string | null = null;

  try {
    // --- Form parse ---
    const id = (fd.get('id') as string) || '';
    const brand_id = String(fd.get('brand_id') || '');
    const title = String(fd.get('title') || '');
    const description = String(fd.get('description') || '');
    const usage_terms = String(fd.get('usage_terms') || '');
    const value_qp = Number(fd.get('value_qp') || 0);
    const stock_status = String(fd.get('stock_status') || 'in_stock') as 'in_stock'|'low'|'out_of_stock'|'hidden';
    const stock_count = Number(fd.get('stock_count') || 0);
    const category = String(fd.get('category') || 'Elektronik');
    const level = Number(fd.get('level') || 1);
    const is_active = String(fd.get('is_active') || 'true') === 'true';

    const levels: number[] = JSON.parse(String(fd.get('levels') || '[]'));
    const featuresString = String(fd.get('features') || '');
    const features = featuresString ? featuresString
      .split(',')
      .map(f => f.trim())
      .map(f => f.replace(/^['"\(\)]+|['"\(\)]+$/g, '')) // Başta ve sonda tırnak/parantez temizle
      .map(f => f.trim()) // Tekrar trim
      .filter(f => f.length > 0) : [];
    const marketplaces: { marketplace: string; product_url: string; image_url?: string }[] =
      JSON.parse(String(fd.get('marketplaces') || '[]'));

    const cover_image = (fd.get('cover_image') as File) || null;
    const gallery_images = (fd.getAll('gallery_images') as File[]) || [];

    console.log('🔍 Parsed form data:', {
      id, brand_id, title, description, usage_terms,
      value_qp, stock_status, stock_count, category, level, is_active,
      featuresString, features, marketplaces, 
      hasCoverImage: !!cover_image, galleryImagesCount: gallery_images.length
    });

    if (!brand_id || !title) return { ok: false, error: 'Marka ve ürün adı zorunludur' };

    // --- A) Insert / Update (kritik; hata = hard fail) ---
    console.log('[A] upsert product');
    let productId = id;

    if (productId) {
      console.log('🔍 Updating existing product:', productId);
      const { error } = await supabaseAdmin
        .from('products')
        .update({
          brand_id, title, description, usage_terms,
          value_qp, stock_status, stock_count,
          category, level, is_active, features
        })
        .eq('id', productId);
      if (error) {
        console.error('❌ Update error:', error);
        throw new Error(error.message);
      }
      console.log('✅ Product updated successfully');
    } else {
      console.log('🔍 Creating new product');
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert([{
          brand_id, title, description, usage_terms,
          value_qp, stock_status, stock_count,
          category, level, is_active, features
        }])
        .select('id')
        .single();
      if (error) {
        console.error('❌ Insert error:', error);
        throw new Error(error.message);
      }
      productId = data.id;
      createdId = productId; // rollback için işaretle
      console.log('✅ Product created successfully with ID:', productId);
    }

    // --- B) Cover upload (opsiyonel; hata = warning) ---
    try {
      if (cover_image) {
        console.log('[B] cover upload');
        const coverPath = `products/${productId}/cover_${Date.now()}_${sanitizeName(cover_image.name || 'cover.jpg')}`;
        const coverUrl = await uploadToStorage(cover_image, coverPath);

        const { error: up1 } = await supabaseAdmin
          .from('products')
          .update({ cover_url: coverUrl })
          .eq('id', productId);
        if (up1) throw new Error(up1.message);

        const { error: up2 } = await supabaseAdmin
          .from('product_images')
          .insert([{ product_id: productId, url: coverUrl, position: 0 }]);
        if (up2) throw new Error(up2.message);
      }
    } catch (e: any) {
      console.warn('[B] cover warning:', e?.message || e);
      warnings.push('Ana görsel yüklenemedi');
    }

    // --- C) Gallery upload (opsiyonel; hata = warning) ---
    try {
      if (gallery_images?.length) {
        console.log('[C] gallery upload');
        let order = 1;
        for (const f of gallery_images) {
          const path = `products/${productId}/gallery_${order}_${Date.now()}_${sanitizeName(f.name || `img_${order}.jpg`)}`;
          const url = await uploadToStorage(f, path);
          const { error } = await supabaseAdmin
            .from('product_images')
            .insert([{ product_id: productId, url, position: order }]);
          if (error) throw new Error(error.message);
          order += 1;
        }
      }
    } catch (e: any) {
      console.warn('[C] gallery warning:', e?.message || e);
      warnings.push('Galeri görselleri yüklenemedi');
    }

    // --- D) Marketplaces (tamamen tazele; hata = warning) ---
    try {
      console.log('[D] marketplaces refresh');
      const { error: delMp } = await supabaseAdmin
        .from('product_marketplaces')
        .delete()
        .eq('product_id', productId);
      if (delMp) throw new Error(delMp.message);

      const rows = (marketplaces || [])
        .filter(m => m?.marketplace && m?.product_url)
        .map(m => ({ product_id: productId, marketplace: m.marketplace, product_url: m.product_url, image_url: m.image_url || null }));

      if (rows.length) {
        const { error: insMp } = await supabaseAdmin.from('product_marketplaces').insert(rows);
        if (insMp) throw new Error(insMp.message);
      }
    } catch (e: any) {
      console.warn('[D] marketplaces warning:', e?.message || e);
      warnings.push('Marketplace linkleri kaydedilemedi');
    }

    // --- E) Levels (opsiyonel; hata = warning) ---
    try {
      console.log('[E] levels refresh');
      const { error: delLv } = await supabaseAdmin.from('product_levels').delete().eq('product_id', productId);
      if (delLv) throw new Error(delLv.message);

      if (Array.isArray(levels) && levels.length) {
        const lvRows = levels.map(lv => ({ product_id: productId, level: Number(lv) || 1 }));
        const { error: insLv } = await supabaseAdmin.from('product_levels').insert(lvRows);
        if (insLv) throw new Error(insLv.message);
      }
    } catch (e: any) {
      console.warn('[E] levels warning:', e?.message || e);
      warnings.push('Seviye bilgileri kaydedilemedi');
    }

    console.timeEnd('createOrUpdateProductAction');
    return { ok: true, id: productId, warnings: warnings.length ? warnings : undefined };
  } catch (e: any) {
    console.error('❌ product action hard fail:', e?.message || e);

    // Insert sonrası bir yerde patladıysa ürünü geri al (tamamen başarısız say)
    if (createdId) {
      try {
        await supabaseAdmin.from('products').delete().eq('id', createdId);
      } catch {}
    }

    console.timeEnd('createOrUpdateProductAction');
    return { ok: false, error: e?.message || 'Kaydetme başarısız' };
  }
}