import { createClient } from "@supabase/supabase-js";

export function createRealtimeClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!url || !key) {
    console.warn("Supabase environment variables missing, realtime disabled");
    return null;
  }
  
  return createClient(url, key, {
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
  });
}
