import { FC, useEffect, ReactNode } from 'react';
import { 
  postEvent, 
  viewport,
  viewportSafeAreaInsets,
  requestFullscreen,
  mountViewport,
  bindViewportCssVars
} from '@telegram-apps/sdk-react';

interface AppWrapperProps {
  children: ReactNode;
}

interface SafeAreaData {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const AppWrapper: FC<AppWrapperProps> = ({ children }) => {
  useEffect(() => {
    const initializeViewport = async () => {
      try {
        // Инициализируем viewport если доступно
        if (mountViewport.isAvailable()) {
          await mountViewport();
          
          // Привязываем CSS переменные viewport
          if (bindViewportCssVars.isAvailable()) {
            bindViewportCssVars();
          }
        }

        // Автоматически включаем полноэкранный режим на всех страницах
        if (requestFullscreen.isAvailable()) {
          await requestFullscreen();
        } else {
          // Fallback для старых версий
          try {
            postEvent('web_app_request_fullscreen');
          } catch (e) {
            console.error('Fullscreen request failed:', e);
          }
        }

        // Отключаем вертикальные свайпы для закрытия приложения 
        postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
        
        // Используем новый способ получения safe area
        if (viewport && viewport.mount.isAvailable()) {
          // Получаем safe area инсеты через новый API
          try {
            const safeArea = viewportSafeAreaInsets();
            if (safeArea) {
              applySafeAreaToCSS(safeArea);
            }
          } catch (e) {
            console.log('Safe area не доступна в текущей версии');
          }
        }

      } catch (error) {
        console.error('Ошибка инициализации viewport:', error);
        
        // Fallback к старым методам для совместимости
        try {
          postEvent('web_app_request_fullscreen');
          postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
        } catch (e) {
          console.error('Fallback methods failed:', e);
        }
      }
    };

    initializeViewport();
    
    // Подписываемся на события используя window.addEventListener
    const handleEvents = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        
        const data = typeof event.data === 'string' 
          ? (event.data ? JSON.parse(event.data) : {}) 
          : event.data;
          
        if (data.eventType === 'safe_area_changed' && data.eventData) {
          applySafeAreaToCSS(data.eventData);
        } else if (data.eventType === 'viewport_changed') {
          // Обновляем состояние fullscreen, но убираем логи
          if (data.eventData && data.eventData.is_expanded) {
            document.documentElement.style.setProperty('--fullscreen-extra-padding', '40px');
          } else {
            document.documentElement.style.setProperty('--fullscreen-extra-padding', '0px');
          }
        }
      } catch (e) {
        console.error('Error parsing event data:', e);
      }
    };
    
    window.addEventListener('message', handleEvents);
    
    // Снижаем частоту запросов для уменьшения логов
    const intervalId = setInterval(() => {
      try {
        // Используем новый API если доступен
        if (viewport && viewport.mount.isAvailable()) {
          const safeArea = viewportSafeAreaInsets();
          if (safeArea) {
            applySafeAreaToCSS(safeArea);
          }
        } else {
          // Fallback для старых версий (но только если поддерживается)
          try {
            postEvent('web_app_request_viewport');
          } catch (e) {
            // Игнорируем ошибки для неподдерживаемых методов
          }
        }
      } catch (e) {
        // Игнорируем ошибки
      }
    }, 15000); // Увеличиваем до 15 секунд
    
    // Устанавливаем дополнительный отступ для fullscreen
    document.documentElement.style.setProperty('--fullscreen-extra-padding', '40px');
    
    // Очистка подписок при размонтировании
    return () => {
      window.removeEventListener('message', handleEvents);
      clearInterval(intervalId);
      try {
        postEvent('web_app_exit_fullscreen');
      } catch (e) {
        // Игнорируем ошибки при выходе
      }
    };
  }, []);
  
  // Применяет safe area к CSS переменным
  const applySafeAreaToCSS = (safeArea: SafeAreaData) => {
    const { top, right, bottom, left } = safeArea;
    
    // Проверяем, что все значения числовые и не undefined
    const topValue = typeof top === 'number' ? `${top}px` : '0px';
    const rightValue = typeof right === 'number' ? `${right}px` : '0px';
    const bottomValue = typeof bottom === 'number' ? `${bottom}px` : '0px';
    const leftValue = typeof left === 'number' ? `${left}px` : '0px';
    
    document.documentElement.style.setProperty('--safe-area-top', topValue);
    document.documentElement.style.setProperty('--safe-area-right', rightValue);
    document.documentElement.style.setProperty('--safe-area-bottom', bottomValue);
    document.documentElement.style.setProperty('--safe-area-left', leftValue);
  };
  
  return <>{children}</>;
}; 