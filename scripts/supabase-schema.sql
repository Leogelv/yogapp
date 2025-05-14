-- Создание таблицы пользователей
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users,
  telegram_id BIGINT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT,
  username TEXT,
  photo_url TEXT,
  language_code TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  last_login TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Создаем RLS политики для таблицы пользователей
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Пользователи могут просматривать свои данные
CREATE POLICY "Пользователи могут просматривать свои данные"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Пользователи могут обновлять свои данные
CREATE POLICY "Пользователи могут обновлять свои данные"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Разрешаем вставку новых пользователей (для процесса регистрации)
CREATE POLICY "Разрешена вставка новых пользователей"
  ON public.users
  FOR INSERT
  WITH CHECK (true);

-- Создаем триггер для обновления поля updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Примечание: Этот SQL-скрипт нужно выполнить в SQL-редакторе Supabase
-- для настройки базы данных. 