const { createClient } = require('@supabase/supabase-js');

// Mobile uygulamanın kullandığı veritabanı (ENV)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMobileSchema() {
  console.log('🔍 Mobile uygulamanın veritabanı şemasını kontrol ediyorum...');
  
  // Bir görev çek ve kolonları gör
  const { data: sampleMission, error } = await supabase
    .from('missions')
    .select('*')
    .limit(1)
    .single();
    
  if (error) {
    console.error('❌ Hata:', error);
    return;
  }
  
  console.log('📋 Missions tablosu kolonları:');
  Object.keys(sampleMission).forEach(key => {
    console.log(`- ${key}: ${typeof sampleMission[key]} = ${sampleMission[key]}`);
  });
  
  // Published + tarih penceresi görevleri çek (is_active yok)
  const now = new Date().toISOString();
  const { data: publishedMissions, error: pubError } = await supabase
    .from('missions')
    .select('id, title, published, starts_at, ends_at, is_qappio_of_week')
    .eq('published', true)
    .or(`ends_at.is.null,ends_at.gte.${now}`)
    .order('is_qappio_of_week', { ascending: false })
    .order('created_at', { ascending: false });
    
  if (!pubError) {
    console.log(`\n📢 Mobile'a görünmesi gereken görevler (${publishedMissions.length} adet):`);
    publishedMissions.forEach((mission, index) => {
      console.log(`${index + 1}. ${mission.id}: ${mission.title}`);
    });
  }
}

checkMobileSchema().catch(console.error);
