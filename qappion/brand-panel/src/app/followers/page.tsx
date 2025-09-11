"use client";

import { useState } from "react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { 
  Search, 
  Filter, 
  Download, 
  Users,
  Target,
  Heart,
  Calendar,
  TrendingUp
} from "lucide-react";

interface Follower {
  id: string;
  username: string;
  avatar: string;
  level: string;
  missionsCompleted: number;
  lastActivity: string;
  totalLikes: number;
  platform: 'instagram' | 'tiktok' | 'youtube';
}

export default function FollowersPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [segmentFilter, setSegmentFilter] = useState("all");
  const [loading] = useState(false);

  // Demo verileri
  const followers: Follower[] = [
    {
      id: "1",
      username: "ayse_kaya",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      level: "Seeker",
      missionsCompleted: 12,
      lastActivity: "2 saat önce",
      totalLikes: 1250,
      platform: "instagram"
    },
    {
      id: "2",
      username: "mehmet_oz",
      avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face",
      level: "Crafter",
      missionsCompleted: 8,
      lastActivity: "5 saat önce",
      totalLikes: 890,
      platform: "tiktok"
    },
    {
      id: "3",
      username: "zeynep_demir",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      level: "Viralist",
      missionsCompleted: 25,
      lastActivity: "1 gün önce",
      totalLikes: 3200,
      platform: "youtube"
    },
    {
      id: "4",
      username: "ali_yilmaz",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      level: "Snapper",
      missionsCompleted: 3,
      lastActivity: "2 gün önce",
      totalLikes: 450,
      platform: "instagram"
    },
    {
      id: "5",
      username: "fatma_celik",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&h=100&fit=crop&crop=face",
      level: "Qappian",
      missionsCompleted: 45,
      lastActivity: "3 saat önce",
      totalLikes: 5600,
      platform: "instagram"
    }
  ];

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Snapper': return 'bg-yellow-100 text-yellow-800';
      case 'Seeker': return 'bg-green-100 text-green-800';
      case 'Crafter': return 'bg-purple-100 text-purple-800';
      case 'Viralist': return 'bg-orange-100 text-orange-800';
      case 'Qappian': return 'bg-cyan-100 text-cyan-800';
      case 'Influencer': return 'bg-pink-100 text-pink-800';
      case 'Creator': return 'bg-indigo-100 text-indigo-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'instagram': return '📷';
      case 'tiktok': return '🎵';
      case 'youtube': return '📺';
      default: return '📱';
    }
  };

  const filteredFollowers = followers.filter(follower => {
    const matchesSearch = follower.username.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="page">
        <PageHeader title="Takipçiler" description="Takipçilerinizi yönetin" />
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="card p-6 animate-pulse">
              <div className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
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
        title="Takipçiler" 
        description="Takipçilerinizi yönetin"
        breadcrumb={[
          { label: "Panel", href: "/" },
          { label: "Takipçiler" }
        ]}
      />

      {/* Filtre ve Segmentler */}
      <div className="card p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                placeholder="Kullanıcı ara..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="all">Tümü</option>
              <option value="recent">Son 30 gün</option>
              <option value="high-engagement">Yüksek etkileşim</option>
              <option value="top-earners">En çok QP kazananlar</option>
            </select>
            <Button variant="ghost" className="flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtre
            </Button>
            <Button className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Export
            </Button>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-brand-50 flex items-center justify-center">
              <Users className="h-5 w-5 text-brand-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Toplam Takipçi</p>
              <p className="text-xl font-bold text-slate-900">1,234</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Bu Ay</p>
              <p className="text-xl font-bold text-slate-900">+89</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
              <Target className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Aktif Katılımcı</p>
              <p className="text-xl font-bold text-slate-900">456</p>
            </div>
          </div>
        </div>
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
              <Heart className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-slate-600">Ortalama Beğeni</p>
              <p className="text-xl font-bold text-slate-900">2.1K</p>
            </div>
          </div>
        </div>
      </div>

      {/* Takipçi Listesi */}
      {filteredFollowers.length === 0 ? (
        <div className="card p-12 text-center">
          <Users className="h-12 w-12 text-slate-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-slate-900 mb-2">Takipçi bulunamadı</h3>
          <p className="text-slate-500">
            {searchTerm 
              ? 'Arama kriterlerinize uygun takipçi bulunamadı.' 
              : 'Henüz takipçiniz bulunmuyor.'
            }
          </p>
        </div>
      ) : (
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Kullanıcı</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Seviye</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Görevler</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Beğeniler</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Platform</th>
                  <th className="text-left py-3 px-4 font-medium text-slate-600">Son Aktivite</th>
                </tr>
              </thead>
              <tbody>
                {filteredFollowers.map((follower) => (
                  <tr key={follower.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={follower.avatar}
                          alt={follower.username}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-slate-900">@{follower.username}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`badge ${getLevelColor(follower.level)}`}>
                        {follower.level}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Target className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{follower.missionsCompleted}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Heart className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{follower.totalLikes.toLocaleString()}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{getPlatformIcon(follower.platform)}</span>
                        <span className="text-sm text-slate-600 capitalize">{follower.platform}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-slate-400" />
                        <span className="text-sm text-slate-600">{follower.lastActivity}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
