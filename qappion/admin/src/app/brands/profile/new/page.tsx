"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { jpost, jget } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
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
  cover_url: z.string().optional()
});

type FormVals = z.infer<typeof Schema>;

interface Brand {
  id: string;
  name: string;
}

export const dynamic = "force-dynamic";

export default function BrandProfileNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [selectedBrandId, setSelectedBrandId] = useState<string | null>(null);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormVals>({
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

  const features = watch("features");
  const logoUrl = watch("logo_url");
  const coverUrl = watch("cover_url");

  // Edit modunu kontrol et
  useEffect(() => {
    const editId = searchParams.get("edit");
    if (editId) {
      setIsEditMode(true);
      setSelectedBrandId(editId);
      
      // Mevcut marka ve profil bilgilerini yükle
      const fetchBrandData = async () => {
        try {
          const brandData = await jget(`/api/brands/${editId}`);
          const profileData = await jget(`/api/brands/${editId}/profile`);
          
          console.log("Brand Data:", brandData);
          console.log("Profile Data:", profileData);
          
          if (brandData?.item) {
            setValue("brand_name", brandData.item.name);
            
            // Brand data'dan gelen profile bilgilerini de kullan
            if (brandData.item.brand_profiles) {
              const profile = brandData.item.brand_profiles;
              console.log("Brand profile from brands API:", profile);
              setValue("display_name", profile.display_name || "");
              setValue("email", profile.email || "");
              setValue("phone", profile.phone || "");
              setValue("website", profile.website || "");
              setValue("category", profile.category || "");
              setValue("license_plan", profile.license_plan || "freemium");
              setValue("license_start", profile.license_start || "");
              setValue("license_end", profile.license_end || "");
              setValue("license_fee", profile.license_fee || 0);

              setValue("address", profile.address || "");
              setValue("description", profile.description || "");
              setValue("social_instagram", profile.social_instagram || "");
              setValue("social_twitter", profile.social_twitter || "");
              setValue("social_facebook", profile.social_facebook || "");
              setValue("social_linkedin", profile.social_linkedin || "");
              setValue("logo_url", profile.avatar_url || "");
              setValue("cover_url", profile.cover_url || "");
              
              if (profile.features) {
                setValue("features", profile.features);
              }
            }
          }
          
          // Eğer brands API'de profile yoksa, ayrı profile API'yi kullan
          if (profileData?.item && !brandData?.item?.brand_profiles) {
            const profile = profileData.item;
            console.log("Profile item from profile API:", profile);
            setValue("display_name", profile.display_name || "");
            setValue("email", profile.email || "");
            setValue("phone", profile.phone || "");
            setValue("website", profile.website || "");
            setValue("category", profile.category || "");
            setValue("license_plan", profile.license_plan || "freemium");
            setValue("license_start", profile.license_start || "");
            setValue("license_end", profile.license_end || "");
            setValue("license_fee", profile.license_fee || 0);

            setValue("address", profile.address || "");
            setValue("description", profile.description || "");
            setValue("social_instagram", profile.social_instagram || "");
            setValue("social_twitter", profile.social_twitter || "");
            setValue("social_facebook", profile.social_facebook || "");
            setValue("social_linkedin", profile.social_linkedin || "");
            setValue("logo_url", profile.avatar_url || "");
            setValue("cover_url", profile.cover_url || "");
            
            if (profile.features) {
              setValue("features", profile.features);
            }
          }
        } catch (error) {
          console.error("Error fetching brand data:", error);
        }
      };
      
      fetchBrandData();
    }
  }, [searchParams, setValue]);

  async function onSubmit(v: FormVals) {
    try {
      setIsSubmitting(true);
      
      if (isEditMode && selectedBrandId) {
        // Güncelleme modu
        await jpost(`/api/brands/${selectedBrandId}/profile`, {
          display_name: v.display_name,
          category: v.category,
          description: v.description,
          email: v.email,
          phone: v.phone,
          website: v.website,
          avatar_url: v.logo_url,
          cover_url: v.cover_url,
          license_plan: v.license_plan,
          license_start: v.license_start,
          license_end: v.license_end,
          license_fee: v.license_fee,
          features: v.features
        });
        
        toast.success("Marka profili güncellendi");
      } else {
        // Yeni oluşturma modu
        const brandResponse = await jpost("/api/brands", { 
          name: v.brand_name, 
          is_active: true 
        });
        const brandId = brandResponse.item.id;
        
        await jpost(`/api/brands/${brandId}/profile`, {
          display_name: v.display_name,
          category: v.category,
          description: v.description,
          email: v.email,
          phone: v.phone,
          website: v.website,
          avatar_url: v.logo_url,
          cover_url: v.cover_url,
          license_plan: v.license_plan,
          license_start: v.license_start,
          license_end: v.license_end,
          license_fee: v.license_fee,
          features: v.features
        });
        
        toast.success("Marka profili oluşturuldu");
      }
      
      router.push("/brands");
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
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6 max-w-2xl">
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
            {logoUrl && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Önizleme:</p>
                <img 
                  src={logoUrl} 
                  alt="Logo önizleme" 
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kapak URL</label>
            <Input
              {...register("cover_url")}
              placeholder="https://example.com/cover.png"
            />
            {coverUrl && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Önizleme:</p>
                <img 
                  src={coverUrl} 
                  alt="Cover önizleme" 
                  className="w-full h-24 object-cover rounded-lg border border-slate-200"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
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
    </div>
  );
}
