"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Edit, 
  Trash2, 
  Package,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Clock,
  XCircle
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  cover: string;
  value: number;
  stock: number;
  category: string;
  levels: string[];
  status: 'draft' | 'pending' | 'published' | 'rejected';
  lastUpdate: string;
}

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading] = useState(false);

  // Demo verileri
  const products: Product[] = [
    {
      id: "1",
      name: "Nike Air Force 1",
      cover: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
      value: 150,
      stock: 25,
      category: "Ayakkabı",
      levels: ["Seeker", "Crafter"],
      status: "published",
      lastUpdate: "2 saat önce"
    },
    {
      id: "2",
      name: "Adidas Ultraboost 22",
      cover: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
      value: 200,
      stock: 0,
      category: "Ayakkabı",
      levels: ["Crafter", "Viralist"],
      status: "pending",
      lastUpdate: "4 saat önce"
    },
    {
      id: "3",
      name: "Nike Dri-FIT T-Shirt",
      cover: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=300&fit=crop",
      value: 80,
      stock: 50,
      category: "Giyim",
      levels: ["Snapper", "Seeker"],
      status: "draft",
      lastUpdate: "1 gün önce"
    },
    {
      id: "4",
      name: "Puma Suede Classic",
      cover: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop",
      value: 120,
      stock: 15,
      category: "Ayakkabı",
      levels: ["Seeker"],
      status: "rejected",
      lastUpdate: "3 gün önce"
    },
    {
      id: "5",
      name: "Reebok Classic Leather",
      cover: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
      value: 100,
      stock: 30,
      category: "Ayakkabı",
      levels: ["Snapper", "Seeker", "Crafter"],
      status: "published",
      lastUpdate: "1 hafta önce"
    }
  ];

  const getStatusInfo = (status: Product['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Taslak', color: 'bg-slate-100 text-slate-800', icon: Clock };
      case 'pending':
        return { label: 'Onay Bekliyor', color: 'bg-amber-100 text-amber-800', icon: AlertCircle };
      case 'published':
        return { label: 'Yayında', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle };
      case 'rejected':
        return { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: 'Bilinmiyor', color: 'bg-slate-100 text-slate-800', icon: Clock };
    }
  };

  const getStockInfo = (stock: number) => {
    if (stock === 0) return { label: 'Stok Yok', color: 'bg-red-100 text-red-800' };
    if (stock < 10) return { label: 'Az Stok', color: 'bg-amber-100 text-amber-800' };
    return { label: 'Stokta', color: 'bg-emerald-100 text-emerald-800' };
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || product.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Ürünler" description="Ürünlerinizi yönetin" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Ürünler" 
        description="Ürünlerinizi yönetin"
        action={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Ürün
          </Button>
        }
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Ürünler" }
        ]}
      />

      {/* Filtre Barı */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Ürün ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="draft">Taslak</option>
              <option value="pending">Onay Bekliyor</option>
              <option value="published">Yayında</option>
              <option value="rejected">Reddedildi</option>
            </select>
            <Button variant="ghost" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtre
            </Button>
          </div>
        </div>
      </div>

      {/* Ürün Listesi */}
      {filteredProducts.length === 0 ? (
        <div className="card p-12 text-center">
          <Package className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Ürün bulunamadı</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Arama kriterlerinize uygun ürün bulunamadı.' 
              : 'Henüz ürün eklemediniz.'
            }
          </p>
          <Button className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            İlk Ürününüzü Ekleyin
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map((product) => {
            const statusInfo = getStatusInfo(product.status);
            const stockInfo = getStockInfo(product.stock);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={product.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Ürün Görseli */}
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={product.cover}
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Ürün Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4" />
                            {product.value} QP
                          </div>
                          <div className="flex items-center gap-1">
                            <Package className="h-4 w-4" />
                            {product.stock} adet
                          </div>
                          <div className="text-slate-500">
                            {product.category}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-xs text-slate-500">Reyonlar:</span>
                          {product.levels.map((level, index) => (
                            <span key={index} className="badge bg-brand-100 text-brand-700 text-xs">
                              {level}
                            </span>
                          ))}
                        </div>
                        <p className="text-xs text-slate-500">
                          Son güncelleme: {product.lastUpdate}
                        </p>
                      </div>

                      {/* Durum ve Aksiyonlar */}
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusInfo.color} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                        <span className={`badge ${stockInfo.color}`}>
                          {stockInfo.label}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
