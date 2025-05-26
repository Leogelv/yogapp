// Типы данных для админ-панели

// Основные типы для вкладок админ-панели
export type AdminTab = 'practices' | 'categories' | 'quiz' | 'users' | 'events';

// Типы для практик
export interface Practice {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  duration?: number;
  thumbnail_url?: string;
  audio_file_path?: string;
  kinescope_id?: string;
  content_type_id?: string;
  category_id?: string;
  display_order?: number;
  difficulty_level?: string;
  is_premium?: boolean;
  is_featured?: boolean;
  created_at?: string;
  updated_at?: string;
  // Связанные данные
  content_types?: {
    id: string;
    name: string;
    slug: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Типы для категорий
export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  display_order?: number;
  created_at?: string;
  updated_at?: string;
}

// Типы для типов контента
export interface ContentType {
  id: string;
  name: string;
  slug: string;
}

// Типы для пользователей
export interface User {
  id: string;
  telegram_id: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_admin: boolean;
  created_at: string;
  last_login?: string;
  updated_at?: string;
}

// Типы для событий
export interface EventItem {
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
    id: string;
    name: string;
    slug: string;
  };
  categories?: {
    id: string;
    name: string;
    slug: string;
  };
}

// Типы для квиза
export interface QuizStep {
  id: string;
  title: string;
  type: string;
  order: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface QuizAnswer {
  id: string;
  question_id: string;
  label: string;
  value: string;
  order: number;
  created_at?: string;
  updated_at?: string;
}

// Типы для состояния редактирования
export interface EditingCell {
  id: string;
  field: string;
}

// Пропсы для менеджеров
export interface PracticesManagerProps {
  setPreviewPractice: (practice: Practice | null) => void;
  setEditPractice: (practice: Practice | null) => void;
  categories: Category[];
}

export interface EditPracticeModalProps {
  practice: Practice;
  categories: Category[];
  contentTypes: ContentType[];
  onClose: () => void;
  onSave: (form: Practice) => void;
  saving: boolean;
  error: string | null;
}