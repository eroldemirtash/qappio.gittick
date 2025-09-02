const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Mobile veritabanı (ENV)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function draftExtraMissions() {
  console.log('📝 Fazla görevleri draft yapıyorum...');
  
  // Sadece 2 görev kalacak: "Kral kim" ve "TEST YENİ GÖREV"
  const keepIds = [
    '949b5738-d7ff-4ed5-9c3a-f3a9514ed486', // Kral kim
    '6ae3f24b-7949-4147-9542-e31d7bdbb1b4'  // TEST YENİ GÖREV
  ];
  
  // Diğer tüm published görevleri draft yap
  const { data: allMissions, error: fetchError } = await supabase
    .from('missions')
    .select('id, title, published')
    .eq('published', true);
    
  if (fetchError) {
    console.error('❌ Görevleri çekerken hata:', fetchError);
    return;
  }
  
  const toDraft = allMissions.filter(mission => !keepIds.includes(mission.id));
  
  console.log(`📋 Toplam ${allMissions.length} published görev bulundu`);
  console.log(`📝 ${toDraft.length} görev draft yapılacak:`);
  toDraft.forEach(mission => {
    console.log(`- ${mission.id}: ${mission.title}`);
  });
  
  if (toDraft.length === 0) {
    console.log('✅ Draft yapılacak görev yok');
    return;
  }
  
  // Draft yapma işlemi
  const { error: updateError } = await supabase
    .from('missions')
    .update({ published: false })
    .not('id', 'in', `(${keepIds.map(id => `'${id}'`).join(',')})`);
    
  if (updateError) {
    console.error('❌ Draft yapma işleminde hata:', updateError);
    return;
  }
  
  console.log('✅ Fazla görevler draft yapıldı!');
  
  // Kontrol
  const { data: publishedMissions, error: checkError } = await supabase
    .from('missions')
    .select('id, title, published')
    .eq('published', true);
    
  if (!checkError) {
    console.log(`\n📢 Kalan published görevler (${publishedMissions.length} adet):`);
    publishedMissions.forEach((mission, index) => {
      console.log(`${index + 1}. ${mission.id}: ${mission.title}`);
    });
  }
}

draftExtraMissions().catch(console.error);
