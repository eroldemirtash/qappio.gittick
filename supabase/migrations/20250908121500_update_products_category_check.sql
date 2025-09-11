-- Update products.category allowed values
alter table if exists public.products
  drop constraint if exists products_category_check;

alter table if exists public.products
  add constraint products_category_check
  check (
    category in (
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
    )
  );



