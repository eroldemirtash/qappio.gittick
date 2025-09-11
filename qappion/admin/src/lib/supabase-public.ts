import { createClient } from "@supabase/supabase-js";

declare global {
  // eslint-disable-next-line no-var
  var __sb_admin_sbPublic__: ReturnType<typeof createClient> | undefined;
}

export const sbPublic = () => {
  if (!globalThis.__sb_admin_sbPublic__) {
    globalThis.__sb_admin_sbPublic__ = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { auth: { persistSession: false, storageKey: "sb-admin-public-lite" } }
    );
  }
  return globalThis.__sb_admin_sbPublic__;
};
