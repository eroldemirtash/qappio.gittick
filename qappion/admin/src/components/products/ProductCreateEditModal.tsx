"use client";

import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Textarea } from "@/components/ui/Textarea";
import ImagePickerField from "./ImagePickerField";
import { createOrUpdateProductAction } from "@/app/products/actions";
import { X, Upload, Star, Package, ShoppingBag, Eye, Trash2 } from "lucide-react";
import { MarketItem, Brand } from "@/lib/types";

type FormInput = {
  id?: string;
  brand_id: string;
  title: string;
  description?: string;
  usage_terms?: string;
  value_qp: number;
  stock_status: 'in_stock'|'low'|'out_of_stock'|'hidden';
  stock_count?: number;
  category: string;
  level: number;
  levels: string[];
  features: string; // Özellikler (virgülle ayrılmış)
  marketplaces: { marketplace: string; product_url: string; image_url?: string }[];
  cover_image: File | null; // Ana görsel
  gallery_images: File[]; // Galeri görselleri
  is_active: boolean;
};

interface ProductCreateEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  product?: MarketItem | null;
  onSave: (product: Partial<MarketItem>) => void;
}

const levelOptions = [
  { value: 1, label: "Snapper (0-500 QP)", color: "#fbbf24" },
  { value: 2, label: "Seeker (501-1000 QP)", color: "#10b981" },
  { value: 3, label: "Crafter (1001-2000 QP)", color: "#8b5cf6" },
  { value: 4, label: "Viralist (2001-5000 QP)", color: "#ef4444" },
  { value: 5, label: "Qappian (5000+ QP)", color: "#1e40af" },
];

const categoryOptions = [
  { value: "Elektronik", label: "Elektronik" },
  { value: "Ses & Kulaklık", label: "Ses & Kulaklık" },
  { value: "Gaming & Aksesuar", label: "Gaming & Aksesuar" },
  { value: "Giyim", label: "Giyim" },
  { value: "Ayakkabı & Çanta", label: "Ayakkabı & Çanta" },
  { value: "Aksesuar & Takı", label: "Aksesuar & Takı" },
  { value: "Güzellik & Bakım", label: "Güzellik & Bakım" },
  { value: "Spor & Outdoor", label: "Spor & Outdoor" },
  { value: "Sağlık & Wellness", label: "Sağlık & Wellness" },
  { value: "Ev & Yaşam", label: "Ev & Yaşam" },
  { value: "Mutfak & Kahve", label: "Mutfak & Kahve" },
  { value: "Hobi & DIY", label: "Hobi & DIY" },
  { value: "Kırtasiye & Ofis", label: "Kırtasiye & Ofis" },
  { value: "Bebek & Çocuk", label: "Bebek & Çocuk" },
  { value: "Evcil Hayvan", label: "Evcil Hayvan" },
  { value: "Otomotiv", label: "Otomotiv" },
  { value: "Seyahat & Valiz", label: "Seyahat & Valiz" },
  { value: "Yiyecek & İçecek", label: "Yiyecek & İçecek" },
  { value: "Dijital / Kodlar", label: "Dijital / Kodlar" },
  { value: "Sezonluk & Hediyelik", label: "Sezonluk & Hediyelik" },
];

const marketplaceOptions = [
  { value: "Trendyol", label: "Trendyol" },
  { value: "Hepsiburada", label: "Hepsiburada" },
  { value: "Pazarama", label: "Pazarama" },
  { value: "Amazon", label: "Amazon" },
  { value: "N11", label: "N11" },
  { value: "Diğer", label: "Diğer" },
];

