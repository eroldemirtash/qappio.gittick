import { NextRequest, NextResponse } from 'next/server';
import { sbAdmin } from '@/lib/supabase-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params;
    console.log('🔍 Marka ID:', brandId);

    const supabase = sbAdmin();

    // Marka bilgilerini çek
    const { data: brand, error: brandError } = await supabase
      .from('brands')
      .select(`
        id, 
        name, 
        category, 
        is_active, 
        created_at,
        logo_url,
        description,
        brand_profiles(
          avatar_url,
          cover_url,
          email,
          website
        )
      `)
      .eq('id', brandId)
      .single();

    if (brandError || !brand) {
      console.error('Marka bulunamadı:', brandError);
      return NextResponse.json({ error: 'Marka bulunamadı' }, { status: 404 });
    }

    // Görev sayısı
    const { count: missionCount } = await supabase
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId);

    // Takipçi sayısı
    const { count: followerCount } = await supabase
      .from('brand_follows')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId);

    // Ürün sayısı
    const { count: productCount } = await supabase
      .from('products')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId);

    // Toplam paylaşım sayısı (submissions tablosundan)
    const { count: shareCount } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('mission_id', brandId);

    // Kullanıcı sayısı (submissions yapan unique kullanıcılar)
    const { data: uniqueUsers } = await supabase
      .from('submissions')
      .select('user_id')
      .eq('mission_id', brandId);

    const uniqueUserCount = new Set(uniqueUsers?.map(u => u.user_id) || []).size;

    // Bakiye (şimdilik 0)
    const balance = 0;

    // Takipçi listesi
    const { data: followers } = await supabase
      .from('brand_follows')
      .select(`
        id,
        created_at,
        user_id,
        auth.users!brand_follows_user_id_fkey(
          id,
          email,
          user_metadata
        )
      `)
      .eq('brand_id', brandId)
      .order('created_at', { ascending: false });

    // Performans metrikleri
    const stats = {
      total_missions: missionCount || 0,
      total_users: uniqueUserCount,
      total_shares: shareCount || 0,
      total_followers: followerCount || 0,
      balance: balance,
      // Performans özeti
      shares_per_mission: missionCount ? Math.round((shareCount || 0) / missionCount * 100) / 100 : 0,
      missions_per_user: uniqueUserCount ? Math.round((missionCount || 0) / uniqueUserCount * 100) / 100 : 0,
      average_balance: balance,
      // Marka bilgileri
      category: brand.category,
      status: brand.is_active ? 'Aktif' : 'Pasif',
      registration_date: new Date(brand.created_at).toLocaleDateString('tr-TR'),
      // Takipçi listesi
      followers: followers || [],
      // Detaylı marka bilgileri
      brand: {
        id: brand.id,
        name: brand.name,
        logo_url: brand.logo_url,
        category: brand.category,
        is_active: brand.is_active,
        created_at: brand.created_at,
        description: brand.description,
        brand_profiles: brand.brand_profiles
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Marka istatistikleri hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params;
    const { type, data } = await request.json();

    if (type === 'follow') {
      // Takip etme işlemi
      const { user_id, action } = data; // action: 'follow' veya 'unfollow'
      
      const supabase = sbAdmin();

      if (action === 'follow') {
        const { error } = await supabase
          .from('brand_follows')
          .insert({
            brand_id: brandId,
            user_id: user_id
          });
        
        if (error) {
          console.error('Takip etme hatası:', error);
          return NextResponse.json({ error: 'Takip etme hatası' }, { status: 400 });
        }
      } else if (action === 'unfollow') {
        const { error } = await supabase
          .from('brand_follows')
          .delete()
          .eq('brand_id', brandId)
          .eq('user_id', user_id);
        
        if (error) {
          console.error('Takibi bırakma hatası:', error);
          return NextResponse.json({ error: 'Takibi bırakma hatası' }, { status: 400 });
        }
      }

      // Güncel istatistikleri döndür
      return GET(request, { params });
    }

    return NextResponse.json({ error: 'Geçersiz işlem' }, { status: 400 });
  } catch (error) {
    console.error('Marka güncelleme hatası:', error);
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 });
  }
}