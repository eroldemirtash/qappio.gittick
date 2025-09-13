"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef, Suspense } from "react";
import { jpost, jget } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import MobileBrandPreview from "@/components/brands/MobileBrandPreview";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { toast } from "sonner";

const Schema = z.object({
  brand_name: z.string().min(2, "En az 2 karakter"),
  display_name: z.string().min(2, "En az 2 karakter"),
  email: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }, "Geçerli email adresi girin"),
  phone: z.string().optional(),
  website: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    // http/https protokolü yoksa ekle
    let url = val;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, "Geçerli URL girin"),
  category: z.string().min(1, "Kategori seçimi zorunlu"),
  license_plan: z.enum(["freemium", "premium", "platinum"]),
  license_start: z.string().min(1, "Başlangıç tarihi zorunlu"),
  license_end: z.string().min(1, "Bitiş tarihi zorunlu"),
  license_fee: z.number().min(0, "Ücret 0'dan büyük olmalı"),
  features: z.object({
    task_creation: z.boolean().default(false),
    user_management: z.boolean().default(false),
    analytics: z.boolean().default(false),
    api_access: z.boolean().default(false),
    priority_support: z.boolean().default(false)
  }),

  address: z.string().optional(),
  description: z.string().optional(),
  social_instagram: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    let url = val;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, "Geçerli URL girin"),
  social_twitter: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    let url = val;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, "Geçerli URL girin"),
  social_facebook: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    let url = val;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, "Geçerli URL girin"),
  social_linkedin: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    let url = val;
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  }, "Geçerli URL girin"),
  logo_url: z.string().optional(),
  avatar_url: z.string().optional(),
  cover_url: z.string().optional()
});

type FormVals = z.infer<typeof Schema>;

interface Brand {
  id: string;
  name: string;
}

export const dynamic = "force-dynamic";

function BrandProfileNewPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  const [forceUpdate, setForceUpdate] = useState(0);
  const [loaded, setLoaded] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger, reset } = useForm<FormVals>({
    resolver: zodResolver(Schema),
    defaultValues: {
      license_plan: "freemium",
      features: {
        task_creation: false,
        user_management: false,
        analytics: false,
        api_access: false,
        priority_support: false
      }
    }
  });

  // Watch form data for preview
  const watchedData = watch();
  const features = watch("features");
  const logoUrl = watch("logo_url");
  const coverUrl = watch("cover_url");
  const logoInputRef = useRef<HTMLInputElement | null>(null);
  const coverInputRef = useRef<HTMLInputElement | null>(null);

  async function handleUpload(file: File, type: "logo" | "cover") {
    console.log('handleUpload called with:', { file, type });
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("brandId", selectedBrandId || "temp-brand");
      form.append("type", type === "logo" ? "avatar" : "cover");
      console.log('Uploading to /api/storage/brand-assets');
      const res = await fetch("/api/storage/brand-assets", { method: "POST", body: form });
      
      // Check if response is JSON
      const contentType = res.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await res.text();
        console.error('Non-JSON response:', { status: res.status, text: text.substring(0, 200) });
        throw new Error(`API returned non-JSON response (${res.status}): ${text.substring(0, 100)}...`);
      }
      
      const json = await res.json();
      console.log('Upload response:', { res, json });
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      
      // Update form state and trigger re-render
      const cacheBustedUrl = `${json.url}?t=${Date.now()}`;
      if (type === "logo") {
        setValue("logo_url", cacheBustedUrl, { shouldValidate: true });
        setValue("avatar_url", cacheBustedUrl, { shouldValidate: true }); // Also update avatar_url
        console.log('Logo URL updated to:', cacheBustedUrl);
      } else {
        setValue("cover_url", cacheBustedUrl, { shouldValidate: true });
        console.log('Cover URL updated to:', cacheBustedUrl);
      }
      
      // Force form re-render to show preview
      await trigger();
      setForceUpdate(prev => prev + 1); // Force component re-render
      toast.success("Görsel yüklendi");
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(e?.message || "Yükleme başarısız");
    }
  }

  // Edit modunu kontrol et
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setIsEditMode(true);
      setSelectedBrandId(editId);
      
      // Mevcut marka ve profil bilgilerini yükle
      const fetchBrandData = async () => {
        try {
          let brandData = await jget(`/api/brands/${editId}`);
          let profileData = await jget(`/api/brands/${editId}/profile`);
          
          console.log("Brand Data:", brandData);
          console.log("Profile Data:", profileData);
          
          // If no profile exists at all, auto-create a minimal one and refetch
          if (brandData?.item && !brandData.item.brand_profiles && !profileData?.item) {
            try {
              await jpost(`/api/brands/${editId}/profile`, { display_name: brandData.item.name });
              // refetch
              brandData = await jget(`/api/brands/${editId}`);
              profileData = await jget(`/api/brands/${editId}/profile`);
            } catch (e) {
              // non-blocking
            }
          }

          if (brandData?.item) {
            const brandName = brandData.item.name || "";
            const profile = brandData.item.brand_profiles || profileData?.item || {};
            reset({
              brand_name: brandName,
              display_name: profile.display_name || brandName || "",
              email: profile.email || "",
              phone: profile.phone || "",
              website: profile.website || "",
              category: profile.category || "",
              license_plan: profile.license_plan || "freemium",
              license_start: profile.license_start || "",
              license_end: profile.license_end || "",
              license_fee: profile.license_fee ?? 0,
              address: profile.address || "",
              description: profile.description || "",
              social_instagram: profile.social_instagram || "",
              social_twitter: profile.social_twitter || "",
              social_facebook: profile.social_facebook || "",
              social_linkedin: profile.social_linkedin || "",
              logo_url: profile.logo_url || profile.avatar_url || "",
              avatar_url: profile.avatar_url || profile.logo_url || "",
              cover_url: profile.cover_url || "",
              features: profile.features || { task_creation:false, user_management:false, analytics:false, api_access:false, priority_support:false },
            });
            setLoaded(true);
          }
        } catch (error) {
          console.error("Error fetching brand data:", error);
          setLoaded(true);
        }
      };
      
      fetchBrandData();
    } else {
      setLoaded(true);
    }
  }, [searchParams, reset]);

  async function onSubmit(v: FormVals) {
    try {
      setIsSubmitting(true);
      let newBrandId: string | null = null;
      // sanitize payload: drop empty strings and nullish
      const sanitize = (obj: Record<string, any>) => {
        const out: Record<string, any> = {};
        for (const [k, val] of Object.entries(obj)) {
          if (val === undefined) continue;
          if (typeof val === "string" && val.trim() === "") continue;
          out[k] = val;
        }
        return out;
      };
      
      if (isEditMode && selectedBrandId) {
        // Güncelleme modu
        await jpost(`/api/brands/${selectedBrandId}/profile`, sanitize({
          display_name: v.display_name,
          category: v.category,
          description: v.description,
          email: v.email,
          phone: v.phone,
          website: v.website,
          address: v.address,
          social_instagram: v.social_instagram,
          social_twitter: v.social_twitter,
          social_facebook: v.social_facebook,
          social_linkedin: v.social_linkedin,
          avatar_url: v.logo_url,
          cover_url: v.cover_url,
          license_plan: v.license_plan,
          license_start: v.license_start,
          license_end: v.license_end,
          license_fee: v.license_fee,
          features: v.features
        }));
        
        toast.success("Marka profili güncellendi");
        router.replace(`/brands?newId=${selectedBrandId}`);
      } else {
        // Yeni oluşturma modu
        const brandResponse = await jpost("/api/brands", {
          name: v.brand_name,
          is_active: true,
        });
        // API yanıtı iki şekilde dönebiliyor: { id, ... } veya { item: { id, ... } }
        const brandId = (brandResponse && (brandResponse.id || brandResponse.item?.id));
        if (!brandId) {
          throw new Error("Brand oluşturuldu fakat ID alınamadı");
        }
        newBrandId = String(brandId);
        
        await jpost(`/api/brands/${brandId}/profile`, sanitize({
          display_name: v.display_name,
          category: v.category,
          description: v.description,
          email: v.email,
          phone: v.phone,
          website: v.website,
          address: v.address,
          social_instagram: v.social_instagram,
          social_twitter: v.social_twitter,
          social_facebook: v.social_facebook,
          social_linkedin: v.social_linkedin,
          avatar_url: v.logo_url,
          cover_url: v.cover_url,
          license_plan: v.license_plan,
          license_start: v.license_start,
          license_end: v.license_end,
          license_fee: v.license_fee,
          features: v.features
        }));
        
        // Optimistic hint for Brands page to render immediately
        try {
          const tempBrand = {
            id: brandId,
            name: v.brand_name,
            logo_url: v.logo_url || null,
            brand_profiles: {
              display_name: v.display_name,
              category: v.category,
              email: v.email || null,
              phone: v.phone || null,
              website: v.website || null,
              avatar_url: v.logo_url || null,
              license_plan: v.license_plan || "freemium",
            },
            is_active: true,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          } as any;
          // Single item hint
          window.localStorage.setItem("lastCreatedBrand", JSON.stringify(tempBrand));
          // Queue for robustness (multiple creations)
          const qRaw = window.localStorage.getItem("createdBrandsQueue");
          const q = Array.isArray(JSON.parse(qRaw || "null")) ? JSON.parse(qRaw || "[]") : [];
          q.unshift(tempBrand);
          window.localStorage.setItem("createdBrandsQueue", JSON.stringify(q.slice(0, 10)));
        } catch {}

        toast.success("Marka profili oluşturuldu");
        
        // Toast mesajını gösterdikten sonra yönlendir
        if (!isEditMode) {
          // Kısa gecikme ile yönlendir
          setTimeout(() => {
            window.location.href = '/brands';
          }, 1000);
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="mb-6">
        <h1 className="page-title">
          {isEditMode ? "Marka Profili Düzenle" : "Marka Profili Oluştur"}
        </h1>
        <p className="text-slate-600 mt-2">
          {isEditMode 
            ? "Mevcut marka profil bilgilerini düzenleyin." 
            : "Yeni bir marka oluşturun ve detaylı profil bilgilerini ekleyin."
          }
        </p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6">
        {/* Marka Adı */}
        <div>
          <label className="block text-sm font-medium mb-2">Marka Adı *</label>
          <Input
            {...register("brand_name")}
            placeholder="Marka adını girin"
            className={errors.brand_name ? "border-rose-500" : ""}
            readOnly={isEditMode}
          />
          {errors.brand_name && <p className="text-sm text-rose-600 mt-1">{errors.brand_name.message}</p>}
        </div>

        {/* Temel Bilgiler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Görünen İsim *</label>
            <Input
              {...register("display_name")}
              placeholder="Görünen isim"
              className={errors.display_name ? "border-rose-500" : ""}
            />
            {errors.display_name && <p className="text-sm text-rose-600 mt-1">{errors.display_name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">E-posta *</label>
            <Input
              {...register("email")}
              type="email"
              placeholder="email@example.com"
              className={errors.email ? "border-rose-500" : ""}
            />
            {errors.email && <p className="text-sm text-rose-600 mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <Input
              {...register("phone")}
              placeholder="+90 555 123 45 67"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <Input
              {...register("website")}
              placeholder="https://example.com"
              className={errors.website ? "border-rose-500" : ""}
            />
            {errors.website && <p className="text-sm text-rose-600 mt-1">{errors.website.message}</p>}
          </div>
        </div>

        {/* Kategori ve Lisans */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kategori *</label>
            <Select
              {...register("category")}
              className={errors.category ? "border-rose-500" : ""}
            >
              <option value="">Kategori seçin</option>
              <option value="fashion">Moda</option>
              <option value="tech">Teknoloji</option>
              <option value="food">Yemek</option>
              <option value="sports">Spor</option>
              <option value="beauty">Güzellik</option>
              <option value="automotive">Otomotiv</option>
              <option value="finance">Finans</option>
              <option value="education">Eğitim</option>
              <option value="health">Sağlık</option>
              <option value="entertainment">Eğlence</option>
            </Select>
            {errors.category && <p className="text-sm text-rose-600 mt-1">{errors.category.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lisans Planı *</label>
            <Select
              {...register("license_plan")}
              className={errors.license_plan ? "border-rose-500" : ""}
            >
              <option value="freemium">Freemium</option>
              <option value="premium">Premium</option>
              <option value="platinum">Platinum</option>
            </Select>
            {errors.license_plan && <p className="text-sm text-rose-600 mt-1">{errors.license_plan.message}</p>}
          </div>
        </div>

        {/* Lisans Tarihleri ve Ücret */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lisans Başlangıç *</label>
            <Input
              {...register("license_start")}
              type="date"
              className={errors.license_start ? "border-rose-500" : ""}
            />
            {errors.license_start && <p className="text-sm text-rose-600 mt-1">{errors.license_start.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Lisans Bitiş *</label>
            <Input
              {...register("license_end")}
              type="date"
              className={errors.license_end ? "border-rose-500" : ""}
            />
            {errors.license_end && <p className="text-sm text-rose-600 mt-1">{errors.license_end.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ücret (₺) *</label>
            <Input
              {...register("license_fee", { valueAsNumber: true })}
              type="number"
              min="0"
              step="0.01"
              placeholder="0.00"
              className={errors.license_fee ? "border-rose-500" : ""}
            />
            {errors.license_fee && <p className="text-sm text-rose-600 mt-1">{errors.license_fee.message}</p>}
          </div>
        </div>

        {/* Özellikler */}
        <div>
          <label className="block text-sm font-medium mb-3">Özellikler</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { key: "task_creation", label: "Görev Oluşturma" },
              { key: "user_management", label: "Kullanıcı Yönetimi" },
              { key: "analytics", label: "Analitik" },
              { key: "api_access", label: "API Erişimi" },
              { key: "priority_support", label: "Öncelikli Destek" }
            ].map((feature) => (
              <div key={feature.key} className="flex items-center gap-3">
                <Switch
                  checked={features?.[feature.key as keyof typeof features] || false}
                  onCheckedChange={(checked) => 
                    setValue(`features.${feature.key}` as any, checked)
                  }
                />
                <label className="text-sm font-medium">{feature.label}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Ek Bilgiler */}
        <div>
          <label className="block text-sm font-medium mb-2">Adres</label>
          <Input
            {...register("address")}
            placeholder="İstanbul, Türkiye"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Açıklama</label>
          <textarea
            {...register("description")}
            className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 resize-none"
            placeholder="Marka hakkında kısa açıklama..."
          />
        </div>

        {/* Sosyal Medya */}
        <div>
          <label className="block text-sm font-medium mb-3">Sosyal Medya</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Instagram</label>
              <Input
                {...register("social_instagram")}
                placeholder="https://instagram.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Twitter</label>
              <Input
                {...register("social_twitter")}
                placeholder="https://twitter.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Facebook</label>
              <Input
                {...register("social_facebook")}
                placeholder="https://facebook.com/username"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">LinkedIn</label>
              <Input
                {...register("social_linkedin")}
                placeholder="https://linkedin.com/company/username"
              />
            </div>
          </div>
        </div>

        {/* Logo ve Kapak */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <Input
              {...register("logo_url")}
              placeholder="https://example.com/logo.png"
            />
            <div className="mt-2">
              <input ref={logoInputRef} type="file" accept="image/*" hidden onChange={(e) => {
                console.log('Logo file selected:', e.target.files?.[0]);
                const f = e.target.files?.[0];
                if (f) handleUpload(f, "logo"); 
              }} />
              <Button type="button" variant="outline" onClick={() => {
                console.log('Logo upload button clicked');
                logoInputRef.current?.click();
              }}>PC'den yükle</Button>
              
              {/* Logo Preview */}
              {logoUrl && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">Önizleme:</p>
                  <img 
                    key={`${logoUrl}-${forceUpdate}`}
                    src={`${logoUrl}${logoUrl.includes('?') ? `&t=${Date.now()}` : `?t=${Date.now()}`}`}
                    alt="Logo önizleme" 
                    className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                    onError={(e) => {
                      console.error('Logo preview failed to load:', logoUrl);
                      // Hide broken preview and clear invalid url from form
                      e.currentTarget.style.display = 'none';
                      setValue("logo_url", "");
                      setValue("avatar_url", "");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kapak URL</label>
            <Input
              {...register("cover_url")}
              placeholder="https://example.com/cover.png"
            />
            <div className="mt-2">
              <input ref={coverInputRef} type="file" accept="image/*" hidden onChange={(e) => {
                console.log('Cover file selected:', e.target.files?.[0]);
                const f = e.target.files?.[0];
                if (f) handleUpload(f, "cover"); 
              }} />
              <Button type="button" variant="outline" onClick={() => {
                console.log('Cover upload button clicked');
                coverInputRef.current?.click();
              }}>PC'den yükle</Button>
              
              {/* Cover Preview */}
              {coverUrl && (
                <div className="mt-2">
                  <p className="text-xs text-slate-500 mb-1">Önizleme:</p>
                  <img 
                    key={`${coverUrl}-${forceUpdate}`} // Force re-render when URL changes
                    src={`${coverUrl}?t=${Date.now()}`} // Cache busting
                    alt="Cover önizleme" 
                    className="w-full h-24 object-cover rounded-lg border border-slate-200"
                    onError={(e) => {
                      console.error('Cover preview failed to load:', coverUrl);
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting 
              ? (isEditMode ? "Güncelleniyor..." : "Oluşturuluyor...") 
              : (isEditMode ? "Profili Güncelle" : "Profil Oluştur")
            }
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            İptal
          </Button>
        </div>
      </form>
      
      {/* Mobile Preview */}
      <div className="card p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-2">Mobil Önizleme</h3>
          <p className="text-sm text-slate-600">Marka profilinizin mobil uygulamada nasıl görüneceğini buradan kontrol edebilirsiniz.</p>
        </div>
        <div className="flex justify-center">
          <MobileBrandPreview formData={{
            brand_name: watchedData.brand_name || "",
            display_name: watchedData.display_name || "",
            email: watchedData.email || "",
            phone: watchedData.phone || "",
            website: watchedData.website || "",
            category: watchedData.category || "",
            description: watchedData.description || "",
            social_instagram: watchedData.social_instagram || "",
            social_twitter: watchedData.social_twitter || "",
            social_facebook: watchedData.social_facebook || "",
            social_linkedin: watchedData.social_linkedin || "",
            logo_url: watchedData.logo_url || "",
            cover_url: watchedData.cover_url || "",
            license_plan: watchedData.license_plan || "freemium",
            features: watchedData.features || {
              task_creation: false,
              user_management: false,
              analytics: false,
              api_access: false,
              priority_support: false
            }
          }} />
        </div>
      </div>
    </div>
    </div>
  );
}

export default function BrandProfileNewPage() {
  return (
    <Suspense fallback={<div className="page"><div className="card p-6">Yükleniyor...</div></div>}>
      <BrandProfileNewPageContent />
    </Suspense>
  );
}
