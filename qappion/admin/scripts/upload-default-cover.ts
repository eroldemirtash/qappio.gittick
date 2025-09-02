import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function uploadDefaultCover() {
  try {
    // Bucket oluştur (yoksa)
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    if (listError) {
      console.error('Error listing buckets:', listError);
      return;
    }

    const bucketExists = buckets?.some(bucket => bucket.name === 'mission-covers');
    if (!bucketExists) {
      const { error: createError } = await supabase.storage.createBucket('mission-covers', {
        public: true
      });
      if (createError) {
        console.error('Error creating bucket:', createError);
        return;
      }
      console.log('Created mission-covers bucket');
    }

    // Default cover dosyasını kontrol et
    const defaultCoverPath = path.join(__dirname, '../assets/default-cover.jpg');
    if (!fs.existsSync(defaultCoverPath)) {
      console.log('Default cover file not found, skipping upload');
      return;
    }

    // Dosyayı yükle
    const fileBuffer = fs.readFileSync(defaultCoverPath);
    const { error: uploadError } = await supabase.storage
      .from('mission-covers')
      .upload('default-cover.jpg', fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true
      });

    if (uploadError) {
      console.error('Error uploading default cover:', uploadError);
      return;
    }

    console.log('Default cover uploaded successfully');
    
    // Public URL'i al
    const { data: publicUrl } = supabase.storage
      .from('mission-covers')
      .getPublicUrl('default-cover.jpg');
    
    console.log('Public URL:', publicUrl.publicUrl);

  } catch (error) {
    console.error('Upload error:', error);
  }
}

uploadDefaultCover();
