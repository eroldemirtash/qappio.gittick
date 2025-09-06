"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { jpost, jget } from "@/lib/fetcher";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Combobox } from "@/components/ui/Combobox";
import { toast } from "sonner";

const Schema = z.object({
  title: z.string().min(3, "En az 3 karakter"),
  brand_id: z.string().min(1, "Marka seçimi zorunlu"),
  category: z.string().optional(),
  reward_qp: z.number().min(0, "Ödül 0'dan büyük olmalı").optional(),
  starts_at: z.string().optional(),
  ends_at: z.string().optional(),
  cover_url: z.string().optional(),
  is_qappio_of_week: z.boolean().default(false),
  is_sponsored: z.boolean().default(false),
  sponsor_brand_id: z.string().optional(),
  description: z.string().optional()
}).refine((data) => {
  if (data.is_sponsored && (!data.sponsor_brand_id || data.sponsor_brand_id === "")) {
    return false;
  }
  return true;
}, {
  message: "Sponsorlu görev için sponsor marka seçimi zorunlu",
  path: ["sponsor_brand_id"]
});

type FormVals = z.infer<typeof Schema>;

interface Brand {
  id: string;
  name: string;
  brand_profiles?: {
    avatar_url?: string;
  };
}

export const dynamic = "force-dynamic";

