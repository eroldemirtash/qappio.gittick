"use client";

import { useEffect, useState } from "react";
import { jget } from "@/lib/fetcher";
import { Share } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { Share2, Search, Upload, Heart, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SharingPage() {
  const [shares, setShares] = useState<Share[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [brandFilter, setBrandFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    const fetchShares = async () => {
      try {
        const response = await jget<{ items: Share[] }>("/api/shares");
        setShares(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchShares();
  }, []);

  const filteredShares = shares.filter(share => {
    const matchesSearch = share.user?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
                         share.user?.username?.toLowerCase().includes(search.toLowerCase()) ||
                         share.mission?.title?.toLowerCase().includes(search.toLowerCase());
    const matchesBrand = brandFilter === "all" || share.brand_id === brandFilter;
    
    let matchesDate = true;
    if (dateFrom) {
      matchesDate = matchesDate && new Date(share.created_at) >= new Date(dateFrom);
    }
    if (dateTo) {
      matchesDate = matchesDate && new Date(share.created_at) <= new Date(dateTo);
    }
    
    return matchesSearch && matchesBrand && matchesDate;
  });

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Paylaşım Yönetimi" description="Kullanıcı paylaşımlarını yönetin" />
        <div className="card p-6 animate-pulse">
          <div className="h-10 bg-slate-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Paylaşım Yönetimi" 
        description="Kullanıcı paylaşımlarını yönetin"
        action={<Button disabled><Upload className="h-4 w-4 mr-2" />Fotoğraf Yükle</Button>}
      />

      {error ? (
        <div className="card p-6 border-rose-200 bg-rose-50">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-rose-500"></div>
            <div>
              <h3 className="font-medium text-rose-900">Hata</h3>
              <p className="text-sm text-rose-700">{error}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="card p-6">
          <div className="toolbar mb-6">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  placeholder="Kullanıcı veya görev ara..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select
                value={brandFilter}
                onChange={(e) => setBrandFilter(e.target.value)}
                className="w-40"
              >
                <option value="all">Tüm Markalar</option>
                {shares.map(share => (
                  <option key={`brand-${share.id}`} value={share.brand_id}>
                    {share.brand?.name}
                  </option>
                ))}
              </Select>
              <Input
                type="date"
                placeholder="Başlangıç"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-40"
              />
              <Input
                type="date"
                placeholder="Bitiş"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          {filteredShares.length === 0 ? (
            <div className="text-center py-12">
              <Share2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz paylaşım yok</h3>
              <p className="text-slate-500">Kullanıcı paylaşımları burada görünecek.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Kullanıcı</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Görev</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">İçerik</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Beğeni</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">Tarih</th>
                    <th className="text-left py-3 px-4 font-medium text-slate-600">İşlemler</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredShares.map((share) => (
                    <tr key={share.id} className="border-b border-slate-100">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <Avatar
                            src={share.user?.avatar_url}
                            fallback={share.user?.full_name?.[0] || share.user?.username?.[0] || "U"}
                            size="sm"
                          />
                          <div>
                            <div className="font-medium text-slate-900">
                              {share.user?.full_name || "İsimsiz"}
                            </div>
                            <div className="text-sm text-slate-500">
                              @{share.user?.username || "kullanici"}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-slate-900">
                          {share.mission?.title || "Görev"}
                        </div>
                        <div className="text-sm text-slate-500">
                          {share.brand?.name}
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        {share.media_url ? (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <img 
                              src={share.media_url} 
                              alt="Paylaşım"
                              className="w-full h-full object-cover rounded-lg"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center">
                            <Share2 className="h-6 w-6 text-slate-400" />
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1">
                          <Heart className="h-4 w-4 text-rose-500" />
                          <span className="font-medium">{share.likes}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-slate-600">
                        {new Date(share.created_at).toLocaleDateString('tr-TR')}
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <Button variant="ghost" size="sm">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
