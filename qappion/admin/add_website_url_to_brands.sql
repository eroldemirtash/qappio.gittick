-- Add missing columns to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS website_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS category TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS license_plan TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS license_start TIMESTAMPTZ;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS license_end TIMESTAMPTZ;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS license_fee DECIMAL;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS features JSONB;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS address TEXT;

-- Add missing columns to brand_profiles table
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS cover_url TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS social_instagram TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS social_twitter TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS social_facebook TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS social_linkedin TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS license_plan TEXT;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS license_start TIMESTAMPTZ;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS license_end TIMESTAMPTZ;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS license_fee DECIMAL;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS features JSONB;
ALTER TABLE brand_profiles ADD COLUMN IF NOT EXISTS address TEXT;

-- Update existing brands with data from brand_profiles (only existing columns)
UPDATE brands 
SET 
  website_url = bp.website,
  email = bp.email,
  category = bp.category,
  description = bp.description,
  phone = bp.phone,
  social_instagram = bp.social_instagram,
  social_twitter = bp.social_twitter,
  social_facebook = bp.social_facebook,
  social_linkedin = bp.social_linkedin,
  license_plan = bp.license_plan,
  license_start = bp.license_start,
  license_end = bp.license_end,
  license_fee = bp.license_fee,
  features = bp.features,
  address = bp.address
FROM brand_profiles bp
WHERE brands.id = bp.brand_id
AND (bp.website IS NOT NULL OR bp.email IS NOT NULL OR bp.category IS NOT NULL OR bp.description IS NOT NULL OR bp.phone IS NOT NULL);
