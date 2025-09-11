"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { 
  BarChart3, 
  Download, 
  Calendar,
  TrendingUp,
  Eye,
  Heart,
  Target,
  Users,
  DollarSign
} from "lucide-react";
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

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState("30");
  const [loading] = useState(false);

  // Demo verileri
  const performanceData = [
    { name: 'Ocak', views: 12000, likes: 8000, participation: 1200, completion: 800 },
    { name: 'Şubat', views: 15000, likes: 10000, participation: 1500, completion: 1000 },
    { name: 'Mart', views: 18000, likes: 12000, participation: 1800, completion: 1200 },
    { name: 'Nisan', views: 22000, likes: 15000, participation: 2200, completion: 1500 },
    { name: 'Mayıs', views: 25000, likes: 18000, participation: 2500, completion: 1800 },
    { name: 'Haziran', views: 28000, likes: 20000, participation: 2800, completion: 2000 }
  ];

  const topMissions = [
    { name: 'Nike Air Max Fotoğrafı', views: 15000, participation: 1200, completion: 800 },
    { name: 'Adidas Ultraboost Deneyimi', views: 12000, participation: 900, completion: 600 },
    { name: 'Puma Suede Stil', views: 10000, participation: 750, completion: 500 },
    { name: 'Reebok Classic Leather', views: 8000, participation: 600, completion: 400 },
    { name: 'Nike React Infinity Run', views: 7000, participation: 500, completion: 350 }
  ];

  const levelPerformance = [
    { name: 'Snapper', users: 1200, missions: 45, revenue: 15000 },
    { name: 'Seeker', users: 800, missions: 38, revenue: 25000 },
    { name: 'Crafter', users: 400, missions: 32, revenue: 30000 },
    { name: 'Viralist', users: 200, missions: 28, revenue: 35000 },
    { name: 'Qappian', users: 100, missions: 25, revenue: 40000 }
  ];

  const funnelData = [
    { name: 'Görüntüleme', value: 100000, color: '#3b82f6' },
    { name: 'Katılım', value: 25000, color: '#10b981' },
    { name: 'Tamamlama', value: 15000, color: '#f59e0b' },
    { name: 'Satın Alma', value: 5000, color: '#ef4444' }
  ];

  const marketData = [
    { name: 'Pazartesi', clicks: 1200, purchases: 120 },
    { name: 'Salı', clicks: 1500, purchases: 150 },
    { name: 'Çarşamba', clicks: 1800, purchases: 180 },
    { name: 'Perşembe', clicks: 2000, purchases: 200 },
    { name: 'Cuma', clicks: 2200, purchases: 220 },
    { name: 'Cumartesi', clicks: 1900, purchases: 190 },
    { name: 'Pazar', clicks: 1600, purchases: 160 }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Analitik" description="Performans verilerinizi analiz edin" />
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
      <PageHeader 
        title="Analitik" 
        description="Performans verilerinizi analiz edin"
        action={
          <div className="flex gap-2">
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="7">Son 7 gün</option>
              <option value="30">Son 30 gün</option>
              <option value="90">Son 90 gün</option>
              <option value="365">Son 1 yıl</option>
            </select>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        }
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Analitik" }
        ]}
      />

      {/* KPI Kartları */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-6">
        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Toplam Görüntüleme</p>
              <p className="text-2xl font-bold text-slate-900">128.5K</p>
              <p className="text-xs text-emerald-600">+12% bu ay</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center">
              <Eye className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Katılım</p>
              <p className="text-2xl font-bold text-slate-900">12.8K</p>
              <p className="text-xs text-emerald-600">+8% bu ay</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-green-50 flex items-center justify-center">
              <Target className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Tamamlama</p>
              <p className="text-2xl font-bold text-slate-900">8.2K</p>
              <p className="text-xs text-emerald-600">+15% bu ay</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-purple-50 flex items-center justify-center">
              <Heart className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-600">Market Dönüşüm</p>
              <p className="text-2xl font-bold text-slate-900">%8.2</p>
              <p className="text-xs text-emerald-600">+2.1% bu ay</p>
            </div>
            <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Grafikler */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Performans Trendi */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Performans Trendi</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area type="monotone" dataKey="views" stackId="1" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.6} name="Görüntüleme" />
              <Area type="monotone" dataKey="likes" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.6} name="Beğeni" />
              <Area type="monotone" dataKey="participation" stackId="3" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.6} name="Katılım" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Funnel Analizi */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Funnel Analizi</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip formatter={(value) => [value.toLocaleString(), '']} />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alt Bölümler */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* En İyi Görevler */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">En İyi Görevler</h3>
          <div className="space-y-3">
            {topMissions.map((mission, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-slate-50">
                <div className="flex-1">
                  <p className="font-medium text-slate-900">{mission.name}</p>
                  <div className="flex items-center gap-4 text-sm text-slate-600 mt-1">
                    <span>{mission.views.toLocaleString()} görüntüleme</span>
                    <span>{mission.participation} katılım</span>
                    <span>{mission.completion} tamamlama</span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-slate-900">#{index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Reyon Performansı */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Reyon Performansı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={levelPerformance}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip formatter={(value, name) => [
                name === 'revenue' ? `₺${value.toLocaleString()}` : value.toLocaleString(),
                name === 'revenue' ? 'Gelir' : name === 'users' ? 'Kullanıcılar' : 'Görevler'
              ]} />
              <Legend />
              <Bar dataKey="users" fill="#3b82f6" name="Kullanıcılar" />
              <Bar dataKey="missions" fill="#10b981" name="Görevler" />
              <Bar dataKey="revenue" fill="#f59e0b" name="Gelir" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Market Analizi */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="h-5 w-5 text-brand-600" />
          <h3 className="text-lg font-semibold">Market Analizi</h3>
        </div>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={marketData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} name="Tıklama" />
            <Line type="monotone" dataKey="purchases" stroke="#10b981" strokeWidth={2} name="Satın Alma" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
