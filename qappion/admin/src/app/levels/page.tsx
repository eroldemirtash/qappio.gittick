"use client";

import { useEffect, useState } from "react";
import { jget, jpost, jpatch, jdelete } from "@/lib/fetcher";
import { Level } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Trophy, Eye, Edit, Trash2, Plus, X, Save } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingLevel, setEditingLevel] = useState<Level | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState<Partial<Level>>({
    name: '',
    description: '',
    min_points: 0,
    max_points: null,
    badge_letter: '',
    color: '#3b82f6'
  });

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const response = await jget<{ items: Level[] }>("/api/levels");
        setLevels(response.items || []);
      } catch (err) {
        // API yoksa placeholder data kullan
        setLevels([
          {
            id: "1",
            name: "Snapper",
            description: "Yeni başlayan kullanıcılar için temel seviye",
            min_points: 0,
            max_points: 100,
            user_count: 0,
            badge_letter: "S"
          },
          {
            id: "2", 
            name: "Seeker",
            description: "Aktif kullanıcılar için orta seviye",
            min_points: 101,
            max_points: 500,
            user_count: 0,
            badge_letter: "E"
          },
          {
            id: "3",
            name: "Crafter", 
            description: "Deneyimli kullanıcılar için ileri seviye",
            min_points: 501,
            max_points: 1000,
            user_count: 0,
            badge_letter: "C"
          },
          {
            id: "4",
            name: "Viralist",
            description: "Popüler içerik üreticileri için üst seviye",
            min_points: 1001,
            max_points: 2500,
            user_count: 0,
            badge_letter: "V"
          },
          {
            id: "5",
            name: "Qappian",
            description: "En üst seviye kullanıcılar için elit seviye",
            min_points: 2501,
            max_points: 999999,
            user_count: 0,
            badge_letter: "Q"
          }
        ]);
      } finally {
        setLoading(false);
      }
    };

    fetchLevels();
  }, []);

  const handleCreate = () => {
    setIsCreating(true);
    setEditingLevel(null);
    setFormData({
      name: '',
      description: '',
      min_points: 0,
      max_points: null,
      badge_letter: '',
      color: '#3b82f6'
    });
    setShowModal(true);
  };

  const handleEdit = (level: Level) => {
    setIsCreating(false);
    setEditingLevel(level);
    setFormData(level);
    setShowModal(true);
  };

  const handleView = (level: Level) => {
    // View functionality - could open a detailed modal
    console.log('Viewing level:', level);
  };

  const handleDelete = async (level: Level) => {
    if (!confirm(`"${level.name}" seviyesini silmek istediğinizden emin misiniz?`)) {
      return;
    }

    try {
      await jdelete(`/api/levels/${level.id}`);
      setLevels(prev => prev.filter(l => l.id !== level.id));
    } catch (err) {
      console.error('Delete error:', err);
      alert('Seviye silinirken hata oluştu');
    }
  };

  const handleSave = async () => {
    try {
      if (isCreating) {
        const newLevel = await jpost<Level>("/api/levels", formData);
        setLevels(prev => [...prev, newLevel]);
      } else if (editingLevel) {
        const updatedLevel = await jpatch<Level>(`/api/levels/${editingLevel.id}`, formData);
        setLevels(prev => prev.map(l => l.id === editingLevel.id ? updatedLevel : l));
      }
      setShowModal(false);
      setFormData({
        name: '',
        description: '',
        min_points: 0,
        max_points: null,
        badge_letter: '',
        color: '#3b82f6'
      });
    } catch (err) {
      console.error('Save error:', err);
      alert('Kaydetme sırasında hata oluştu');
    }
  };

  const handleCancel = () => {
    setShowModal(false);
    setFormData({
      name: '',
      description: '',
      min_points: 0,
      max_points: null,
      badge_letter: '',
      color: '#3b82f6'
    });
  };

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Level Ayarları" description="Kullanıcı seviyelerini yönetin" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-16 w-16 bg-slate-200 rounded-full mb-4"></div>
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Level Ayarları" 
        description="Kullanıcı seviyelerini yönetin"
        action={
          <Button onClick={handleCreate} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Level
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {levels.map((level) => (
            <div key={level.id} className="card p-4">
              <div className="text-center mb-4">
                <div 
                  className="w-12 h-12 mx-auto mb-3 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: level.color }}
                >
                  <span className="text-lg font-bold text-white">{level.badge_letter}</span>
                </div>
                <h3 className="text-lg font-semibold text-slate-900 mb-1">{level.name}</h3>
                <p className="text-xs text-slate-600 mb-3 line-clamp-2">{level.description}</p>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Min Puan:</span>
                  <span className="text-sm font-medium">{level.min_points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Max Puan:</span>
                  <span className="text-sm font-medium">
                    {level.max_points === null || level.max_points === 999999 ? "∞" : level.max_points}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Kullanıcılar:</span>
                  <span className="text-sm font-medium text-blue-600">{level.user_count}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Ürünler:</span>
                  <span className="text-sm font-medium text-green-600">{level.product_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Görevler:</span>
                  <span className="text-sm font-medium text-purple-600">{level.mission_count || 0}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-500">Ort. Puan:</span>
                  <span className="text-sm font-medium text-orange-600">{level.avg_points || 0}</span>
                </div>
              </div>

              <div className="flex gap-1">
                <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => handleView(level)}>
                  <Eye className="h-3 w-3 mr-1" />
                  Görüntüle
                </Button>
                <Button variant="ghost" size="sm" className="flex-1 text-xs" onClick={() => handleEdit(level)}>
                  <Edit className="h-3 w-3 mr-1" />
                  Düzenle
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="flex-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50" 
                  onClick={() => handleDelete(level)}
                >
                  <Trash2 className="h-3 w-3 mr-1" />
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">
                {isCreating ? 'Yeni Level Ekle' : 'Level Düzenle'}
              </h3>
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Level Adı
                </label>
                <Input
                  value={formData.name || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Örn: Snapper"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Açıklama
                </label>
                <Textarea
                  value={formData.description || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Level açıklaması"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Min Puan
                  </label>
                  <Input
                    type="number"
                    value={formData.min_points || 0}
                    onChange={(e) => setFormData(prev => ({ ...prev, min_points: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Max Puan
                  </label>
                  <Input
                    type="number"
                    value={formData.max_points || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, max_points: e.target.value ? parseInt(e.target.value) : null }))}
                    placeholder="Boş bırak = ∞"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Badge Harfi
                </label>
                <Input
                  value={formData.badge_letter || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, badge_letter: e.target.value.toUpperCase() }))}
                  placeholder="Örn: S"
                  maxLength={1}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Renk
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.color || '#3b82f6'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    className="w-12 h-10 rounded border border-slate-300"
                  />
                  <Input
                    value={formData.color || '#3b82f6'}
                    onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
                    placeholder="#3b82f6"
                    className="flex-1"
                  />
                </div>
                <div className="mt-2 flex items-center gap-2">
                  <div 
                    className="w-6 h-6 rounded-full border border-slate-300"
                    style={{ backgroundColor: formData.color || '#3b82f6' }}
                  ></div>
                  <span className="text-sm text-slate-600">Önizleme</span>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <Button variant="ghost" onClick={handleCancel}>
                İptal
              </Button>
              <Button onClick={handleSave} className="flex items-center gap-2">
                <Save className="h-4 w-4" />
                {isCreating ? 'Oluştur' : 'Güncelle'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
