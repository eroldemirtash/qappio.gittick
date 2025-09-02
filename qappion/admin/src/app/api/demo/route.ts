import { sbAdmin } from "@/lib/supabase-admin";

export const runtime="nodejs"; export const dynamic="force-dynamic"; export const revalidate=0;

export async function GET() {
  try {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    // Check if using placeholder values
    if (!url || !key || url.includes('placeholder') || key.includes('placeholder')) {
      return new Response(JSON.stringify({ 
        message: "Demo mode - Supabase configuration missing",
        demo: {
          brands: [
            { id: "1", name: "Nike", is_active: true, created_at: "2024-01-15T10:00:00Z", brand_profiles: { avatar_url: null } },
            { id: "2", name: "Adidas", is_active: true, created_at: "2024-01-16T11:00:00Z", brand_profiles: { avatar_url: null } },
            { id: "3", name: "Puma", is_active: false, created_at: "2024-01-17T12:00:00Z", brand_profiles: { avatar_url: null } }
          ],
          missions: [
            { id: "1", title: "Fotoğraf Çek", description: "Ürün fotoğrafı çek ve paylaş", published: true, is_qappio_of_week: true, brand: { name: "Nike" } },
            { id: "2", title: "Video Çek", description: "Kısa video hazırla", published: false, is_qappio_of_week: false, brand: { name: "Adidas" } }
          ],
          users: [
            { id: "1", full_name: "Ahmet Yılmaz", username: "ahmety", role: "user", avatar_url: null },
            { id: "2", full_name: "Ayşe Demir", username: "aysed", role: "admin", avatar_url: null }
          ],
          notifications: [
            { id: "1", title: "Yeni Görev", message: "Yeni görev eklendi", channel: "push", is_active: true },
            { id: "2", title: "Sistem Güncellemesi", message: "Sistem güncellendi", channel: "email", is_active: false }
          ]
        }
      }), { 
        status: 200,
        headers: { "content-type": "application/json", "cache-control": "no-store" }
      });
    }

    // Real Supabase connection
    const s = sbAdmin();
    return new Response(JSON.stringify({ message: "Real Supabase connection active" }), {
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ 
      error: error.message || "Unknown error"
    }), { 
      status: 200,
      headers: { "content-type": "application/json", "cache-control": "no-store" }
    });
  }
}
