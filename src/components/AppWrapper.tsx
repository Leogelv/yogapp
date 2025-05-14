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
  // Отслеживаем полноэкранный режим
  useEffect(() => {
    // Запрашиваем информацию о безопасной зоне контента
    postEvent('web_app_request_content_safe_area');
    postEvent('web_app_request_safe_area');
    
    // Отключаем вертикальные свайпы для закрытия приложения 
    postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
    
    // Подписываемся на событие изменения полноэкранного режима
    const handleViewportChange = (event: MessageEvent) => {
      try {
        const { eventType, eventData } = JSON.parse(event.data);
        if (eventType === 'content_safe_area_changed' && eventData) {
          applySafeAreaToCSS(eventData as SafeAreaData);
        }
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    };
    
    window.addEventListener('message', handleViewportChange);
    
    // Очистка подписок при размонтировании
    return () => {
      window.removeEventListener('message', handleViewportChange);
    };
  }, []);
  
  // Применяет safe area к CSS переменным
  const applySafeAreaToCSS = (safeArea: SafeAreaData) => {
    const { top, right, bottom, left } = safeArea;
    
    document.documentElement.style.setProperty('--safe-area-top', `${top}px`);
    document.documentElement.style.setProperty('--safe-area-right', `${right}px`);
    document.documentElement.style.setProperty('--safe-area-bottom', `${bottom}px`);
    document.documentElement.style.setProperty('--safe-area-left', `${left}px`);
  };
  
  // Стили для root элемента с учетом safe area
  const safeAreaStyle = {
    paddingTop: 'var(--safe-area-top, 0px)',
    paddingRight: 'var(--safe-area-right, 0px)',
    paddingBottom: 'var(--safe-area-bottom, 0px)',
    paddingLeft: 'var(--safe-area-left, 0px)',
    minHeight: '100vh',
    maxWidth: '100vw',
    boxSizing: 'border-box' as const
  };
  
  return (
    <div className="app-wrapper" style={safeAreaStyle}>
      {children}
    </div>
  );
}; 