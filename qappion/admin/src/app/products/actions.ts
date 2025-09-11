'use server';

import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';

const BUCKET = process.env.PRODUCT_BUCKET || 'product_media'; // varsayılan bucket adı

async function ensureBucketExists(bucket: string) {
  try {
    const { data: meta } = await supabaseAdmin.storage.getBucket(bucket);
    if (meta) return;
    // create if not exists
    await supabaseAdmin.storage.createBucket(bucket, { public: true });
  } catch (e: any) {
    // Bazı ortamlarda getBucket hata dönebilir; create dene ve var ise yoksay
    await supabaseAdmin.storage.createBucket(bucket, { public: true }).catch(() => {});
  }
}

export async function createOrUpdateProductAction(form: FormData) {
  try {
    const idRaw = form.get('id'); // opsiyonel (düzenleme için)
    const productIdExisting = idRaw ? String(idRaw) : null;

    const brand_id     = String(form.get('brand_id') || '');
    const title        = String(form.get('title') || '');
    const description  = String(form.get('description') || '');
    const usage_terms  = String(form.get('usage_terms') || '');
    const value_qp     = Number(form.get('value_qp') || 0);
    const stock_status = String(form.get('stock_status') || 'in_stock');
    const stock_count  = form.get('stock_count') != null ? Number(form.get('stock_count')) : null;
    const category     = String(form.get('category') || '');
    const level        = Number(form.get('level') || 1);
    const is_active    = form.get('is_active') === 'on' || form.get('is_active') === 'true';

    const levels        = JSON.parse(String(form.get('levels') || '[]')) as string[];
    const marketplaces  = JSON.parse(String(form.get('marketplaces') || '[]')) as any[];

    if (!brand_id || !title) {
      return { ok: false, error: 'brand_id ve title zorunludur' };
    }

    // Ürün insert/update
    let productId = productIdExisting;
    if (!productId) {
      const { data, error } = await supabaseAdmin
        .from('products')
        .insert({
          brand_id, title, description, usage_terms,
          value_qp, stock_status, stock_count,
          category, level,
          is_active,
        })
        .select('id')
        .single();
      if (error) throw new Error(error.message);
      productId = data.id;
    } else {
      const { error } = await supabaseAdmin
        .from('products')
        .update({
          brand_id, title, description, usage_terms,
          value_qp, stock_status, stock_count,
          category, level,
          is_active,
        })
        .eq('id', productId);
      if (error) throw new Error(error.message);
    }

    // Levels replace
    if (Array.isArray(levels)) {
      await supabaseAdmin.from('product_levels').delete().eq('product_id', productId);
      if (levels.length) {
        const rows = levels.map(l => ({ product_id: productId, level: l }));
        const { error } = await supabaseAdmin.from('product_levels').insert(rows);
        if (error) throw new Error(error.message);
      }
    }

    // Marketplaces replace
    if (Array.isArray(marketplaces)) {
      await supabaseAdmin.from('product_marketplaces').delete().eq('product_id', productId);
      if (marketplaces.length) {
        const rows = marketplaces.map((m: any, idx: number) => ({
          product_id: productId,
          marketplace: m.marketplace,
          product_url: m.product_url,
          image_url: m.image_url || null,
          position: idx,
        }));
        const { error } = await supabaseAdmin.from('product_marketplaces').insert(rows);
        if (error) throw new Error(error.message);
      }
    }

    // Görseller: FormData'dan çek
    await ensureBucketExists(BUCKET);
    const coverImage = form.get('cover_image') as File | null;
    const galleryFiles = form.getAll('gallery_images') as unknown as File[];
    console.log('ServerAction cover image:', coverImage?.name);
    console.log('ServerAction gallery images len:', galleryFiles?.length || 0);

    // Sadece yeni görseller varsa eski görselleri temizle (gallery için)
    const hasNewImages = (coverImage && coverImage.size > 0) || (galleryFiles && galleryFiles.length > 0);
    if (hasNewImages) {
      await supabaseAdmin.from('product_images').delete().eq('product_id', productId);
    }

    let position = 0;

    // Ana görsel yükle (position 0)
    if (coverImage && coverImage.size > 0) {
      const buf = Buffer.from(await coverImage.arrayBuffer());
      const ext = (coverImage.name?.split('.').pop() || 'jpg').toLowerCase();
      const key = `${productId}/cover-${randomUUID()}.${ext}`;

      const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(key, buf, {
        contentType: coverImage.type || 'image/jpeg',
        upsert: true,
      });
      if (upErr) throw new Error(`Cover upload failed: ${upErr.message}`);

      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
      const url = pub.publicUrl;

      const { error: imgErr } = await supabaseAdmin.from('product_images').insert({
        product_id: productId,
        url,
        position: position++,
        is_cover: true,
      });
      if (imgErr) throw new Error(imgErr.message);
    }

    // Galeri görselleri yükle (ilk galeri görseli de cover olabilir; ama cover zaten ayrı yüklendi)
    for (let i = 0; i < (galleryFiles?.length || 0); i++) {
      const f = galleryFiles[i];
      if (!f || (f as any).size === 0) continue;

      const buf = Buffer.from(await f.arrayBuffer());
      const ext = (f.name?.split('.').pop() || 'jpg').toLowerCase();
      const key = `${productId}/gallery-${String(i).padStart(2, '0')}-${randomUUID()}.${ext}`;

      const { error: upErr } = await supabaseAdmin.storage.from(BUCKET).upload(key, buf, {
        contentType: f.type || 'image/jpeg',
        upsert: true,
      });
      if (upErr) throw new Error(`Gallery upload failed: ${upErr.message}`);

      const { data: pub } = supabaseAdmin.storage.from(BUCKET).getPublicUrl(key);
      const url = pub.publicUrl;

      const { error: imgErr } = await supabaseAdmin.from('product_images').insert({
        product_id: productId,
        url,
        position: position++,
        is_cover: false,
      });
      if (imgErr) throw new Error(imgErr.message);
    }

    revalidatePath('/market');
    return { ok: true, id: productId };
  } catch (e: any) {
    console.error('createOrUpdateProductAction error:', e?.message || e);
    return { ok: false, error: e?.message || 'Internal error' };
  }
}