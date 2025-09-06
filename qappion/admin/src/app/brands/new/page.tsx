"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { jpost, jget, jpatch } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { toast } from "sonner";

const Schema = z.object({
  brand_id: z.string().optional(),
  name: z.string().min(2, "En az 2 karakter"),
  description: z.string().optional(),
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
  }, "Geçerli bir URL girin"),
  email: z.string().optional().refine((val) => {
    if (!val || val === "") return true;
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }, "Geçerli bir email girin"),
  phone: z.string().optional(),
  category: z.string().optional(),
  logo_url: z.string().optional(),
  cover_url: z.string().optional(),
  is_active: z.boolean().default(true)
});

type FormVals = z.infer<typeof Schema>;

export const dynamic = "force-dynamic";

interface Brand {
  id: string;
  name: string;
}

export default function BrandNewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get('edit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [isEditMode, setIsEditMode] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<FormVals>({
    resolver: zodResolver(Schema),
    defaultValues: { is_active: true }
  });

  const isActive = watch("is_active");
  const selectedBrandId = watch("brand_id");
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
      const json = await res.json();
      console.log('Upload response:', { res, json });
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      const cacheBustedUrl = `${json.url}?t=${Date.now()}`;
      if (type === "logo") {
        setValue("logo_url", cacheBustedUrl, { shouldValidate: true });
        console.log('Logo URL updated to:', cacheBustedUrl);
      } else {
        setValue("cover_url", cacheBustedUrl, { shouldValidate: true });
        console.log('Cover URL updated to:', cacheBustedUrl);
      }
      setForceUpdate(prev => prev + 1); // Force component re-render
      toast.success("Görsel yüklendi");
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(e?.message || "Yükleme başarısız");
    }
  }

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await jget<{ items: Brand[] }>("/api/brands");
        setBrands(response.items || []);
      } catch (error) {
        toast.error("Markalar yüklenemedi");
      } finally {
        setLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  // Edit mode için marka verilerini yükle
  useEffect(() => {
    if (editId) {
      setIsEditMode(true);
      const fetchBrandData = async () => {
        try {
          const response = await jget<{ item: any }>(`/api/brands/${editId}`);
          const brand = response.item;
          if (brand) {
            setValue("brand_id", brand.id);
            setValue("name", brand.name);
            setValue("is_active", brand.is_active);
          }
          
          // Profil verilerini de yükle
          try {
            const profileResponse = await jget<{ item: any }>(`/api/brands/${editId}/profile`);
            const profile = profileResponse.item;
            if (profile) {
              setValue("category", profile.category || "");
              setValue("description", profile.description || "");
              setValue("email", profile.email || "");
              setValue("phone", profile.phone || "");
              setValue("logo_url", profile.avatar_url || "");
              setValue("cover_url", profile.cover_url || "");
            }
          } catch (error) {
            // Profil yoksa devam et
          }
        } catch (error) {
          toast.error("Marka verileri yüklenemedi");
        }
      };
      fetchBrandData();
    }
  }, [editId, setValue]);

  // Auto-fill form when brand is selected (sadece edit modu değilse)
  useEffect(() => {
    if (selectedBrandId && !isEditMode) {
      const fetchBrandProfile = async () => {
        try {
          const response = await jget<{ item: any }>(`/api/brands/${selectedBrandId}/profile`);
          const profile = response.item;
          if (profile) {
            setValue("category", profile.category || "");
            setValue("description", profile.description || "");
            setValue("email", profile.email || "");
            setValue("phone", profile.phone || "");
            setValue("logo_url", profile.avatar_url || "");
            setValue("cover_url", profile.cover_url || "");
          }
        } catch (error) {
          // Profile doesn't exist yet, that's ok
        }
      };
      fetchBrandProfile();
    }
  }, [selectedBrandId, setValue, isEditMode]);

  async function onSubmit(v: FormVals) {
    try {
      setIsSubmitting(true);
      
      if (v.brand_id) {
        // Update existing brand
        await jpatch(`/api/brands/${v.brand_id}`, {
          name: v.name,
          is_active: v.is_active
        });
        
        // Update profile
        await jpost(`/api/brands/${v.brand_id}/profile`, {
          category: v.category,
          description: v.description,
          email: v.email,
          phone: v.phone,
          avatar_url: v.logo_url,
          cover_url: v.cover_url
        });
        
        toast.success("Marka güncellendi");
        router.push(`/brands/profile/new?edit=${v.brand_id}`);
      } else {
        // Create new brand
        const brandResponse = await jpost("/api/brands", {
          name: v.name,
          is_active: v.is_active
        });
        
        // Yeni marka oluşturulduktan sonra profil de oluştur
        if (brandResponse && brandResponse.id) {
          await jpost(`/api/brands/${brandResponse.id}/profile`, {
            category: v.category,
            description: v.description,
            email: v.email,
            phone: v.phone,
            avatar_url: v.logo_url,
            cover_url: v.cover_url
          });
        }
        toast.success("Marka oluşturuldu");
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
        <h1 className="page-title">{isEditMode ? "Marka Düzenle" : "Yeni Marka"}</h1>
        <p className="text-slate-600 mt-2">
          {isEditMode ? "Mevcut markayı düzenleyin." : "Yeni bir marka oluşturun ve sisteme ekleyin."}
        </p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6 max-w-2xl">
        {!isEditMode && (
          <div>
            <label className="block text-sm font-medium mb-2">Mevcut Marka (Opsiyonel)</label>
            <Select
              {...register("brand_id")}
              placeholder="Marka seçin (otomatik doldurma için)"
            >
              <option value="">Yeni marka oluştur</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </Select>
            <p className="text-xs text-slate-500 mt-1">
              Mevcut marka seçerseniz, profil bilgileri otomatik doldurulur
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Marka Adı *</label>
            <Input
              {...register("name")}
              placeholder="Marka adını girin"
              className={errors.name ? "border-rose-500" : ""}
            />
            {errors.name && <p className="text-sm text-rose-600 mt-1">{errors.name.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Kategori</label>
            <Select
              {...register("category")}
              placeholder="Kategori seçin"
            >
              <option value="">Kategori seçin</option>
              <option value="teknoloji">Teknoloji</option>
              <option value="moda">Moda</option>
              <option value="gida">Gıda & İçecek</option>
              <option value="eglence">Eğlence</option>
              <option value="spor">Spor</option>
              <option value="saglik">Sağlık</option>
              <option value="egitim">Eğitim</option>
              <option value="finans">Finans</option>
              <option value="diger">Diğer</option>
            </Select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Açıklama</label>
          <Textarea
            {...register("description")}
            placeholder="Marka hakkında kısa bir açıklama yazın"
            rows={3}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2">Website</label>
            <Input
              {...register("website")}
              placeholder="https://example.com"
              type="url"
              className={errors.website ? "border-rose-500" : ""}
            />
            {errors.website && <p className="text-sm text-rose-600 mt-1">{errors.website.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <Input
              {...register("email")}
              placeholder="info@example.com"
              type="email"
              className={errors.email ? "border-rose-500" : ""}
            />
            {errors.email && <p className="text-sm text-rose-600 mt-1">{errors.email.message}</p>}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Telefon</label>
          <Input
            {...register("phone")}
            placeholder="+90 555 123 45 67"
            type="tel"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
            </div>
            {logoUrl && (
              <div className="mt-2">
                <p className="text-xs text-slate-500 mb-1">Önizleme:</p>
                <img 
                  key={`${logoUrl}-${forceUpdate}`} // Force re-render when URL changes
                  src={`${logoUrl}?t=${Date.now()}`} // Cache busting
                  alt="Logo önizleme" 
                  className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                  onError={(e) => {
                    console.error('Logo preview failed to load:', logoUrl);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cover URL</label>
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
            </div>
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

        <div className="flex items-center gap-3">
          <Switch
            checked={isActive}
            onCheckedChange={(checked) => setValue("is_active", checked)}
          />
          <label className="text-sm font-medium">Aktif</label>
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting 
              ? (isEditMode ? "Güncelleniyor..." : "Oluşturuluyor...") 
              : (isEditMode ? "Güncelle" : "Oluştur")
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