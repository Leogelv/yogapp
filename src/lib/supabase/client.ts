import { createClient } from '@supabase/supabase-js';

// Получаем URL и ключ из переменных окружения
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 
                    import.meta.env.NEXT_PUBLIC_SUPABASE_URL || 
                    'https://moxwendgxxvhbesajomc.supabase.co';

const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 
                        import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 
                        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1veHdlbmRneHh2aGJlc2Fqb21jIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MTYyOTAzMzQsImV4cCI6MjAzMTg2NjMzNH0.G2PVKK9QXYCZJXGfpQXL_JytGWtQGyzNFORPWX7PMnw'; // Временный ключ для тестирования

// Добавим защиту от ошибок
let supabaseClient: any;

try {
  console.log('Инициализация Supabase с URL:', supabaseUrl);
  
  if (!supabaseAnonKey) {
    console.warn('Supabase Anon Key не найден. Используется тестовый ключ.');
  }

  // Создаем клиент Supabase
  supabaseClient = createClient(supabaseUrl, supabaseAnonKey);
} catch (error) {
  console.error('Ошибка при инициализации Supabase:', error);
  // Создаем заглушку клиента, чтобы приложение не падало
  supabaseClient = {
    auth: {
      onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
      signUp: () => Promise.resolve({ data: null, error: new Error('Supabase не инициализирован') }),
      signInWithPassword: () => Promise.resolve({ data: null, error: new Error('Supabase не инициализирован') }),
      signInWithOtp: () => Promise.resolve({ data: null, error: new Error('Supabase не инициализирован') }),
      signOut: () => Promise.resolve()
    },
    from: () => ({
      select: () => ({
        eq: () => ({
          maybeSingle: () => Promise.resolve({ data: null, error: null })
        }),
        single: () => Promise.resolve({ data: null, error: null })
      }),
      update: () => ({
        eq: () => Promise.resolve({ data: null, error: null })
      }),
      insert: () => Promise.resolve({ data: null, error: null })
    })
  };
}

// Экспортируем клиент
export const supabase = supabaseClient;

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
  try {
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
  } catch (error) {
    console.error('Необработанная ошибка при проверке пользователя:', error);
    return false;
  }
}

// Получает данные пользователя из Supabase
export async function getUser(telegramId: number): Promise<DBUser | null> {
  try {
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
  } catch (error) {
    console.error('Необработанная ошибка при получении пользователя:', error);
    return null;
  }
}

// Обновляет время последнего входа пользователя
export async function updateUserLastLogin(telegramId: number): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('telegram_id', telegramId);
  
    if (error) {
      console.error('Ошибка при обновлении времени входа:', error);
      return false;
    }
  
    return true;
  } catch (error) {
    console.error('Необработанная ошибка при обновлении времени входа:', error);
    return false;
  }
} 