import { createClient } from "@supabase/supabase-js";

// Singleton realtime client to avoid multiple GoTrueClient instances
export function createRealtimeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn("Supabase environment variables missing, realtime disabled");
    return null;
  }
  
  // Use distinct storage key to avoid GoTrueClient collision with other clients
  // and keep a single instance per browser context
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const g = globalThis as any;
  if (!g.__sb_admin_realtime__) {
    g.__sb_admin_realtime__ = createClient(url, key, {
      global: { headers: {} },
      auth: { storageKey: "sb-admin-realtime" },
      realtime: {
        params: {
          eventsPerSecond: 10,
        },
      },
    });
  }
  return g.__sb_admin_realtime__;
}
