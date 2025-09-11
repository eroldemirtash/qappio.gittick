-- Backfill products.category to valid values before tightening CHECK constraint
update public.products
   set category = 'Elektronik'
 where category is null
    or trim(category) = ''
    or category not in (
      'Elektronik',
      'Ses & Kulaklık',
      'Gaming & Aksesuar',
      'Giyim',
      'Ayakkabı & Çanta',
      'Aksesuar & Takı',
      'Güzellik & Bakım',
      'Spor & Outdoor',
      'Sağlık & Wellness',
      'Ev & Yaşam',
      'Mutfak & Kahve',
      'Hobi & DIY',
      'Kırtasiye & Ofis',
      'Bebek & Çocuk',
      'Evcil Hayvan',
      'Otomotiv',
      'Seyahat & Valiz',
      'Yiyecek & İçecek',
      'Dijital / Kodlar',
      'Sezonluk & Hediyelik'
    );



