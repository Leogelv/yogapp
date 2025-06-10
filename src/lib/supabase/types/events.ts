// Типы для событий календаря
export interface Event {
  id: string;
  title: string;
    difficulty_level?: string
  description?: string;
    event_date?: string;
  event_type: 'practice' | 'broadcast' | 'community' | 'reminder';
  start_time: string; // TIMESTAMPTZ в формате ISO
  end_time?: string; // TIMESTAMPTZ в формате ISO
  content_id?: string;
  user_id?: string;
    is_premium?: boolean;
  thumbnail_url?: string;
  color?: string;
  created_at: string;
    is_featured?: boolean
    is_recurring?: boolean;
    event_status?: string
  updated_at: string;
    instructor_name?: string;
    categories?: {
        name?: string;
    }
 }
 
 export interface EventFormData {
  title: string;
  description?: string;
  event_type: 'practice' | 'broadcast' | 'community' | 'reminder';
  start_time: string;
  end_time?: string;
  content_id?: string;
  user_id?: string;
  thumbnail_url?: string;
  color?: string;
 }