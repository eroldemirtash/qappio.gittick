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
import { Avatar } from "@/components/ui/Avatar";
import { ShoppingBag, Search, Plus, Package, TrendingUp, X, Edit, Eye, Trash2 } from "lucide-react";
import { ProductCreateEditModal } from "@/components/market/ProductCreateEditModal";

export const dynamic = "force-dynamic";

export default function MarketPage() {
  console.log("MarketPage component rendering");
  
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [brandFilter, setBrandFilter] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketItem | null>(null);
  const [viewingProduct, setViewingProduct] = useState<MarketItem | null>(null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        setLoading(true);
        const response = await jget<{ items: MarketItem[] }>("/api/market");
        const items = response.items || [];
        
        console.log("Fetched items:", items.length);
        console.log("First item cover_url:", items[0]?.cover_url);
        console.log("First item image_url:", items[0]?.image_url);
        console.log("First item gallery:", (items[0] as any)?.gallery);
        console.log("First item product_images:", (items[0] as any)?.product_images);
        setItems(items);
      } catch (err) {
        console.error("Fetch error:", err);
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

  const filteredItems = items.filter(item => {
    const matchesSearch = (item.title?.toLowerCase() || item.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
                         (item.description?.toLowerCase() || '').includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    const matchesBrand = brandFilter === "all" || item.brand_id === brandFilter;
    
    return matchesSearch && matchesCategory && matchesBrand;
  });

  const handleAddProduct = () => {
    setShowAddModal(true);
  };

  const handleEditProduct = (product: MarketItem) => {
    setEditingProduct(product);
  };

  const handleViewProduct = (product: MarketItem) => {
    setViewingProduct(product);
  };

  const handleDeleteProduct = async (productId: string) => {
    if (confirm("Bu ürünü silmek istediğinizden emin misiniz?")) {
      try {
        const response = await fetch(`/api/market/${productId}`, {
          method: "DELETE",
        });
        
        if (response.ok) {
          setItems(items.filter(item => item.id !== productId));
        } else {
          alert("Ürün silinirken hata oluştu");
        }
      } catch (error) {
        console.error("Delete error:", error);
        alert("Ürün silinirken hata oluştu");
      }
    }
  };

  const handleSaveProduct = async (productData: any) => {
    try {
      const response = await fetch("/api/market", {
        method: editingProduct ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...productData,
          id: editingProduct?.id,
        }),
      });

      if (response.ok) {
        const updatedItems = await response.json();
        const newItem = updatedItems.items?.[0];
        
        if (editingProduct && newItem) {
          // Update existing product
          setItems(items.map(item => item.id === newItem.id ? newItem : item));
        } else if (newItem) {
          // Add new product
          setItems([newItem, ...items]);
        }
        
        setShowAddModal(false);
        setEditingProduct(null);
        setViewingProduct(null);
      } else {
        alert("Ürün kaydedilirken hata oluştu");
      }
    } catch (error) {
      console.error("Save error:", error);
      alert("Ürün kaydedilirken hata oluştu");
    }
  };

  const stats = {
    totalQp: items.reduce((sum, item) => sum + (item.value_qp || item.price_qp || 0), 0),
    totalProducts: items.length,
    activeProducts: items.filter(item => item.is_active).length
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Market Yönetimi" description="QP sistemini yönetin" />
        <div className="card p-6">
          <h2 className="text-xl font-bold mb-4">Yükleniyor...</h2>
          <p>Market verileri yükleniyor, lütfen bekleyin.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Market Yönetimi" 
        description="QP sistemini yönetin"
        action={<Button onClick={handleAddProduct}><Plus className="h-4 w-4 mr-2" />Ürün Ekle</Button>}
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

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
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
          </div>

          <div className="card p-6">
            <div className="toolbar mb-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Ürün ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-full sm:w-64"
                  />
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <Select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full sm:w-40"
                  >
                    <option value="all">Tüm Kategoriler</option>
                    <option value="Spor">Spor</option>
                    <option value="Oyuncak">Oyuncak</option>
                    <option value="Elektronik">Elektronik</option>
                    <option value="Giyim">Giyim</option>
                    <option value="Kitap">Kitap</option>
                    <option value="Ev & Yaşam">Ev & Yaşam</option>
                  </Select>
                  <Select
                    value={brandFilter}
                    onChange={(e) => setBrandFilter(e.target.value)}
                    className="w-full sm:w-40"
                  >
                    <option value="all">Tüm Markalar</option>
                    {Array.from(new Map(items.map(item => [item.brand_id, item.brand])).values()).map(brand => (
                      <option key={brand?.id || 'unknown'} value={brand?.id || 'unknown'}>
                        {brand?.name || 'Bilinmeyen Marka'}
                      </option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {filteredItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz ürün yok</h3>
                <p className="text-slate-500">Market ürünleri burada görünecek.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                {filteredItems.map((item) => (
                  <div key={item.id} className="card p-4 sm:p-6 hover:shadow-lg transition-shadow">
                    <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                      {(() => {
                        const cover = item.cover_url || item.image_url || null;
                        console.log(`Item ${item.id} cover:`, cover);
                        return cover ? (
                          <img
                            src={cover}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover rounded-lg"
                            onError={(e) => {
                              console.log(`Image load error for ${item.id}:`, cover);
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="flex flex-col items-center justify-center text-slate-400">
                            <Package className="h-16 w-16 mb-2" />
                            <span className="text-sm">Görsel Yok</span>
                          </div>
                        );
                      })()}
                    </div>
                    
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-semibold text-slate-900">{item.title || item.name}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar
                            src={item.brand?.brand_profiles?.avatar_url || item.brand?.logo_url}
                            fallback={item.brand?.name?.[0] || "M"}
                            size="sm"
                          />
                          <p className="text-sm text-slate-500">{item.brand?.name || 'Bilinmeyen Marka'}</p>
                        </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-sm text-slate-600 line-clamp-2">
                          {item.description}
                        </p>
                      )}
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-lg font-bold text-brand-600">
                            {item.value_qp || item.price_qp} QP
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
                      
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          aria-label="Düzenle"
                          className="flex-1"
                          onClick={() => handleEditProduct(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          aria-label="Görüntüle"
                          className="flex-1"
                          onClick={() => handleViewProduct(item)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          aria-label="Sil"
                          onClick={() => handleDeleteProduct(item.id)}
                          className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {/* Product Create/Edit Modal */}
      <ProductCreateEditModal
        isOpen={showAddModal || editingProduct !== null || viewingProduct !== null}
        onClose={() => {
          setShowAddModal(false);
          setEditingProduct(null);
          setViewingProduct(null);
        }}
        product={editingProduct || viewingProduct}
        onSave={handleSaveProduct}
      />
    </div>
  );
}
