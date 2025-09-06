import { NextRequest, NextResponse } from "next/server";
import { sbAdmin } from "@/lib/supabase-admin";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: brandId } = await params;

    // Missions count
    const { count: missionsCount } = await sbAdmin()
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId);

    // Active missions count
    const { count: activeMissionsCount } = await sbAdmin()
      .from('missions')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId)
      .eq('published', true);

    // Users count (mission participations)
    const { data: missionIds } = await sbAdmin()
      .from('missions')
      .select('id')
      .eq('brand_id', brandId);
    
    const missionIdList = missionIds?.map(m => m.id) || [];
    
    const { count: usersCount } = await sbAdmin()
      .from('mission_participations')
      .select('user_id', { count: 'exact', head: true })
      .in('mission_id', missionIdList);

    // Total shares count
    const { count: sharesCount } = await sbAdmin()
      .from('shares')
      .select('*', { count: 'exact', head: true })
      .in('mission_id', missionIdList);

    // Followers count (brand follows)
    const { count: followersCount } = await sbAdmin()
      .from('brand_follows')
      .select('*', { count: 'exact', head: true })
      .eq('brand_id', brandId);

    // Balance (from brand_profiles or calculate from transactions)
    const { data: brandProfile } = await sbAdmin()
      .from('brand_profiles')
      .select('balance')
      .eq('brand_id', brandId)
      .single();

    // Calculate performance metrics
    const sharesPerMission = missionsCount && missionsCount > 0 
      ? Math.round((sharesCount || 0) / missionsCount) 
      : 0;
    
    const missionsPerUser = usersCount && usersCount > 0 
      ? Number(((missionsCount || 0) / usersCount).toFixed(2))
      : 0;

    const averageBalance = brandProfile?.balance || 0;

    const stats = {
      totalMissions: missionsCount || 0,
      activeMissions: activeMissionsCount || 0,
      users: usersCount || 0,
      totalShares: sharesCount || 0,
      followers: followersCount || 0,
      balance: averageBalance,
      performance: {
        sharesPerMission,
        missionsPerUser,
        averageBalance
      }
    };

    return NextResponse.json({ success: true, data: stats });

  } catch (error) {
    console.error('Brand stats error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch brand stats' },
      { status: 500 }
    );
  }
}

