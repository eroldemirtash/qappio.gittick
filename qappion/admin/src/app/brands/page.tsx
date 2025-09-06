"use client";

import { useEffect, useState } from "react";
import { jget, jpatch, jdelete } from "@/lib/fetcher";
import { Brand } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/ui/StatCard";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Avatar } from "@/components/ui/Avatar";
import { BrandDetailModal } from "@/components/brands/BrandDetailModal";
import { Modal } from "@/components/ui/Modal";
import { Building2, Search, Plus, Target, Share2, Users, RefreshCw, Eye, Edit, Power, Trash2, Grid3X3, List } from "lucide-react";
import { useRouter } from "next/navigation";

export const dynamic = "force-dynamic";

export default function BrandsPage() {
  const router = useRouter();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [brandToDelete, setBrandToDelete] = useState<Brand | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<"cards" | "list">("cards");

  const fetchBrands = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await jget<{ items: any[] }>("/api/brands");
      console.log("Brands API Response:", response);
      console.log("Brands items:", response.items);
      if (response.items && response.items.length > 0) {
        console.log("First brand:", response.items[0]);
        console.log("First brand profiles:", response.items[0].brand_profiles);
      }
      // Normalize brand_profiles and logo (snake/camel)
      const normalized: Brand[] = (response.items || []).map((b: any) => {
        const profile = Array.isArray(b.brand_profiles) ? b.brand_profiles[0] : b.brand_profiles;
        return {
          ...b,
          logo_url: b.logo_url || b.logoUrl || profile?.logo_url || profile?.avatar_url || null,
          brand_profiles: profile
        };
      });
      setBrands(normalized);
    } catch (err) {
      console.error("Brands fetch error:", err);
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleToggleActive = async (brand: Brand) => {
    try {
      await jpatch(`/api/brands/${brand.id}`, { is_active: !brand.is_active });
      setBrands(prev => prev.map(b => 
        b.id === brand.id ? { ...b, is_active: !b.is_active } : b
      ));
      // Modal'daki brand'i de güncelle
      if (selectedBrand && selectedBrand.id === brand.id) {
        setSelectedBrand({ ...selectedBrand, is_active: !selectedBrand.is_active });
      }
    } catch (err) {
      console.error("Failed to update brand:", err);
    }
  };

  const handleShowDetail = (brand: Brand) => {
    setSelectedBrand(brand);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (brand: Brand) => {
    setIsDetailModalOpen(false);
    router.push(`/brands/profile/new?edit=${brand.id}`);
  };

  const handleCloseModal = () => {
    setIsDetailModalOpen(false);
    setSelectedBrand(null);
  };

  const handleDeleteClick = (brand: Brand) => {
    setBrandToDelete(brand);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!brandToDelete) return;
    
    try {
      // Gerçek DELETE API'sini kullan
      await jdelete(`/api/brands/${brandToDelete.id}`);
      setBrands(prev => prev.filter(b => b.id !== brandToDelete.id));
      setIsDeleteModalOpen(false);
      setBrandToDelete(null);
    } catch (err) {
      console.error("Failed to delete brand:", err);
    }
  };

  const handleDeleteCancel = () => {
    setIsDeleteModalOpen(false);
    setBrandToDelete(null);
  };

  const filteredBrands = brands.filter(brand => {
    const matchesSearch = brand.name.toLowerCase().includes(search.toLowerCase()) ||
                         brand.brand_profiles?.display_name?.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === "all" || 
                         (statusFilter === "active" && brand.is_active) ||
                         (statusFilter === "inactive" && !brand.is_active);
    const matchesCategory = categoryFilter === "all" || brand.brand_profiles?.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const stats = {
    total: brands.length,
    active: brands.filter(b => b.is_active).length,
    totalMissions: 0, // Placeholder
    totalShares: 0, // Placeholder
    totalFollowers: 0 // Placeholder
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Marka Yönetimi" description="Tüm markaları yönetin" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
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
        title="Marka Yönetimi" 
        description="Tüm markaları yönetin"
        action={
          <div className="flex gap-2">
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg p-1">
              <Button
                variant={viewMode === "cards" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("cards")}
                className="h-8 w-8 p-0"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "ghost"}
                size="sm"
                onClick={() => setViewMode("list")}
                className="h-8 w-8 p-0"
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
            <Button variant="ghost" onClick={fetchBrands} disabled={loading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
            <Button onClick={() => router.push("/brands/profile/new")}>
              <Plus className="h-4 w-4 mr-2" />Marka Profili Oluştur
            </Button>
          </div>
        }
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
          <StatsRow>
            <StatCard title="Toplam Marka" value={stats.total} icon={Building2} />
            <StatCard title="Toplam Görev" value={stats.totalMissions} icon={Target} />
            <StatCard title="Toplam Paylaşım" value={stats.totalShares} icon={Share2} />
            <StatCard title="Toplam Takipçi" value={stats.totalFollowers} icon={Users} />
          </StatsRow>

          <div className="card p-6">
            <div className="toolbar mb-6">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    placeholder="Marka ara..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="all">Tüm Durumlar</option>
                  <option value="active">Aktif</option>
                  <option value="inactive">Pasif</option>
                </Select>
                <Select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-40"
                >
                  <option value="all">Tüm Kategoriler</option>
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
                </Select>

              </div>
            </div>

            {filteredBrands.length === 0 ? (
              <div className="text-center py-12">
                <Building2 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz marka yok</h3>
                <p className="text-slate-500">İlk markanızı oluşturmak için yukarıdaki butonu kullanın.</p>
              </div>
            ) : viewMode === "cards" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredBrands.map((brand) => (
                  <div key={brand.id} className="card p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          src={brand.brand_profiles?.logo_url || brand.brand_profiles?.avatar_url}
                          fallback={brand.name[0] || "M"}
                          size="lg"
                        />
                        <div>
                          <h3 className="font-semibold text-slate-900">{brand.name}</h3>
                          <p className="text-sm text-slate-500">{brand.brand_profiles?.display_name || brand.name}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`badge ${
                          brand.is_active 
                            ? "bg-emerald-100 text-emerald-700" 
                            : "bg-slate-100 text-slate-700"
                        }`}>
                          {brand.is_active ? "Aktif" : "Pasif"}
                        </span>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Kategori:</span>
                        <span className="badge bg-brand-100 text-brand-700">
                          {brand.brand_profiles?.category || brand.category || "Genel"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">E-posta:</span>
                        <span className="text-sm font-medium">{brand.brand_profiles?.email || brand.email || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Telefon:</span>
                        <span className="text-sm font-medium">{brand.brand_profiles?.phone || brand.phone || "N/A"}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Website:</span>
                        <span className="text-sm font-medium">
                          {(brand.brand_profiles?.website || brand.website) ? (
                            <a 
                              href={(brand.brand_profiles?.website || brand.website)?.startsWith('http') 
                                ? (brand.brand_profiles?.website || brand.website)
                                : `https://${brand.brand_profiles?.website || brand.website}`} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {(brand.brand_profiles?.website || brand.website)?.replace(/^https?:\/\//, '')}
                            </a>
                          ) : "N/A"}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-slate-500">Lisans:</span>
                        <span className="text-sm font-medium">
                          <span className="badge bg-purple-100 text-purple-700">
                            {brand.brand_profiles?.license_plan || "Basic"}
                          </span>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-10 h-10 p-0 hover:bg-blue-50"
                        onClick={() => handleShowDetail(brand)}
                        title="Detay"
                      >
                        <Eye className="h-4 w-4 text-blue-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-10 h-10 p-0 hover:bg-emerald-50"
                        onClick={() => handleEdit(brand)}
                        title="Düzenle"
                      >
                        <Edit className="h-4 w-4 text-emerald-600" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className={`w-10 h-10 p-0 ${
                          brand.is_active 
                            ? "hover:bg-orange-50" 
                            : "hover:bg-green-50"
                        }`}
                        onClick={() => handleToggleActive(brand)}
                        title={brand.is_active ? "Pasife Al" : "Aktif Et"}
                      >
                        <Power className={`h-4 w-4 ${
                          brand.is_active ? "text-orange-600" : "text-green-600"
                        }`} />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-10 h-10 p-0 hover:bg-red-50"
                        onClick={() => handleDeleteClick(brand)}
                        title="Sil"
                      >
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="border-b border-slate-200">
                      <tr>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Marka</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Kategori</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">E-posta</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Telefon</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Website</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Lisans</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                        <th className="text-left py-3 px-4 font-medium text-slate-600">İşlemler</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredBrands.map((brand) => (
                        <tr key={brand.id} className="border-b border-slate-100 hover:bg-slate-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar
                                src={brand.brand_profiles?.logo_url || brand.brand_profiles?.avatar_url}
                                fallback={brand.name[0] || "M"}
                                size="sm"
                              />
                              <div>
                                <div className="font-medium text-slate-900">{brand.name}</div>
                                <div className="text-sm text-slate-500">{brand.brand_profiles?.display_name || brand.name}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <span className="badge bg-brand-100 text-brand-700">
                              {brand.brand_profiles?.category || brand.category || "Genel"}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {brand.brand_profiles?.email || brand.email || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {brand.brand_profiles?.phone || brand.phone || "N/A"}
                          </td>
                          <td className="py-3 px-4 text-sm text-slate-600">
                            {(brand.brand_profiles?.website || brand.website) ? (
                              <a 
                                href={(brand.brand_profiles?.website || brand.website)?.startsWith('http') 
                                  ? (brand.brand_profiles?.website || brand.website)
                                  : `https://${brand.brand_profiles?.website || brand.website}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline"
                              >
                                {(brand.brand_profiles?.website || brand.website)?.replace(/^https?:\/\//, '')}
                              </a>
                            ) : "N/A"}
                          </td>
                          <td className="py-3 px-4">
                            <span className="badge bg-purple-100 text-purple-700">
                              {brand.brand_profiles?.license_plan || "Basic"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <span className={`badge ${
                              brand.is_active 
                                ? "bg-emerald-100 text-emerald-700" 
                                : "bg-slate-100 text-slate-700"
                            }`}>
                              {brand.is_active ? "Aktif" : "Pasif"}
                            </span>
                          </td>
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0 hover:bg-blue-50"
                                onClick={() => handleShowDetail(brand)}
                                title="Detay"
                              >
                                <Eye className="h-4 w-4 text-blue-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0 hover:bg-emerald-50"
                                onClick={() => handleEdit(brand)}
                                title="Düzenle"
                              >
                                <Edit className="h-4 w-4 text-emerald-600" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className={`w-8 h-8 p-0 ${
                                  brand.is_active
                                    ? "hover:bg-orange-50"
                                    : "hover:bg-green-50"
                                }`}
                                onClick={() => handleToggleActive(brand)}
                                title={brand.is_active ? "Pasife Al" : "Aktif Et"}
                              >
                                <Power className={`h-4 w-4 ${
                                  brand.is_active ? "text-orange-600" : "text-green-600"
                                }`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="w-8 h-8 p-0 hover:bg-red-50"
                                onClick={() => handleDeleteClick(brand)}
                                title="Sil"
                              >
                                <Trash2 className="h-4 w-4 text-red-600" />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Brand Detail Modal */}
      <BrandDetailModal
        brand={selectedBrand}
        isOpen={isDetailModalOpen}
        onClose={handleCloseModal}
        onToggleActive={handleToggleActive}
        onEdit={handleEdit}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteCancel}
        title="Markayı Sil"
        size="sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {brandToDelete?.name} markasını silmek istediğinizden emin misiniz?
              </h3>
              <p className="text-sm text-slate-500 mt-1">
                Bu işlem geri alınamaz. Marka ve tüm verileri kalıcı olarak silinecektir.
              </p>
            </div>
          </div>
          
          <div className="flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={handleDeleteCancel}
            >
              İptal
            </Button>
            <Button
              onClick={handleDeleteConfirm}
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
