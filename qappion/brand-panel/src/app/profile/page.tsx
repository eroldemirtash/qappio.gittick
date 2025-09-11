"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { 
  Upload, 
  Save, 
  Eye,
  Instagram,
  Youtube,
  Twitter,
  Globe,
  Mail,
  MessageCircle,
  Palette,
  Image as ImageIcon
} from "lucide-react";

export default function ProfilePage() {
  const [loading, setLoading] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Demo verileri
  const [profileData, setProfileData] = useState({
    brandName: "Nike",
    shortBio: "Just Do It. Dünyanın önde gelen spor markası.",
    logo: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=200&h=200&fit=crop",
    cover: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&h=300&fit=crop",
    primaryColor: "#000000",
    secondaryColor: "#FF0000",
    socialLinks: {
      instagram: "https://instagram.com/nike",
      youtube: "https://youtube.com/nike",
      twitter: "https://twitter.com/nike",
      website: "https://nike.com"
    },
    contact: {
      email: "brand@nike.com",
      support: "Destek için brand@nike.com adresine yazın"
    }
  });

  const handleSave = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    // Show success message
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', color: string) => {
    setProfileData(prev => ({
      ...prev,
      [field]: color
    }));
  };

  if (previewMode) {
    return (
      <div className="page">
        <PageHeader 
          title="Marka Profili Önizleme" 
          description="Profilinizin nasıl görüneceğini kontrol edin"
          action={
            <Button variant="ghost" onClick={() => setPreviewMode(false)}>
              <Eye className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          }
        />
        
        {/* Mobil Profil Kartı Önizleme */}
        <div className="max-w-sm mx-auto">
          <div className="card overflow-hidden">
            {/* Kapak Fotoğrafı */}
            <div 
              className="h-32 w-full bg-cover bg-center"
              style={{ backgroundImage: `url(${profileData.cover})` }}
            />
            
            {/* Profil Bilgileri */}
            <div className="p-6 -mt-8 relative">
              {/* Logo */}
              <div className="h-16 w-16 rounded-full border-4 border-white overflow-hidden bg-white shadow-lg">
                <img
                  src={profileData.logo}
                  alt={profileData.brandName}
                  className="h-full w-full object-cover"
                />
              </div>
              
              <div className="mt-4">
                <h2 className="text-xl font-bold text-slate-900">{profileData.brandName}</h2>
                <p className="text-sm text-slate-600 mt-1">{profileData.shortBio}</p>
                
                {/* Sosyal Linkler */}
                <div className="flex gap-3 mt-4">
                  <a href={profileData.socialLinks.instagram} className="p-2 rounded-lg bg-pink-50 text-pink-600">
                    <Instagram className="h-4 w-4" />
                  </a>
                  <a href={profileData.socialLinks.youtube} className="p-2 rounded-lg bg-red-50 text-red-600">
                    <Youtube className="h-4 w-4" />
                  </a>
                  <a href={profileData.socialLinks.twitter} className="p-2 rounded-lg bg-blue-50 text-blue-600">
                    <Twitter className="h-4 w-4" />
                  </a>
                  <a href={profileData.socialLinks.website} className="p-2 rounded-lg bg-slate-50 text-slate-600">
                    <Globe className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Marka Profili" 
        description="Marka profilinizi düzenleyin"
        action={
          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => setPreviewMode(true)}>
              <Eye className="h-4 w-4 mr-2" />
              Önizle
            </Button>
            <Button onClick={handleSave} disabled={loading}>
              <Save className="h-4 w-4 mr-2" />
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>
        }
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Marka Profili" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Sol: Form */}
        <div className="space-y-6">
          {/* Temel Bilgiler */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Temel Bilgiler</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Marka Adı
                </label>
                <Input
                  value={profileData.brandName}
                  onChange={(e) => setProfileData(prev => ({ ...prev, brandName: e.target.value }))}
                  placeholder="Marka adınızı girin"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kısa Açıklama
                </label>
                <Textarea
                  value={profileData.shortBio}
                  onChange={(e) => setProfileData(prev => ({ ...prev, shortBio: e.target.value }))}
                  placeholder="Markanız hakkında kısa açıklama"
                  rows={3}
                />
              </div>
            </div>
          </div>

          {/* Görseller */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Görseller</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Logo
                </label>
                <div className="flex items-center gap-4">
                  <div className="h-16 w-16 rounded-lg overflow-hidden bg-slate-100">
                    <img
                      src={profileData.logo}
                      alt="Logo"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <Button variant="ghost" className="flex items-center gap-2">
                    <Upload className="h-4 w-4" />
                    Yükle
                  </Button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Kapak Fotoğrafı
                </label>
                <div className="h-32 w-full rounded-lg overflow-hidden bg-slate-100">
                  <img
                    src={profileData.cover}
                    alt="Kapak"
                    className="h-full w-full object-cover"
                  />
                </div>
                <Button variant="ghost" className="mt-2 flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Kapak Yükle
                </Button>
              </div>
            </div>
          </div>

          {/* Tema Renkleri */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Tema Renkleri
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Ana Renk
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={profileData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="h-10 w-10 rounded border border-slate-300"
                  />
                  <Input
                    value={profileData.primaryColor}
                    onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  İkincil Renk
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={profileData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="h-10 w-10 rounded border border-slate-300"
                  />
                  <Input
                    value={profileData.secondaryColor}
                    onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
            
            {/* Renk Önizleme */}
            <div className="mt-4 p-4 rounded-lg border border-slate-200">
              <p className="text-sm text-slate-600 mb-2">Renk Önizleme:</p>
              <div className="flex gap-2">
                <div 
                  className="h-8 w-16 rounded"
                  style={{ backgroundColor: profileData.primaryColor }}
                />
                <div 
                  className="h-8 w-16 rounded"
                  style={{ backgroundColor: profileData.secondaryColor }}
                />
              </div>
            </div>
          </div>

          {/* Sosyal Linkler */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Sosyal Medya Linkleri</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Instagram
                </label>
                <div className="flex items-center gap-2">
                  <Instagram className="h-4 w-4 text-pink-600" />
                  <Input
                    value={profileData.socialLinks.instagram}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, instagram: e.target.value }
                    }))}
                    placeholder="https://instagram.com/username"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  YouTube
                </label>
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600" />
                  <Input
                    value={profileData.socialLinks.youtube}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, youtube: e.target.value }
                    }))}
                    placeholder="https://youtube.com/channel"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  X (Twitter)
                </label>
                <div className="flex items-center gap-2">
                  <Twitter className="h-4 w-4 text-blue-600" />
                  <Input
                    value={profileData.socialLinks.twitter}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, twitter: e.target.value }
                    }))}
                    placeholder="https://twitter.com/username"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Website
                </label>
                <div className="flex items-center gap-2">
                  <Globe className="h-4 w-4 text-slate-600" />
                  <Input
                    value={profileData.socialLinks.website}
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      socialLinks: { ...prev.socialLinks, website: e.target.value }
                    }))}
                    placeholder="https://website.com"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* İletişim */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Mail className="h-5 w-5" />
              İletişim Bilgileri
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  E-posta
                </label>
                <Input
                  value={profileData.contact.email}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  placeholder="brand@example.com"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Destek Mesajı
                </label>
                <Textarea
                  value={profileData.contact.support}
                  onChange={(e) => setProfileData(prev => ({ 
                    ...prev, 
                    contact: { ...prev.contact, support: e.target.value }
                  }))}
                  placeholder="Destek için nasıl iletişim kurulacağı"
                  rows={2}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Özet */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Profil Özeti</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-slate-600">Marka Adı:</span>
                <span className="font-medium">{profileData.brandName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Sosyal Hesaplar:</span>
                <span className="font-medium">
                  {Object.values(profileData.socialLinks).filter(link => link).length} aktif
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Tema:</span>
                <div className="flex gap-1">
                  <div 
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: profileData.primaryColor }}
                  />
                  <div 
                    className="h-4 w-4 rounded"
                    style={{ backgroundColor: profileData.secondaryColor }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold mb-4">Hızlı İpuçları</h3>
            <div className="space-y-3 text-sm text-slate-600">
              <div className="flex items-start gap-2">
                <ImageIcon className="h-4 w-4 mt-0.5 text-slate-400" />
                <p>Logo ve kapak fotoğrafı yüksek kalitede olmalı</p>
              </div>
              <div className="flex items-start gap-2">
                <MessageCircle className="h-4 w-4 mt-0.5 text-slate-400" />
                <p>Kısa açıklama 160 karakteri geçmemeli</p>
              </div>
              <div className="flex items-start gap-2">
                <Palette className="h-4 w-4 mt-0.5 text-slate-400" />
                <p>Renkler marka kimliğinizi yansıtmalı</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
