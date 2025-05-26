// Типы для событий календаря

export interface Event {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  duration: number;
  thumbnail_url?: string;
  background_image_url?: string;
  content_type_id?: string;
  category_id?: string;
  difficulty_level?: string;
  kinescope_id?: string;
  audio_file_path?: string;
  is_premium: boolean;
  is_featured: boolean;
  display_order?: number;
  metadata?: any;
  
  // Поля специфичные для событий
  event_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM:SS
  end_time?: string; // HH:MM:SS
  is_recurring: boolean;
  recurring_pattern?: any;
  event_status: 'active' | 'cancelled' | 'completed';
  max_participants?: number;
  instructor_name?: string;
  location?: string;
  
  created_at: string;
  updated_at: string;
  
  // Связанные данные
  content_types?: {
    name: string;
    slug: string;
  };
  categories?: {
    name: string;
    slug: string;
  };
}

export interface EventFormData {
  title: string;
  subtitle?: string;
  description?: string;
  duration: number;
  thumbnail_url?: string;
  background_image_url?: string;
  content_type_id?: string;
  category_id?: string;
  difficulty_level?: string;
  kinescope_id?: string;
  audio_file_path?: string;
  is_premium: boolean;
  is_featured: boolean;
  display_order?: number;
  metadata?: any;
  
  event_date: string;
  start_time: string;
  end_time?: string;
  is_recurring: boolean;
  recurring_pattern?: any;
  event_status: 'active' | 'cancelled' | 'completed';
  max_participants?: number;
  instructor_name?: string;
  location?: string;
}