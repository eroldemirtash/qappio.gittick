"use client";

import { Mission } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Eye, Edit, Play, Pause, Clock, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface MissionCardProps {
  mission: Mission;
  onTogglePublished: (mission: Mission) => void;
  onToggleQappioOfWeek: (mission: Mission) => void;
  onEdit: (mission: Mission) => void;
  onViewDetails: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}

export function MissionCard({ 
  mission, 
  onTogglePublished, 
  onToggleQappioOfWeek, 
  onEdit, 
  onViewDetails,
  onDelete
}: MissionCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePublished = async () => {
    setIsLoading(true);
    try {
      await onTogglePublished(mission);
    } finally {
      setIsLoading(false);
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
    
    if (days > 0) return `${days}g ${hours}s`;
    if (hours > 0) return `${hours}s`;
    
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${minutes}dk`;
  };

  const timeRemaining = formatTimeRemaining(mission.ends_at);

  // Debug: API'den gelen veriyi kontrol et
  console.log('MissionCard - mission data:', {
    id: mission.id,
    title: mission.title,
    brand: mission.brand,
    is_sponsored: mission.is_sponsored,
    sponsor_brand: mission.sponsor_brand
  });

  return (
    <div className="card p-6 hover:shadow-lg transition-shadow">
      {/* Cover Image */}
      {mission.cover_url && (
        <div className="relative mb-4">
          <img 
            src={mission.cover_url} 
            alt={mission.title}
            className="w-full h-48 object-cover rounded-xl"
          />
          {mission.is_qappio_of_week && (
            <div className="absolute top-3 right-3">
              <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <Star className="h-3 w-3" />
                Haftanın Qappio'su
              </div>
            </div>
          )}
          {mission.is_sponsored && mission.sponsor_brand && (
            <div className="absolute top-3 left-3">
              <div className="flex items-center gap-1 bg-purple-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <span>Sponsored by</span>
                {mission.sponsor_brand.brand_profiles?.logo_url && (
                  <img
                    src={mission.sponsor_brand.brand_profiles.logo_url}
                    alt={mission.sponsor_brand.name}
                    className="h-3 w-3 rounded-full"
                  />
                )}
                <span>{mission.sponsor_brand.name}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar
            src={mission.brand?.brand_profiles?.logo_url}
            fallback={mission.brand?.name?.[0] || "M"}
            size="md"
          />
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{mission.title}</h3>
            <p className="text-sm text-slate-500">{mission.brand?.name}</p>
            {/* Sponsor bilgisi */}
            {mission.is_sponsored && mission.sponsor_brand && (
              <div className="flex items-center gap-1 mt-1">
                <span className="text-xs text-red-500 font-medium">Sponsored by</span>
                {mission.sponsor_brand.brand_profiles?.logo_url && (
                  <img
                    src={mission.sponsor_brand.brand_profiles.logo_url}
                    alt={mission.sponsor_brand.name}
                    className="h-3 w-3 rounded-full"
                  />
                )}
                <span className="text-xs text-red-500 font-medium">{mission.sponsor_brand.name}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 text-sm font-semibold rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg">
            {mission.reward_qp || 0} QP
          </span>
        </div>
      </div>

      {/* Description */}
      {mission.description && (
        <p className="text-sm text-slate-600 mb-4 line-clamp-2">
          {mission.description}
        </p>
      )}


      {/* Time Remaining */}
      {timeRemaining && (
        <div className="flex items-center gap-2 mb-4 text-sm text-slate-500">
          <Clock className="h-4 w-4" />
          <span>Kalan süre: {timeRemaining}</span>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        {/* Publish/Unpublish Button */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleTogglePublished}
            disabled={isLoading}
            className={`w-full ${mission.published ? "text-green-600 hover:text-green-700 hover:bg-green-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
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
        </div>
        
        {/* Qappio of Week Toggle */}
        <div className="flex justify-center mb-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onToggleQappioOfWeek(mission)}
            disabled={isLoading}
            className={`w-full ${mission.is_qappio_of_week ? "text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50" : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"}`}
          >
            <Star className="h-4 w-4 mr-2" />
            {mission.is_qappio_of_week ? "Haftanın Qappio'su" : "Haftanın Qappio'su Yap"}
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-3 gap-2">
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onViewDetails(mission)}
            className="text-slate-600 hover:text-slate-700 hover:bg-slate-50"
          >
            <Eye className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onEdit(mission)}
            className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onDelete(mission)}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>


    </div>
  );
}
