"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { jget, jpost } from "@/lib/fetcher";
import { useForm } from "react-hook-form";
import MobileBrandPreview from "@/components/brands/MobileBrandPreview";
import { ImageUploadField } from "@/components/ui/ImageUploadField";

interface Brand {
  id: string;
  name: string;
  logo_url?: string;
  website?: string;
  email?: string;
  phone?: string;
  category?: string;
  description?: string;
  socials?: any;
  cover_url?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  brand_profiles?: any[];
}

type FormVals = {
  brand_name: string;
  display_name: string;
  email: string;
  phone: string;
  website: string;
  category: string;
  license_plan: string;
  license_start: string;
  license_end: string;
  license_fee: number;
  features: {
    task_creation: boolean;
    user_management: boolean;
    analytics: boolean;
    api_access: boolean;
    priority_support: boolean;
  };
  address: string;
  description: string;
  social_instagram: string;
  social_twitter: string;
  social_facebook: string;
  social_linkedin: string;
  logo_url: string;
  avatar_url: string;
  cover_url: string;
};

export default function EditBrandProfilePage() {
  const router = useRouter();
  const params = useParams();
  const brandId = params.id as string;
  
  const [brand, setBrand] = useState<Brand | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loaded, setLoaded] = useState(false);

  const { register, handleSubmit, reset, watch, formState: { errors } } = useForm<FormVals>({
    defaultValues: {
      brand_name: "",
      display_name: "",
      email: "",
      phone: "",
      website: "",
      category: "",
      license_plan: "freemium",
      license_start: "",
      license_end: "",
      license_fee: 0,
      features: {
        task_creation: false,
        user_management: false,
        analytics: false,
        api_access: false,
        priority_support: false
      },
      address: "",
      description: "",
      social_instagram: "",
      social_twitter: "",
      social_facebook: "",
      social_linkedin: "",
      logo_url: "",
      avatar_url: "",
      cover_url: ""
    }
  });

  // Watch form data for preview
  const watchedData = watch();

  useEffect(() => {
    if (brandId) {
      fetchBrandData();
    } else {
      setLoaded(true);
    }
  }, [brandId]);

  const fetchBrandData = async () => {
    try {
      setLoading(true);
      
      let brandData = await jget(`/api/brands/${brandId}`);
      let profileData = await jget(`/api/brands/${brandId}/profile`);
      
      console.log("Brand Data:", brandData);
      console.log("Profile Data:", profileData);
      
      // If no profile exists at all, auto-create a minimal one and refetch
      if (brandData?.item && !brandData.item.brand_profiles && !profileData?.item) {
        try {
          await jpost(`/api/brands/${brandId}/profile`, { display_name: brandData.item.name });
          // refetch
          brandData = await jget(`/api/brands/${brandId}`);
          profileData = await jget(`/api/brands/${brandId}/profile`);
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
    } finally {
      setLoading(false);
    }
  };

  async function onSubmit(v: FormVals) {
    try {
      setIsSubmitting(true);
      
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
      
      // Güncelleme modu
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
      
      toast.success("Marka profili güncellendi");
      
      // Brands sayfasına yönlendir
      setTimeout(() => {
        window.location.href = '/brands';
      }, 1000);
      
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="page">
        <div className="card p-6">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-6"></div>
            <div className="space-y-4">
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
              <div className="h-10 bg-slate-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loaded) {
    return (
      <div className="page">
        <div className="card p-6 text-center">
          <h1 className="text-xl font-semibold text-slate-900 mb-2">Yükleniyor...</h1>
          <p className="text-slate-600">Marka bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Marka Profili Düzenle</h1>
          <p className="text-slate-600 mt-2">Marka bilgilerini güncelleyin ve detaylı profil ayarlarını yapın.</p>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Form */}
          <div className="xl:col-span-2">
            <form onSubmit={handleSubmit(onSubmit)} className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 space-y-8">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-slate-700">Marka Adı *</label>
                <input
                  {...register("brand_name", { required: "Marka adı gereklidir" })}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  placeholder="Marka adını girin"
                />
                {errors.brand_name && <p className="text-red-500 text-sm mt-1">{errors.brand_name.message}</p>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">Görünen İsim *</label>
                  <input
                    {...register("display_name", { required: "Görünen isim gereklidir" })}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="Görünen isim"
                  />
                  {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name.message}</p>}
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700">E-posta *</label>
                  <input
                    {...register("email", { required: "E-posta gereklidir" })}
                    type="email"
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                    placeholder="email@example.com"
                  />
                  {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
                </div>
              </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Telefon</label>
            <input
              {...register("phone")}
              type="tel"
              className="input"
              placeholder="+90 555 123 45 67"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <input
              {...register("website")}
              type="url"
              className="input"
              placeholder="https://example.com"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kategori *</label>
            <select
              {...register("category", { required: "Kategori gereklidir" })}
              className="input"
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
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lisans Planı *</label>
            <select
              {...register("license_plan")}
              className="input"
            >
              <option value="freemium">Freemium</option>
              <option value="premium">Premium</option>
              <option value="platinum">Platinum</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Açıklama</label>
          <textarea
            {...register("description")}
            className="w-full h-24 px-3 py-2 rounded-xl border border-slate-200 resize-none"
            placeholder="Marka hakkında kısa açıklama..."
          />
        </div>

        {/* Logo ve Kapak Fotoğrafı */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Marka Logosu</label>
            <ImageUploadField
              name="logo_url"
              register={register}
              currentValue={watchedData.logo_url}
              onImageChange={(url) => {
                // Form değerini güncelle
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                  const logoInput = form.querySelector('input[name="logo_url"]') as HTMLInputElement;
                  if (logoInput) {
                    logoInput.value = url;
                  }
                }
              }}
              placeholder="Logo yüklemek için tıklayın"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kapak Fotoğrafı</label>
            <ImageUploadField
              name="cover_url"
              register={register}
              currentValue={watchedData.cover_url}
              onImageChange={(url) => {
                // Form değerini güncelle
                const form = document.querySelector('form') as HTMLFormElement;
                if (form) {
                  const coverInput = form.querySelector('input[name="cover_url"]') as HTMLInputElement;
                  if (coverInput) {
                    coverInput.value = url;
                    coverInput.dispatchEvent(new Event('input', { bubbles: true }));
                  }
                }
              }}
              placeholder="Kapak fotoğrafı yüklemek için tıklayın"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lisans Başlangıç</label>
            <input
              {...register("license_start")}
              type="date"
              className="input"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Lisans Bitiş</label>
            <input
              {...register("license_end")}
              type="date"
              className="input"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Lisans Ücreti (₺)</label>
            <input
              {...register("license_fee", { valueAsNumber: true })}
              type="number"
              className="input"
              placeholder="0.00"
              step="0.01"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Adres</label>
            <input
              {...register("address")}
              type="text"
              className="input"
              placeholder="Marka adresi"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Sosyal Medya</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-slate-600 mb-1">Instagram</label>
              <input
                {...register("social_instagram")}
                type="text"
                className="input"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Twitter</label>
              <input
                {...register("social_twitter")}
                type="text"
                className="input"
                placeholder="@username"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">Facebook</label>
              <input
                {...register("social_facebook")}
                type="text"
                className="input"
                placeholder="facebook.com/username"
              />
            </div>
            <div>
              <label className="block text-xs text-slate-600 mb-1">LinkedIn</label>
              <input
                {...register("social_linkedin")}
                type="text"
                className="input"
                placeholder="linkedin.com/in/username"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Özellikler</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <label className="flex items-center space-x-2">
              <input
                {...register("features.task_creation")}
                type="checkbox"
                className="rounded border-slate-300"
              />
              <span className="text-sm">Görev Oluşturma</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                {...register("features.user_management")}
                type="checkbox"
                className="rounded border-slate-300"
              />
              <span className="text-sm">Kullanıcı Yönetimi</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                {...register("features.analytics")}
                type="checkbox"
                className="rounded border-slate-300"
              />
              <span className="text-sm">Analitik</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                {...register("features.api_access")}
                type="checkbox"
                className="rounded border-slate-300"
              />
              <span className="text-sm">API Erişimi</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                {...register("features.priority_support")}
                type="checkbox"
                className="rounded border-slate-300"
              />
              <span className="text-sm">Öncelikli Destek</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Logo URL</label>
            <input
              {...register("logo_url")}
              type="url"
              className="input"
              placeholder="https://example.com/logo.png"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Kapak URL</label>
            <input
              {...register("cover_url")}
              type="url"
              className="input"
              placeholder="https://example.com/cover.png"
            />
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="btn btn-primary flex-1"
          >
            {isSubmitting ? "Güncelleniyor..." : "Profili Güncelle"}
          </button>
          <button
            type="button"
            onClick={() => router.push('/brands')}
            className="btn btn-secondary"
          >
            İptal
          </button>
        </div>
      </form>
          </div>
      
          {/* Mobile Preview */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 sticky top-8">
              <div className="mb-6">
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
            },
            address: watchedData.address || ""
          }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}