export default function MissionNewPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);
  const [forceUpdate, setForceUpdate] = useState(0);
  const coverInputRef = useRef<HTMLInputElement | null>(null);
  const [customBrands, setCustomBrands] = useState<Brand[]>([]);
  
  const { register, handleSubmit, formState: { errors }, setValue, watch, trigger } = useForm<FormVals>({
    resolver: zodResolver(Schema),
    defaultValues: {
      reward_qp: 0,
      is_qappio_of_week: false,
      is_sponsored: false
    }
  });

  const coverUrl = watch("cover_url");
  const isQappioOfWeek = watch("is_qappio_of_week");
  const isSponsored = watch("is_sponsored");
  const startsAt = watch("starts_at");

  // Debug coverUrl
  console.log('coverUrl value:', coverUrl);

  const handleCoverUpload = async (file: File) => {
    console.log('handleCoverUpload called with file:', file);
    try {
      const form = new FormData();
      form.append("file", file);
      form.append("missionId", "temp-mission");
      form.append("type", "cover");
      
      console.log('Uploading to /api/storage/mission-assets');
      const res = await fetch("/api/storage/mission-assets", { method: "POST", body: form });
      const json = await res.json();
      
      console.log('Upload response:', { res, json });
      if (!res.ok) throw new Error(json?.error || "Upload failed");
      
      const cacheBustedUrl = `${json.url}?t=${Date.now()}`;
      console.log('Setting cover_url to:', cacheBustedUrl);
      setValue("cover_url", cacheBustedUrl, { shouldValidate: true });
      await trigger();
      setForceUpdate(prev => prev + 1);
      toast.success("Kapak görseli yüklendi");
    } catch (e: any) {
      console.error("Upload error:", e);
      toast.error(e?.message || "Yükleme başarısız");
    }
  };

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

  // Handle custom brand creation
  const handleCustomBrand = async (brandName: string) => {
    try {
      // Create new brand
      const newBrand = await jpost("/api/brands", {
        name: brandName,
        is_active: true
      });
      
      // Add to local state
      setCustomBrands(prev => [...prev, newBrand]);
      setBrands(prev => [...prev, newBrand]);
      
      // Set as selected
      setValue("brand_id", newBrand.id);
      
      toast.success(`"${brandName}" markası oluşturuldu`);
    } catch (error: any) {
      toast.error("Marka oluşturulamadı: " + (error.message || "Bilinmeyen hata"));
    }
  };

  async function onSubmit(v: FormVals) {
    try {
      setIsSubmitting(true);
      
      // Determine if mission should be published based on start date
      const now = new Date();
      const startDate = v.starts_at ? new Date(v.starts_at) : null;
      const shouldPublish = !startDate || startDate <= now;
      
      const missionData = {
        ...v,
        published: shouldPublish
      };
      
      await jpost("/api/missions", missionData);
      
      if (shouldPublish) {
        toast.success("Görev oluşturuldu ve yayınlandı");
      } else {
        toast.success("Görev oluşturuldu, belirtilen tarihte otomatik yayınlanacak");
      }
      
      router.push("/missions");
    } catch (error: any) {
      toast.error(error.message || "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="page">
      <div className="mb-6">
        <h1 className="page-title">Yeni Görev</h1>
        <p className="text-slate-600 mt-2">Yeni bir görev oluşturun ve sisteme ekleyin.</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="card p-6 space-y-6 max-w-2xl">
        {/* Başlık */}
        <div>
          <label className="block text-sm font-medium mb-2">Başlık *</label>
          <Input
            {...register("title")}
            placeholder="Görev başlığını girin"
            className={errors.title ? "border-rose-500" : ""}
          />
          {errors.title && <p className="text-sm text-rose-600 mt-1">{errors.title.message}</p>}
        </div>

        {/* Marka Seçimi */}
        <div>
          <label className="block text-sm font-medium mb-2">Marka *</label>
          <Combobox
            options={brands.map(brand => ({
              value: brand.id,
              label: brand.name,
              avatar: brand.brand_profiles?.avatar_url
            }))}
            value={watch("brand_id")}
            onChange={(value) => setValue("brand_id", value)}
            placeholder="Marka ara veya yazın..."
            error={!!errors.brand_id}
            allowCustom={true}
            onCustomValue={handleCustomBrand}
          />
          {errors.brand_id && <p className="text-sm text-rose-600 mt-1">{errors.brand_id.message}</p>}
          <p className="text-xs text-slate-500 mt-1">
            Mevcut markaları arayabilir veya yeni marka oluşturabilirsiniz
          </p>
        </div>

        {/* Kategori ve Ödül */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Kategori</label>
            <Select {...register("category")}>
              <option value="">Kategori seçin</option>
              <option value="social">Sosyal Medya</option>
              <option value="photo">Fotoğraf</option>
              <option value="video">Video</option>
              <option value="review">Değerlendirme</option>
              <option value="survey">Anket</option>
              <option value="checkin">Check-in</option>
              <option value="share">Paylaşım</option>
              <option value="purchase">Satın Alma</option>
              <option value="referral">Yönlendirme</option>
              <option value="other">Diğer</option>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Ödül QP *</label>
            <Input
              {...register("reward_qp", { valueAsNumber: true })}
              type="number"
              min="0"
              placeholder="0"
              className={errors.reward_qp ? "border-rose-500" : ""}
            />
            {errors.reward_qp && <p className="text-sm text-rose-600 mt-1">{errors.reward_qp.message}</p>}
            <p className="text-xs text-slate-500 mt-1">
              Mobil uygulamada puan alanında görünecek
            </p>
          </div>
        </div>

        {/* Tarihler */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-2">Başlangıç Tarihi</label>
            <Input
              {...register("starts_at")}
              type="datetime-local"
            />
            <p className="text-xs text-slate-500 mt-1">
              {startsAt ? (
                new Date(startsAt) > new Date() ? (
                  <span className="text-blue-600">
                    Görev belirtilen tarihte otomatik yayınlanacak
                  </span>
                ) : (
                  <span className="text-green-600">
                    Görev hemen yayınlanacak
                  </span>
                )
              ) : (
                "Boş bırakılırsa görev hemen yayınlanır"
              )}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Bitiş Tarihi</label>
            <Input
              {...register("ends_at")}
              type="datetime-local"
            />
            <p className="text-xs text-slate-500 mt-1">
              Mobil uygulamada geri sayım sayacında gün, saat, dakika olarak görünecek
            </p>
          </div>
        </div>

        {/* Kapak Görseli */}
        <div>
          <label className="block text-sm font-medium mb-2">Kapak Görseli URL</label>
          <div className="flex gap-2">
            <Input
              {...register("cover_url")}
              placeholder="https://example.com/cover.jpg"
              className="flex-1"
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => coverInputRef.current?.click()}
            >
              PC'den Yükle
            </Button>
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            hidden
            onChange={(e) => {
              console.log('Cover file input changed:', e.target.files);
              const file = e.target.files?.[0];
              if (file) {
                console.log('File selected for upload:', file);
                handleCoverUpload(file);
              } else {
                console.log('No file selected');
              }
            }}
          />
          {coverUrl && (
            <div className="mt-3">
              <p className="text-sm text-slate-600 mb-2">Önizleme:</p>
              <p className="text-xs text-slate-400 mb-2">URL: {coverUrl}</p>
              <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden">
                <img
                  key={`${coverUrl}-${forceUpdate}`}
                  src={`${coverUrl}?t=${Date.now()}`}
                  alt="Kapak görseli önizleme"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    console.error('Cover preview failed to load:', coverUrl);
                    e.currentTarget.style.display = 'none';
                    (e.currentTarget.nextElementSibling as HTMLElement)!.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full flex items-center justify-center text-slate-500" style={{display: 'none'}}>
                  Görsel yüklenemedi
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Açıklama */}
        <div>
          <label className="block text-sm font-medium mb-2">Açıklama</label>
          <textarea
            {...register("description")}
            className="w-full h-32 px-3 py-2 rounded-xl border border-slate-200 resize-none"
            placeholder="Görev hakkında detaylı açıklama... (Mobilde 2 satır görünecek, fazlası 'devamı...' ile gösterilecek)"
          />
          <p className="text-xs text-slate-500 mt-1">
            Mobil uygulamada açıklama 2 satır olarak görünecek, fazlası "devamı..." ile gösterilecek
          </p>
        </div>

        {/* Durumlar */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <Switch
              checked={isQappioOfWeek}
              onCheckedChange={(checked) => setValue("is_qappio_of_week", checked)}
            />
            <label className="text-sm font-medium">Haftanın Qappio'su</label>
          </div>
          {isQappioOfWeek && (
            <p className="text-xs text-slate-500 ml-8">
              Mobil uygulamada "Haftanın Qappiosu" alanında gösterilecek
            </p>
          )}

          <div className="flex items-center gap-3">
            <Switch
              checked={isSponsored}
              onCheckedChange={(checked) => setValue("is_sponsored", checked)}
            />
            <label className="text-sm font-medium">Sponsorlu</label>
          </div>
        </div>

        {/* Sponsor Marka Seçimi */}
        {isSponsored && (
          <div>
            <label className="block text-sm font-medium mb-2">Sponsor Marka *</label>
            <Combobox
              options={brands.map(brand => ({
                value: brand.id,
                label: brand.name,
                avatar: brand.brand_profiles?.avatar_url
              }))}
              value={watch("sponsor_brand_id")}
              onChange={(value) => setValue("sponsor_brand_id", value)}
              placeholder="Sponsor marka ara veya yazın..."
              error={!!errors.sponsor_brand_id}
              allowCustom={true}
              onCustomValue={handleCustomBrand}
            />
            {errors.sponsor_brand_id && <p className="text-sm text-rose-600 mt-1">{errors.sponsor_brand_id.message}</p>}
            <p className="text-xs text-slate-500 mt-1">
              Mobil uygulamada "Sponsored by [Marka Adı ve Logosu]" etiketi görünecek
            </p>
          </div>
        )}

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? "Oluşturuluyor..." : "Görev Oluştur"}
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
