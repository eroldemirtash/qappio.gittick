"use client";

import { useEffect, useState } from "react";
import { jget } from "@/lib/fetcher";
import { Stats } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/ui/StatCard";
import { Building2, Target, Users, Bell, Plus, Send } from "lucide-react";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await jget<Stats>("/api/stats");
        setStats(response || null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Dashboard" description="Qappio Admin Panel'e hoş geldiniz" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-1/2 mb-2"></div>
              <div className="h-8 bg-slate-200 rounded w-1/3 mb-2"></div>
              <div className="h-3 bg-slate-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader title="Dashboard" description="Qappio Admin Panel'e hoş geldiniz" />

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
        <StatsRow>
          <StatCard
            title="Toplam Marka"
            value={stats?.total_brands || 0}
            icon={Building2}
            trend={{ value: "+12% bu ay", isPositive: true }}
          />
          <StatCard
            title="Aktif Görevler"
            value={stats?.active_missions || 0}
            icon={Target}
            trend={{ value: "+8% bu hafta", isPositive: true }}
          />
          <StatCard
            title="Kayıtlı Kullanıcı"
            value={stats?.total_users || 0}
            icon={Users}
            trend={{ value: "+23% bu ay", isPositive: true }}
          />
          <StatCard
            title="Bildirimler"
            value={stats?.total_notifications || 0}
            icon={Bell}
            trend={{ value: "+5% bu hafta", isPositive: true }}
          />
        </StatsRow>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="h-2 w-2 rounded-full bg-emerald-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Yeni marka eklendi</p>
                <p className="text-xs text-slate-500">2 saat önce</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="h-2 w-2 rounded-full bg-blue-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Görev yayınlandı</p>
                <p className="text-xs text-slate-500">4 saat önce</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50">
              <div className="h-2 w-2 rounded-full bg-amber-500"></div>
              <div className="flex-1">
                <p className="text-sm font-medium">Kullanıcı kaydı</p>
                <p className="text-xs text-slate-500">6 saat önce</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Hızlı İşlemler</h3>
          <div className="grid grid-cols-1 gap-3">
            <a href="/missions/new" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="rounded-lg bg-brand-50 p-2">
                <Plus className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="font-medium">Yeni Görev</p>
                <p className="text-sm text-slate-500">Yeni görev oluştur</p>
              </div>
            </a>
            <a href="/notifications/new" className="flex items-center gap-3 p-4 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors">
              <div className="rounded-lg bg-brand-50 p-2">
                <Send className="h-5 w-5 text-brand-600" />
              </div>
              <div>
                <p className="font-medium">Bildirim</p>
                <p className="text-sm text-slate-500">Yeni bildirim gönder</p>
              </div>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
