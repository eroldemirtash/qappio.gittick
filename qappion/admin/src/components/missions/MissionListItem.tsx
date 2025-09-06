"use client";

import { Mission } from "@/lib/types";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Eye, Edit, Play, Pause, Clock, Star, Trash2 } from "lucide-react";
import { useState } from "react";

interface MissionListItemProps {
  mission: Mission;
  onTogglePublished: (mission: Mission) => void;
  onToggleQappioOfWeek: (mission: Mission) => void;
  onEdit: (mission: Mission) => void;
  onViewDetails: (mission: Mission) => void;
  onDelete: (mission: Mission) => void;
}

export function MissionListItem({ 
  mission, 
  onTogglePublished, 
  onToggleQappioOfWeek, 
  onEdit, 
  onViewDetails,
  onDelete
}: MissionListItemProps) {
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

  return (
    <div className="card p-4 flex items-center justify-between hover:shadow-md transition-shadow">
      {/* Left side - Image and Info */}
      <div className="flex items-center gap-4 flex-1">
        {/* Cover Image */}
        <div className="relative">
          {mission.cover_url ? (
            <img 
              src={mission.cover_url} 
              alt={mission.title}
              className="h-16 w-28 object-cover rounded-xl"
            />
          ) : (
            <div className="h-16 w-28 bg-slate-200 rounded-xl flex items-center justify-center">
              <span className="text-slate-400 text-xs">Resim yok</span>
            </div>
          )}
          {mission.is_qappio_of_week && (
            <div className="absolute -top-1 -right-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
            </div>
          )}
        </div>

        {/* Mission Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-semibold text-slate-900 truncate">{mission.title}</h3>
            <span className="px-2 py-1 text-xs font-semibold rounded-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 text-white shadow-lg">
              {mission.reward_qp || 0} QP
            </span>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Avatar
              src={mission.brand?.brand_profiles?.avatar_url}
              fallback={mission.brand?.name?.[0] || "M"}
              size="sm"
            />
            <span className="truncate">{mission.brand?.name}</span>
            {timeRemaining && (
              <>
                <span>•</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{timeRemaining}</span>
                </div>
              </>
            )}
          </div>
          
          {mission.description && (
            <p className="text-sm text-slate-600 mt-1 line-clamp-1">
              {mission.description}
            </p>
          )}
        </div>
      </div>

      {/* Right side - Actions */}
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleTogglePublished}
          disabled={isLoading}
          className={mission.published ? "text-green-600 hover:text-green-700" : "text-slate-500 hover:text-slate-700"}
        >
          {mission.published ? (
            <>
              <Pause className="h-4 w-4 mr-1" />
              Duraklat
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-1" />
              Yayınla
            </>
          )}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onToggleQappioOfWeek(mission)}
          disabled={isLoading}
          className={mission.is_qappio_of_week ? "text-yellow-600 hover:text-yellow-700" : "text-slate-500 hover:text-slate-700"}
        >
          <Star className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onViewDetails(mission)}
        >
          <Eye className="h-4 w-4" />
        </Button>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => onEdit(mission)}
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
  );
}
