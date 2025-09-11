import { NextRequest, NextResponse } from 'next/server';
import { sbAdmin } from '@/lib/supabase-admin';

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const supabase = sbAdmin();

    // Delete product images first
    const { error: imagesError } = await supabase
      .from('product_images')
      .delete()
      .eq('product_id', id);

    if (imagesError) {
      console.error('Error deleting product images:', imagesError);
    }

    // Delete product levels
    const { error: levelsError } = await supabase
      .from('product_levels')
      .delete()
      .eq('product_id', id);

    if (levelsError) {
      console.error('Error deleting product levels:', levelsError);
    }

    // Delete product marketplaces
    const { error: marketplacesError } = await supabase
      .from('product_marketplaces')
      .delete()
      .eq('product_id', id);

    if (marketplacesError) {
      console.error('Error deleting product marketplaces:', marketplacesError);
    }

    // Delete the product
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (productError) {
      console.error('Error deleting product:', productError);
      return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Delete product error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
