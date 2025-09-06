import { createClient } from "@supabase/supabase-js";

export function sbAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error("Supabase URL missing");
  }

  // Prefer service role key. If missing (local dev misconfig), fall back to anon for read-only.
  const keyToUse = serviceKey || anonKey;
  if (!keyToUse) {
    throw new Error("Supabase keys missing");
  }

  return createClient(url, keyToUse, { auth: { persistSession: false } });
}