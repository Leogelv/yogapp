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
    // Автоматически включаем полноэкранный режим на всех страницах
    postEvent('web_app_request_fullscreen');
    
    // Запрашиваем ТОЛЬКО информацию о content safe area
    postEvent('web_app_request_content_safe_area');
    
    // Отключаем вертикальные свайпы для закрытия приложения 
    postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });
    
    // Подписываемся на события
    const handleViewportChange = (event: MessageEvent) => {
      try {
        const { eventType, eventData } = JSON.parse(event.data);
        if (eventType === 'content_safe_area_changed' && eventData) {
          applyContentSafeAreaToCSS(eventData as SafeAreaData);
        }
      } catch (e) {
        // Игнорируем ошибки парсинга
      }
    };
    
    window.addEventListener('message', handleViewportChange);
    
    // Очистка подписок и выход из полноэкранного режима при размонтировании
    return () => {
      window.removeEventListener('message', handleViewportChange);
      postEvent('web_app_exit_fullscreen');
    };
  }, []);
  
  // Применяет content safe area к CSS переменным
  const applyContentSafeAreaToCSS = (safeArea: SafeAreaData) => {
    const { top, right, bottom, left } = safeArea;
    
    document.documentElement.style.setProperty('--content-safe-area-top', `${top}px`);
    document.documentElement.style.setProperty('--content-safe-area-right', `${right}px`);
    document.documentElement.style.setProperty('--content-safe-area-bottom', `${bottom}px`);
    document.documentElement.style.setProperty('--content-safe-area-left', `${left}px`);
  };
  
  // Стили для root элемента с учетом content safe area
  const contentSafeAreaStyle = {
    paddingTop: 'var(--content-safe-area-top, 0px)',
    paddingRight: 'var(--content-safe-area-right, 0px)',
    paddingBottom: 'var(--content-safe-area-bottom, 0px)',
    paddingLeft: 'var(--content-safe-area-left, 0px)',
    minHeight: '100vh',
    maxWidth: '100vw',
    boxSizing: 'border-box' as const
  };
  
  return (
    <div className="app-wrapper" style={contentSafeAreaStyle}>
      {children}
    </div>
  );
}; 