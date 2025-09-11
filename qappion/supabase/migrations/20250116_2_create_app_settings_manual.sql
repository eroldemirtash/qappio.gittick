-- Create app_settings table manually
CREATE TABLE IF NOT EXISTS public.app_settings (
  id SERIAL PRIMARY KEY,
  key VARCHAR(255) UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow all operations for service role" ON public.app_settings
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_app_settings_updated_at
  BEFORE UPDATE ON public.app_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- Insert default settings
INSERT INTO public.app_settings (key, value) VALUES
  ('theme', '{"primary": "#2da2ff", "secondary": "#1b8ae6", "dark_mode": false}'),
  ('notifications', '{"email_enabled": true, "push_enabled": true, "sms_enabled": false}'),
  ('login', '{"logo_url": "", "cover_image_url": "", "show_facebook": true, "show_google": true, "show_apple": false, "show_phone": true, "show_manual_signup": true, "terms_url": "", "privacy_url": "", "custom_css": ""}')
ON CONFLICT (key) DO NOTHING;
