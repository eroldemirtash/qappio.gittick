"use client";

import { useEffect, useState } from "react";
import { jget } from "@/lib/fetcher";
import { MarketItem } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { ShoppingBag, Search, Plus, Package, TrendingUp } from "lucide-react";

export const dynamic = "force-dynamic";

export default function MarketPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await jget<{ items: MarketItem[] }>("/api/market");
        setItems(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
                         item.description?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesBrand = brandFilter === "all" || item.brand_id === brandFilter;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const stats = {
    totalQp: items.reduce((sum, item) => sum + item.price_qp, 0),
    totalProducts: items.length,
    activeProducts: items.filter(item => item.is_active).length
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Market Yönetimi" description="QP sistemini yönetin" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Market Yönetimi" 
        description="QP sistemini yönetin"
        action={<Button disabled><Plus className="h-4 w-4 mr-2" />Ürün Ekle</Button>}
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
        <>
          <div className="card p-6 mb-6">
            <h3 className="text-lg font-semibold mb-4">QP Sistemi</h3>
            <div className="prose prose-sm text-slate-600">
              <p>
                QP (Qappio Points) sistemi, kullanıcıların görevleri tamamlayarak kazandıkları puanlarla 
                market ürünlerini satın alabilecekleri bir ödül sistemidir. Kullanıcılar görevleri tamamlayarak 
                QP kazanır ve bu puanlarla çeşitli ürünleri satın alabilirler.
              </p>
            </div>
          </div>

          <StatsRow>
            <StatCard 
              title="Toplam QP (Collected)" 
              value={stats.totalQp.toLocaleString()} 
              icon={TrendingUp} 
            />
            <StatCard 
              title="Toplam Ürün" 
              value={stats.totalProducts} 
              icon={Package} 
            />
            <StatCard 
              title="Aktif Ürün" 
              value={stats.activeProducts} 
              icon={ShoppingBag} 
            />
          </StatsRow>

          <div className="card p-6">
            <div className="toolbar mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Ürün ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="all">Tüm Kategoriler</option>
                  <option value="electronics">Elektronik</option>
                  <option value="clothing">Giyim</option>
                  <option value="food">Yiyecek</option>
                  <option value="gift">Hediye</option>
                </Select>
                <Select
                  value={brandFilter}
                  onChange={(e) => setBrandFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="all">Tüm Markalar</option>
                  {items.map(item => (
                    <option key={item.brand_id} value={item.brand_id}>
                      {item.brand?.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz ürün yok</h3>
                <p className="text-slate-500">Market ürünleri burada görünecek.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="card p-6">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center">
                      {item.image_url ? (
                        <img 
                          src={item.image_url} 
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Package className="h-12 w-12 text-slate-400" />
                      )}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.name}</h3>
                        <p className="text-sm text-slate-500">{item.brand?.name}</p>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-brand-600">
                            {item.price_qp} QP
                          </span>
                          {item.stock !== undefined && (
                            <span className="text-sm text-slate-500">
                              Stok: {item.stock}
                            </span>
                          )}
                        </div>
                        <span className={`badge ${
                          item.is_active 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {item.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm" className="flex-1">Düzenle</Button>
                        <Button variant="ghost" size="sm" className="flex-1">Görüntüle</Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
