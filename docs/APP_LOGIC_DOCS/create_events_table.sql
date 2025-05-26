-- Создание таблицы events для календаря
-- Таблица содержит события с аналогичными полями как contents, но для календарного расписания

CREATE TABLE IF NOT EXISTS public.events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL, -- название события
  subtitle TEXT, -- подзаголовок события
  description TEXT, -- описание события
  duration INTEGER NOT NULL, -- длительность в секундах
  thumbnail_url TEXT, -- URL обложки события
  background_image_url TEXT, -- URL фонового изображения
  content_type_id UUID REFERENCES public.content_types(id), -- тип контента (video, audio, timer)
  category_id UUID REFERENCES public.categories(id), -- категория
  difficulty_level TEXT, -- уровень сложности
  kinescope_id TEXT, -- ID видео в Kinescope для событий
  audio_file_path TEXT, -- путь к аудиофайлу для событий
  is_premium BOOLEAN DEFAULT false, -- премиум событие
  is_featured BOOLEAN DEFAULT false, -- рекомендуемое событие
  display_order INTEGER, -- порядок отображения в списке
  metadata JSONB, -- дополнительные метаданные
  
  -- Поля специфичные для событий
  event_date DATE NOT NULL, -- дата события
  start_time TIME NOT NULL, -- время начала события
  end_time TIME, -- время окончания события (опционально)
  is_recurring BOOLEAN DEFAULT false, -- повторяющееся событие
  recurring_pattern JSONB, -- паттерн повторения события (дни недели, интервал и т.д.)
  event_status TEXT DEFAULT 'active', -- статус события (active, cancelled, completed)
  max_participants INTEGER, -- максимальное количество участников (для живых эфиров)
  instructor_name TEXT, -- имя инструктора
  location TEXT, -- место проведения или ссылка
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Создаем индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS events_event_date_idx ON public.events (event_date);
CREATE INDEX IF NOT EXISTS events_start_time_idx ON public.events (start_time);
CREATE INDEX IF NOT EXISTS events_content_type_id_idx ON public.events (content_type_id);
CREATE INDEX IF NOT EXISTS events_category_id_idx ON public.events (category_id);
CREATE INDEX IF NOT EXISTS events_status_idx ON public.events (event_status);
CREATE INDEX IF NOT EXISTS events_recurring_idx ON public.events (is_recurring);

-- Триггер для автоматического обновления поля updated_at
CREATE TRIGGER update_events_updated_at
BEFORE UPDATE ON public.events
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Настройка RLS (Row Level Security)
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Политика для чтения всех активных событий (события видны всем пользователям)
CREATE POLICY events_select_all ON public.events 
FOR SELECT USING (event_status = 'active');

-- Политика для админов - полный доступ к управлению событиями
-- (предполагается наличие роли admin или специального поля в таблице users)
-- CREATE POLICY events_admin_all ON public.events 
-- FOR ALL USING (auth.jwt() ->> 'role' = 'admin');

-- Комментарии к таблице
COMMENT ON TABLE public.events IS 'События календаря с возможностью воспроизведения через плеер';
COMMENT ON COLUMN public.events.event_date IS 'Дата проведения события';
COMMENT ON COLUMN public.events.start_time IS 'Время начала события';
COMMENT ON COLUMN public.events.is_recurring IS 'Флаг повторяющегося события';
COMMENT ON COLUMN public.events.recurring_pattern IS 'JSON с настройками повторения (дни недели, интервал)';
COMMENT ON COLUMN public.events.event_status IS 'Статус события: active, cancelled, completed';
COMMENT ON COLUMN public.events.max_participants IS 'Максимальное количество участников для живых эфиров';