"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Plus, 
  Search, 
  Filter, 
  Eye, 
  Copy, 
  Trash2, 
  Calendar,
  Target,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Users
} from "lucide-react";

interface Mission {
  id: string;
  title: string;
  cover: string;
  status: 'draft' | 'pending' | 'published' | 'expired' | 'rejected';
  startDate: string;
  endDate: string;
  reward: number;
  participation: number;
  lastUpdate: string;
}

export default function MissionsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading] = useState(false);

  // Demo verileri
  const missions: Mission[] = [
    {
      id: "1",
      title: "Nike Air Max Fotoğrafı",
      cover: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=300&fit=crop",
      status: "published",
      startDate: "2024-01-15",
      endDate: "2024-01-30",
      reward: 50,
      participation: 234,
      lastUpdate: "2 saat önce"
    },
    {
      id: "2",
      title: "Adidas Ultraboost Deneyimi",
      cover: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
      status: "pending",
      startDate: "2024-01-20",
      endDate: "2024-02-05",
      reward: 75,
      participation: 0,
      lastUpdate: "4 saat önce"
    },
    {
      id: "3",
      title: "Puma Suede Stil",
      cover: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&h=300&fit=crop",
      status: "draft",
      startDate: "2024-02-01",
      endDate: "2024-02-15",
      reward: 40,
      participation: 0,
      lastUpdate: "1 gün önce"
    },
    {
      id: "4",
      title: "Nike React Infinity Run",
      cover: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=300&fit=crop",
      status: "expired",
      startDate: "2023-12-01",
      endDate: "2023-12-31",
      reward: 60,
      participation: 156,
      lastUpdate: "1 hafta önce"
    },
    {
      id: "5",
      title: "Reebok Classic Leather",
      cover: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&h=300&fit=crop",
      status: "rejected",
      startDate: "2024-01-10",
      endDate: "2024-01-25",
      reward: 35,
      participation: 0,
      lastUpdate: "3 gün önce"
    }
  ];

  const getStatusInfo = (status: Mission['status']) => {
    switch (status) {
      case 'draft':
        return { label: 'Taslak', color: 'bg-slate-100 text-slate-800', icon: Clock };
      case 'pending':
        return { label: 'Onay Bekliyor', color: 'bg-amber-100 text-amber-800', icon: AlertCircle };
      case 'published':
        return { label: 'Yayında', color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle };
      case 'expired':
        return { label: 'Süresi Doldu', color: 'bg-slate-100 text-slate-600', icon: Clock };
      case 'rejected':
        return { label: 'Reddedildi', color: 'bg-red-100 text-red-800', icon: XCircle };
      default:
        return { label: 'Bilinmiyor', color: 'bg-slate-100 text-slate-800', icon: Clock };
    }
  };

  const filteredMissions = missions.filter(mission => {
    const matchesSearch = mission.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || mission.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Görevler" description="Görevlerinizi yönetin" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 bg-slate-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-slate-200 rounded w-1/3 mb-2"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <PageHeader 
        title="Görevler" 
        description="Görevlerinizi yönetin"
        action={
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Yeni Görev
          </Button>
        }
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Görevler" }
        ]}
      />

      {/* Filtre Barı */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Görev ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="draft">Taslak</option>
              <option value="pending">Onay Bekliyor</option>
              <option value="published">Yayında</option>
              <option value="expired">Süresi Doldu</option>
              <option value="rejected">Reddedildi</option>
            </select>
            <Button variant="ghost" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtre
            </Button>
          </div>
        </div>
      </div>

      {/* Görev Listesi */}
      {filteredMissions.length === 0 ? (
        <div className="card p-12 text-center">
          <Target className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Görev bulunamadı</h3>
          <p className="text-slate-500 mb-6">
            {searchTerm || statusFilter !== 'all' 
              ? 'Arama kriterlerinize uygun görev bulunamadı.' 
              : 'Henüz görev oluşturmadınız.'
            }
          </p>
          <Button className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            İlk Görevinizi Oluşturun
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredMissions.map((mission) => {
            const statusInfo = getStatusInfo(mission.status);
            const StatusIcon = statusInfo.icon;
            
            return (
              <div key={mission.id} className="card p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-4">
                  {/* Kapak Görseli */}
                  <div className="h-20 w-20 rounded-lg overflow-hidden bg-slate-100 flex-shrink-0">
                    <img
                      src={mission.cover}
                      alt={mission.title}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Görev Bilgileri */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-900 mb-1">
                          {mission.title}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-slate-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            {new Date(mission.startDate).toLocaleDateString('tr-TR')} - {new Date(mission.endDate).toLocaleDateString('tr-TR')}
                          </div>
                          <div className="flex items-center gap-1">
                            <Target className="h-4 w-4" />
                            {mission.reward} QP
                          </div>
                          <div className="flex items-center gap-1">
                            <Users className="h-4 w-4" />
                            {mission.participation} katılım
                          </div>
                        </div>
                        <p className="text-xs text-slate-500">
                          Son güncelleme: {mission.lastUpdate}
                        </p>
                      </div>

                      {/* Durum ve Aksiyonlar */}
                      <div className="flex items-center gap-3">
                        <span className={`badge ${statusInfo.color} flex items-center gap-1`}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo.label}
                        </span>
                        
                        <div className="flex items-center gap-1">
                          <Button variant="ghost" size="sm" className="p-2">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2">
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="p-2 text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
