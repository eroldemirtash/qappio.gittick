"use client";

import { Modal } from "@/components/ui/Modal";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Brand, BrandStats } from "@/lib/types";
import { Building2, Globe, Mail, Phone, Calendar, Tag, Eye, EyeOff, Users, Share2, TrendingUp, RefreshCw } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { jget } from "@/lib/fetcher";
import { createRealtimeClient } from "@/lib/supabase-realtime";

interface BrandDetailModalProps {
  brand: Brand | null;
  isOpen: boolean;
  onClose: () => void;
  onToggleActive: (brand: Brand) => void;
  onEdit: (brand: Brand) => void;
}

export function BrandDetailModal({ 
  brand, 
  isOpen, 
  onClose, 
  onToggleActive, 
  onEdit 
}: BrandDetailModalProps) {
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useRef(createRealtimeClient());
  const channelRef = useRef<any>(null);

  useEffect(() => {
    if (isOpen && brand) {
      fetchStats();
      setupRealtimeUpdates();
    } else {
      cleanupRealtimeUpdates();
    }

    return () => {
      cleanupRealtimeUpdates();
    };
  }, [isOpen, brand]);

  const fetchStats = async () => {
    if (!brand) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await jget(`/api/brands/${brand.id}/stats`);
      if (response.success) {
        setStats(response.data);
      } else {
        setError('İstatistikler yüklenemedi');
      }
    } catch (err) {
      setError('İstatistikler yüklenemedi');
      console.error('Stats fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const setupRealtimeUpdates = () => {
    if (!brand || !supabase.current) return;

    // Clean up existing channel
    cleanupRealtimeUpdates();

    // Create new channel for real-time updates
    const channel = supabase.current
      .channel(`brand-stats-${brand.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'missions',
          filter: `brand_id=eq.${brand.id}`
        },
        () => {
          // Refresh stats when missions change
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mission_participations'
        },
        () => {
          // Refresh stats when participations change
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'shares'
        },
        () => {
          // Refresh stats when shares change
          fetchStats();
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'brand_follows',
          filter: `brand_id=eq.${brand.id}`
        },
        () => {
          // Refresh stats when follows change
          fetchStats();
        }
      )
      .subscribe();

    channelRef.current = channel;
  };

  const cleanupRealtimeUpdates = () => {
    if (channelRef.current && supabase.current) {
      supabase.current.removeChannel(channelRef.current);
      channelRef.current = null;
    }
  };

  if (!brand) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Marka Detayları"
      size="xl"
    >
      <div className="p-6 space-y-6">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <Avatar
            src={brand.brand_profiles?.avatar_url}
            fallback={brand.name[0] || "M"}
            size="lg"
            className="w-16 h-16"
          />
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-2xl font-bold text-slate-900">{brand.name}</h3>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                brand.is_active 
                  ? "bg-emerald-100 text-emerald-700" 
                  : "bg-slate-100 text-slate-700"
              }`}>
                {brand.is_active ? "Aktif" : "Pasif"}
              </span>
              <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                {brand.category || brand.brand_profiles?.category || "Kategori"}
              </span>
            </div>
            <p className="text-slate-600 mb-1">
              {brand.email || brand.brand_profiles?.email || "E-posta belirtilmemiş"}
            </p>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Performans Metrikleri</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={fetchStats}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Yenile
            </Button>
          </div>
          
          {loading ? (
            <div className="grid grid-cols-5 gap-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="bg-slate-50 rounded-lg p-4 text-center animate-pulse">
                  <div className="h-8 bg-slate-200 rounded mb-2"></div>
                  <div className="h-4 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-600">{error}</p>
              <Button variant="ghost" size="sm" onClick={fetchStats} className="mt-2">
                Tekrar Dene
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-5 gap-4">
              <div className="bg-blue-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats?.totalMissions.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-slate-600">Toplam Görev</div>
              </div>
              <div className="bg-emerald-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-emerald-600">
                  {stats?.users.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-slate-600">Kullanıcı</div>
              </div>
              <div className="bg-purple-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {stats?.totalShares.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-slate-600">Toplam Paylaşım</div>
              </div>
              <div className="bg-pink-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-pink-600">
                  {stats?.followers.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-slate-600">Takipçi</div>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  ₺{stats?.balance.toLocaleString() || '0'}
                </div>
                <div className="text-sm text-slate-600">Bakiye</div>
              </div>
            </div>
          )}
        </div>

        {/* Details Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Brand Information */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Marka Bilgileri
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Tag className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  Kategori: {brand.category || brand.brand_profiles?.category || "Belirtilmemiş"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  brand.is_active 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-slate-100 text-slate-700"
                }`}>
                  {brand.is_active ? "Aktif" : "Pasif"}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  Kayıt Tarihi: {new Date(brand.created_at).toLocaleDateString('tr-TR')}
                </span>
              </div>
            </div>
          </div>

          {/* Performance Summary */}
          <div className="space-y-4">
            <h4 className="font-semibold text-slate-900 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Performans Özeti
            </h4>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Share2 className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  Görev Başına Paylaşım: {stats?.performance.sharesPerMission || 0}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <Users className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  Kullanıcı Başına Görev: {stats?.performance.missionsPerUser || 0}
                </span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <TrendingUp className="h-4 w-4 text-slate-400" />
                <span className="text-slate-600">
                  Ortalama Bakiye: ₺{stats?.performance.averageBalance.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Follower List Section */}
        <div className="space-y-4">
          <h4 className="font-semibold text-slate-900 flex items-center gap-2">
            <Users className="h-4 w-4" />
            Takipçi Listesi ({stats?.followers.toLocaleString() || '0'})
          </h4>
          <div className="bg-slate-50 rounded-lg p-8 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-500">
              {stats?.followers === 0 ? 'Henüz takipçi bulunmuyor' : 'Takipçi listesi yakında eklenecek'}
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={() => onToggleActive(brand)}
              className="flex items-center gap-2"
            >
              {brand.is_active ? (
                <>
                  <EyeOff className="h-4 w-4" />
                  Pasife Al
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4" />
                  Aktif Et
                </>
              )}
            </Button>
          </div>
          
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              onClick={onClose}
            >
              Kapat
            </Button>
            <Button
              onClick={() => onEdit(brand)}
            >
              Düzenle
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