export function ProductCreateEditModal({ isOpen, onClose, product, onSave }: ProductCreateEditModalProps) {
  const { control, register, handleSubmit, watch, formState: { isSubmitting, errors }, reset } = useForm<FormInput>({
    defaultValues: {
      id: product?.id || '',
      brand_id: product?.brand_id || '',
      title: product?.name || product?.title || '',
      description: product?.description || '',
      usage_terms: '',
      value_qp: product?.value_qp || product?.price_qp || 0,
      stock_status: 'in_stock',
      stock_count: product?.stock || undefined,
      category: product?.category || 'Elektronik',
      level: product?.level || 1,
      levels: [],
      features: '', // Özellikler (virgülle ayrılmış)
      marketplaces: [],
      cover_image: null, // Ana görsel
      gallery_images: [], // Galeri görselleri
      is_active: product?.is_active ?? true,
    }
  });

  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [newMarketplace, setNewMarketplace] = useState({ name: "", url: "", isCustom: false });
  const [previewMode, setPreviewMode] = useState<"grid" | "list">("grid");
  const [isUploading, setIsUploading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [existingImages, setExistingImages] = useState<string[]>([]);

  const coverImage = watch('cover_image') as File | null;
  const galleryImages = watch('gallery_images') as File[]; // debug için
  const features = watch('features') as string;

  useEffect(() => {
    if (product) {
      // API -> Form eşleme (normalize)
      const normalized: Partial<MarketItem> = {
        id: product.id,
        name: (product as any).name || (product as any).title || "",
        description: product.description || "",
        price_qp: (product as any).price_qp ?? (product as any).value_qp ?? 0,
        stock: (product as any).stock ?? 0,
        category: product.category || "Elektronik",
        level: (product as any).level ?? 1,
        brand_id: product.brand_id,
        image_url: (product as any).image_url || (product as any).cover_url || "",
        images: (() => {
          // Önce mevcut images/gallery kontrol et
          if ((product as any).images && Array.isArray((product as any).images)) {
            return (product as any).images;
          }
          if ((product as any).gallery && Array.isArray((product as any).gallery)) {
            return (product as any).gallery;
          }
          // cover_url'den görsel oluştur
          if ((product as any).cover_url) {
            return [(product as any).cover_url];
          }
          // product_images tablosundan görselleri al
          if ((product as any).product_images && Array.isArray((product as any).product_images) && (product as any).product_images.length > 0) {
            return (product as any).product_images.map((img: any) => img.url);
          }
          return [];
        })(),
        features: (product as any).features || [],
        marketplace_links: (product as any).marketplace_links || [],
        is_active: product.is_active ?? true,
      } as any;

      console.log('Product data loaded:', product);
      console.log('Product images from API:', (product as any).product_images);
      console.log('Product levels from API:', (product as any).product_levels);
      console.log('Product marketplaces from API:', (product as any).product_marketplaces);
      console.log('Normalized form data:', normalized);
      console.log('Images array:', normalized.images);
      
      // Mevcut görselleri state'e kaydet
      setExistingImages(normalized.images || []);
      
      // Reset form with normalized data
      reset({
        id: normalized.id || '',
        brand_id: normalized.brand_id || '',
        title: normalized.name || '',
        description: normalized.description || '',
        usage_terms: (product as any).usage_terms || '',
        value_qp: normalized.price_qp || 0,
        stock_status: (product as any).stock_status || 'in_stock',
        stock_count: normalized.stock || undefined,
        category: normalized.category || 'Elektronik',
        level: normalized.level || 1,
        levels: (product as any).product_levels?.map((level: any) => level.level) || [],
        features: Array.isArray(normalized.features) ? normalized.features.join(', ') : (normalized.features || ''),
        marketplaces: (normalized.marketplace_links || []).map((link: any) => ({
          marketplace: link.name || link.marketplace || '',
          product_url: link.url || link.product_url || '',
          image_url: link.image_url || ''
        })),
        cover_image: null, // Will be handled separately
        gallery_images: [], // Will be handled by ImagePickerField
        is_active: normalized.is_active ?? true,
      });

      if ((product as any).brand) {
        setSelectedBrand({
          id: product.brand_id,
          name: (product as any).brand?.name || '',
          logo_url: (product as any).brand?.logo_url,
          is_active: true,
          created_at: new Date().toISOString(),
          brand_profiles: (product as any).brand?.brand_profiles,
        });
      }
    } else {
      // Reset form to default values for new product
      reset({
        id: '',
        brand_id: '',
        title: '',
        description: '',
        usage_terms: '',
        value_qp: 0,
        stock_status: 'in_stock',
        stock_count: undefined,
        category: 'Elektronik',
        level: 1,
        levels: [],
        marketplaces: [],
        cover_image: null,
        gallery_images: [],
        is_active: true,
      });
      setSelectedBrand(null);
    }
  }, [product]);

  useEffect(() => {
      loadBrands();
  }, []);

  const loadBrands = async () => {
    try {
      const response = await fetch("/api/brands");
      const data = await response.json();
      if (data.brands) {
        setBrands(data.brands);
      } else {
        // Fallback mock data
        setBrands([
          { id: "1", name: "Apple", logo_url: "https://via.placeholder.com/100", website: "apple.com", is_active: true, created_at: new Date().toISOString() },
          { id: "2", name: "Nike", logo_url: "https://via.placeholder.com/100", website: "nike.com", is_active: true, created_at: new Date().toISOString() },
          { id: "3", name: "Samsung", logo_url: "https://via.placeholder.com/100", website: "samsung.com", is_active: true, created_at: new Date().toISOString() },
          { id: "4", name: "Adidas", logo_url: "https://via.placeholder.com/100", website: "adidas.com", is_active: true, created_at: new Date().toISOString() },
          { id: "5", name: "Sony", logo_url: "https://via.placeholder.com/100", website: "sony.com", is_active: true, created_at: new Date().toISOString() }
        ]);
      }
    } catch (error) {
      console.error("Brands fetch error:", error);
      // Fallback mock data
      setBrands([
        { id: "1", name: "Apple", logo_url: "https://via.placeholder.com/100", website: "apple.com", is_active: true, created_at: new Date().toISOString() },
        { id: "2", name: "Nike", logo_url: "https://via.placeholder.com/100", website: "nike.com", is_active: true, created_at: new Date().toISOString() },
        { id: "3", name: "Samsung", logo_url: "https://via.placeholder.com/100", website: "samsung.com", is_active: true, created_at: new Date().toISOString() },
        { id: "4", name: "Adidas", logo_url: "https://via.placeholder.com/100", website: "adidas.com", is_active: true, created_at: new Date().toISOString() },
        { id: "5", name: "Sony", logo_url: "https://via.placeholder.com/100", website: "sony.com", is_active: true, created_at: new Date().toISOString() }
      ]);
    }
  };



  const handleAddMarketplace = () => {
    if (newMarketplace.name.trim() && newMarketplace.url.trim()) {
      const marketplace = {
        marketplace: newMarketplace.name.trim(),
        product_url: newMarketplace.url.trim(),
        image_url: ""
      };
      
      // Get current marketplaces from form
      const currentMarketplaces = watch('marketplaces') || [];
      const updatedMarketplaces = [...currentMarketplaces, marketplace];
      
      // Update form with new marketplace
      const currentFormData = watch();
      reset({
        ...currentFormData,
        marketplaces: updatedMarketplaces
      });
      
      setNewMarketplace({ name: "", url: "", isCustom: false });
    }
  };

  const handleRemoveMarketplace = (index: number) => {
    const currentMarketplaces = watch('marketplaces') || [];
    const updatedMarketplaces = currentMarketplaces.filter((_, i) => i !== index);
    
    // Update form with removed marketplace
    const currentFormData = watch();
    reset({
      ...currentFormData,
      marketplaces: updatedMarketplaces
    });
  };

  const onSubmit = async (data: FormInput) => {
    try {
      setErr(null);
      console.log('🧩 Form data before submit:', data);
      console.log('🧩 Cover image:', data.cover_image?.name);
      console.log('🧩 Gallery length before submit:', data.gallery_images?.length || 0);

      // Validation
      if (!data.brand_id || !data.title) {
        setErr('Marka ve ürün adı zorunludur');
        return;
      }

      const fd = new FormData();
      if (data.id) fd.append('id', data.id);
      fd.append('brand_id', data.brand_id);
      fd.append('title', data.title);
      fd.append('description', data.description || '');
      fd.append('usage_terms', data.usage_terms || '');
      fd.append('value_qp', String(data.value_qp));
      fd.append('stock_status', data.stock_status);
      if (typeof data.stock_count === 'number') fd.append('stock_count', String(data.stock_count));
      fd.append('category', data.category);
      fd.append('level', String(data.level));
      fd.append('is_active', String(data.is_active));
      fd.append('levels', JSON.stringify(data.levels || []));
      const featuresArray = data.features ? data.features.split(',').map(f => f.trim()).filter(f => f.length > 0) : [];
      fd.append('features', JSON.stringify(featuresArray));
      fd.append('marketplaces', JSON.stringify(data.marketplaces || []));

      // Ana görsel
      if (data.cover_image) {
        fd.append('cover_image', data.cover_image, data.cover_image.name || 'cover.jpg');
      }

      // Galeri görselleri
      (data.gallery_images || []).forEach((f, idx) => {
        fd.append('gallery_images', f, f.name || `gallery_${idx}.jpg`);
      });
      console.log('📦 FormData cover image:', data.cover_image?.name);
      console.log('📦 FormData gallery images appended:', (data.gallery_images || []).length);

      const res = await createOrUpdateProductAction(fd);
      if (!res?.ok) throw new Error(res?.error || 'Kaydetme başarısız');

      console.log('✅ Product saved with id:', res.id);
      onClose(); // modal kapat
      // onSave({}); // parent'ı yenile - Server Action zaten revalidatePath yapıyor
    } catch (e: any) {
      console.error('❌ Product save error:', e?.message || e);
      setErr(e?.message || 'Hata');
    }
  };

  const selectedLevel = levelOptions.find(l => l.value === watch('level'));
  const selectedCategory = categoryOptions.find(c => c.value === watch('category'));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h3 className="text-xl font-semibold">
            {product ? "Ürün Düzenle" : "Yeni Ürün Ekle"}
          </h3>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setPreviewMode(previewMode === "grid" ? "list" : "grid")}
            >
              <Eye className="h-4 w-4 mr-2" />
              {previewMode === "grid" ? "Liste" : "Grid"} Önizleme
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <form id="product-form" onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-hidden flex">
          {/* Form Section */}
          <div className="w-1/2 p-6 overflow-y-auto border-r">
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Temel Bilgiler</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ürün Adı *
                  </label>
                  <Input
                    {...register('title', { required: 'Ürün adı zorunludur' })}
                    placeholder="Ürün adını girin"
                  />
                  {errors.title && (
                    <p className="text-red-500 text-sm mt-1">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Açıklama *
                  </label>
                  <Textarea
                    {...register('description')}
                    placeholder="Ürün açıklaması"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      QP Fiyatı *
                    </label>
                    <Input
                      type="number"
                      {...register('value_qp', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Stok *
                    </label>
                    <Input
                      type="number"
                      {...register('stock_count', { valueAsNumber: true })}
                      placeholder="0"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Kategori *
                    </label>
                    <Select
                      {...register('category')}
                    >
                      {categoryOptions.map(cat => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </Select>
            </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Seviye *
                    </label>
                    <Select
                      {...register('level', { valueAsNumber: true })}
                    >
                      {levelOptions.map(level => (
                        <option key={level.value} value={level.value}>
                          {level.label}
                        </option>
                      ))}
                    </Select>
                  </div>
                </div>

              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                  Marka *
                </label>
                <Select
                    {...register('brand_id', { required: 'Marka seçimi zorunludur' })}
                    onChange={(e) => {
                      const brand = brands.find(b => b.id === e.target.value);
                      setSelectedBrand(brand || null);
                    }}
                >
                  <option value="">Marka seçin</option>
                  {brands.map(brand => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </Select>
                {errors.brand_id && (
                    <p className="text-red-500 text-sm mt-1">{errors.brand_id.message}</p>
                )}
                </div>
              </div>

              {/* Images */}
              <div className="space-y-6">
                <h4 className="text-lg font-medium">Görseller</h4>
                
                
                {/* Ana Görsel */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Ana Görsel (Ürün Kartında Gösterilecek) *
                </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                    <Controller
                      control={control}
                      name="cover_image"
                      render={({ field: { value, onChange } }) => (
                        <div className="space-y-3">
                          <div className="flex items-center justify-center w-full">
                            <label htmlFor="cover-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-300 border-dashed rounded-lg cursor-pointer bg-slate-50 hover:bg-slate-100">
                              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <svg className="w-8 h-8 mb-4 text-slate-500" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
                                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
                                </svg>
                                <p className="mb-2 text-sm text-slate-500">
                                  <span className="font-semibold">Ana görsel seçmek için tıklayın</span>
                                </p>
                                <p className="text-xs text-slate-500">PNG, JPG (MAX. 5MB)</p>
                              </div>
                              <input
                                id="cover-upload"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  const file = e.target.files?.[0] || null;
                                  onChange(file);
                                }}
                              />
                            </label>
              </div>

                          {value && (
                            <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-lg">
                              <div className="w-16 h-16 rounded-lg overflow-hidden border-2 border-slate-200">
                                <img
                                  src={URL.createObjectURL(value)}
                                  alt="Ana görsel önizleme"
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium text-slate-900">{value.name}</p>
                                <p className="text-sm text-slate-600">Ana görsel seçildi</p>
                              </div>
                              <button
                                type="button"
                                onClick={() => onChange(null)}
                                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                )}
              </div>
                      )}
                    />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Bu görsel ürün kartında ana görsel olarak gösterilecek
                  </p>
              </div>

                {/* Galeri Görselleri */}
              <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Galeri Görselleri (Max 4 adet)
                </label>
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-4">
                    <ImagePickerField control={control} name="gallery_images" max={4} />
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Ürün detay sayfasında gösterilecek ek görseller
                  </p>
                </div>
              </div>

              {/* Error Message */}
              {err && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded">
                  {err}
                </div>
              )}

              {/* Features */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Özellikler</h4>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Özellikler (virgülle ayırın)
                  </label>
                  <Textarea
                    {...register('features')}
                    placeholder="Hızlı teslimat, Ücretsiz kargo, 2 yıl garanti"
                    rows={3}
                    onChange={(e) => {
                      const value = e.target.value;
                      const currentFormData = watch();
                      reset({
                        ...currentFormData,
                        features: value
                      });
                    }}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    Özellikleri virgülle ayırarak yazın (örn: Hızlı teslimat, Ücretsiz kargo)
                  </p>
                </div>
              </div>

              {/* Marketplace Links */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Marketplace Linkleri</h4>

                <div className="space-y-3">
                  <div className="space-y-3">
                <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Marketplace Adı
                  </label>
                      <div className="space-y-2">
                        <Select
                          value={newMarketplace.isCustom ? "" : newMarketplace.name}
                          onChange={(e) => {
                            if (e.target.value === "custom") {
                              setNewMarketplace(prev => ({ ...prev, name: "", isCustom: true }));
                            } else {
                              setNewMarketplace(prev => ({ ...prev, name: e.target.value, isCustom: false }));
                            }
                          }}
                        >
                          <option value="">Marketplace seçin</option>
                          {marketplaceOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                          <option value="custom">Manuel Gir</option>
                  </Select>
                        
                        {newMarketplace.isCustom && (
                          <Input
                            value={newMarketplace.name}
                            onChange={(e) => setNewMarketplace(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="Marketplace adını yazın"
                          />
                        )}
                      </div>
                </div>

                <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Ürün URL'si
                  </label>
                  <Input
                        value={newMarketplace.url}
                        onChange={(e) => setNewMarketplace(prev => ({ ...prev, url: e.target.value }))}
                        placeholder="https://..."
                      />
                    </div>
                  </div>
                  
                  <Button 
                    onClick={handleAddMarketplace} 
                    size="sm"
                    disabled={!newMarketplace.name || !newMarketplace.url}
                  >
                    Marketplace Ekle
                  </Button>
                </div>

                <div className="space-y-2">
                  {watch('marketplaces') && watch('marketplaces').length > 0 ? (
                    <div className="space-y-2">
                      {watch('marketplaces').map((marketplace: any, index: number) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div className="flex-1">
                            <p className="font-medium text-slate-900">{marketplace.marketplace}</p>
                            <p className="text-sm text-slate-600 truncate">{marketplace.product_url}</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRemoveMarketplace(index)}
                            className="ml-2 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-slate-500">Henüz marketplace linki eklenmedi</p>
                  )}
                </div>
              </div>

              {/* Status */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">Durum</h4>
                
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="is_active"
                    {...register('is_active')}
                    className="rounded"
                  />
                  <label htmlFor="is_active" className="text-sm font-medium text-slate-700">
                    Aktif
                    </label>
                </div>
              </div>
              </div>
          </div>

          {/* Preview Section */}
          <div className="w-1/2 p-6 overflow-y-auto bg-slate-50">
            <h4 className="text-lg font-medium mb-4">Mobil Önizleme</h4>
            
            <div className="bg-white rounded-lg shadow-sm border p-4">
              {/* Brand Card Preview */}
              <div className="bg-gradient-to-r from-slate-100 to-slate-200 rounded-lg p-4 mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center overflow-hidden">
                      {selectedBrand?.brand_profiles?.avatar_url || selectedBrand?.logo_url ? (
                        <img 
                          src={selectedBrand.brand_profiles?.avatar_url || selectedBrand.logo_url} 
                        alt={selectedBrand.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Package className="h-6 w-6 text-slate-600" />
                      )}
                    </div>
                    <div>
                      <h5 className="font-semibold text-white">{selectedBrand?.name || "Marka Adı"}</h5>
                      <p className="text-sm text-white/80">
                        {selectedBrand?.brand_profiles?.website || selectedBrand?.website 
                          ? `www.${(selectedBrand.brand_profiles?.website || selectedBrand.website || '').replace(/^https?:\/\//, '')}`
                          : "www.marka.com"}
                      </p>
                    </div>
                  </div>
                  
                  {/* Marka Detay Bilgileri */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-white/90">
                    <div>
                      <span className="font-medium">Email:</span>
                      <p className="truncate">{selectedBrand?.brand_profiles?.email || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Kategori:</span>
                      <p className="truncate">{selectedBrand?.brand_profiles?.category || "Genel"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Telefon:</span>
                      <p className="truncate">{selectedBrand?.brand_profiles?.phone || "N/A"}</p>
                    </div>
                    <div>
                      <span className="font-medium">Lisans:</span>
                      <p className="truncate">{selectedBrand?.brand_profiles?.license_plan || "Basic"}</p>
                    </div>
                  </div>
                  
                </div>
              </div>

              {/* Product Card Preview */}
              <div className={`${previewMode === "grid" ? "grid grid-cols-2 gap-4" : "space-y-4"}`}>
                <div className={`bg-white rounded-lg border p-4 ${previewMode === "list" ? "flex gap-4" : ""}`}>
                  <div className={`${previewMode === "grid" ? "aspect-square" : "w-20 h-20"} bg-slate-100 rounded-lg flex items-center justify-center mb-2`}>
                    {coverImage ? (
                      <img 
                        src={URL.createObjectURL(coverImage)} 
                        alt={watch('title')}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <Package className="h-8 w-8 text-slate-400" />
                    )}
                </div>

                  <div className="flex-1">
                    <h5 className="font-semibold text-slate-900 mb-1">
                      {watch('title') || "Ürün Adı"}
                    </h5>
                    <p className="text-sm text-slate-500 mb-2">
                      {selectedBrand?.name || "Marka"}
                    </p>
                    
                    {watch('description') && (
                      <p className="text-sm text-slate-600 mb-2 line-clamp-2">
                        {watch('description')}
                      </p>
                    )}
                    
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                        <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          <span className="text-sm font-bold">{watch('value_qp') || 0} QP</span>
                        </div>
                        <span className="text-xs text-slate-500">
                          Stok: {watch('stock_count') || 0}
                    </span>
                      </div>
                      
                      {selectedLevel && (
                        <div 
                          className="px-2 py-1 rounded text-xs font-semibold text-white"
                          style={{ backgroundColor: selectedLevel.color }}
                        >
                          {selectedLevel.label.split(" ")[0]}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Existing Images Preview */}
              {existingImages && existingImages.length > 0 && (
                <div className="mt-4">
                  <h6 className="font-medium text-slate-900 mb-2">Mevcut Görseller:</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {existingImages.map((imageUrl, index) => (
                      <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={imageUrl}
                          alt={`Mevcut görsel ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Gallery Images Preview */}
              {galleryImages && galleryImages.length > 0 && (
                <div className="mt-4">
                  <h6 className="font-medium text-slate-900 mb-2">Yeni Galeri Görselleri:</h6>
                  <div className="grid grid-cols-2 gap-2">
                    {galleryImages.map((image, index) => (
                      <div key={index} className="aspect-square bg-slate-100 rounded-lg overflow-hidden">
                        <img
                          src={URL.createObjectURL(image)}
                          alt={`Galeri görsel ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Features Preview */}
              <div className="mt-4">
                <h6 className="font-medium text-slate-900 mb-2">Özellikler:</h6>
                {features && features.trim() ? (
                  <div className="flex flex-wrap gap-1">
                    {features.split(',').map((feature, index) => {
                      const trimmed = feature.trim();
                      return trimmed ? (
                      <span
                          key={index}
                          className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs"
                      >
                          {trimmed}
                      </span>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Henüz özellik eklenmedi</p>
                )}
              </div>

              {/* Marketplace Links Preview */}
              <div className="mt-4">
                <h6 className="font-medium text-slate-900 mb-2">Marketplace Linkleri:</h6>
                {watch('marketplaces') && watch('marketplaces').length > 0 ? (
                  <div className="space-y-2">
                    {watch('marketplaces').map((marketplace: any, index: number) => (
                      <div key={index} className="flex items-center gap-2 p-2 bg-slate-100 rounded">
                        <ShoppingBag className="h-4 w-4 text-slate-600" />
                        <div className="flex-1">
                          <p className="text-sm font-medium text-slate-900">{marketplace.marketplace}</p>
                          <p className="text-xs text-slate-600 truncate">{marketplace.product_url}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">Marketplace linki yok</p>
                )}
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t">
          <Button variant="ghost" onClick={onClose}>
            İptal
          </Button>
          <Button type="submit" form="product-form" disabled={isSubmitting}>
            {isSubmitting ? 'Kaydediliyor…' : (product ? "Güncelle" : "Ürün Ekle")}
          </Button>
        </div>
      </div>
    </div>
  );
}
