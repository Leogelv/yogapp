/**
 * Утилиты для отладки Supabase соединения
 */
import { supabase } from '../client';
import { logger } from '@/lib/logger';

/**
 * Проверяет соединение с Supabase и выводит информацию
 */
export const checkSupabaseConnection = async (): Promise<{
  connected: boolean;
  error?: string;
  details?: any;
}> => {
  try {
    logger.info('Checking Supabase connection');
    
    // Проверяем конфигурацию клиента
    const clientConfig = {
      hasClient: !!supabase,
      authEnabled: !!supabase.auth,
      realtimeEnabled: !!supabase.realtime,
      signUp: !!supabase.auth?.signUp
    };
    
    logger.debug('Supabase client config', clientConfig);
    
    // Проверяем соединение с базой данных
    const { data, error } = await supabase.from('users').select('count(*)', { count: 'exact' }).limit(0);
    
    if (error) {
      throw error;
    }
    
    // Проверяем realtime
    let realtimeStatus = 'unknown';
    try {
      const channel = supabase.channel('connection-check');
      const subscription = channel.subscribe((status) => {
        realtimeStatus = status;
        logger.debug(`Realtime status: ${status}`);
        
        // Очистка после проверки
        setTimeout(() => {
          channel.unsubscribe();
        }, 1000);
      });
      
      // Даем время на соединение
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (realtimeError) {
      logger.warn('Realtime connection check failed', realtimeError);
      realtimeStatus = 'failed';
    }
    
    return {
      connected: true,
      details: {
        clientConfig,
        dbCheck: { success: true, data },
        realtimeStatus
      }
    };
  } catch (err) {
    logger.error('Supabase connection check failed', err);
    return {
      connected: false,
      error: err instanceof Error ? err.message : 'Unknown error',
      details: { error: err }
    };
  }
};

/**
 * Проверяет публичные эндпоинты API сервера
 */
export const checkServerEndpoints = async (): Promise<{
  success: boolean;
  results: Record<string, any>;
}> => {
  const endpoints = [
    '/api/server-info',
    '/api/server-info-edge'
  ];
  
  const results: Record<string, any> = {};
  
  for (const endpoint of endpoints) {
    try {
      logger.info(`Checking endpoint: ${endpoint}`);
      const response = await fetch(endpoint);
      
      results[endpoint] = {
        status: response.status,
        ok: response.ok,
        data: response.ok ? await response.json() : null
      };
    } catch (err) {
      logger.warn(`Failed to check endpoint: ${endpoint}`, err);
      results[endpoint] = {
        error: err instanceof Error ? err.message : 'Unknown error'
      };
    }
  }
  
  // Проверяем доступность логирования
  try {
    logger.info('Testing log endpoint');
    await logger.info('Test log message');
    results['logging'] = { tested: true };
  } catch (err) {
    results['logging'] = { 
      tested: true, 
      error: err instanceof Error ? err.message : 'Unknown error' 
    };
  }
  
  return {
    success: Object.values(results).some(r => r.ok || r.tested),
    results
  };
}; 