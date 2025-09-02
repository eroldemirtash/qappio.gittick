const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mobile uygulamanın kullandığı veritabanı (ENV)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkMobileDb() {
  console.log('🔍 Mobile uygulamanın veritabanındaki TÜM görevleri kontrol ediyorum...');
  
  const { data: allMissions, error } = await supabase
    .from('missions')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Hata:', error);
    return;
  }
  
  console.log(`📋 Bulunan görevler (${allMissions.length} adet):`);
  allMissions.forEach((mission, index) => {
    console.log(`${index + 1}. ${mission.id}: ${mission.title} (${mission.published ? 'published' : 'draft'})`);
  });
  
  // Published olanları kontrol et
  const publishedMissions = allMissions.filter(m => m.published);
  console.log(`\n📢 Published görevler (${publishedMissions.length} adet):`);
  publishedMissions.forEach((mission, index) => {
    console.log(`${index + 1}. ${mission.id}: ${mission.title}`);
  });
}

checkMobileDb().catch(console.error);

// Basit bağlantı testi
async function testConnection() {
  const { data, error } = await supabase
    .from("missions")
    .select("id, title")
    .limit(5);

  if (error) {
    console.error("Supabase error:", error.message);
  } else {
    console.log("Missions from Supabase:", data);
  }
}

// İstersen hızlı test için aktif et
// testConnection();
