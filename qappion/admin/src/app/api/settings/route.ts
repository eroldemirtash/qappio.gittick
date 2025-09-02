import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        settings: {
          use_mocks: false,
          theme: {
            primary: "#2da2ff",
            secondary: "#1b8ae6",
            dark_mode: false
          },
          notifications: {
            email_enabled: true,
            push_enabled: true,
            sms_enabled: false
          },
          login: {
            logo_url: "",
            show_facebook: true,
            show_google: true,
            show_apple: false,
            show_phone: true,
            terms_url: "",
            privacy_url: "",
            custom_css: ""
          }
        },
        error: "Supabase configuration missing - using default settings"
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const { data, error } = await s
      .from("app_settings")
      .select("key, value");

    if (error) {
      return new Response(JSON.stringify({ 
        settings: {
          use_mocks: false,
          theme: {
            primary: "#2da2ff",
            secondary: "#1b8ae6",
            dark_mode: false
          },
          notifications: {
            email_enabled: true,
            push_enabled: true,
            sms_enabled: false
          },
          login: {
            logo_url: "",
            show_facebook: true,
            show_google: true,
            show_apple: false,
            show_phone: true,
            terms_url: "",
            privacy_url: "",
            custom_css: ""
          }
        },
        error: error.message 
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const settings = data?.reduce((acc, item) => {
      acc[item.key] = item.value;
      return acc;
    }, {} as any) || {};

    return new Response(JSON.stringify({ settings }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      settings: {
        use_mocks: false,
        theme: {
          primary: "#2da2ff",
          secondary: "#1b8ae6",
          dark_mode: false
        },
        notifications: {
          email_enabled: true,
          push_enabled: true,
          sms_enabled: false
        },
        login: {
          logo_url: "",
          show_facebook: true,
          show_google: true,
          show_apple: false,
          show_phone: true,
          terms_url: "",
          privacy_url: "",
          custom_css: ""
        }
      },
      error: error.message || "Unknown error"
    }), { 
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        error: "Supabase configuration missing"
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    const s = sbAdmin();
    const body = await request.json();
    const { key: settingKey, value } = body;

    if (!settingKey) {
      return new Response(JSON.stringify({ error: "Key is required" }), { 
        status: 400,
        headers: { "content-type": "application/json" }
      });
    }

    const { data, error } = await s
      .from("app_settings")
      .upsert({
        key: settingKey,
        value
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    return new Response(JSON.stringify({ success: true, setting: data }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), { 
      status: 500,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
