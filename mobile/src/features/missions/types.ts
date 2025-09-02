export interface FeedUser {
  id: string;
  display_name: string;
  avatar_url?: string;
  level_name?: string;
  level_tier?: number;
}

export interface Brand {
  id: string;
  name: string;
  logo_url?: string;
}

export interface Mission {
  id: string;
  title: string;
  brand?: Brand;
}

export interface FeedItem {
  id: string;
  media_type?: 'image' | 'video';
  media_url?: string;
  caption?: string;
  like_count?: number;
  comment_count?: number;
  created_at?: string;
  is_sponsored?: boolean;
  user?: FeedUser;
  mission?: Mission;
  sponsor_brand?: Brand;
  latest_comment?: {
    username: string;
    text: string;
  };
}

export interface MissionDetail {
  id: string;
  title: string;
  description: string;
  reward_qp: number;
  deadline?: string;
  location_lat?: number;
  location_lng?: number;
  location_radius?: number;
  brand: Brand;
  media_url?: string;
  status: 'active' | 'closed' | 'completed';
}
