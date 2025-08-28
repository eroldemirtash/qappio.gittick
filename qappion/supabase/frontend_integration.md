# Qappion Frontend Integration Guide

## Supabase Backend MVP Kurulumu

### 1. SQL Editor'da Çalıştır
Supabase Dashboard → SQL Editor → New Query → Backend MVP SQL'ini çalıştır

### 2. Storage Bucket'ları Oluştur
Dashboard → Storage → New Bucket:
- `avatars` (public)
- `submissions` (private)
- `chat` (private)

### 3. Environment Variables

#### Mobile (.env)
```
EXPO_PUBLIC_SUPABASE_URL=https://vjphawsjdfdvkeyysvbb.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

#### Admin (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://vjphawsjdfdvkeyysvbb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

### 4. Frontend Integration

#### Gönderi Oluşturma
```typescript
const { data, error } = await supabase.rpc('fn_submit', {
  p_mission: missionId,
  p_media: [{ path: 'userid/123.jpg', type: 'image' }],
  p_note: note
});
```

#### Beğeni Toggle
```typescript
const { error } = await supabase.rpc('fn_toggle_like', {
  p_submission: submissionId
});
```

#### Ödül Talep Et
```typescript
const { data, error } = await supabase.rpc('fn_redeem_reward', {
  p_reward: rewardId
});
```

#### Bakiye Çekme
```typescript
const { data } = await supabase
  .from('wallet_balances')
  .select('balance')
  .eq('user_id', userId)
  .single();
```

### 5. Hızlı Kontrol Listesi
- ✅ Tüm tablolar ve RLS kuruldu
- ✅ Beğeni/yorum sayaçları ve bildirimler trigger ile otomatik
- ✅ Gönderi onaylanınca puan yüklüyor
- ✅ Ödül redeem atomik; bakiyeyi düşürür, stoğu azaltır, bildirim atar
- ✅ Storage: avatar public; submissions owner veya approved görünür; chat sadece owner
- ✅ Takip: request→accepted; sayaç ve bildirim otomatik