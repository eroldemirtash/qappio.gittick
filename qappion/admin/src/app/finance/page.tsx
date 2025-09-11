"use client";

import { useEffect, useState } from "react";
import { jget, jpost, jpatch, jdelete } from "@/lib/fetcher";
import { Brand } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { CreditCard, Download, Eye, Edit, Plus, X, Save, FileText, DollarSign, CreditCard as PaymentIcon } from "lucide-react";

export const dynamic = "force-dynamic";

interface License {
  id: string;
  name: string;
  price: string;
  features: string[];
  color: string;
  description?: string;
  max_missions?: number;
  max_duration_days?: number;
  weekly_attempts?: number;
  sponsored_allowed?: boolean;
  post_pay_amount?: number;
  post_pay_currency?: 'TL' | 'USD';
}

interface BrandLicense {
  id: string;
  brand_id: string;
  brand_name: string;
  license_plan: string;
  license_start: string;
  license_end: string;
  license_fee: number;
  status: 'active' | 'expired' | 'pending';
}

export default function FinancePage() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [brandLicenses, setBrandLicenses] = useState<BrandLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLicense, setEditingLicense] = useState<License | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [assignModalVisible, setAssignModalVisible] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<License | null>(null);
  const [selectedBrand, setSelectedBrand] = useState<string>('');
  const [formData, setFormData] = useState<Partial<License>>({
    name: '',
    price: '',
    features: [],
    color: 'border-slate-200',
    description: '',
    max_missions: 0,
    max_duration_days: 0,
    weekly_attempts: 0,
    sponsored_allowed: false,
    post_pay_amount: 0,
    post_pay_currency: 'TL'
  });

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await jget<{ items: Brand[] }>("/api/brands");
        setBrands(response.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchBrands();
  }, []);

  const handleCreateLicense = () => {
    setIsCreating(true);
    setEditingLicense(null);
    setFormData({
      name: '',
      price: '',
      features: [],
      color: 'border-slate-200',
      description: '',
      max_missions: 0,
      max_duration_days: 0,
      weekly_attempts: 0,
      sponsored_allowed: false,
      post_pay_amount: 0,
      post_pay_currency: 'TL'
    });
    setShowModal(true);
  };

  const handleEditLicense = (license: License) => {
    setIsCreating(false);
    setEditingLicense(license);
    setFormData(license);
    setShowModal(true);
  };

  const handleAssignLicense = (license: License) => {
    setSelectedLicense(license);
    setAssignModalVisible(true);
  };

  const handleDownloadProposal = async (license: License) => {
    try {
      // PDF oluşturma işlemi
      const proposalData = {
        licenseName: license.name,
        price: license.price,
        features: license.features,
        description: license.description,
        maxMissions: license.max_missions,
        maxDurationDays: license.max_duration_days,
        weeklyAttempts: license.weekly_attempts,
        sponsoredAllowed: license.sponsored_allowed
      };

      // Mock PDF oluşturma - gerçek uygulamada PDF library kullanılacak
      const pdfContent = `
        QAPPIO LİSANS TEKLİFİ
        ====================
        
        Lisans Adı: ${proposalData.licenseName}
        Fiyat: ${proposalData.price}
        Açıklama: ${proposalData.description}
        
        Özellikler:
        ${proposalData.features.map(feature => `• ${feature}`).join('\n')}
        
        Teknik Detaylar:
        • Maksimum Görev: ${proposalData.maxMissions === -1 ? 'Sınırsız' : proposalData.maxMissions}
        • Maksimum Süre: ${proposalData.maxDurationDays} gün
        • Haftalık Deneme: ${proposalData.weeklyAttempts}
        • Sponsorlu İçerik: ${proposalData.sponsoredAllowed ? 'Evet' : 'Hayır'}
        • Görev Başına Ödeme: ${license.post_pay_amount ? `${license.post_pay_amount} ${license.post_pay_currency}` : 'Yok'}
        
        Tarih: ${new Date().toLocaleDateString('tr-TR')}
      `;

      // Blob oluştur ve indir
      const blob = new Blob([pdfContent], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `qappio-${license.name.toLowerCase()}-teklif.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF oluşturma hatası:', error);
      alert('Teklif indirilirken hata oluştu');
    }
  };

  const handleSaveLicense = async () => {
    try {
      if (isCreating) {
        const newLicense = {
          id: Date.now().toString(),
          ...formData,
          features: formData.features || []
        } as License;
        setLicenses(prev => [...prev, newLicense]);
      } else if (editingLicense) {
        const updatedLicense = {
          ...editingLicense,
          ...formData
        };
        setLicenses(prev => prev.map(l => l.id === editingLicense.id ? updatedLicense : l));
      }
      setShowModal(false);
    } catch (err) {
      console.error('Save error:', err);
      alert('Kaydetme sırasında hata oluştu');
    }
  };

  const handleAssignToBrand = async () => {
    if (!selectedLicense || !selectedBrand) return;

    try {
      const brandLicense: BrandLicense = {
        id: Date.now().toString(),
        brand_id: selectedBrand,
        brand_name: brands.find(b => b.id === selectedBrand)?.name || '',
        license_plan: selectedLicense.name,
        license_start: new Date().toISOString().split('T')[0],
        license_end: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        license_fee: parseInt(selectedLicense.price.replace('₺', '')),
        status: 'active'
      };

      setBrandLicenses(prev => [...prev, brandLicense]);
      setAssignModalVisible(false);
      setSelectedLicense(null);
      setSelectedBrand('');
    } catch (err) {
      console.error('Assign error:', err);
      alert('Lisans atanırken hata oluştu');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setAssignModalVisible(false);
    setFormData({
      name: '',
      price: '',
      features: [],
      color: 'border-slate-200',
      description: '',
      max_missions: 0,
      max_duration_days: 0,
      weekly_attempts: 0,
      sponsored_allowed: false,
      post_pay_amount: 0,
      post_pay_currency: 'TL'
    });
  };

  const [licenses, setLicenses] = useState<License[]>([
    {
      id: "1",
      name: "Freemium",
      price: "₺0",
      features: [
        "Aylık 5 görev",
        "Maksimum 7 gün süre",
        "Haftalık 1 hakkı",
        "Sponsorlu hakkı yok",
        "Temel özellikler"
      ],
      color: "border-slate-200",
      description: "Yeni başlayan markalar için temel plan",
      max_missions: 5,
      max_duration_days: 7,
      weekly_attempts: 1,
      sponsored_allowed: false,
      post_pay_amount: 0,
      post_pay_currency: 'TL'
    },
    {
      id: "2",
      name: "Premium",
      price: "₺299",
      features: [
        "Aylık 50 görev",
        "Maksimum 30 gün süre",
        "Haftalık 5 hakkı",
        "Sponsorlu hakkı var",
        "Gelişmiş özellikler"
      ],
      color: "border-brand-200",
      description: "Aktif markalar için gelişmiş plan",
      max_missions: 50,
      max_duration_days: 30,
      weekly_attempts: 5,
      sponsored_allowed: true,
      post_pay_amount: 25,
      post_pay_currency: 'TL'
    },
    {
      id: "3",
      name: "Platinum",
      price: "₺599",
      features: [
        "Sınırsız görev",
        "Maksimum 90 gün süre",
        "Haftalık 10 hakkı",
        "Sponsorlu hakkı var",
        "Tüm özellikler"
      ],
      color: "border-amber-200",
      description: "Büyük markalar için premium plan",
      max_missions: -1,
      max_duration_days: 90,
      weekly_attempts: 10,
      sponsored_allowed: true,
      post_pay_amount: 50,
      post_pay_currency: 'USD'
    }
  ]);

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Finans & Lisanslar" description="Marka lisanslarını yönetin" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                {[...Array(5)].map((_, j) => (
                  <div key={j} className="h-3 bg-slate-200 rounded"></div>
                ))}
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
        title="Finans & Lisanslar" 
        description="Marka lisanslarını yönetin"
        action={
          <Button onClick={handleCreateLicense} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Lisans
          </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {licenses.map((license) => (
            <div key={license.id} className={`card p-6 border-2 ${license.color}`}>
              <div className="text-center mb-6">
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{license.name}</h3>
                <div className="text-3xl font-bold text-slate-900 mb-4">{license.price}</div>
                {license.description && (
                  <p className="text-sm text-slate-600 mb-4">{license.description}</p>
                )}
              </div>

              <div className="space-y-3 mb-6">
                {license.features.map((feature, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
                    <span className="text-sm text-slate-600">{feature}</span>
                  </div>
                ))}
                
                {/* Post Pay Bilgisi */}
                {license.post_pay_amount && license.post_pay_amount > 0 && (
                  <div className="flex items-center gap-2 mt-3 p-2 bg-blue-50 rounded-md">
                    <PaymentIcon className="h-4 w-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-800">
                      Görev Başına: {license.post_pay_amount} {license.post_pay_currency}
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Button className="w-full" onClick={() => handleEditLicense(license)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => handleAssignLicense(license)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Markaya Ata
                </Button>
                <Button variant="ghost" className="w-full" onClick={() => handleDownloadProposal(license)}>
                  <Download className="h-4 w-4 mr-2" />
                  Teklif İndir
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="card p-6 mt-6">
        <h3 className="text-lg font-semibold mb-4">Marka Lisansları</h3>
        {brandLicenses.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Henüz lisans atanmamış</h3>
            <p className="text-slate-500">Markalara lisans atamak için yukarıdaki "Markaya Ata" butonunu kullanın.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Marka</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Plan</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Başlangıç</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Bitiş</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Ücret</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Durum</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">İşlemler</th>
                </tr>
              </thead>
              <tbody>
                {brandLicenses.map((license) => (
                  <tr key={license.id} className="border-b border-slate-100">
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-900">{license.brand_name}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="badge bg-brand-100 text-brand-700">
                        {license.license_plan}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(license.license_start).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      {new Date(license.license_end).toLocaleDateString('tr-TR')}
                    </td>
                    <td className="py-3 px-4 text-sm text-slate-600">
                      ₺{license.license_fee}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${
                        license.status === 'active' ? 'bg-green-100 text-green-700' :
                        license.status === 'expired' ? 'bg-red-100 text-red-700' :
                        'bg-yellow-100 text-yellow-700'
                      }`}>
                        {license.status === 'active' ? 'Aktif' :
                         license.status === 'expired' ? 'Süresi Dolmuş' : 'Beklemede'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">Düzenle</Button>
                        <Button variant="ghost" size="sm">Görüntüle</Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* License Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isCreating ? 'Yeni Lisans Ekle' : 'Lisans Düzenle'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Lisans Adı
                </label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Premium"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Fiyat
                </label>
                <Input
                  value={formData.price || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  placeholder="Örn: ₺299"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Açıklama
                </label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Lisans açıklaması"
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maksimum Görev
                </label>
                <Input
                  type="number"
                  value={formData.max_missions || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_missions: parseInt(e.target.value) || 0 }))}
                  placeholder="0 = sınırsız"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Maksimum Süre (Gün)
                </label>
                <Input
                  type="number"
                  value={formData.max_duration_days || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, max_duration_days: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Haftalık Deneme
                </label>
                <Input
                  type="number"
                  value={formData.weekly_attempts || 0}
                  onChange={(e) => setFormData(prev => ({ ...prev, weekly_attempts: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Renk
                </label>
                <select
                  value={formData.color || 'border-slate-200'}
                  onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="border-slate-200">Gri</option>
                  <option value="border-brand-200">Mavi</option>
                  <option value="border-amber-200">Sarı</option>
                  <option value="border-green-200">Yeşil</option>
                  <option value="border-red-200">Kırmızı</option>
                  <option value="border-purple-200">Mor</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.sponsored_allowed || false}
                    onChange={(e) => setFormData(prev => ({ ...prev, sponsored_allowed: e.target.checked }))}
                    className="rounded border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">Sponsorlu içerik izni</span>
                </label>
              </div>

              {/* Post Pay Section */}
              <div className="md:col-span-2">
                <div className="border-t border-slate-200 pt-4">
                  <h4 className="text-sm font-medium text-slate-700 mb-3 flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Görev Post Pay Ayarları
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Görev Başına Ödeme
                      </label>
                      <Input
                        type="number"
                        value={formData.post_pay_amount || 0}
                        onChange={(e) => setFormData(prev => ({ ...prev, post_pay_amount: parseFloat(e.target.value) || 0 }))}
                        placeholder="0"
                        min="0"
                        step="0.01"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Para Birimi
                      </label>
                      <select
                        value={formData.post_pay_currency || 'TL'}
                        onChange={(e) => setFormData(prev => ({ ...prev, post_pay_currency: e.target.value as 'TL' | 'USD' }))}
                        className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                      >
                        <option value="TL">Türk Lirası (₺)</option>
                        <option value="USD">Amerikan Doları ($)</option>
                      </select>
                    </div>
                  </div>
                  
                  <p className="text-xs text-slate-500 mt-2">
                    Kullanıcılar görev tamamladığında bu miktar kadar ödeme alacak
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={handleCancel}>
                İptal
              </Button>
              <Button onClick={handleSaveLicense} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isCreating ? 'Oluştur' : 'Güncelle'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign License Modal */}
      {assignModalVisible && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Lisans Ata</h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Seçilen Lisans
                </label>
                <div className="p-3 bg-slate-50 rounded-md">
                  <div className="font-medium">{selectedLicense?.name}</div>
                  <div className="text-sm text-slate-600">{selectedLicense?.price}</div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Marka Seçin
                </label>
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <option value="">Marka seçin...</option>
                  {brands.map((brand) => (
                    <option key={brand.id} value={brand.id}>
                      {brand.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={handleCancel}>
                İptal
              </Button>
              <Button 
                onClick={handleAssignToBrand} 
                disabled={!selectedBrand}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Ata
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
