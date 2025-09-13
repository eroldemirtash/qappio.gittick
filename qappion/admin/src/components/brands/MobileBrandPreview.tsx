"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BrandPreviewProps {
  formData: {
    brand_name: string;
    display_name: string;
    email: string;
    phone: string;
    website: string;
    category: string;
    description: string;
    social_instagram: string;
    social_twitter: string;
    social_facebook: string;
    social_linkedin: string;
    logo_url: string;
    cover_url: string;
    license_plan: string;
    features: {
      task_creation: boolean;
      user_management: boolean;
      analytics: boolean;
      api_access: boolean;
      priority_support: boolean;
    };
  };
}

export default function MobileBrandPreview({ formData }: BrandPreviewProps) {
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [tab, setTab] = useState<'missions' | 'products'>('missions');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock data for preview
  const mockMissions = [
    {
      id: '1',
      title: 'Yeni Ürün Lansmanı',
      cover_url: 'https://picsum.photos/seed/mission1/800/600',
      reward_qp: 150,
      total_likes: 45,
      total_posts: 23,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '2',
      title: 'Sosyal Medya Kampanyası',
      cover_url: 'https://picsum.photos/seed/mission2/800/600',
      reward_qp: 200,
      total_likes: 67,
      total_posts: 34,
      starts_at: new Date().toISOString(),
      ends_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
    }
  ];

  const mockProducts = [
    {
      id: '1',
      title: 'Premium Ürün Paketi',
      cover_url: 'https://picsum.photos/seed/product1/400/400',
    },
    {
      id: '2',
      title: 'Özel İndirim Kuponu',
      cover_url: 'https://picsum.photos/seed/product2/400/400',
    }
  ];

  const logo = formData.logo_url || 'https://picsum.photos/seed/logo/200/200';
  const cover = formData.cover_url || 'https://picsum.photos/seed/cover/1200/600';
  
  const socials = {
    instagram: formData.social_instagram ? `https://instagram.com/${formData.social_instagram.replace('@', '')}` : '',
    twitter: formData.social_twitter ? `https://twitter.com/${formData.social_twitter.replace('@', '')}` : '',
    facebook: formData.social_facebook ? `https://facebook.com/${formData.social_facebook}` : '',
    linkedin: formData.social_linkedin ? `https://linkedin.com/in/${formData.social_linkedin}` : '',
  };

  const formatTimeLeft = (startsAt: string, endsAt: string) => {
    const now = new Date();
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    
    if (now < start) return 'Yakında';
    if (now >= end) return 'Sona erdi';
    
    const diffMs = end.getTime() - now.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const days = Math.floor(diffMin / (60 * 24));
    const hours = Math.floor((diffMin % (60 * 24)) / 60);
    const mins = diffMin % 60;
    
    if (days > 0) return `${days}g ${hours}s ${mins}dk`;
    if (hours > 0) return `${hours}s ${mins}dk`;
    return `${mins}dk`;
  };

  return (
    <div className="w-full max-w-sm mx-auto bg-white rounded-2xl shadow-2xl overflow-hidden">
      {/* Mobile Header */}
      <div className="relative h-48 bg-gradient-to-br from-slate-800 to-slate-900">
        <Image
          src={cover}
          alt="Cover"
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-black/30" />
        
        {/* Logo */}
        <div className="absolute left-4 bottom-4 w-16 h-16 rounded-full border-4 border-white overflow-hidden bg-slate-200">
          <Image
            src={logo}
            alt="Logo"
            width={64}
            height={64}
            className="w-full h-full object-contain"
          />
        </div>
        
        {/* Brand Info */}
        <div className="absolute left-20 bottom-4 right-4">
          <h2 className="text-white text-lg font-bold truncate">
            {formData.display_name || formData.brand_name}
          </h2>
          {formData.category && (
            <p className="text-slate-200 text-sm truncate">{formData.category}</p>
          )}
          {formData.email && (
            <p className="text-slate-200 text-sm truncate">{formData.email}</p>
          )}
        </div>
      </div>

      {/* Info Row */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-2">
          {formData.website && (
            <div className="flex items-center gap-1 px-2 py-1 bg-slate-100 rounded-full">
              <svg className="w-3 h-3 text-slate-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.083 9h1.946c.089-1.546.383-2.97.837-4.118A6.004 6.004 0 004.083 9zM10 2a8 8 0 100 16 8 8 0 000-16zm0 2c-.076 0-.232.032-.465.262-.238.234-.497.623-.737 1.182-.389.907-.673 2.142-.766 3.556h3.936c-.093-1.414-.377-2.649-.766-3.556-.24-.56-.5-.948-.737-1.182C10.232 4.032 10.076 4 10 4zm3.971 5c-.089-1.546-.383-2.97-.837-4.118A6.004 6.004 0 0115.917 9h-1.946zm-2.003 2H8.032c.093 1.414.377 2.649.766 3.556.24.56.5.948.737 1.182.233.23.389.262.465.262.076 0 .232-.032.465-.262.238-.234.498-.623.737-1.182.389-.907.673-2.142.766-3.556zm1.166 4.118c.454-1.147.748-2.572.837-4.118h1.946a6.004 6.004 0 01-2.783 4.118zm-6.268 0c.454 1.147.748 2.572.837 4.118H4.083a6.004 6.004 0 002.783-4.118z" clipRule="evenodd" />
              </svg>
              <span className="text-xs text-slate-600 truncate max-w-20">
                {formData.website}
              </span>
            </div>
          )}
          
          {/* Social Icons */}
          <div className="flex gap-3">
            {socials.instagram && (
              <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.62 5.367 11.987 11.988 11.987s11.987-5.367 11.987-11.987C24.014 5.367 18.647.001 12.017.001zM8.449 16.988c-1.297 0-2.448-.49-3.323-1.297C4.198 14.895 3.708 13.744 3.708 12.447s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323c-.875.807-2.026 1.297-3.323 1.297zm7.718-1.297c-.875.807-2.026 1.297-3.323 1.297s-2.448-.49-3.323-1.297c-.807-.875-1.297-2.026-1.297-3.323s.49-2.448 1.297-3.323c.875-.807 2.026-1.297 3.323-1.297s2.448.49 3.323 1.297c.807.875 1.297 2.026 1.297 3.323s-.49 2.448-1.297 3.323z"/>
                </svg>
              </div>
            )}
            {socials.twitter && (
              <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                </svg>
              </div>
            )}
            {socials.facebook && (
              <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </div>
            )}
            {socials.linkedin && (
              <div className="w-6 h-6 bg-blue-700 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </div>
            )}
          </div>
        </div>
        
        {formData.description && (
          <p className="text-slate-600 text-sm">{formData.description}</p>
        )}
      </div>

      {/* Stats */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex justify-around">
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{mockMissions.length}</div>
            <div className="text-xs text-slate-500">Görev</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{followerCount}</div>
            <div className="text-xs text-slate-500">Takipçi</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-slate-900">{mockProducts.length}</div>
            <div className="text-xs text-slate-500">Ürün</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-b border-slate-200">
        <div className="flex gap-2">
          <button
            onClick={() => setIsFollowing(!isFollowing)}
            className={`flex-1 py-2 px-4 rounded-lg text-sm font-semibold ${
              isFollowing 
                ? 'bg-slate-100 text-slate-700 border border-slate-300' 
                : 'bg-slate-900 text-white'
            }`}
          >
            {isFollowing ? 'Takipten Çık' : 'Takip Et'}
          </button>
          <button className="flex-1 py-2 px-4 rounded-lg text-sm font-semibold bg-slate-100 text-slate-700 border border-slate-300">
            Mesaj
          </button>
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 rounded-lg border border-slate-300"
          >
            <svg className="w-4 h-4 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {viewMode === 'grid' ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        <button
          onClick={() => setTab('missions')}
          className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 ${
            tab === 'missions' 
              ? 'bg-slate-900 text-white' 
              : 'text-slate-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Qappiolar
        </button>
        <button
          onClick={() => setTab('products')}
          className={`flex-1 py-3 px-4 text-sm font-semibold flex items-center justify-center gap-2 ${
            tab === 'products' 
              ? 'bg-slate-900 text-white' 
              : 'text-slate-600'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" />
          </svg>
          Ödüller
        </button>
      </div>

      {/* Content */}
      <div className="p-4">
        {tab === 'missions' ? (
          <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {mockMissions.map((mission) => (
              <div key={mission.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <div className="relative">
                  <Image
                    src={mission.cover_url}
                    alt={mission.title}
                    width={viewMode === 'grid' ? 150 : 300}
                    height={viewMode === 'grid' ? 100 : 150}
                    className="w-full object-cover"
                  />
                  {viewMode === 'list' && (
                    <>
                      <div className="absolute inset-0 bg-black/30" />
                      <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <div className="bg-black/60 rounded-lg px-2 py-1 flex-1 mr-2">
                          <h3 className="text-white text-sm font-bold line-clamp-2">{mission.title}</h3>
                        </div>
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-xl px-3 py-1.5">
                          <span className="text-white text-xs font-bold">
                            {mission.reward_qp} QP
                          </span>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-3">
                        <div className="flex justify-between items-center text-white text-xs">
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                            </svg>
                            <span>{mission.total_likes}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                            </svg>
                            <span>{mission.total_posts}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                            </svg>
                            <span>{formatTimeLeft(mission.starts_at, mission.ends_at)}</span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                {viewMode === 'grid' && (
                  <div className="p-2">
                    <h3 className="text-slate-900 text-xs font-semibold mb-1 line-clamp-2">{mission.title}</h3>
                    <div className="flex justify-between items-center">
                      <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg px-2 py-1">
                        <span className="text-white text-xs font-bold">{mission.reward_qp}</span>
                      </div>
                      <div className="flex gap-2 text-xs">
                        <span className="text-red-500">❤️ {mission.total_likes}</span>
                        <span className="text-blue-500">📷 {mission.total_posts}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className={`grid gap-3 ${viewMode === 'grid' ? 'grid-cols-2' : 'grid-cols-1'}`}>
            {mockProducts.map((product) => (
              <div key={product.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                <Image
                  src={product.cover_url}
                  alt={product.title}
                  width={viewMode === 'grid' ? 150 : 300}
                  height={viewMode === 'grid' ? 120 : 150}
                  className="w-full object-cover"
                />
                <div className="p-3">
                  <h3 className="text-slate-900 text-sm font-semibold">{product.title}</h3>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
