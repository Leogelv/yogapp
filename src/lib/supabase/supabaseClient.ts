import { createClient } from '@supabase/supabase-js';

// Эти переменные должны быть установлены в вашем .env.local файле
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_URL");
}
if (!supabaseAnonKey) {
  throw new Error("Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Создаем и экспортируем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Опционально: Типизация для таблицы users, если понадобится в других местах
// Можно расширить на основе структуры из Supabase
export interface DbUser {
  id: string; // uuid, primary key, references auth.users
  telegram_id: number; // bigint, unique
  first_name?: string | null;
  last_name?: string | null;
  username?: string | null;
  photo_url?: string | null;
  // auth_date: number; // bigint - был в твоем примере, но в схеме его нет в public.users, а в auth.users.user_metadata. Это поле из initData Telegram
  // hash: string; // text - был в твоем примере, это поле из initData Telegram
  created_at?: string; // timestamptz, default now()
  updated_at?: string; // timestamptz, default now()
  last_login?: string; // timestamptz, default now()
} 