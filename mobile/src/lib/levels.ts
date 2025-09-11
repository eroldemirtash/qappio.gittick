import { supabase } from './supabase';

export interface Level {
  id: string;
  name: string;
  description: string;
  min_points: number;
  max_points: number | null;
  badge_letter: string;
  color: string;
  user_count: number;
}

export const getLevelColor = (levelName: string): string => {
  // Default colors for fallback
  const defaultColors: { [key: string]: string } = {
    'Snapper': '#fbbf24', // Yellow
    'Seeker': '#10b981', // Green
    'Crafter': '#8b5cf6', // Purple
    'Viralist': '#f59e0b', // Orange
    'Qappian': '#06b6d4', // Cyan
  };
  
  return defaultColors[levelName] || '#6b7280'; // Default gray
};

export const fetchLevels = async (): Promise<Level[]> => {
  try {
    const { data, error } = await supabase
      .from('levels')
      .select('*')
      .order('min_points', { ascending: true });

    if (error) {
      console.error('Error fetching levels:', error);
      return getDefaultLevels();
    }

    return data || getDefaultLevels();
  } catch (error) {
    console.error('Error fetching levels:', error);
    return getDefaultLevels();
  }
};

export const getDefaultLevels = (): Level[] => [
  {
    id: '1',
    name: 'Snapper',
    description: 'Yeni başlayan kullanıcılar için temel seviye',
    min_points: 0,
    max_points: 99,
    badge_letter: 'S',
    color: '#fbbf24',
    user_count: 0
  },
  {
    id: '2',
    name: 'Seeker',
    description: 'Aktif kullanıcılar için orta seviye',
    min_points: 100,
    max_points: 499,
    badge_letter: 'E',
    color: '#10b981',
    user_count: 0
  },
  {
    id: '3',
    name: 'Crafter',
    description: 'Deneyimli kullanıcılar için ileri seviye',
    min_points: 500,
    max_points: 1499,
    badge_letter: 'C',
    color: '#8b5cf6',
    user_count: 0
  },
  {
    id: '4',
    name: 'Viralist',
    description: 'Sosyal medya uzmanları için üst seviye',
    min_points: 1500,
    max_points: 4999,
    badge_letter: 'V',
    color: '#f59e0b',
    user_count: 0
  },
  {
    id: '5',
    name: 'Qappian',
    description: 'En üst seviye kullanıcılar için elit seviye',
    min_points: 5000,
    max_points: null,
    badge_letter: 'Q',
    color: '#06b6d4',
    user_count: 0
  }
];

export const getLevelByPoints = (points: number, levels: Level[]): Level | null => {
  return levels.find(level => 
    points >= level.min_points && 
    (level.max_points === null || points <= level.max_points)
  ) || null;
};

export const getLevelColorFromLevels = (levelName: string, levels: Level[]): string => {
  const level = levels.find(l => l.name === levelName);
  return level?.color || getLevelColor(levelName);
};
