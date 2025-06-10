/**
* Утилиты для работы с Telegram Mini App
*/

/**
* Проверяет, запущено ли приложение в реальном Telegram окружении
* @returns true если в реальном Telegram, false если в мокированном окружении
*/
export function isRealTelegramEnvironment(): boolean {
    try {
      // В реальном Telegram всегда есть объект window.Telegram
      const telegram = (window as any)?.Telegram?.WebApp;
      if (typeof window !== 'undefined' && telegram) {
        // Проверяем дополнительные признаки реального Telegram
        return !!(
          (
            telegram.version &&
            telegram.platform &&
            telegram.colorScheme &&
            telegram.initData
          ) // В реальном Telegram всегда есть initData
        );
      }
      return false;
    } catch (error) {
      console.warn('Error checking Telegram environment:', error);
      return false;
    }
   }
   
