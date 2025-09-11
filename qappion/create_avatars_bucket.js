const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAvatarsBucket() {
  try {
    console.log('Creating avatars bucket...');
    
    // Create bucket
    const { data: bucket, error: bucketError } = await supabase.storage.createBucket('avatars', {
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
    });

    if (bucketError) {
      if (bucketError.message.includes('already exists')) {
        console.log('✅ Avatars bucket already exists');
      } else {
        throw bucketError;
      }
    } else {
      console.log('✅ Avatars bucket created successfully');
    }

    // Test bucket access
    const { data: buckets } = await supabase.storage.listBuckets();
    console.log('Available buckets:', buckets.map(b => b.name));

  } catch (error) {
    console.error('❌ Error creating bucket:', error.message);
  }
}

createAvatarsBucket();
