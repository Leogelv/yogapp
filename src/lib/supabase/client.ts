import { createClient, RealtimeChannel } from '@supabase/supabase-js';
import { logger } from '../logger';

// Получаем URL и ANON KEY из переменных окружения
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Проверяем, что переменные окружения установлены
if (!supabaseUrl) {
  logger.error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_URL');
}
if (!supabaseAnonKey) {
  logger.error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
  throw new Error('Missing env.NEXT_PUBLIC_SUPABASE_ANON_KEY');
}

// Создаем и экспортируем клиент Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  realtime: {
    // Включаем логирование для отладки realtime
    debug: process.env.NODE_ENV === 'development',
  },
  auth: {
    // Сохраняем сессию в localStorage
    persistSession: true,
    autoRefreshToken: true,
  },
  global: {
    // Устанавливаем обработчики для fetch
    fetch: customFetch,
  },
});

// Настраиваем каналы для Realtime
export const usersChannel = supabase.channel('public:users');

// Вспомогательная функция для fetch с логированием
async function customFetch(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  try {
    const start = Date.now();
    const response = await fetch(input, init);
    const duration = Date.now() - start;

    // Логируем информацию о запросе
    const url = typeof input === 'string' ? input : input.url;
    const method = init?.method || 'GET';
    const status = response.status;
    
    if (status >= 400) {
      // Логируем ошибки
      let errorBody;
      try {
        errorBody = await response.clone().text();
      } catch (e) {
        errorBody = 'Unable to read response body';
      }
      
      logger.error(`Supabase API Error`, {
        url,
        method,
        status,
        duration,
        error: errorBody,
      });
    } else {
      // Логируем успешные запросы
      logger.debug(`Supabase API Request`, {
        url,
        method,
        status,
        duration,
      });
    }
    
    return response;
  } catch (error) {
    logger.error(`Supabase API Request Failed`, {
      url: typeof input === 'string' ? input : input.url,
      method: init?.method || 'GET',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Функция для подписки на изменения пользователей в режиме реального времени
export function subscribeToUserChanges(
  telegramId: number,
  callback: (payload: any) => void
): RealtimeChannel {
  logger.info(`Subscribing to user changes for telegram_id: ${telegramId}`);
  
  // Создаем канал для отслеживания изменений в таблице users
  const channel = supabase.channel(`users:${telegramId}`)
    .on(
      'postgres_changes',
      {
        event: '*', // Отслеживаем все события (INSERT, UPDATE, DELETE)
        schema: 'public',
        table: 'users',
        filter: `telegram_id=eq.${telegramId}`,
      },
      (payload) => {
        logger.info(`Received user change event`, { payload });
        callback(payload);
      }
    )
    .subscribe((status) => {
      logger.info(`Subscription status for user ${telegramId}:`, { status });
    });
    
  return channel;
} 