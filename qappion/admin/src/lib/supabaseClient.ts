import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Singleton public client to avoid multiple auth instances warning
declare global {
  // eslint-disable-next-line no-var
  var __sb_admin_public__: ReturnType<typeof createClient> | undefined;
}

export const supabase =
  globalThis.__sb_admin_public__ ??
  (globalThis.__sb_admin_public__ = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey: "sb-admin-public-main",
      persistSession: true,
      autoRefreshToken: true,
    },
  }));



