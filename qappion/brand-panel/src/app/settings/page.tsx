"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { 
  Settings, 
  Shield, 
  Bell, 
  Key, 
  Mail, 
  Smartphone,
  AlertTriangle,
  Save,
  Eye,
  EyeOff,
  CheckCircle,
  XCircle
} from "lucide-react";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<'security' | 'notifications' | 'api' | 'account'>('security');
  const [loading, setLoading] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Demo verileri
  const [settings, setSettings] = useState({
    security: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      twoFactorEnabled: false
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      missionUpdates: true,
      productApprovals: true,
      teamInvites: true,
      systemUpdates: false,
      marketingEmails: false
    },
    api: {
      apiKey: 'sk_live_1234567890abcdef',
      webhookUrl: 'https://nike.com/webhooks/qappio',
      rateLimit: 1000
    },
    account: {
      companyName: 'Nike Türkiye',
      contactEmail: 'brand@nike.com',
      phoneNumber: '+90 212 555 0123',
      address: 'Maslak Mahallesi, Büyükdere Caddesi No: 123, Sarıyer/İstanbul',
      timezone: 'Europe/Istanbul',
      language: 'tr'
    }
  });

  const handleSave = async (section: string) => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
    // Show success message
  };

  const tabs = [
    { id: 'security', label: 'Güvenlik', icon: Shield },
    { id: 'notifications', label: 'Bildirimler', icon: Bell },
    { id: 'api', label: 'API Anahtarları', icon: Key },
    { id: 'account', label: 'Hesap Bilgileri', icon: Settings }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Ayarlar" description="Hesap ayarlarınızı yönetin" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-4 animate-pulse">
              <div className="space-y-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-8 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="card p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-4 bg-slate-200 rounded"></div>
                ))}
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
        title="Ayarlar" 
        description="Hesap ayarlarınızı yönetin"
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Ayarlar" }
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Sol: Tab Navigation */}
        <div className="lg:col-span-1">
          <div className="card p-4">
            <nav className="space-y-1">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      activeTab === tab.id
                        ? 'bg-brand-100 text-brand-700'
                        : 'text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {tab.label}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Sağ: Tab Content */}
        <div className="lg:col-span-3">
          {/* Güvenlik */}
          {activeTab === 'security' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-6">Güvenlik Ayarları</h3>
              
              <div className="space-y-6">
                {/* Şifre Değiştir */}
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-4">Şifre Değiştir</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Mevcut Şifre
                      </label>
                      <div className="relative">
                        <Input
                          type={showCurrentPassword ? 'text' : 'password'}
                          value={settings.security.currentPassword}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, currentPassword: e.target.value }
                          }))}
                          placeholder="Mevcut şifrenizi girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        >
                          {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Yeni Şifre
                      </label>
                      <div className="relative">
                        <Input
                          type={showNewPassword ? 'text' : 'password'}
                          value={settings.security.newPassword}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            security: { ...prev.security, newPassword: e.target.value }
                          }))}
                          placeholder="Yeni şifrenizi girin"
                        />
                        <button
                          type="button"
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                        >
                          {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Yeni Şifre Tekrar
                    </label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={settings.security.confirmPassword}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, confirmPassword: e.target.value }
                        }))}
                        placeholder="Yeni şifrenizi tekrar girin"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2FA */}
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-4">İki Faktörlü Kimlik Doğrulama</h4>
                  <div className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Smartphone className="h-5 w-5 text-slate-600" />
                      <div>
                        <p className="font-medium text-slate-900">SMS Doğrulama</p>
                        <p className="text-sm text-slate-600">Hesabınızı ek güvenlik katmanıyla koruyun</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`badge ${settings.security.twoFactorEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'}`}>
                        {settings.security.twoFactorEnabled ? 'Aktif' : 'Pasif'}
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSettings(prev => ({
                          ...prev,
                          security: { ...prev.security, twoFactorEnabled: !prev.security.twoFactorEnabled }
                        }))}
                      >
                        {settings.security.twoFactorEnabled ? 'Devre Dışı Bırak' : 'Etkinleştir'}
                      </Button>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('security')} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Güvenlik Ayarlarını Kaydet
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Bildirimler */}
          {activeTab === 'notifications' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-6">Bildirim Tercihleri</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-4">E-posta Bildirimleri</h4>
                  <div className="space-y-3">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900">
                            {key === 'emailNotifications' && 'E-posta Bildirimleri'}
                            {key === 'pushNotifications' && 'Push Bildirimleri'}
                            {key === 'missionUpdates' && 'Görev Güncellemeleri'}
                            {key === 'productApprovals' && 'Ürün Onayları'}
                            {key === 'teamInvites' && 'Takım Davetleri'}
                            {key === 'systemUpdates' && 'Sistem Güncellemeleri'}
                            {key === 'marketingEmails' && 'Pazarlama E-postaları'}
                          </p>
                          <p className="text-sm text-slate-600">
                            {key === 'emailNotifications' && 'Tüm e-posta bildirimlerini al'}
                            {key === 'pushNotifications' && 'Mobil cihazınıza anlık bildirimler gönder'}
                            {key === 'missionUpdates' && 'Görev durumu değişikliklerini bildir'}
                            {key === 'productApprovals' && 'Ürün onay durumlarını bildir'}
                            {key === 'teamInvites' && 'Takım davetlerini bildir'}
                            {key === 'systemUpdates' && 'Sistem güncellemelerini bildir'}
                            {key === 'marketingEmails' && 'Pazarlama ve promosyon e-postaları al'}
                          </p>
                        </div>
                        <button
                          onClick={() => setSettings(prev => ({
                            ...prev,
                            notifications: { ...prev.notifications, [key]: !value }
                          }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            value ? 'bg-brand-600' : 'bg-slate-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              value ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('notifications')} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Bildirim Ayarlarını Kaydet
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* API Anahtarları */}
          {activeTab === 'api' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-6">API Anahtarları</h3>
              
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-4">Mevcut API Anahtarı</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      value={settings.api.apiKey}
                      readOnly
                      className="font-mono text-sm"
                    />
                    <Button variant="ghost" size="sm">
                      Kopyala
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                      Yenile
                    </Button>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    API anahtarınızı güvenli tutun ve kimseyle paylaşmayın.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-4">Webhook URL</h4>
                  <Input
                    value={settings.api.webhookUrl}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      api: { ...prev.api, webhookUrl: e.target.value }
                    }))}
                    placeholder="https://example.com/webhook"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Webhook URL'nizi güncelleyin. Bu URL'ye bildirimler gönderilecek.
                  </p>
                </div>

                <div>
                  <h4 className="text-md font-medium text-slate-900 mb-4">Rate Limit</h4>
                  <Input
                    type="number"
                    value={settings.api.rateLimit}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      api: { ...prev.api, rateLimit: parseInt(e.target.value) }
                    }))}
                    placeholder="1000"
                  />
                  <p className="text-xs text-slate-500 mt-2">
                    Dakikada maksimum API çağrı sayısı.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('api')} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    API Ayarlarını Kaydet
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Hesap Bilgileri */}
          {activeTab === 'account' && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold mb-6">Hesap Bilgileri</h3>
              
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Şirket Adı
                    </label>
                    <Input
                      value={settings.account.companyName}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        account: { ...prev.account, companyName: e.target.value }
                      }))}
                      placeholder="Şirket adınızı girin"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      İletişim E-postası
                    </label>
                    <Input
                      type="email"
                      value={settings.account.contactEmail}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        account: { ...prev.account, contactEmail: e.target.value }
                      }))}
                      placeholder="iletisim@example.com"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Telefon Numarası
                    </label>
                    <Input
                      value={settings.account.phoneNumber}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        account: { ...prev.account, phoneNumber: e.target.value }
                      }))}
                      placeholder="+90 212 555 0123"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Zaman Dilimi
                    </label>
                    <select
                      value={settings.account.timezone}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        account: { ...prev.account, timezone: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                    >
                      <option value="Europe/Istanbul">İstanbul (GMT+3)</option>
                      <option value="Europe/London">Londra (GMT+0)</option>
                      <option value="America/New_York">New York (GMT-5)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Adres
                  </label>
                  <Textarea
                    value={settings.account.address}
                    onChange={(e) => setSettings(prev => ({
                      ...prev,
                      account: { ...prev.account, address: e.target.value }
                    }))}
                    placeholder="Şirket adresinizi girin"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end">
                  <Button onClick={() => handleSave('account')} className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Hesap Bilgilerini Kaydet
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
