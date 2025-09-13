"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface MissionPreviewProps {
  formData: {
    title: string;
    brief: string;
    description: string;
    cover_url: string;
    reward_qp: number;
    starts_at: string;
    ends_at: string;
    brand_id: string;
    brand_name?: string;
    brand_logo?: string;
  };
}

export default function MobileMissionPreview({ formData }: MissionPreviewProps) {
  const [timeLeft, setTimeLeft] = useState("");

  // Mock data for preview
  const mockStats = {
    totalLikes: 245,
    totalPosts: 12,
  };

  const mockTopUsers = [
    { id: '1', name: 'user1', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100&h=100&fit=crop&crop=face', likes: 245, rank: 1 },
    { id: '2', name: 'user2', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face', likes: 198, rank: 2 },
    { id: '3', name: 'user3', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face', likes: 156, rank: 3 },
  ];

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return '#ffd700';
      case 2: return '#c0c0c0';
      case 3: return '#cd7f32';
      default: return '#000';
    }
  };

  // Calculate time left
  useEffect(() => {
    const calculateTimeLeft = () => {
      if (!formData.ends_at) {
        setTimeLeft("Süresiz");
        return;
      }

      const now = new Date();
      const endTime = new Date(formData.ends_at);
      const timeLeft = Math.max(0, endTime.getTime() - now.getTime());
      
      if (timeLeft === 0) {
        setTimeLeft("Sona erdi");
        return;
      }
      
      const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
      const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
      
      if (days > 0) {
        setTimeLeft(`${days}g ${hours}s ${minutes}dk`);
      } else if (hours > 0) {
        setTimeLeft(`${hours}s ${minutes}dk`);
      } else {
        setTimeLeft(`${minutes}dk`);
      }
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [formData.ends_at]);

  const coverImage = formData.cover_url || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80';
  const brandLogo = formData.brand_logo || 'https://via.placeholder.com/50x50/06b6d4/ffffff?text=' + encodeURIComponent(formData.brand_name || 'M');

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Mobile Mission Detail Screen - Only Mission Card */}
      <div className="bg-slate-50 p-4">
        {/* Mission Detail Card */}
        <div className="relative">
          <div className="relative w-full h-60 rounded-2xl overflow-hidden shadow-lg">
            <Image
              src={coverImage}
              alt="Mission Cover"
              fill
              className="object-cover"
            />
            <div className="absolute inset-0 bg-black/60" />
            
            {/* Brand Logo and Name - Top Left */}
            <div className="absolute top-2 left-2 flex items-center bg-black/60 rounded-2xl px-2 py-1">
              <Image
                src={brandLogo}
                alt="Brand Logo"
                width={24}
                height={24}
                className="w-6 h-6 rounded-full mr-1.5 object-contain"
              />
              <span className="text-white text-xs font-bold">
                {formData.brand_name || 'Marka'}
              </span>
            </div>

            {/* Countdown and QP - Top Right */}
            <div className="absolute top-2 right-2 flex flex-col items-end space-y-2">
              <div className="bg-black/80 px-2.5 py-1.5 rounded-xl flex items-center">
                <svg className="w-3 h-3 text-white mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-white text-xs font-semibold">{timeLeft}</span>
              </div>
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl px-3 py-1.5 shadow-lg">
                <span className="text-white text-xs font-bold">{formData.reward_qp || 0} QP</span>
              </div>
            </div>

            {/* Mission Description - Center */}
            <div className="absolute top-1/2 left-3 right-3 transform -translate-y-1/2 text-center">
              <p className="text-white text-sm leading-relaxed text-shadow-lg">
                {formData.description || formData.brief || 'Görev açıklaması buraya yazılacak...'}
              </p>
              {(formData.description || formData.brief) && (formData.description || formData.brief || '').length > 100 && (
                <p className="text-cyan-400 text-xs font-medium mt-1">devamı...</p>
              )}
            </div>

            {/* Action Buttons - Bottom */}
            <div className="absolute bottom-3 left-3 right-3 flex justify-between items-center">
              {/* Post Count */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl px-3 py-2 flex items-center space-x-1.5 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-white text-xs font-bold">{mockStats.totalPosts}</span>
              </div>
              
              {/* Qappishle Button */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl p-3 shadow-xl border-2 border-cyan-400">
                <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              
              {/* Like Count */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl px-3 py-2 flex items-center space-x-1.5 shadow-lg">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                </svg>
                <span className="text-white text-xs font-bold">{mockStats.totalLikes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
