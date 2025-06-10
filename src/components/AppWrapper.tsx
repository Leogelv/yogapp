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
        // Сначала пробуем новый API
        let fullscreenSuccess = false;
        let viewportSuccess = false;

        // Попытка использовать новый API для viewport
        try {
          if (mountViewport?.isAvailable()) {
            await mountViewport();
            viewportSuccess = true;
            console.log('Новый viewport API инициализирован');
            
            // Привязываем CSS переменные viewport
            if (bindViewportCssVars?.isAvailable()) {
              bindViewportCssVars();
            }
          }
        } catch (e) {
          console.log('Новый viewport API недоступен:', e);
        }

        // Попытка использовать новый API для fullscreen
        try {
          if (requestFullscreen?.isAvailable()) {
            await requestFullscreen();
            fullscreenSuccess = true;
            console.log('Новый fullscreen API работает');
          }
        } catch (e) {
          console.log('Новый fullscreen API недоступен:', e);
        }

        // Fallback к старому API если новый не работает
        if (!fullscreenSuccess) {
          try {
            postEvent('web_app_request_fullscreen');
            console.log('Использую старый fullscreen API');
          } catch (e) {
            console.error('Старый fullscreen API тоже не работает:', e);
          }
        }

        // Отключаем вертикальные свайпы для закрытия приложения 
        postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
        
        // Получаем safe area инсеты через новый API если доступно
        if (viewportSuccess && viewport && viewportSafeAreaInsets) {
          try {
            const safeArea = viewportSafeAreaInsets();
            if (safeArea) {
              applySafeAreaToCSS(safeArea);
              console.log('Safe area получена через новый API');
            }
          } catch (e) {
            console.log('Новый safe area API недоступен, используем старый');
            // Fallback к старому методу
            postEvent('web_app_request_safe_area');
          }
        } else {
          // Используем старый метод
          postEvent('web_app_request_safe_area');
          console.log('Использую старый safe area API');
        }

      } catch (error) {
        console.error('Ошибка инициализации viewport:', error);
        
        // Полный fallback к старым методам
        try {
          postEvent('web_app_request_fullscreen');
          postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
          postEvent('web_app_request_safe_area');
          console.log('Используем все старые методы API');
        } catch (e) {
          console.error('Все методы API недоступны:', e);
        }
      }
    };

    initializeViewport();
    
    // Подписываемся на события используя window.addEventListener
    const handleEvents = (event: MessageEvent) => {
      try {
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
          
        if (data.eventType === 'safe_area_changed' && data.eventData) {
          // Убираем логи safe area, они очень часто повторяются
          applySafeAreaToCSS(data.eventData);
        } else if (data.eventType === 'viewport_changed') {
          // Обновляем состояние fullscreen, но убираем логи
        }
      } catch (error) {
        // Игнорируем ошибки парсинга
      }
    };
    
    window.addEventListener('message', handleEvents);
    
    // Снижаем частоту запросов для уменьшения логов
    const intervalId = setInterval(() => {
      try {
        // Сначала пробуем новый API
        if (viewport && viewportSafeAreaInsets) {
          try {
            const safeArea = viewportSafeAreaInsets();
            if (safeArea) {
              applySafeAreaToCSS(safeArea);
              return; // Если новый API работает, не используем старый
            }
          } catch (e) {
            // Новый API не работает, используем старый
          }
        }
        
        // Fallback к старому API
        postEvent('web_app_request_safe_area');
        postEvent('web_app_request_viewport');
      } catch (e) {
        // Игнорируем ошибки
      }
    }, 15000); // Увеличиваем до 15 секунд
    
    // Устанавливаем дополнительный отступ для fullscreen
    document.documentElement.style.setProperty('--fullscreen-padding', '16px');
    
    return () => {
      window.removeEventListener('message', handleEvents);
      clearInterval(intervalId);
             try {
         // Пробуем новый API выхода из fullscreen
         if (viewport?.exitFullscreen?.isAvailable()) {
           viewport.exitFullscreen();
         } else {
           postEvent('web_app_exit_fullscreen');
         }
       } catch (e) {
        // Fallback к старому методу
        try {
          postEvent('web_app_exit_fullscreen');
        } catch (fallbackError) {
          // Игнорируем ошибки при выходе
        }
      }
    };
  }, []);
  
  // Применяем Safe Area значения к CSS переменным
  const applySafeAreaToCSS = (safeArea: SafeAreaData) => {
    const { top, right, bottom, left } = safeArea;
    
    // Убираем лишний лог про применение значений
    
    // Проверяем, что все значения числовые и не undefined
    const topValue = typeof top === 'number' ? `${top}px` : '0px';
    const rightValue = typeof right === 'number' ? `${right}px` : '0px';
    const bottomValue = typeof bottom === 'number' ? `${bottom}px` : '0px';
    const leftValue = typeof left === 'number' ? `${left}px` : '0px';
    
    document.documentElement.style.setProperty('--safe-area-top', topValue);
    document.documentElement.style.setProperty('--safe-area-right', rightValue);
    document.documentElement.style.setProperty('--safe-area-bottom', bottomValue);
    document.documentElement.style.setProperty('--safe-area-left', leftValue);
    
    // Убираем лишний лог про установку CSS-переменных
  };
  
  // Теперь мы не применяем стили отступов здесь, это делает компонент Page
  return <>{children}</>;
}; 
