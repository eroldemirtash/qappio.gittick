-- Create profiles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  username TEXT UNIQUE,
  bio TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  gender TEXT CHECK (gender IN ('erkek', 'kadin', 'belirtmek_istemiyorum')),
  avatar_url TEXT,
  socials JSONB DEFAULT '{}',
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'brand_manager', 'editor', 'viewer', 'user')),
  brand_id UUID,
  is_active BOOLEAN NOT NULL DEFAULT true,
  total_qp INTEGER DEFAULT 0,
  spendable_qp INTEGER DEFAULT 0,
  total_missions INTEGER DEFAULT 0,
  completed_missions INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS profiles_username_idx ON public.profiles(username);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_brand_id_idx ON public.profiles(brand_id);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();
