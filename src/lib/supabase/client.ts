import { createClient } from '@supabase/supabase-js';

// Получаем URL и ключ из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://moxwendgxxvhbesajomc.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        ''; // Анонимный ключ должен быть установлен в .env.local

if (!supabaseAnonKey) {
  console.warn('Supabase Anon Key не найден. Проверьте переменные окружения.');
}

// Создаем и экспортируем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Типы для пользователя из Telegram
export interface TelegramUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
  language_code?: string;
  is_premium?: boolean;
  allows_write_to_pm?: boolean;
}

// Типы для пользователя в БД
export interface DBUser {
  id: string;
  telegram_id: number;
  username?: string;
  first_name: string;
  last_name?: string;
  photo_url?: string;
  created_at: string;
  updated_at: string;
  last_login: string;
  language_code?: string;
  is_premium?: boolean;
}

// Проверяет, существует ли пользователь в Supabase
export async function checkUserExists(telegramId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('users')
    .select('id')
    .eq('telegram_id', telegramId)
    .maybeSingle();
  
  if (error) {
    console.error('Ошибка при проверке пользователя:', error);
    return false;
  }
  
  return !!data;
}

// Получает данные пользователя из Supabase
export async function getUser(telegramId: number): Promise<DBUser | null> {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('telegram_id', telegramId)
    .maybeSingle();

  if (error) {
    console.error('Ошибка при получении пользователя:', error);
    return null;
  }

  return data;
}

// Обновляет время последнего входа пользователя
export async function updateUserLastLogin(telegramId: number): Promise<boolean> {
  const { error } = await supabase
    .from('users')
    .update({ last_login: new Date().toISOString() })
    .eq('telegram_id', telegramId);

  if (error) {
    console.error('Ошибка при обновлении времени входа:', error);
    return false;
  }

  return true;
} 