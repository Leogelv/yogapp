import { createClient } from '@supabase/supabase-js';

// Получаем URL и ANON KEY из переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Проверяем, что переменные окружения установлены
if (!supabaseUrl) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Создаем и экспортируем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey); 