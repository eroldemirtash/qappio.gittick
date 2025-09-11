import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🔍 Product detail API called with id:', id);
    
    const { data, error } = await sbAdmin()
      .from("products")
      .select(`
        id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, created_at, category, level, usage_terms,
        brands ( 
          id, name, logo_url,
          brand_profiles ( website, email, avatar_url )
        ),
        product_images ( url, position ),
        product_marketplaces ( marketplace, url )
      `)
      .eq("id", id)
      .single();

    console.log('🔍 Supabase response:', { data, error });

    if (error) {
      console.error("Supabase product detail error:", error);
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    if (!data) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Get cover image from product_images (first image by position)
    const coverImage = data.product_images && data.product_images.length > 0 
      ? data.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url
      : null;

    // Get all images sorted by position
    const galleryImages = data.product_images && data.product_images.length > 0
      ? data.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0)).map((img: any) => img.url)
      : [];

    // Transform marketplace links
    const marketplaceLinks = data.product_marketplaces && data.product_marketplaces.length > 0
      ? data.product_marketplaces.map((mp: any, index: number) => ({
          id: index + 1,
          marketplace: mp.marketplace || 'Marketplace',
          product_url: mp.url || '#',
          image_url: '' // Will be resolved by og-image API
        }))
      : [];

    const brand = Array.isArray(data.brands) && data.brands.length > 0 ? data.brands[0] : null;
    const brandProfile = brand?.brand_profiles?.[0] || null;
    
    const item = {
      id: data.id,
      name: data.title || 'Ürün Adı Yok',
      brandName: brand?.name || 'Bilinmeyen Marka',
      brandLogo: brand?.logo_url,
      brandCover: brandProfile?.avatar_url || brand?.logo_url, // Use avatar_url if available
      brandWebsite: brandProfile?.website || '',
      brandEmail: brandProfile?.email || '',
      brandSocials: {}, // Not available in current schema
      stock: data.stock_count || 0,
      price: data.value_qp || 0,
      level: data.level || 1,
      category: data.category || 'Elektronik',
      image: coverImage || 'https://via.placeholder.com/400x400?text=No+Image',
      images: galleryImages.length > 0 ? galleryImages : [coverImage || 'https://via.placeholder.com/400x400?text=No+Image'],
      description: data.description || '',
      features: [], // TODO: Add features field to products table
      marketplace_links: marketplaceLinks,
      product_images: data.product_images || [],
      brand: data.brands,
      usage_terms: data.usage_terms || '',
      is_active: data.is_active,
      created_at: data.created_at,
    };

    return NextResponse.json({ item });
  } catch (error: any) {
    console.error("API error:", error?.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    console.log('🗑️ Delete product API called with id:', id);
    
    // Delete product images first
    const { error: imagesError } = await sbAdmin()
      .from('product_images')
      .delete()
      .eq('product_id', id);
    
    if (imagesError) {
      console.error('Error deleting product images:', imagesError);
    }
    
    // Delete product levels
    const { error: levelsError } = await sbAdmin()
      .from('product_levels')
      .delete()
      .eq('product_id', id);
    
    if (levelsError) {
      console.error('Error deleting product levels:', levelsError);
    }
    
    // Delete product marketplaces
    const { error: marketplacesError } = await sbAdmin()
      .from('product_marketplaces')
      .delete()
      .eq('product_id', id);
    
    if (marketplacesError) {
      console.error('Error deleting product marketplaces:', marketplacesError);
    }
    
    // Delete the product
    const { error: productError } = await sbAdmin()
      .from('products')
      .delete()
      .eq('id', id);
    
    if (productError) {
      console.error('Error deleting product:', productError);
      return NextResponse.json({ error: "Failed to delete product" }, { status: 500 });
    }
    
    console.log('✅ Product deleted successfully:', id);
    return NextResponse.json({ success: true, message: "Product deleted successfully" });
  } catch (error: any) {
    console.error("Delete API error:", error?.message || error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}