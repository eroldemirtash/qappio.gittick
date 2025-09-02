const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// ENV'den bağlan
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function checkPublishedMissions() {
  console.log('🔍 Published görevleri kontrol ediyorum...');
  
  // Sadece published görevleri çek
  const { data: publishedMissions, error } = await supabase
    .from('missions')
    .select('id, title, published')
    .eq('published', true)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('❌ Hata:', error);
    return;
  }
  
  console.log(`📢 Published görevler (${publishedMissions.length} adet):`);
  publishedMissions.forEach((mission, index) => {
    console.log(`${index + 1}. ${mission.id}: ${mission.title}`);
  });
}

checkPublishedMissions().catch(console.error);