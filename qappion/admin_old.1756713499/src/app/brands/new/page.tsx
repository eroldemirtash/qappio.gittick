"use client";

import * as React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Upload, Image as ImageIcon } from "lucide-react";

export default function BrandCreatePage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [brandId, setBrandId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [coverUrl, setCoverUrl] = useState<string>("");
  const [useLogoUrl, setUseLogoUrl] = useState<boolean>(false);
  const [useCoverUrl, setUseCoverUrl] = useState<boolean>(false);

  async function upload(kind: "logo" | "cover", file: File, bid: string) {
    const fd = new FormData();
    fd.append("file", file);
    fd.append("brand_id", bid);
    fd.append("kind", kind);
    const res = await fetch("/api/storage/brand-assets", { method: "POST", body: fd });
    if (!res.ok) {
      const errorText = await res.text();
      console.error("Storage API Error:", errorText);
      throw new Error(`Storage API Error: ${errorText}`);
    }
    const result = await res.json();
    return result as { path: string; publicUrl: string };
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const obj: any = Object.fromEntries(formData.entries());

    // checkbox -> boolean
    ["feat_mission_create","feat_user_mgmt","feat_analytics","feat_api_access","feat_priority_support"]
      .forEach(k => (obj[k] = formData.get(k) ? true : false));
    obj.is_active = formData.get("is_active") ? true : true;

    if (!obj.name || String(obj.name).trim().length < 2) {
      alert("Marka adı zorunlu"); return;
    }

    setSubmitting(true);
    try {
      // 1) Markayı oluştur
      const res = await fetch("/api/brands", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name: obj.name,
          is_active: obj.is_active,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const { brandId } = await res.json();

      // 2) Görseller varsa yükle veya URL kullan
      const patch: any = {};
      const logoFile = (formData.get("logo") as File) || null;
      const coverFile = (formData.get("cover") as File) || null;

      if (useLogoUrl && logoUrl.trim()) {
        patch.avatar_url = logoUrl.trim();
      } else if (logoFile && logoFile.size > 0) {
        const up = await upload("logo", logoFile, brandId);
        patch.avatar_url = up.publicUrl;
      }
      if (useCoverUrl && coverUrl.trim()) {
        patch.cover_url = coverUrl.trim();
      } else if (coverFile && coverFile.size > 0) {
        const up = await upload("cover", coverFile, brandId);
        patch.cover_url = up.publicUrl;
      }

      // 3) Profil alanlarını (varsa) PATCH et (upsert)
      const profileBody = {
        display_name: obj.name,
        handle: obj.handle || null,
        description: obj.description || null,
        email: obj.email || null,
        phone: obj.phone || null,
        website: obj.website || null,
        category: obj.category || null,
        founded_year: obj.founded_year || null,
        address: obj.address || null,
        instagram: obj.instagram || null,
        twitter: obj.twitter || null,
        facebook: obj.facebook || null,
        linkedin: obj.linkedin || null,
        license_plan: obj.license_plan || null,
        license_start: obj.license_start || null,
        license_end: obj.license_end || null,
        license_fee: obj.license_fee || null,
        feat_mission_create: obj.feat_mission_create || false,
        feat_user_mgmt: obj.feat_user_mgmt || false,
        feat_analytics: obj.feat_analytics || false,
        feat_api_access: obj.feat_api_access || false,
        feat_priority_support: obj.feat_priority_support || false,
        ...patch,
      };

      const pr = await fetch(`/api/brands/${brandId}/profile`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(profileBody),
      });
      if (!pr.ok) throw new Error(await pr.text());

      alert("Marka oluşturuldu ✅");
      router.push(`/brands?_=${Date.now()}`);
    } catch (err: any) {
      console.error(err);
      alert("Hata: " + (err?.message || "Bilinmeyen hata"));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Geri Dön
        </button>
        <h1 className="text-3xl font-bold text-gray-900 mt-4">Yeni Marka Oluştur</h1>
        <p className="text-gray-600 mt-2">Marka bilgilerini doldurun ve kaydedin</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-8">
        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Temel Bilgiler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Marka Adı *</label>
              <input
                type="text"
                name="name"
                required
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="Marka adını girin"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Handle</label>
              <input
                type="text"
                name="handle"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="@markaadi"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <input
                type="email"
                name="email"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="info@marka.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                name="phone"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="+90 555 123 45 67"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                name="website"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                placeholder="https://marka.com"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kategori</label>
              <select
                name="category"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
              >
                <option value="">Kategori seçin</option>
                <option value="Spor Giyim">Spor Giyim</option>
                <option value="İçecek">İçecek</option>
                <option value="Teknoloji">Teknoloji</option>
                <option value="Fast Food">Fast Food</option>
                <option value="Otomotiv">Otomotiv</option>
                <option value="Kozmetik">Kozmetik</option>
                <option value="Gıda">Gıda</option>
                <option value="Moda">Moda</option>
              </select>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Logo</h2>
          
          {/* Dosya yükleme seçeneği */}
          <div className="mb-3">
            <label className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={!useLogoUrl}
                onChange={(e) => setUseLogoUrl(!e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Dosya yükle</span>
            </label>
            {!useLogoUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                {logoPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={logoPreview} 
                      alt="Logo Preview" 
                      className="w-32 h-32 object-cover rounded-lg mx-auto"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setLogoPreview(null);
                        setLogoFile(null);
                      }}
                      className="px-4 py-2 text-red-600 hover:text-red-700"
                    >
                      Logoyu Kaldır
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload size={48} className="mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Logo yüklemek için tıklayın
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG veya SVG formatında, maksimum 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      name="logo"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setLogoFile(file);
                        if (file) setLogoPreview(URL.createObjectURL(file));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* URL girme seçeneği */}
          <div>
            <label className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={useLogoUrl}
                onChange={(e) => setUseLogoUrl(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">URL gir</span>
            </label>
            {useLogoUrl && (
              <div className="space-y-4">
                <input 
                  type="url" 
                  placeholder="https://example.com/logo.jpg"
                  value={logoUrl}
                  onChange={(e) => {
                    setLogoUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setLogoPreview(e.target.value.trim());
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt="Logo Preview"
                    className="w-32 h-32 object-cover rounded-lg mx-auto border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-xl font-semibold mb-4">Kapak Resmi</h2>
          
          {/* Dosya yükleme seçeneği */}
          <div className="mb-3">
            <label className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={!useCoverUrl}
                onChange={(e) => setUseCoverUrl(!e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">Dosya yükle</span>
            </label>
            {!useCoverUrl && (
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center">
                {coverPreview ? (
                  <div className="space-y-4">
                    <img 
                      src={coverPreview} 
                      alt="Cover Preview" 
                      className="w-full h-48 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setCoverPreview(null);
                        setCoverFile(null);
                      }}
                      className="px-4 py-2 text-red-600 hover:text-red-700"
                    >
                      Kapak Resmini Kaldır
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Upload size={48} className="mx-auto text-gray-400" />
                    <div>
                      <p className="text-sm text-gray-600">
                        Kapak resmi yüklemek için tıklayın
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG formatında, önerilen boyut: 1200x400px, maksimum 5MB
                      </p>
                    </div>
                    <input
                      type="file"
                      name="cover"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0] || null;
                        setCoverFile(file);
                        if (file) setCoverPreview(URL.createObjectURL(file));
                      }}
                      className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                    />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* URL girme seçeneği */}
          <div>
            <label className="flex items-center mb-2">
              <input 
                type="checkbox" 
                checked={useCoverUrl}
                onChange={(e) => setUseCoverUrl(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">URL gir</span>
            </label>
            {useCoverUrl && (
              <div className="space-y-4">
                <input 
                  type="url" 
                  placeholder="https://example.com/cover.jpg"
                  value={coverUrl}
                  onChange={(e) => {
                    setCoverUrl(e.target.value);
                    if (e.target.value.trim()) {
                      setCoverPreview(e.target.value.trim());
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                />
                {coverUrl && (
                  <img
                    src={coverUrl}
                    alt="Cover Preview"
                    className="w-full h-48 object-cover rounded-lg border border-gray-200"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none'
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors disabled:opacity-50"
          >
            {submitting ? "Oluşturuluyor..." : "Marka Oluştur"}
          </button>
        </div>
      </form>
    </div>
  );
}

