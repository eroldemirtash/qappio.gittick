export interface Brand {
  id: string;
  name: string;
  is_active: boolean;
  created_at: string;
  category?: string;
  email?: string;
  phone?: string;
  website?: string;
  description?: string;
  brand_profiles?: {
    id?: string;
    display_name?: string;
    avatar_url?: string;
    cover_url?: string;
    description?: string;
    website?: string;
    instagram_url?: string;
    twitter_url?: string;
    email?: string;
    phone?: string;
    category?: string;
    license_plan?: string;
    license_start?: string;
    license_end?: string;
    license_fee?: number;
  };
}

export interface Mission {
  id: string;
  title: string;
  description?: string;
  brand_id: string;
  cover_url?: string;
  reward_qp: number;
  published: boolean;
  is_qappio_of_week: boolean;
  starts_at?: string;
  ends_at?: string;
  created_at: string;
  brand?: {
    id: string;
    name: string;
    brand_profiles?: {
      avatar_url?: string;
    };
  };
}

export interface User {
  id: string;
  full_name?: string;
  username?: string;
  role: string;
  avatar_url?: string;
  created_at: string;
  level?: string;
  total_qp?: number;
  spendable_qp?: number;
  total_missions?: number;
  completed_missions?: number;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  channel: string;
  scheduled_at?: string;
  is_active: boolean;
  created_at: string;
  sent_count?: number;
  read_rate?: number;
}

export interface Stats {
  total_brands: number;
  active_missions: number;
  total_users: number;
  total_notifications: number;
  total_qp_collected?: number;
  total_products?: number;
  active_products?: number;
}

export interface Level {
  id: string;
  name: string;
  description: string;
  min_points: number;
  max_points: number;
  user_count: number;
  badge_letter: string;
}

export interface Share {
  id: string;
  user_id: string;
  brand_id: string;
  mission_id: string;
  media_url?: string;
  likes: number;
  created_at: string;
  user?: {
    full_name?: string;
    username?: string;
    avatar_url?: string;
  };
  brand?: {
    name: string;
  };
  mission?: {
    title: string;
  };
}

export interface MarketItem {
  id: string;
  name: string;
  description?: string;
  price_qp: number;
  category: string;
  brand_id: string;
  is_active: boolean;
  stock?: number;
  image_url?: string;
  brand?: {
    name: string;
  };
}

export interface ApiResponse<T> {
  items: T[];
  error?: string;
  message?: string;
}

export interface BrandStats {
  totalMissions: number;
  activeMissions: number;
  users: number;
  totalShares: number;
  followers: number;
  balance: number;
  performance: {
    sharesPerMission: number;
    missionsPerUser: number;
    averageBalance: number;
  };
}

export interface Settings {
  use_mocks: boolean;
  theme: {
    primary: string;
    secondary: string;
    dark_mode: boolean;
  };
  notifications: {
    email_enabled: boolean;
    push_enabled: boolean;
    sms_enabled: boolean;
  };
}

export interface SubmissionRanking {
  id: string;
  media_url: string;
  created_at: string;
  user_id: string;
  likes_count: number;
  profiles: {
    display_name: string;
    avatar_url?: string;
  };
}
