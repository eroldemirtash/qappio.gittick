const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mobile uygulamanın kullandığı veritabanı (ENV)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function cleanupMobileDb() {
  console.log('🧹 Mobile uygulamanın veritabanını temizliyorum...');
  
  // Sadece 2 görev kalacak: "Kral kim" ve "TEST YENİ GÖREV"
  const keepIds = [
    '949b5738-d7ff-4ed5-9c3a-f3a9514ed486', // Kral kim
    '6ae3f24b-7949-4147-9542-e31d7bdbb1b4'  // TEST YENİ GÖREV
  ];
  
  // Diğer tüm görevleri sil
  const { data: allMissions, error: fetchError } = await supabase
    .from('missions')
    .select('id, title');
    
  if (fetchError) {
    console.error('❌ Görevleri çekerken hata:', fetchError);
    return;
  }
  
  const toDelete = allMissions.filter(mission => !keepIds.includes(mission.id));
  console.log(`🗑️  Silinecek görevler (${toDelete.length} adet):`);
  toDelete.forEach(mission => {
    console.log(`- ${mission.id}: ${mission.title}`);
  });
  
  if (toDelete.length > 0) {
    const { error: deleteError } = await supabase
      .from('missions')
      .delete()
      .in('id', toDelete.map(m => m.id));
      
    if (deleteError) {
      console.error('❌ Silme hatası:', deleteError);
    } else {
      console.log('✅ Görevler başarıyla silindi!');
    }
  }
  
  // Son durumu kontrol et
  const { data: remainingMissions, error: checkError } = await supabase
    .from('missions')
    .select('id, title, published');
    
  if (!checkError) {
    console.log(`\n📋 Kalan görevler (${remainingMissions.length} adet):`);
    remainingMissions.forEach((mission, index) => {
      console.log(`${index + 1}. ${mission.id}: ${mission.title} (${mission.published ? 'published' : 'draft'})`);
    });
  }
}

cleanupMobileDb().catch(console.error);
