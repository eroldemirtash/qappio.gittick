"use client";

import { useEffect, useState } from "react";
import { jget, jpatch } from "@/lib/fetcher";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Switch } from "@/components/ui/Switch";
import { Avatar } from "@/components/ui/Avatar";
import { User, Bell, Palette, Shield, Settings, LogIn } from "lucide-react";

export const dynamic = "force-dynamic";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("profile");
  const [settings, setSettings] = useState({
    theme: {
      primary: "#2da2ff",
      secondary: "#1b8ae6",
      dark_mode: false
    },
    notifications: {
      email_enabled: true,
      push_enabled: true,
      sms_enabled: false
    },
    login: {
      logo_url: "",
      show_facebook: true,
      show_google: true,
      show_apple: false,
      show_phone: true,
      terms_url: "",
      privacy_url: "",
      custom_css: ""
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await jget<{ settings: any }>("/api/settings");
        setSettings(response.settings || settings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleThemeUpdate = async (themeData: any) => {
    try {
      await jpatch("/api/theme", themeData);
      setSettings(prev => ({
        ...prev,
        theme: { ...prev.theme, ...themeData }
      }));
    } catch (err) {
      console.error("Failed to update theme:", err);
    }
  };

  const handleNotificationUpdate = async (notificationData: any) => {
    try {
      await jpatch("/api/settings", {
        key: "notifications",
        value: { ...settings.notifications, ...notificationData }
      });
      setSettings(prev => ({
        ...prev,
        notifications: { ...prev.notifications, ...notificationData }
      }));
    } catch (err) {
      console.error("Failed to update notifications:", err);
    }
  };

  const handleLoginUpdate = async (loginData: any) => {
    try {
      await jpatch("/api/settings", {
        key: "login",
        value: { ...(settings.login || {}), ...loginData }
      });
      setSettings(prev => ({
        ...prev,
        login: { ...(prev.login || {}), ...loginData }
      }));
    } catch (err) {
      console.error("Failed to update login settings:", err);
    }
  };

  const tabs = [
    { id: "profile", label: "Profil Ayarları", icon: User },
    { id: "notifications", label: "Bildirim Ayarları", icon: Bell },
    { id: "theme", label: "Tema Ayarları", icon: Palette },
    { id: "login", label: "Giriş Sayfası", icon: LogIn },
    { id: "security", label: "Güvenlik", icon: Shield },
    { id: "system", label: "Sistem", icon: Settings }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Ayarlar" description="Sistem ayarlarını yönetin" />
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-4 animate-pulse">
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-10 bg-slate-200 rounded"></div>
                ))}
              </div>
            </div>
          </div>
          <div className="lg:col-span-3">
            <div className="card p-6 animate-pulse">
              <div className="h-6 bg-slate-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-3">
                {[...Array(4)].map((_, i) => (
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
        description="Sistem ayarlarını yönetin"
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
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1">
            <div className="card p-4">
              <nav className="space-y-2">
                {tabs.map((tab) => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors ${
                        activeTab === tab.id
                          ? "bg-brand-50 text-brand-700"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-sm font-medium">{tab.label}</span>
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          <div className="lg:col-span-3">
            <div className="card p-6">
              {activeTab === "profile" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Profil Ayarları</h3>
                  <div className="flex items-center gap-4">
                    <Avatar size="lg" fallback="A" />
                    <div>
                      <Button variant="ghost" size="sm">Avatar Değiştir</Button>
                      <p className="text-xs text-slate-500 mt-1">JPG, PNG veya GIF (max 2MB)</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ad Soyad
                      </label>
                      <Input placeholder="Ad Soyad" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        E-posta
                      </label>
                      <Input placeholder="E-posta" type="email" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Telefon
                      </label>
                      <Input placeholder="Telefon" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Rol
                      </label>
                      <div className="badge bg-brand-100 text-brand-700">Admin</div>
                    </div>
                  </div>
                  <Button>Düzenle</Button>
                </div>
              )}

              {activeTab === "notifications" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Bildirim Ayarları</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">E-posta Bildirimleri</p>
                        <p className="text-sm text-slate-500">E-posta ile bildirim al</p>
                      </div>
                      <Switch
                        checked={settings.notifications.email_enabled}
                        onCheckedChange={(checked) => handleNotificationUpdate({ email_enabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">Push Bildirimleri</p>
                        <p className="text-sm text-slate-500">Tarayıcı push bildirimleri</p>
                      </div>
                      <Switch
                        checked={settings.notifications.push_enabled}
                        onCheckedChange={(checked) => handleNotificationUpdate({ push_enabled: checked })}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">SMS Bildirimleri</p>
                        <p className="text-sm text-slate-500">SMS ile bildirim al</p>
                      </div>
                      <Switch
                        checked={settings.notifications.sms_enabled}
                        onCheckedChange={(checked) => handleNotificationUpdate({ sms_enabled: checked })}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "theme" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Tema Ayarları</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Ana Renk
                      </label>
                      <Input
                        type="color"
                        value={settings.theme.primary}
                        onChange={(e) => handleThemeUpdate({ primary: e.target.value })}
                        className="h-10"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        İkincil Renk
                      </label>
                      <Input
                        type="color"
                        value={settings.theme.secondary}
                        onChange={(e) => handleThemeUpdate({ secondary: e.target.value })}
                        className="h-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Karanlık Mod</p>
                      <p className="text-sm text-slate-500">Karanlık tema kullan</p>
                    </div>
                    <Switch
                      checked={settings.theme.dark_mode}
                      onCheckedChange={(checked) => handleThemeUpdate({ dark_mode: checked })}
                    />
                  </div>
                </div>
              )}

              {activeTab === "login" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Giriş Sayfası Ayarları</h3>
                  
                  {/* Logo Ayarları */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Logo Ayarları</h4>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Logo URL
                      </label>
                      <Input
                        placeholder="https://example.com/logo.png"
                        value={settings.login?.logo_url || ""}
                        onChange={(e) => handleLoginUpdate({ logo_url: e.target.value })}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Giriş sayfasında görünecek logo URL'si
                      </p>
                    </div>
                  </div>

                  {/* Sosyal Medya Giriş Seçenekleri */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Sosyal Medya Giriş Seçenekleri</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Facebook</p>
                          <p className="text-sm text-slate-500">Facebook ile giriş yap</p>
                        </div>
                        <Switch
                          checked={settings.login?.show_facebook || false}
                          onCheckedChange={(checked) => handleLoginUpdate({ show_facebook: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Google</p>
                          <p className="text-sm text-slate-500">Google ile giriş yap</p>
                        </div>
                        <Switch
                          checked={settings.login?.show_google || false}
                          onCheckedChange={(checked) => handleLoginUpdate({ show_google: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Apple</p>
                          <p className="text-sm text-slate-500">Apple ile giriş yap</p>
                        </div>
                        <Switch
                          checked={settings.login?.show_apple || false}
                          onCheckedChange={(checked) => handleLoginUpdate({ show_apple: checked })}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Telefon</p>
                          <p className="text-sm text-slate-500">Telefon numarası ile giriş yap</p>
                        </div>
                        <Switch
                          checked={settings.login?.show_phone || false}
                          onCheckedChange={(checked) => handleLoginUpdate({ show_phone: checked })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Yasal Belgeler */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Yasal Belgeler</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Kullanıcı Sözleşmesi URL
                        </label>
                        <Input
                          placeholder="https://example.com/terms"
                          value={settings.login?.terms_url || ""}
                          onChange={(e) => handleLoginUpdate({ terms_url: e.target.value })}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-2">
                          Gizlilik Politikası URL
                        </label>
                        <Input
                          placeholder="https://example.com/privacy"
                          value={settings.login?.privacy_url || ""}
                          onChange={(e) => handleLoginUpdate({ privacy_url: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Özel CSS */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Özel Stil</h4>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Özel CSS
                      </label>
                      <textarea
                        className="w-full h-32 px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent"
                        placeholder="/* Özel CSS kodları */"
                        value={settings.login?.custom_css || ""}
                        onChange={(e) => handleLoginUpdate({ custom_css: e.target.value })}
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Giriş sayfasına özel CSS stilleri ekleyin
                      </p>
                    </div>
                  </div>

                  {/* Önizleme */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Önizleme</h4>
                    <div className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                      <div className="text-sm text-slate-600">
                        <p>• Logo: {settings.login?.logo_url ? "✅ Ayarlanmış" : "❌ Ayarlanmamış"}</p>
                        <p>• Facebook: {settings.login?.show_facebook ? "✅ Aktif" : "❌ Pasif"}</p>
                        <p>• Google: {settings.login?.show_google ? "✅ Aktif" : "❌ Pasif"}</p>
                        <p>• Apple: {settings.login?.show_apple ? "✅ Aktif" : "❌ Pasif"}</p>
                        <p>• Telefon: {settings.login?.show_phone ? "✅ Aktif" : "❌ Pasif"}</p>
                        <p>• Sözleşme: {settings.login?.terms_url ? "✅ Ayarlanmış" : "❌ Ayarlanmamış"}</p>
                        <p>• Gizlilik: {settings.login?.privacy_url ? "✅ Ayarlanmış" : "❌ Ayarlanmamış"}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Güvenlik</h3>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Mevcut Şifre
                      </label>
                      <Input type="password" placeholder="Mevcut şifre" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Yeni Şifre
                      </label>
                      <Input type="password" placeholder="Yeni şifre" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Şifre Tekrar
                      </label>
                      <Input type="password" placeholder="Şifre tekrar" />
                    </div>
                    <Button>Şifre Değiştir</Button>
                  </div>
                </div>
              )}

              {activeTab === "system" && (
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold">Sistem</h3>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium mb-2">Sistem Bilgileri</h4>
                      <div className="text-sm text-slate-600 space-y-1">
                        <p>Versiyon: 1.0.0</p>
                        <p>Son Güncelleme: 2024-01-15</p>
                        <p>Veritabanı: Supabase</p>
                      </div>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-lg">
                      <h4 className="font-medium mb-2">Bakım</h4>
                      <div className="space-y-2">
                        <Button variant="ghost" size="sm">Cache Temizle</Button>
                        <Button variant="ghost" size="sm">Logları İndir</Button>
                        <Button variant="ghost" size="sm">Sistem Durumu</Button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
