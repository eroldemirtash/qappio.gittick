"use client";

import { useState, useEffect } from "react";
import { MarketItem } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { ProductCreateEditModal } from "@/components/market/ProductCreateEditModal";
import { ShoppingBag, Package, TrendingUp, Plus, Edit, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

async function getMarketData() {
  try {
    // Server-side'da internal API çağrısı yapalım
    const { sbAdmin } = await import("@/lib/supabase-admin");
    
    const { data, error } = await sbAdmin()
      .from("products")
      .select(`
        id, title, description, value_qp, stock_count, stock_status, brand_id, is_active, created_at, category, level, usage_terms,
        brands ( id, name, logo_url ),
        product_images ( url, position ),
        product_marketplaces ( marketplace, product_url )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Supabase products error:", error);
      return [];
    }

    const items = (data || []).map((p: any) => {
      const coverImage = p.product_images && p.product_images.length > 0 
        ? p.product_images.sort((a: any, b: any) => (a.position || 0) - (b.position || 0))[0]?.url
        : null;
      
      return {
        id: p.id,
        name: p.title ?? null,
        description: p.description ?? null,
        price_qp: p.value_qp ?? null,
        stock: p.stock_count ?? null,
        stock_status: p.stock_status ?? 'in_stock',
        brand_id: p.brand_id ?? null,
        is_active: p.is_active ?? true,
        image_url: coverImage,
        cover_url: coverImage,
        brand: p.brands ? { id: (p.brands as any).id, name: (p.brands as any).name, logo_url: (p.brands as any).logo_url } : null,
        created_at: p.created_at,
        category: p.category ?? 'Elektronik',
        level: p.level ?? 1,
        usage_terms: p.usage_terms ?? '',
        marketplace_links: p.product_marketplaces ? p.product_marketplaces.map((mp: any) => ({
          marketplace: mp.marketplace,
          url: mp.product_url || ''
        })) : [],
      };
    });

    return items;
  } catch (error) {
    console.error("Market data fetch error:", error);
    return [];
  }
}

export default function MarketPage() {
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<MarketItem | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<MarketItem | null>(null);

  useEffect(() => {
    loadMarketData();
  }, []);

  const loadMarketData = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/market");
      const data = await response.json();
      setItems(data.items || []);
    } catch (error) {
      console.error("Market data load error:", error);
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (product: MarketItem) => {
    setEditingProduct(product);
    setIsModalOpen(true);
  };

  const handleDelete = (product: MarketItem) => {
    setProductToDelete(product);
    setDeleteConfirmOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;

    try {
      const response = await fetch(`/api/market`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productToDelete.id })
      });

      if (response.ok) {
        await loadMarketData();
        setDeleteConfirmOpen(false);
        setProductToDelete(null);
      } else {
        console.error("Delete failed");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    loadMarketData(); // Refresh data after modal close
  };

  // Filtreleme (basit)
  const filteredItems = items;

  const stats = {
    totalQp: items.reduce((sum: number, item: any) => sum + (item.value_qp || item.price_qp || 0), 0),
    totalProducts: items.length,
    activeProducts: items.filter((item: any) => item.is_active).length
  };

  return (
    <div className="page">
      <PageHeader 
        title="Market Yönetimi" 
        description="QP sistemini yönetin"
        action={
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Ürün Ekle
          </Button>
        }
      />

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
        {filteredItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingBag className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz ürün yok</h3>
            <p className="text-slate-500">Market ürünleri burada görünecek.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-6">
            {filteredItems.map((item) => (
              <div key={item.id} className="card p-4 sm:p-6 hover:shadow-lg transition-shadow">
                <div className="aspect-square bg-slate-100 rounded-lg mb-4 flex items-center justify-center overflow-hidden border-2 border-dashed border-slate-300">
                  {(() => {
                    const cover = item.cover_url || item.image_url || null;
                    return cover ? (
                      <img
                        src={cover}
                        alt={item.name}
                        className="w-full h-full object-cover rounded-lg"
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
                    <h3 className="font-semibold text-slate-900">{item.name}</h3>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-medium">
                        {item.brand?.name?.[0] || "M"}
                      </div>
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
                      <span className="text-lg font-bold text-blue-600">
                        {item.price_qp || item.value_qp || 0} QP
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        item.stock_status === 'in_stock' ? 'bg-green-100 text-green-800' :
                        item.stock_status === 'low' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {item.stock_status === 'in_stock' ? 'Stokta' :
                         item.stock_status === 'low' ? 'Az Stok' : 'Stok Yok'}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-xs text-slate-500">
                      Stok: {item.stock || 0}
                    </span>
                    <div className="flex items-center gap-1">
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleEdit(item)}
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        <span className="text-xs">Düzenle</span>
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => handleDelete(item)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        <span className="text-xs">Sil</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Product Create/Edit Modal */}
      <ProductCreateEditModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        product={editingProduct}
        onSave={() => {}} // Modal kendi kaydetme işlemini yapıyor
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        title="Ürünü Sil"
        size="sm"
      >
        <div className="p-6">
          <p className="text-slate-600 mb-6">
            <strong>{productToDelete?.name}</strong> ürününü silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </p>
          <div className="flex justify-end gap-3">
            <Button 
              variant="ghost" 
              onClick={() => setDeleteConfirmOpen(false)}
            >
              İptal
            </Button>
            <Button 
              onClick={handleConfirmDelete}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Sil
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}