const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mobile veritabanı (ENV + service role key)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function cleanupMobileDbFinal() {
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
  
  console.log(`📋 Toplam ${allMissions.length} görev bulundu`);
  console.log(`🗑️ ${toDelete.length} görev silinecek:`);
  toDelete.forEach(mission => {
    console.log(`- ${mission.id}: ${mission.title}`);
  });
  
  if (toDelete.length === 0) {
    console.log('✅ Silinecek görev yok, veritabanı zaten temiz');
    return;
  }
  
  // Silme işlemi
  const { error: deleteError } = await supabase
    .from('missions')
    .delete()
    .not('id', 'in', `(${keepIds.map(id => `'${id}'`).join(',')})`);
    
  if (deleteError) {
    console.error('❌ Silme işleminde hata:', deleteError);
    return;
  }
  
  console.log('✅ Veritabanı temizlendi!');
  
  // Kontrol
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

cleanupMobileDbFinal().catch(console.error);
