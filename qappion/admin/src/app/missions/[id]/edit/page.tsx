"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { jget, jpatch } from "@/lib/fetcher";
import { Mission } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Switch } from "@/components/ui/Switch";
import { Combobox } from "@/components/ui/Combobox";
import { ArrowLeft, Save, Eye, Image, AlertCircle } from "lucide-react";
import { toast } from "sonner";

export default function EditMissionPage() {
  const router = useRouter();
  const params = useParams();
  const missionId = params.id as string;
  
  const [mission, setMission] = useState<Mission | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [brands, setBrands] = useState<any[]>([]);
  const [loadingBrands, setLoadingBrands] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch missions
        const missionsResponse = await jget<{ items: any[] }>("/api/missions");
        const foundMission = missionsResponse.items.find(m => m.id === missionId);
        if (foundMission) {
          // Map reward_points to reward_qp
          const mappedMission = {
            ...foundMission,
            reward_qp: foundMission.reward_points || foundMission.reward_qp || 0
          };
          setMission(mappedMission);
        } else {
          setError("Görev bulunamadı");
        }

        // Fetch brands
        const brandsResponse = await jget<{ items: any[] }>("/api/brands");
        setBrands(brandsResponse.items || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
        setLoadingBrands(false);
      }
    };

    if (missionId) {
      fetchData();
    }
  }, [missionId]);

  const handleSave = async () => {
    if (!mission) return;
    
    setSaving(true);
    try {
      await jpatch(`/api/missions/${mission.id}`, {
        title: mission.title,
        description: mission.description,
        reward_qp: mission.reward_qp,
        published: mission.published,
        is_qappio_of_week: mission.is_qappio_of_week,
        starts_at: mission.starts_at,
        ends_at: mission.ends_at,
        cover_url: mission.cover_url,
        category: mission.category,
        brand_id: mission.brand_id,
      });
      
      toast.success("Görev başarıyla güncellendi");
      router.push("/missions");
    } catch (err) {
      console.error("Failed to save mission:", err);
      toast.error("Kaydetme başarısız");
      setError("Kaydetme başarısız");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Görev Düzenle" description="Görev bilgilerini güncelleyin" />
        <div className="card p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="h-10 bg-slate-200 rounded"></div>
            <div className="h-20 bg-slate-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="page">
        <PageHeader title="Görev Düzenle" description="Görev bilgilerini güncelleyin" />
        <div className="card p-6 border-rose-200 bg-rose-50">
          <div className="flex items-center gap-3">
            <div className="h-5 w-5 rounded-full bg-rose-500"></div>
            <div>
              <h3 className="font-medium text-rose-900">Hata</h3>
              <p className="text-sm text-rose-700">{error || "Görev bulunamadı"}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Görev Düzenle" 
        description="Görev bilgilerini güncelleyin"
        action={
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => router.back()}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Geri
            </Button>
            <Button variant="ghost" onClick={() => router.push("/missions")}>
              <Eye className="h-4 w-4 mr-2" />
              Görüntüle
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Kaydediliyor..." : "Kaydet"}
            </Button>
          </div>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Temel Bilgiler</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Görev Başlığı *
                </label>
                <Input
                  value={mission.title}
                  onChange={(e) => setMission({ ...mission, title: e.target.value })}
                  placeholder="Görev başlığını girin"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Marka *
                </label>
                <Combobox
                  options={brands.map(brand => ({
                    value: brand.id,
                    label: brand.name,
                    avatar: brand.brand_profiles?.avatar_url
                  }))}
                  value={mission.brand_id}
                  onChange={(value) => setMission({ ...mission, brand_id: value })}
                  placeholder="Marka seçin..."
                  allowCustom={false}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kategori
                </label>
                <Select
                  value={mission.category || ""}
                  onChange={(e) => setMission({ ...mission, category: e.target.value })}
                >
                  <option value="">Kategori seçin</option>
                  <option value="social">Sosyal Medya</option>
                  <option value="photo">Fotoğraf</option>
                  <option value="video">Video</option>
                  <option value="review">Değerlendirme</option>
                  <option value="survey">Anket</option>
                  <option value="checkin">Check-in</option>
                  <option value="share">Paylaşım</option>
                  <option value="purchase">Satın Alma</option>
                  <option value="referral">Yönlendirme</option>
                  <option value="other">Diğer</option>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  QP Ödülü *
                </label>
                <Input
                  type="number"
                  value={mission.reward_qp}
                  onChange={(e) => setMission({ ...mission, reward_qp: parseInt(e.target.value) || 0 })}
                  placeholder="0"
                  min="0"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Açıklama
                </label>
                <Textarea
                  value={mission.description || ""}
                  onChange={(e) => setMission({ ...mission, description: e.target.value })}
                  placeholder="Görev açıklamasını girin"
                  rows={4}
                />
                <p className="text-xs text-slate-500 mt-1">
                  Mobil uygulamada açıklama 2 satır olarak görünecek, fazlası "devamı..." ile gösterilecek
                </p>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Kapak Görseli</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Kapak Görseli URL
                </label>
                <Input
                  value={mission.cover_url || ""}
                  onChange={(e) => setMission({ ...mission, cover_url: e.target.value })}
                  placeholder="https://example.com/cover.jpg"
                />
              </div>
              
              {mission.cover_url && (
                <div>
                  <p className="text-sm text-slate-600 mb-2">Önizleme:</p>
                  <div className="w-full h-48 bg-slate-100 rounded-xl overflow-hidden">
                    <img
                      src={mission.cover_url}
                      alt="Kapak görseli önizleme"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        e.currentTarget.nextElementSibling!.style.display = 'flex';
                      }}
                    />
                    <div className="w-full h-full flex items-center justify-center text-slate-500" style={{display: 'none'}}>
                      <div className="text-center">
                        <Image className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p>Görsel yüklenemedi</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Zamanlama</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Başlangıç Tarihi
                </label>
                <Input
                  type="datetime-local"
                  value={mission.starts_at ? new Date(mission.starts_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setMission({ ...mission, starts_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Bitiş Tarihi
                </label>
                <Input
                  type="datetime-local"
                  value={mission.ends_at ? new Date(mission.ends_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setMission({ ...mission, ends_at: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Durum</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Yayında</p>
                  <p className="text-xs text-slate-500">Görev kullanıcılara görünür</p>
                </div>
                <Switch
                  checked={mission.published}
                  onCheckedChange={(checked) => setMission({ ...mission, published: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">Haftanın Qappio'su</p>
                  <p className="text-xs text-slate-500">Öne çıkan görev</p>
                </div>
                <Switch
                  checked={mission.is_qappio_of_week}
                  onCheckedChange={(checked) => setMission({ ...mission, is_qappio_of_week: checked })}
                />
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Görev Bilgileri</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Görev ID:</span>
                <span className="text-sm font-mono text-slate-900">{mission.id}</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Oluşturulma:</span>
                <span className="text-sm text-slate-900">
                  {new Date(mission.created_at).toLocaleDateString("tr-TR")}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Son Güncelleme:</span>
                <span className="text-sm text-slate-900">
                  {mission.updated_at ? new Date(mission.updated_at).toLocaleDateString("tr-TR") : "Bilinmiyor"}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600">Kategori:</span>
                <span className="text-sm text-slate-900">
                  {mission.category || "Belirtilmemiş"}
                </span>
              </div>
            </div>
          </div>

          <div className="card p-6 border-amber-200 bg-amber-50">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-amber-900 mb-1">Dikkat!</h4>
                <p className="text-sm text-amber-700">
                  Görev düzenlendiğinde, mevcut katılımcılar etkilenebilir. 
                  Önemli değişiklikler yapmadan önce dikkatli olun.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
