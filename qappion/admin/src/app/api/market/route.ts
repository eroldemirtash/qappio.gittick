import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export async function GET() {
  try {
    const { data, error } = await sbAdmin()
      .from("products")
      .select(`
        id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, created_at, category, level, usage_terms,
        brands ( id, name, logo_url ),
        product_images ( url, position ),
        product_marketplaces ( marketplace, url )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase products error:", error);
      return NextResponse.json({ items: [] });
    }

    const items = (data || []).map((p: any) => {
      // Get cover image from product_images (first image by position)
      const coverImage = p.product_images && p.product_images.length > 0 
        ? p.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url
        : null;
      
      return {
        id: p.id,
        name: p.title ?? null,
        description: p.description ?? null,
        price_qp: p.value_qp ?? null,
        stock: p.stock_count ?? null,
        stock_status: p.stock_status ?? 'in_stock',
        brand_id: p.brand_id ?? null,
        is_active: p.is_active ?? true,
        image_url: coverImage,
        cover_url: coverImage,
        brand: p.brands ? { id: (p.brands as any).id, name: (p.brands as any).name, logo_url: (p.brands as any).logo_url } : null,
        created_at: p.created_at,
        category: p.category ?? 'Elektronik',
        level: p.level ?? 1,
        usage_terms: p.usage_terms ?? '',
        marketplace_links: p.product_marketplaces ? p.product_marketplaces.map((mp: any) => ({
          marketplace: mp.marketplace,
          url: mp.url || ''
        })) : [],
      };
    });

    return NextResponse.json({ items });
  } catch (error: any) {
    console.error("API error:", error?.message || error);
    return NextResponse.json({ items: [] });
  }
}

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get('content-type') || '';
    let body: any = {};
    if (contentType.includes('application/json')) {
      body = await request.json();
    } else if (contentType.includes('multipart/form-data')) {
      const form = await request.formData();
      body = Object.fromEntries(form.entries());
      // Normalize numeric fields from strings
      if (body.value_qp !== undefined) body.value_qp = parseInt(String(body.value_qp)) || 0;
      if (body.price_qp !== undefined) body.price_qp = parseInt(String(body.price_qp)) || 0;
      if (body.stock_count !== undefined) body.stock_count = parseInt(String(body.stock_count)) || 0;
      if (body.level !== undefined) body.level = parseInt(String(body.level)) || 1;
      if (body.is_active !== undefined) body.is_active = String(body.is_active) !== 'false';
      // Arrays possibly passed as JSON strings
      try { if (typeof body.gallery === 'string') body.gallery = JSON.parse(body.gallery); } catch {}
      try { if (typeof body.images === 'string') body.images = JSON.parse(body.images); } catch {}
    } else {
      // Fallback: try JSON, then empty body
      try { body = await request.json(); } catch { body = {}; }
    }

    console.log('POST /api/market - Received body:', body);
    const { name, title, description, price_qp, value_qp, stock, brand_id, is_active, gallery, images, category, level, usage_terms, stock_status, stock_count } = body;
    console.log('POST /api/market - Gallery:', gallery);
    console.log('POST /api/market - Images:', images);

    // Validate required fields
    if (!(name || title)) {
      return NextResponse.json({ error: "'title' zorunludur" }, { status: 400 });
    }
    if (!brand_id) {
      return NextResponse.json({ error: "'brand_id' zorunludur" }, { status: 400 });
    }
    
    // Use empty string if description is not provided
    const productDescription = description || "";

    const { data: product, error } = await sbAdmin()
      .from("products")
      .insert({
        title: title || name,
        description: productDescription,
        value_qp: value_qp || price_qp || 0,
        stock_count: stock_count || stock || 0,
        stock_status: stock_status || (stock && stock > 0 ? 'in_stock' : 'out_of_stock'),
        brand_id,
        is_active: is_active !== false,
        category: category || 'Elektronik',
        level: level || 1,
        usage_terms: usage_terms || '',
      })
      .select(`*`)
      .single();

    if (error) {
      console.error("Product create error:", error);
      return NextResponse.json({ 
        error: "Product creation failed", 
        details: error.message,
        code: error.code 
      }, { status: 500 });
    }

    // Save product images to product_images table
    if (product && (gallery || images)) {
      const imageUrls = gallery || images || [];
      console.log('POST /api/market - Saving images to product_images table:', imageUrls);
      if (Array.isArray(imageUrls) && imageUrls.length > 0) {
        try {
          const imageInserts = imageUrls.map((url: string, index: number) => ({
            product_id: product.id,
            url: url,
            position: index
          }));

          console.log('POST /api/market - Image inserts:', imageInserts);

          const { error: imageError } = await sbAdmin()
            .from("product_images")
            .insert(imageInserts);

          if (imageError) {
            console.error("Product images insert error:", imageError);
          } else {
            console.log(`✅ Saved ${imageInserts.length} product images to database`);
          }
        } catch (imageError) {
          console.error("Product images save error:", imageError);
        }
      } else {
        console.log('POST /api/market - No images to save or invalid imageUrls:', imageUrls);
      }
    } else {
      console.log('POST /api/market - No product or no gallery/images:', { product: !!product, gallery, images });
    }

    // If images were saved, fetch images list (non-fatal if fails)
    let finalProduct = product as any;
    let productImages: any[] = [];
    try {
      const { data: imgs } = await sbAdmin()
        .from("product_images")
        .select("url, position")
        .eq("product_id", product.id);
      productImages = imgs || [];
    } catch {}

    const coverFromPosition = [...productImages].sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url || null;
    const mapped = finalProduct ? [{
      id: finalProduct.id,
      name: finalProduct.title,
      description: finalProduct.description,
      price_qp: finalProduct.value_qp,
      stock: finalProduct.stock_count,
      stock_status: finalProduct.stock_status,
      brand_id: finalProduct.brand_id,
      is_active: finalProduct.is_active,
      image_url: coverFromPosition,
      cover_url: coverFromPosition,
      brand: null,
      created_at: finalProduct.created_at,
    }] : [];

    return NextResponse.json({ items: mapped });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, title, description, price_qp, value_qp, stock, brand_id, is_active, gallery, images, category, level, usage_terms, stock_status, stock_count } = body;

    if (!id) {
      return NextResponse.json({ error: "Product ID is required" }, { status: 400 });
    }

    const updateData: any = { updated_at: new Date().toISOString() };

    if (name || title) updateData.title = title || name;
    if (description !== undefined) updateData.description = description;
    if (value_qp !== undefined || price_qp !== undefined) updateData.value_qp = value_qp || price_qp;
    if (stock !== undefined || stock_count !== undefined) {
      updateData.stock_count = stock_count || stock;
      updateData.stock_status = stock_status || (stock > 0 ? 'in_stock' : 'out_of_stock');
    }
    if (brand_id !== undefined) updateData.brand_id = brand_id;
    if (is_active !== undefined) updateData.is_active = is_active;
    if (category !== undefined) updateData.category = category;
    if (level !== undefined) updateData.level = level;
    if (usage_terms !== undefined) updateData.usage_terms = usage_terms;

    const { data: product, error } = await sbAdmin()
      .from("products")
      .update(updateData)
      .eq("id", id)
      .select(`
        id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, created_at,
        brands ( id, name, logo_url ),
        product_images ( url, position )
      `)
      .single();

    if (error) {
      console.error("Product update error:", error);
      return NextResponse.json({ error: "Product update failed" }, { status: 500 });
    }

    // Update product images in product_images table
    if (product && (gallery !== undefined || images !== undefined)) {
      const imageUrls = gallery || images || [];
      if (Array.isArray(imageUrls)) {
        try {
          // First, delete existing images for this product
          await sbAdmin()
            .from("product_images")
            .delete()
            .eq("product_id", id);

          // Then insert new images (only if there are any)
          if (imageUrls.length > 0) {
            const imageInserts = imageUrls.map((url: string, index: number) => ({
              product_id: id,
              url: url,
              position: index
            }));

            const { error: imageError } = await sbAdmin()
              .from("product_images")
              .insert(imageInserts);

            if (imageError) {
              console.error("Product images update error:", imageError);
            } else {
              console.log(`✅ Updated ${imageInserts.length} product images in database`);
            }
          }
        } catch (imageError) {
          console.error("Product images update error:", imageError);
        }
      }
    }

    const mapped = product ? [{
      id: product.id,
      name: product.title,
      description: product.description,
      price_qp: product.value_qp,
      stock: product.stock_count,
      stock_status: product.stock_status,
      brand_id: product.brand_id,
      is_active: product.is_active,
      image_url: product?.product_images && product.product_images.length > 0 
        ? product.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url
        : null,
      cover_url: product?.product_images && product.product_images.length > 0 
        ? product.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url
        : null,
      brand: product.brands ? { id: (product.brands as any).id, name: (product.brands as any).name, logo_url: (product.brands as any).logo_url } : null,
      created_at: product.created_at,
    }] : [];

    return NextResponse.json({ items: mapped });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}