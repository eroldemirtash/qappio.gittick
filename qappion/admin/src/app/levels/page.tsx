"use client";

import { useEffect, useState } from "react";
import { jget } from "@/lib/fetcher";
import { Level } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Trophy, Eye, Edit, Trash2 } from "lucide-react";

export const dynamic = "force-dynamic";

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {levels.map((level) => (
            <div key={level.id} className="card p-6">
              <div className="text-center mb-6">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center">
                  <span className="text-2xl font-bold text-white">{level.badge_letter}</span>
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{level.name}</h3>
                <p className="text-sm text-slate-600 mb-4">{level.description}</p>
              </div>

              <div className="space-y-3 mb-6">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Min Puan:</span>
                  <span className="font-medium">{level.min_points}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Max Puan:</span>
                  <span className="font-medium">
                    {level.max_points === 999999 ? "∞" : level.max_points}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-500">Kullanıcı Sayısı:</span>
                  <span className="font-medium">{level.user_count}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Button variant="ghost" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Görüntüle
                </Button>
                <Button variant="ghost" className="w-full">
                  <Edit className="h-4 w-4 mr-2" />
                  Düzenle
                </Button>
                <Button variant="ghost" className="w-full" disabled>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
