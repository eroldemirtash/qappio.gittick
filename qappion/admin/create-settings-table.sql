-- Create settings table for storing landing page configuration
CREATE TABLE IF NOT EXISTS settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow read access to settings" ON settings
  FOR SELECT USING (true);

CREATE POLICY "Allow insert access to settings" ON settings
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow update access to settings" ON settings
  FOR UPDATE USING (true);

-- Grant permissions
GRANT SELECT, INSERT, UPDATE ON settings TO anon, authenticated;

-- Create function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger
CREATE TRIGGER update_settings_updated_at 
  BEFORE UPDATE ON settings 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();
