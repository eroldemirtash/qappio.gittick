import { sbAdmin } from "@/lib/supabase-admin";
import { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      return new Response(JSON.stringify({ error: "Supabase service key eksik veya geçersiz (placeholder)." }), { status: 500, headers: { "content-type": "application/json" } });
    }

    const s = sbAdmin();
    const body = await req.json();
    const resolvedParams = await params;
    
    // Helpers
    const ensureUrl = (url?: string | null): string | undefined => {
      if (!url) return undefined;
      const v = String(url).trim();
      if (!v) return undefined;
      if (/^https?:\/\//i.test(v)) return v;
      // add protocol, assume https
      return `https://${v}`;
    };
    const handleToUrl = (platform: 'instagram'|'facebook'|'linkedin'|'twitter', handle?: string | null): string | undefined => {
      if (!handle) return undefined;
      const raw = String(handle).trim();
      if (!raw) return undefined;
      if (/^https?:\/\//i.test(raw)) return raw; // already full url
      const h = raw.replace(/^@+/, '');
      const bases: Record<typeof platform, string> = {
        instagram: 'https://instagram.com/',
        facebook: 'https://facebook.com/',
        linkedin: 'https://www.linkedin.com/',
        twitter: 'https://twitter.com/'
      } as const;
      // linkedin kullanıcı/şirket farkı kullanıcıya kalmış; düz ekliyoruz
      return `${bases[platform]}${h}`;
    };

    // Whitelist only columns known to exist in brand_profiles
    const profileDataFull: Record<string, any> = {
      brand_id: resolvedParams.id,
      display_name: body.display_name,
      category: body.category,
      description: body.description,
      email: body.email,
      phone: body.phone,
      website: ensureUrl(body.website),
      avatar_url: body.logo_url || body.avatar_url,
      cover_url: body.cover_url,
      // socials as separate columns (accept handle or full url)
      social_instagram: handleToUrl('instagram', body.social_instagram ?? body.instagram),
      social_twitter: handleToUrl('twitter', body.social_twitter ?? body.twitter),
      social_facebook: handleToUrl('facebook', body.social_facebook ?? body.facebook),
      social_linkedin: handleToUrl('linkedin', body.social_linkedin ?? body.linkedin),
      // license fields
      license_plan: body.license_plan,
      license_start: body.license_start,
      license_end: body.license_end,
      license_fee: body.license_fee,
      // optional json
      features: body.features,
      // keep only minimal, broadly available columns above
    };

    // Strict allowlist for broad compatibility across environments
    const allowedColumns = new Set([
      "brand_id",
      "display_name",
      "category",
      "description",
      "email",
      "phone",
      "website",
      "avatar_url",
      "cover_url",
      "social_instagram",
      "social_twitter",
      "social_facebook",
      "social_linkedin",
      "license_plan",
      "license_start",
      "license_end",
      "license_fee",
      "features",
    ]);
    const profileData: Record<string, any> = {};
    for (const [k, v] of Object.entries(profileDataFull)) {
      if (allowedColumns.has(k) && v !== undefined) profileData[k] = v;
    }
    // Remove undefined to avoid sending nulls unnecessarily
    Object.keys(profileData).forEach((k) => profileData[k] === undefined && delete profileData[k]);

    // Resilient upsert: if a column doesn't exist in this environment, drop it and retry
    let attemptData = { ...profileData } as Record<string, any>;
    let data: any = null;
    let error: any = null;
    for (let i = 0; i < 6; i++) {
      const res = await s
        .from("brand_profiles")
        .upsert(attemptData, { onConflict: 'brand_id' })
        .select()
        .single();
      data = res.data; error = res.error;
      if (!error) break;
      const msg = String(error?.message || "");
      const m = msg.match(/Could not find the '(.*?)' column/i);
      if (m && m[1] && attemptData.hasOwnProperty(m[1])) {
        delete attemptData[m[1]];
        continue;
      }
      break;
    }

    if (!error) {
      // Mirror avatar to brands.logo_url for cards if relation not joined
      if (profileData.avatar_url) {
        await s
          .from("brands")
          .update({ logo_url: profileData.avatar_url })
          .eq("id", profileData.brand_id);
      }
      // Also mirror cover_url to brands.cover_url if provided (profile may not have column)
      const coverUrl = (body as any)?.cover_url as string | undefined;
      if (coverUrl) {
        await s
          .from("brands")
          .update({ cover_url: coverUrl })
          .eq("id", profileData.brand_id);
      }
      // Mirror socials to brands.socials json for mobile read (optional)
      const socialsJson: Record<string, string> = {};
      if (profileData.social_instagram) socialsJson.instagram = profileData.social_instagram;
      if (profileData.social_twitter) socialsJson.twitter = profileData.social_twitter;
      if (profileData.social_facebook) socialsJson.facebook = profileData.social_facebook;
      if (profileData.social_linkedin) socialsJson.linkedin = profileData.social_linkedin;
      const websiteUrl = profileData.website as string | undefined;
      if (Object.keys(socialsJson).length > 0 || websiteUrl) {
        await s
          .from("brands")
          .update({ socials: Object.keys(socialsJson).length ? socialsJson : undefined, website_url: websiteUrl })
          .eq("id", profileData.brand_id);
      }
      
      // Mirror description to brands.description for mobile read
      if (profileData.description) {
        await s
          .from("brands")
          .update({ description: profileData.description })
          .eq("id", profileData.brand_id);
      }
      return new Response(JSON.stringify({ item: data }), {
        headers: { "content-type": "application/json" }
      });
    }

    console.error("BRAND_PROFILE_UPSERT_ERROR:", error?.message || error);
    return new Response(JSON.stringify({ error: String(error?.message || error) }), { status: 500, headers: { "content-type": "application/json" } });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey || supabaseUrl.includes('placeholder') || supabaseKey.includes('placeholder')) {
      const resolvedParams = await params;
      return new Response(JSON.stringify({
        item: {
          brand_id: resolvedParams.id,
          display_name: "Demo Brand",
          category: "teknoloji",
          description: "Demo brand description",
          email: "demo@example.com",
          phone: "+90 555 123 45 67",
          avatar_url: "https://via.placeholder.com/100x100/2da2ff/ffffff?text=DB",
          cover_url: "https://via.placeholder.com/400x200/2da2ff/ffffff?text=Demo+Brand",
          website: "https://demo.example.com",
          social_instagram: "https://instagram.com/demo",
          social_twitter: "https://twitter.com/demo",
          social_facebook: "https://facebook.com/demo",
          social_linkedin: "https://linkedin.com/company/demo",
          license_plan: "premium",
          license_start: new Date().toISOString(),
          license_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          license_fee: 1000,
          features: {
            task_creation: true,
            user_management: true,
            analytics: false,
            api_access: true,
            priority_support: false
          },
          address: "İstanbul, Türkiye"
        }
      }), {
        headers: { "content-type": "application/json" }
      });
    }

    const s = sbAdmin();
    const resolvedParams = await params;

    // helpers to convert full URL to handle (cocacola) for form UX
    const urlToHandle = (platform: 'instagram'|'facebook'|'linkedin'|'twitter', url?: string | null): string => {
      if (!url) return "";
      const raw = String(url).trim();
      if (!raw) return "";
      try {
        // If only handle was stored, just return
        if (!/^https?:\/\//i.test(raw)) return raw.replace(/^@+/, "");
        const u = new URL(raw);
        // take last non-empty path segment as handle
        const segs = u.pathname.split('/').filter(Boolean);
        return (segs.pop() || '').replace(/^@+/, "");
      } catch { return raw.replace(/^@+/, ""); }
    };

    const profileRes = await s
      .from("brand_profiles")
      .select("*")
      .eq("brand_id", resolvedParams.id)
      .maybeSingle();

    const brandsRes = await s
      .from("brands")
      .select("id, name, website_url, socials, logo_url, cover_url")
      .eq("id", resolvedParams.id)
      .maybeSingle();

    const error = profileRes.error || brandsRes.error;
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { "content-type": "application/json" }
      });
    }

    const data = profileRes.data as any;
    const brand = brandsRes.data as any;

    if (!data && !brand) {
      // Fallback: return empty profile data instead of 404 (Stability First)
      console.warn("Brand profile not found for brand_id:", resolvedParams.id);
      const emptyProfile = {
        brand_id: resolvedParams.id,
        display_name: "",
        category: "",
        description: "",
        email: "",
        phone: "",
        avatar_url: null,
        cover_url: null,
        website: brand?.website_url || "",
        social_instagram: urlToHandle('instagram', brand?.socials?.instagram),
        social_twitter: urlToHandle('twitter', brand?.socials?.twitter),
        social_facebook: urlToHandle('facebook', brand?.socials?.facebook),
        social_linkedin: urlToHandle('linkedin', brand?.socials?.linkedin),
        license_plan: "freemium",
        license_start: null,
        license_end: null,
        license_fee: null,
        features: {},
        address: "",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      return new Response(JSON.stringify({ item: emptyProfile }), {
        status: 200,
        headers: { "content-type": "application/json" }
      });
    }

    // Merge: prefer profile table; fallback to brands json
    const item = {
      ...(data || {}),
      brand_id: resolvedParams.id,
      website: (data as any)?.website || brand?.website_url || "",
      social_instagram: (data as any)?.social_instagram || urlToHandle('instagram', brand?.socials?.instagram),
      social_twitter:   (data as any)?.social_twitter   || urlToHandle('twitter', brand?.socials?.twitter),
      social_facebook:  (data as any)?.social_facebook  || urlToHandle('facebook', brand?.socials?.facebook),
      social_linkedin:  (data as any)?.social_linkedin  || urlToHandle('linkedin', brand?.socials?.linkedin),
      avatar_url: (data as any)?.avatar_url || brand?.logo_url || null,
      cover_url:  (data as any)?.cover_url  || brand?.cover_url || null,
    };

    return new Response(JSON.stringify({ item }), {
      headers: { "content-type": "application/json" }
    });

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "content-type": "application/json" }
    });
  }
}