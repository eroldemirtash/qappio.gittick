"use client";

import { Mission, SubmissionRanking } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { X, Clock, Star, Calendar, MapPin, Users, Eye, Edit, Play, Pause, Trophy, Heart } from "lucide-react";
import { useState, useEffect } from "react";
import { jget } from "@/lib/fetcher";

interface MissionDetailModalProps {
  mission: Mission | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (mission: Mission) => void;
  onTogglePublished: (mission: Mission) => void;
  onToggleQappioOfWeek: (mission: Mission) => void;
}

export function MissionDetailModal({ 
  mission, 
  isOpen, 
  onClose, 
  onEdit, 
  onTogglePublished, 
  onToggleQappioOfWeek 
}: MissionDetailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [ranking, setRanking] = useState<SubmissionRanking[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);

  useEffect(() => {
    const fetchRanking = async () => {
      if (!mission?.id || !isOpen) return;
      
      setRankingLoading(true);
      try {
        const response = await jget<{ ranking: SubmissionRanking[] }>(`/api/missions/${mission.id}/ranking`);
        setRanking(response.ranking || []);
      } catch (error) {
        console.error('Failed to fetch ranking:', error);
      } finally {
        setRankingLoading(false);
      }
    };

    fetchRanking();
  }, [mission?.id, isOpen]);

  if (!isOpen || !mission) return null;

  const handleTogglePublished = async () => {
    setIsLoading(true);
    try {
      await onTogglePublished(mission);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleQappioOfWeek = async () => {
    setIsLoading(true);
    try {
      await onToggleQappioOfWeek(mission);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Belirtilmemiş";
    try {
      return new Date(dateString).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
      });
    } catch (error) {
      return "Geçersiz tarih";
    }
  };

  const formatTimeRemaining = (endsAt?: string) => {
    if (!endsAt) return null;
    
    const now = new Date();
    const end = new Date(endsAt);
    const diff = end.getTime() - now.getTime();
    
    if (diff <= 0) return "Süresi doldu";
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (days > 0) return `${days} gün ${hours} saat`;
    if (hours > 0) return `${hours} saat`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes} dakika`;
  };

  const timeRemaining = formatTimeRemaining(mission.ends_at);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-slate-900">Görev Detayları</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Cover Image */}
          {mission.cover_url && (
            <div className="relative">
              <img 
                src={mission.cover_url} 
                alt={mission.title}
                className="w-full h-64 object-cover rounded-xl"
              />
              {mission.is_qappio_of_week && (
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    <Star className="h-4 w-4" />
                    Haftanın Qappio'su
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mission Info */}
          <div className="space-y-4">
            <div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">{mission.title}</h3>
              <div className="flex items-center gap-3">
                <Avatar
                  src={mission.brand?.brand_profiles?.avatar_url}
                  fallback={mission.brand?.name?.[0] || "M"}
                  size="md"
                />
                <div>
                  <p className="font-medium text-slate-900">{mission.brand?.name}</p>
                  <p className="text-sm text-slate-500">Marka</p>
                </div>
              </div>
            </div>

            {mission.description && (
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Açıklama</h4>
                <p className="text-slate-600 leading-relaxed">{mission.description}</p>
              </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-1">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium text-slate-700">Ödül</span>
                </div>
                <p className="text-2xl font-bold text-brand-600">{mission.reward_qp} QP</p>
              </div>
              
              {timeRemaining && (
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-4 w-4 text-slate-500" />
                    <span className="text-sm font-medium text-slate-700">Kalan Süre</span>
                  </div>
                  <p className="text-lg font-semibold text-slate-900">{timeRemaining}</p>
                </div>
              )}
            </div>

            {/* Dates */}
            <div className="space-y-4">
              <h4 className="font-medium text-slate-900 mb-3">Zamanlama</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium text-slate-700">Başlangıç</span>
                  </div>
                  <p className="text-slate-900 font-medium">{formatDate(mission.starts_at)}</p>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl">
                  <div className="flex items-center gap-2 mb-2">
                    <Calendar className="h-4 w-4 text-red-500" />
                    <span className="text-sm font-medium text-slate-700">Bitiş</span>
                  </div>
                  <p className="text-slate-900 font-medium">{formatDate(mission.ends_at)}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${mission.published ? 'bg-green-500' : 'bg-slate-300'}`} />
                <span className="text-sm font-medium">
                  {mission.published ? 'Yayında' : 'Taslak'}
                </span>
              </div>
              
              {mission.is_qappio_of_week && (
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">Haftanın Qappio'su</span>
                </div>
              )}
            </div>

            {/* Ranking Section */}
            {ranking.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  <h4 className="text-lg font-semibold text-slate-900">En Çok Beğenilenler</h4>
                </div>
                
                <div className="space-y-3">
                  {ranking.slice(0, 5).map((submission, index) => {
                    const getRankColor = (rank: number) => {
                      switch (rank) {
                        case 1:
                          return "bg-gradient-to-r from-yellow-400 to-yellow-500"; // Gold
                        case 2:
                          return "bg-gradient-to-r from-gray-300 to-gray-400"; // Silver
                        case 3:
                          return "bg-gradient-to-r from-amber-600 to-amber-700"; // Bronze
                        default:
                          return "bg-gradient-to-r from-gray-700 to-gray-800"; // Black for 4th and 5th
                      }
                    };

                    return (
                      <div key={submission.id} className="flex items-center gap-4 p-3 bg-slate-50 rounded-xl">
                        <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getRankColor(index + 1)} text-white text-sm font-bold`}>
                          {index + 1}
                        </div>
                        <Avatar
                          src={submission.profiles.avatar_url}
                          fallback={submission.profiles.display_name?.[0] || "U"}
                          size="md"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-slate-900 truncate">
                            {submission.profiles.display_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {new Date(submission.created_at).toLocaleDateString("tr-TR")}
                          </p>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Heart className="h-4 w-4" />
                          <span className="font-medium">{submission.likes_count}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between p-6 border-t bg-slate-50">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={handleTogglePublished}
              disabled={isLoading}
              className={mission.published ? "text-green-600 hover:text-green-700" : "text-slate-500 hover:text-slate-700"}
            >
              {mission.published ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Duraklat
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Yayınla
                </>
              )}
            </Button>
            
            <Button
              variant="ghost"
              onClick={handleToggleQappioOfWeek}
              disabled={isLoading}
              className={mission.is_qappio_of_week ? "text-yellow-600 hover:text-yellow-700" : "text-slate-500 hover:text-slate-700"}
            >
              <Star className="h-4 w-4 mr-2" />
              {mission.is_qappio_of_week ? "Haftanın Qappio'sundan Çıkar" : "Haftanın Qappio'su Yap"}
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={onClose}>
              Kapat
            </Button>
            <Button onClick={() => onEdit(mission)}>
              <Edit className="h-4 w-4 mr-2" />
              Düzenle
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
