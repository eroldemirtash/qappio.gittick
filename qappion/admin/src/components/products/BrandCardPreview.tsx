'use client';

import { BrandSelect } from '@/lib/zodSchemas';
import { ExternalLink, Mail, Instagram, Twitter, Facebook } from 'lucide-react';

interface BrandCardPreviewProps {
  brand: BrandSelect | null;
}

export function BrandCardPreview({ brand }: BrandCardPreviewProps) {
  if (!brand) {
    return (
      <div className="p-4 border-2 border-dashed border-slate-300 rounded-lg text-center text-slate-500">
        Marka seçin
      </div>
    );
  }

  const socialIcons = {
    instagram: Instagram,
    twitter: Twitter,
    facebook: Facebook,
  };

  return (
    <div className="p-4 bg-white border border-slate-200 rounded-lg shadow-sm">
      <div className="flex items-center gap-3 mb-3">
        {brand.logo_url && (
          <img 
            src={brand.logo_url} 
            alt={brand.name}
            className="w-12 h-12 rounded-lg object-cover"
          />
        )}
        <div>
          <h3 className="font-semibold text-slate-900">{brand.name}</h3>
          {brand.website && (
            <div className="flex items-center gap-1 text-sm text-slate-600">
              <ExternalLink className="w-3 h-3" />
              <span>{brand.website}</span>
            </div>
          )}
        </div>
      </div>
      
      {brand.email && (
        <div className="flex items-center gap-2 text-sm text-slate-600 mb-2">
          <Mail className="w-4 h-4" />
          <span>{brand.email}</span>
        </div>
      )}
      
      {brand.social_media && Object.keys(brand.social_media).length > 0 && (
        <div className="flex gap-2">
          {Object.entries(brand.social_media).map(([platform, url]) => {
            const IconComponent = socialIcons[platform as keyof typeof socialIcons];
            if (!IconComponent || !url) return null;
            
            return (
              <a
                key={platform}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded"
              >
                <IconComponent className="w-4 h-4" />
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
