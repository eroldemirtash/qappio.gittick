"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function NewBrandPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    website_url: "",
    instagram_url: "",
    twitter_url: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create brand
      const brandRes = await fetch("/api/brands", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(formData)
      });

      if (!brandRes.ok) {
        const error = await brandRes.json();
        throw new Error(error.error || "Brand creation failed");
      }

      const { brand } = await brandRes.json();

      // Redirect to brands list
      router.push("/brands");
    } catch (error: any) {
      alert("Hata: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold mb-6">Yeni Marka</h1>
      
      <form onSubmit={handleSubmit} className="card p-6 space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Marka Adı *
          </label>
          <input
            type="text"
            required
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="Marka adını girin"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Açıklama
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            rows={3}
            placeholder="Marka açıklaması"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Website URL
          </label>
          <input
            type="url"
            value={formData.website_url}
            onChange={(e) => setFormData({...formData, website_url: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="https://example.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Instagram URL
          </label>
          <input
            type="url"
            value={formData.instagram_url}
            onChange={(e) => setFormData({...formData, instagram_url: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="https://instagram.com/username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Twitter URL
          </label>
          <input
            type="url"
            value={formData.twitter_url}
            onChange={(e) => setFormData({...formData, twitter_url: e.target.value})}
            className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500"
            placeholder="https://twitter.com/username"
          />
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-brand-600 text-white rounded-xl hover:bg-brand-700 disabled:opacity-50"
          >
            {loading ? "Oluşturuluyor..." : "Marka Oluştur"}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50"
          >
            İptal
          </button>
        </div>
      </form>
    </div>
  );
}