'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/ui/StatCard';
import { Users, Share2, Gift, Heart, DollarSign, Calendar, Tag, Activity } from 'lucide-react';

interface BrandStats {
  total_missions: number;
  total_users: number;
  total_shares: number;
  total_followers: number;
  balance: number;
  shares_per_mission: number;
  missions_per_user: number;
  average_balance: number;
  category: string;
  status: string;
  registration_date: string;
  followers: Array<{
    id: string;
    created_at: string;
    user_id: string;
    auth: {
      users: {
        id: string;
        email: string;
        user_metadata: any;
      };
    };
  }>;
  brand: {
    id: string;
    name: string;
    logo_url: string;
    category: string;
    is_active: boolean;
    created_at: string;
    description: string;
    brand_profiles: {
      avatar_url: string;
      cover_url: string;
      email: string;
      website: string;
    };
  };
}

export default function BrandDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const brandId = params.id as string;
  const [stats, setStats] = useState<BrandStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = () => {
    router.push(`/brands/profile/new?edit=${brandId}`);
  };

  const fetchStats = async () => {
    try {
      setLoading(true);
      console.log('🔍 Fetching stats for brand:', brandId);
      const response = await fetch(`/api/brands/${brandId}/stats`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`Veriler alınamadı: ${response.status} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log('📊 Stats data:', data);
      setStats(data);
    } catch (err) {
      console.error('❌ Fetch error:', err);
      setError(err instanceof Error ? err.message : 'Bilinmeyen hata');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (brandId) {
      fetchStats();
    }
  }, [brandId]);

  if (loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-5 gap-4 mb-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Marka Detayları</h1>
          <p className="text-red-600 mb-4">{error || 'Veriler yüklenemedi'}</p>
          <Button onClick={fetchStats}>Yenile</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Marka Detayları</h1>
        <Button onClick={fetchStats} variant="outline" size="sm">
          <Activity className="w-4 h-4 mr-2" />
          Yenile
        </Button>
      </div>

      {/* Marka Bilgileri Kartı */}
      {stats?.brand && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-start space-x-4">
            {/* Marka Logosu */}
            <div className="flex-shrink-0">
              <img
                src={stats.brand.logo_url || '/placeholder-logo.png'}
                alt={stats.brand.name}
                className="w-16 h-16 rounded-lg object-contain border border-gray-200 bg-gray-50"
                onError={(e) => {
                  e.currentTarget.src = '/placeholder-logo.png';
                }}
              />
            </div>
            
            {/* Marka Bilgileri */}
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-xl font-bold text-gray-900">{stats.brand.name}</h2>
                <Badge variant={stats.brand.is_active ? 'default' : 'destructive'}>
                  {stats.brand.is_active ? 'Aktif' : 'Pasif'}
                </Badge>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <Tag className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Kategori:</span>
                  <span className="font-medium">{stats.brand.category || 'Belirtilmemiş'}</span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-500" />
                  <span className="text-gray-600">Kayıt Tarihi:</span>
                  <span className="font-medium">{new Date(stats.brand.created_at).toLocaleDateString('tr-TR')}</span>
                </div>
                
                {stats.brand.brand_profiles?.email && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium">{stats.brand.brand_profiles.email}</span>
                  </div>
                )}
                
                {stats.brand.brand_profiles?.website && (
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-600">Website:</span>
                    <a 
                      href={stats.brand.brand_profiles.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-blue-600 hover:underline"
                    >
                      {stats.brand.brand_profiles.website}
                    </a>
                  </div>
                )}
                
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performans Metrikleri */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Activity className="w-5 h-5 mr-2 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Performans Metrikleri</h2>
        </div>
        <div className="grid grid-cols-5 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-blue-600">{stats.total_missions}</div>
            <div className="text-sm text-gray-600">Toplam Görev</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-green-600">{stats.total_users}</div>
            <div className="text-sm text-gray-600">Kullanıcı</div>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-purple-600">{stats.total_shares}</div>
            <div className="text-sm text-gray-600">Toplam Paylaşım</div>
          </div>
          <div className="bg-pink-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-pink-600">{stats.total_followers}</div>
            <div className="text-sm text-gray-600">Takipçi</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg text-center">
            <div className="text-2xl font-bold text-yellow-600">₺{stats.balance}</div>
            <div className="text-sm text-gray-600">Bakiye</div>
          </div>
        </div>
      </div>

      {/* Marka Bilgileri */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Tag className="w-5 h-5 mr-2 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Marka Bilgileri</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Tag className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Kategori:</span>
            <Badge variant="secondary">{stats.category || 'Belirtilmemiş'}</Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Activity className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Durum:</span>
            <Badge variant={stats.status === 'Aktif' ? 'default' : 'destructive'}>
              {stats.status}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-600">Kayıt Tarihi:</span>
            <span className="text-sm font-medium">{stats.registration_date}</span>
          </div>
        </div>
      </div>

      {/* Performans Özeti */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Activity className="w-5 h-5 mr-2 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Performans Özeti</h2>
        </div>
        <div className="grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-2">
            <Share2 className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Görev Başına Paylaşım:</span>
            <span className="text-sm font-medium">{stats.shares_per_mission}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Users className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Kullanıcı Başına Görev:</span>
            <span className="text-sm font-medium">{stats.missions_per_user}</span>
          </div>
          <div className="flex items-center space-x-2">
            <DollarSign className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">Ortalama Bakiye:</span>
            <span className="text-sm font-medium">₺{stats.average_balance}</span>
          </div>
        </div>
      </div>

      {/* Takipçi Listesi */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="flex items-center mb-4">
          <Users className="w-5 h-5 mr-2 text-gray-700" />
          <h2 className="text-lg font-semibold text-gray-900">Takipçi Listesi ({stats.total_followers})</h2>
        </div>
        {stats.total_followers === 0 ? (
          <div className="text-center py-8">
            <Users className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">Henüz takipçi bulunmuyor</p>
          </div>
        ) : (
          <div className="space-y-2">
            {stats.followers.map((follower) => (
              <div key={follower.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {follower.auth?.users?.email?.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {follower.auth?.users?.user_metadata?.full_name || 
                       follower.auth?.users?.email || 
                       'Bilinmeyen Kullanıcı'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {follower.auth?.users?.email}
                    </p>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(follower.created_at).toLocaleDateString('tr-TR')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-gray-100 p-4 rounded-lg">
        <div className="flex justify-end">
          <Button onClick={handleEdit}>Düzenle</Button>
        </div>
      </div>
    </div>
  );
}