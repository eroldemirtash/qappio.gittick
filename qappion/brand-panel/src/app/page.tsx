"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { StatsRow } from "@/components/layout/StatsRow";
import { StatCard } from "@/components/layout/StatCard";
import { 
  Target, 
  Users, 
  TrendingUp, 
  DollarSign,
  Activity,
  Clock,
  CheckCircle,
  AlertCircle
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

export default function DashboardPage() {
  const [loading] = useState(false);

  // Demo verileri
  const dailyData = [
    { name: 'Pzt', views: 1200, likes: 800, participation: 150 },
    { name: 'Sal', views: 1900, likes: 1200, participation: 200 },
    { name: 'Çar', views: 3000, likes: 2000, participation: 350 },
    { name: 'Per', views: 2800, likes: 1800, participation: 300 },
    { name: 'Cum', views: 1890, likes: 1200, participation: 180 },
    { name: 'Cmt', views: 2390, likes: 1500, participation: 250 },
    { name: 'Paz', views: 3490, likes: 2200, participation: 400 }
  ];

  const funnelData = [
    { name: 'Görüntüleme', value: 10000, color: '#3b82f6' },
    { name: 'Katılım', value: 2500, color: '#10b981' },
    { name: 'Onaylanan İçerik', value: 800, color: '#f59e0b' }
  ];

  const recentActivities = [
    { id: 1, type: 'mission', message: 'Yeni görev yayınlandı: "Nike Air Max Fotoğrafı"', time: '2 saat önce', status: 'success' },
    { id: 2, type: 'product', message: 'Ürün onaya gönderildi: "Nike Dri-FIT T-Shirt"', time: '4 saat önce', status: 'pending' },
    { id: 3, type: 'comment', message: 'Görevde 5 yeni yorum', time: '6 saat önce', status: 'info' },
    { id: 4, type: 'follower', message: '23 yeni takipçi', time: '8 saat önce', status: 'success' },
    { id: 5, type: 'product', message: 'Ürün onaylandı: "Nike Air Force 1"', time: '1 gün önce', status: 'success' }
  ];

  const pendingApprovals = [
    { id: 1, type: 'product', title: 'Nike Dri-FIT T-Shirt', submitted: '2 saat önce' },
    { id: 2, type: 'mission', title: 'Nike Air Max Fotoğrafı', submitted: '4 saat önce' }
  ];

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Gösterge Paneli" description="Marka performansınızı takip edin" />
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
        title="Gösterge Paneli" 
        description="Marka performansınızı takip edin"
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Gösterge Paneli" }
        ]}
      />

      {/* KPI Kartları */}
      <StatsRow>
        <StatCard
          title="Aktif Görev"
          value={12}
          icon={Target}
          trend={{ value: "+2 bu hafta", isPositive: true }}
        />
        <StatCard
          title="Toplam Görev"
          value={45}
          icon={Target}
          trend={{ value: "+8 bu ay", isPositive: true }}
        />
        <StatCard
          title="Bu Haftaki Etkileşim"
          value="12.5K"
          icon={Activity}
          trend={{ value: "+15% geçen haftaya", isPositive: true }}
        />
        <StatCard
          title="Market Dönüşüm"
          value="%8.2"
          icon={DollarSign}
          trend={{ value: "+1.2% geçen aya", isPositive: true }}
        />
      </StatsRow>

      {/* Grafikler */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-6">
        {/* Günlük Performans */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Günlük Performans</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={dailyData}>
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
            <Activity className="h-5 w-5 text-brand-600" />
            <h3 className="text-lg font-semibold">Funnel Analizi</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={funnelData} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={120} />
              <Tooltip />
              <Bar dataKey="value" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Alt Bölümler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Son Aktiviteler */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Son Aktiviteler</h3>
          <div className="space-y-3">
            {recentActivities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg bg-slate-50">
                <div className={`h-2 w-2 rounded-full mt-2 ${
                  activity.status === 'success' ? 'bg-emerald-500' :
                  activity.status === 'pending' ? 'bg-amber-500' :
                  'bg-blue-500'
                }`}></div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{activity.message}</p>
                  <p className="text-xs text-slate-500">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bekleyen Onaylar */}
        <div className="card p-6">
          <h3 className="text-lg font-semibold mb-4">Bekleyen Onaylar</h3>
          {pendingApprovals.length === 0 ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-slate-900 mb-2">Tüm onaylar tamamlandı</h3>
              <p className="text-slate-500">Bekleyen onayınız bulunmuyor.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {pendingApprovals.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-amber-50 border border-amber-200">
                  <div>
                    <p className="text-sm font-medium text-amber-900">{item.title}</p>
                    <p className="text-xs text-amber-700">{item.submitted}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="badge bg-amber-100 text-amber-800">
                      {item.type === 'product' ? 'Ürün' : 'Görev'}
                    </span>
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}