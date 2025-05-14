import { FC, useEffect, ReactNode } from 'react';
import { postEvent } from '@telegram-apps/sdk-react';

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
    // Автоматически включаем полноэкранный режим на всех страницах
    postEvent('web_app_request_fullscreen');
    
    // Отключаем вертикальные свайпы для закрытия приложения 
    postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
    
    // Запрашиваем информацию о safe area
    postEvent('web_app_request_safe_area');
    
    // Подписываемся на события используя window.addEventListener
    const handleEvents = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
          
        if (data.eventType === 'safe_area_changed' && data.eventData) {
          console.log('Safe area changed:', data.eventData);
          applySafeAreaToCSS(data.eventData);
        } else if (data.eventType === 'viewport_changed') {
          // Обновляем состояние fullscreen
          if (data.eventData && data.eventData.is_expanded) {
            console.log('Fullscreen mode: active');
            document.documentElement.style.setProperty('--fullscreen-extra-padding', '40px');
          } else {
            console.log('Fullscreen mode: inactive');
            document.documentElement.style.setProperty('--fullscreen-extra-padding', '0px');
          }
        }
      } catch (e) {
        console.error('Error parsing event data:', e);
      }
    };
    
    window.addEventListener('message', handleEvents);
    
    // Для отладки повторяем запрос каждые несколько секунд
    const intervalId = setInterval(() => {
      postEvent('web_app_request_safe_area');
      postEvent('web_app_request_viewport');
    }, 5000);
    
    // Устанавливаем дополнительный отступ для fullscreen
    document.documentElement.style.setProperty('--fullscreen-extra-padding', '40px');
    
    // Очистка подписок при размонтировании
    return () => {
      window.removeEventListener('message', handleEvents);
      clearInterval(intervalId);
      postEvent('web_app_exit_fullscreen');
    };
  }, []);
  
  // Применяет safe area к CSS переменным
  const applySafeAreaToCSS = (safeArea: SafeAreaData) => {
    const { top, right, bottom, left } = safeArea;
    
    console.log('Applying safe area values:', { top, right, bottom, left });
    
    // Проверяем, что все значения числовые и не undefined
    const topValue = typeof top === 'number' ? `${top}px` : '0px';
    const rightValue = typeof right === 'number' ? `${right}px` : '0px';
    const bottomValue = typeof bottom === 'number' ? `${bottom}px` : '0px';
    const leftValue = typeof left === 'number' ? `${left}px` : '0px';
    
    document.documentElement.style.setProperty('--safe-area-top', topValue);
    document.documentElement.style.setProperty('--safe-area-right', rightValue);
    document.documentElement.style.setProperty('--safe-area-bottom', bottomValue);
    document.documentElement.style.setProperty('--safe-area-left', leftValue);
    
    // Для отладки добавляем вывод после установки
    console.log('Safe area CSS variables set:', {
      top: document.documentElement.style.getPropertyValue('--safe-area-top'),
      right: document.documentElement.style.getPropertyValue('--safe-area-right'),
      bottom: document.documentElement.style.getPropertyValue('--safe-area-bottom'),
      left: document.documentElement.style.getPropertyValue('--safe-area-left')
    });
  };
  
  // Теперь мы не применяем стили отступов здесь, это делает компонент Page
  return <>{children}</>;
}; 