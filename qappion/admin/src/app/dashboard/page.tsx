"use client";

import { useEffect, useState } from "react";
import { jget } from "@/lib/fetcher";
import { Stats } from "@/lib/types";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/ui/StatCard";
import { Building2, Target, Users, Bell, Plus, Send, TrendingUp, DollarSign, Activity, Calendar } from "lucide-react";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Demo verileri
  const userGrowthData = [
    { name: 'Ocak', users: 1200, missions: 45 },
    { name: 'Şubat', users: 1450, missions: 52 },
    { name: 'Mart', users: 1680, missions: 68 },
    { name: 'Nisan', users: 1920, missions: 75 },
    { name: 'Mayıs', users: 2150, missions: 82 },
    { name: 'Haziran', users: 2380, missions: 95 }
  ];

  const missionStatusData = [
    { name: 'Tamamlandı', value: 65, color: '#10b981' },
    { name: 'Devam Ediyor', value: 25, color: '#3b82f6' },
    { name: 'Beklemede', value: 10, color: '#f59e0b' }
  ];

  const revenueData = [
    { name: 'Pazartesi', revenue: 2400, expenses: 1200 },
    { name: 'Salı', revenue: 1398, expenses: 980 },
    { name: 'Çarşamba', revenue: 9800, expenses: 3200 },
    { name: 'Perşembe', revenue: 3908, expenses: 1800 },
    { name: 'Cuma', revenue: 4800, expenses: 2400 },
    { name: 'Cumartesi', revenue: 3800, expenses: 2000 },
    { name: 'Pazar', revenue: 4300, expenses: 2100 }
  ];

  const brandPerformanceData = [
    { name: 'Nike', missions: 45, users: 1200, revenue: 15000 },
    { name: 'Adidas', missions: 38, users: 980, revenue: 12000 },
    { name: 'Puma', missions: 32, users: 850, revenue: 9500 },
    { name: 'Reebok', missions: 28, users: 720, revenue: 8000 },
    { name: 'Under Armour', missions: 22, users: 650, revenue: 6500 }
  ];

  const weeklyActivityData = [
    { day: 'Pzt', missions: 12, users: 45, posts: 28 },
    { day: 'Sal', missions: 15, users: 52, posts: 32 },
    { day: 'Çar', missions: 18, users: 48, posts: 35 },
    { day: 'Per', missions: 22, users: 55, posts: 42 },
    { day: 'Cum', missions: 25, users: 62, posts: 48 },
    { day: 'Cmt', missions: 20, users: 58, posts: 38 },
    { day: 'Paz', missions: 16, users: 45, posts: 30 }
  ];

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

      {/* Grafikler Bölümü */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Kullanıcı Büyümesi */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Kullanıcı Büyümesi</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={userGrowthData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="users" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} />
              <Area type="monotone" dataKey="missions" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Görev Durumu */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Target className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Görev Durumu</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={missionStatusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {missionStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Haftalık Aktivite ve Gelir */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Haftalık Aktivite */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Haftalık Aktivite</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyActivityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="missions" fill="#3b82f6" name="Görevler" />
              <Bar dataKey="users" fill="#10b981" name="Kullanıcılar" />
              <Bar dataKey="posts" fill="#f59e0b" name="Gönderiler" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Gelir Analizi */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <DollarSign className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Gelir vs Gider</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value) => [`₺${value}`, '']} />
              <Legend />
              <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} name="Gelir" />
              <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} name="Gider" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Marka Performansı */}
      <div className="card p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Building2 className="h-5 w-5 text-brand-600" />
          <h3 className="text-lg font-semibold">Marka Performansı</h3>
        </div>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={brandPerformanceData} layout="horizontal">
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" />
            <YAxis dataKey="name" type="category" width={100} />
            <Tooltip formatter={(value, name) => [
              name === 'revenue' ? `₺${value}` : value,
              name === 'revenue' ? 'Gelir' : name === 'missions' ? 'Görevler' : 'Kullanıcılar'
            ]} />
            <Legend />
            <Bar dataKey="missions" fill="#3b82f6" name="Görevler" />
            <Bar dataKey="users" fill="#10b981" name="Kullanıcılar" />
            <Bar dataKey="revenue" fill="#f59e0b" name="Gelir" />
          </BarChart>
        </ResponsiveContainer>
      </div>

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
