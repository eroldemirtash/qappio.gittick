import { createClient } from "@supabase/supabase-js";

export const sbAdmin = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
    throw new Error("Supabase configuration missing or using placeholder values");
  }
  
  return createClient(url, key, { auth: { persistSession: false } });
};
