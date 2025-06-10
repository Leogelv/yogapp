import React, { type PropsWithChildren, useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  hideBackButton, 
  onBackButtonClick, 
  showBackButton, 
  postEvent,
  viewport,
  viewportSafeAreaInsets
} from '@telegram-apps/sdk-react';
import { SafeAreaFade } from '@/components/SafeAreaFade/SafeAreaFade';
import TabBar from '@/components/TabBar/TabBar';
import { useNavigationHistory } from '@/lib/hooks/useNavigationHistory';
import './Page.css';

// Стили для учета отступов safe area с дополнительным отступом для fullscreen режима
const safeAreaStyle = {
  paddingTop: 'calc(var(--safe-area-top, 0px) + var(--fullscreen-extra-padding, 0px))',
  paddingRight: 'var(--safe-area-right, 0px)',
  paddingBottom: 'var(--safe-area-bottom, 0px)',
  paddingLeft: 'var(--safe-area-left, 0px)',
  flex: 1,
  display: 'flex',
  flexDirection: 'column' as const,
  width: '100%',
  boxSizing: 'border-box' as const,
  position: 'relative' as const
};

interface PageProps {
  /**
   * True if it is allowed to go back from this page.
   */
  back?: boolean;
  /**
   * True if the page should display the bottom TabBar.
   */
  showTabBar?: boolean;
  /**
   * True if the page should display the SafeAreaFade at the top.
   */
  showSafeAreaFade?: boolean;
  /**
   * Custom back button handler. If not provided, uses navigate(-1).
   */
  onBackClick?: () => void;
  hideTopPadding?: boolean
}

export function Page({ 
  children, 
  back = true,
  showTabBar = true,
  showSafeAreaFade = true,
    hideTopPadding = false,
  onBackClick,
}: PropsWithChildren<PageProps>) {
  const location = useLocation();
  const containerRef = useRef<HTMLDivElement>(null);
  const [isInTelegram, setIsInTelegram] = useState(false);
  const { goBack, canNavigateBack } = useNavigationHistory();

  // Определяем, показывается ли таймер или аудио плеер
  const [isTimerActive, setIsTimerActive] = useState(false);
  
  const isTimerPage = useMemo(() => {
    // Проверяем URL
    if (location.pathname.includes('/practice/') || location.pathname.includes('/timer')) {
      // Дополнительно проверяем наличие timer-player-container или audio-player-container в DOM
      const timerContainer = document.querySelector('.timer-player-container');
      const audioContainer = document.querySelector('.audio-player-container');
      if (timerContainer || audioContainer) {
        return true;
      }
    }
    
    // Проверяем содержимое children на наличие TimerPlayer или AudioPlayer
    const childrenString = React.Children.toArray(children).join('');
    if (childrenString.includes('TimerPlayer') || 
        childrenString.includes('AudioPlayer') ||
        childrenString.includes('timer-player-container') ||
        childrenString.includes('audio-player-container') ||
        childrenString.includes('meditation-timer-container')) {
      return true;
    }
    
    // Проверяем наличие элементов таймера или аудио плеера в DOM
    const hasTimerElements = document.querySelector('.timer-player-container') || 
                            document.querySelector('.audio-player-container') ||
                            document.querySelector('.meditation-timer-container');
    
    return !!hasTimerElements || isTimerActive;
  }, [location.pathname, children, isTimerActive]);

  // Отслеживаем изменения в DOM для определения таймера или аудио плеера
  useEffect(() => {
    const checkForTimer = () => {
      const hasTimer = !!(document.querySelector('.timer-player-container') || 
                         document.querySelector('.audio-player-container') ||
                         document.querySelector('.meditation-timer-container'));
      setIsTimerActive(hasTimer);
    };

    // Проверяем сразу
    checkForTimer();

    // Создаем observer для отслеживания изменений в DOM
    const observer = new MutationObserver(checkForTimer);
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class']
    });

    return () => {
      observer.disconnect();
    };
  }, []);

  // Состояние для fullscreen режима
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Проверяем Telegram окружение и fullscreen режим
  useEffect(() => {
    const checkTelegramEnvironment = () => {
      try {
        // Проверяем разные способы определения Telegram
        let isTelegram = false;
        
        // Способ 1: Проверяем WebApp API
        if ((window as any).Telegram?.WebApp) {
          isTelegram = true;
        }
        
        // Способ 2: Проверяем наличие объекта Telegram
        else if ((window as any).Telegram) {
          isTelegram = true;
        }
        
        // Способ 3: Проверяем User Agent
        else if (navigator.userAgent.includes('Telegram')) {
          isTelegram = true;
        }
        
        // Способ 4: Проверяем URL параметры
        else if (window.location.search.includes('tgWebAppData') || 
                 window.location.hash.includes('tgWebAppData')) {
          isTelegram = true;
        }
        
        setIsInTelegram(isTelegram);
        
        // Если мы в Telegram, настраиваем слушатели для fullscreen
        if (isTelegram && (window as any).Telegram?.WebApp) {
          const webApp = (window as any).Telegram.WebApp;
          
          const checkFullscreen = () => {
            // Проверяем различные признаки fullscreen режима
            // isExpanded - это не fullscreen, а просто развернутое состояние
            // Для fullscreen нужно слушать событие fullscreen_changed
            const viewportHeight = webApp.viewportHeight || window.innerHeight;
            const screenHeight = window.screen.height;
            const isExpanded = webApp.isExpanded || false;
            
            // Считаем что мы в fullscreen если viewport занимает почти весь экран
            const isFS = viewportHeight >= screenHeight * 0.9;
            
            setIsFullscreen(isFS);
            
            // Устанавливаем CSS переменную для дополнительного отступа
            document.documentElement.style.setProperty('--fullscreen-extra-padding', isFS ? '100px' : '0px');
            console.log('Fullscreen check:', {
              isFullscreen: isFS,
              viewportHeight,
              screenHeight,
              isExpanded,
              ratio: viewportHeight / screenHeight
            });
          };

          // Проверяем при загрузке
          checkFullscreen();

          // Слушаем события изменения viewport
          const handleViewportChanged = () => {
            checkFullscreen();
          };

          const handleFullscreenChanged = (event: any) => {
            const isFS = event?.is_fullscreen || false;
            setIsFullscreen(isFS);
            document.documentElement.style.setProperty('--fullscreen-extra-padding', isFS ? '100px' : '0px');
            console.log('Fullscreen changed event:', isFS);
          };

          // Подписываемся на события
          if (webApp.onEvent) {
            webApp.onEvent('viewportChanged', handleViewportChanged);
            webApp.onEvent('fullscreen_changed', handleFullscreenChanged);
          }

          // Также слушаем через postMessage для надежности
          const handleMessage = (event: MessageEvent) => {
            if (event.data && typeof event.data === 'string') {
              try {
                const message = JSON.parse(event.data);
                if (message.eventType === 'viewport_changed') {
                  handleViewportChanged();
                } else if (message.eventType === 'fullscreen_changed') {
                  handleFullscreenChanged(message.eventData);
                }
              } catch (e) {
                // Ignore non-JSON messages
              }
            }
          };

          window.addEventListener('message', handleMessage);

          // Проверяем периодически для надежности
          const interval = setInterval(checkFullscreen, 1000);

          return () => {
            if (webApp.offEvent) {
              webApp.offEvent('viewportChanged', handleViewportChanged);
              webApp.offEvent('fullscreen_changed', handleFullscreenChanged);
            }
            window.removeEventListener('message', handleMessage);
            clearInterval(interval);
          };
        } else {
          // Не в Telegram - устанавливаем дефолтные значения
          document.documentElement.style.setProperty('--fullscreen-extra-padding', '0px');
        }
      } catch (error) {
        console.log('Не удалось определить окружение Telegram:', error);
        setIsInTelegram(false);
        document.documentElement.style.setProperty('--fullscreen-extra-padding', '0px');
      }
    };

    const cleanup = checkTelegramEnvironment();
    return cleanup;
  }, []);

  // Обработчик кнопки "Назад" - используем useCallback для стабильной ссылки
  const handleBackClick = useCallback(() => {
    if (onBackClick) {
      onBackClick();
    } else {
      goBack();
    }
  }, [onBackClick, goBack]);

  // Обработчик клавиши Escape для браузера
  useEffect(() => {
    if (!isInTelegram && back) {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          event.preventDefault();
          handleBackClick();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => {
        document.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isInTelegram, back, handleBackClick]);

  // Настройка кнопки назад в Telegram
  useEffect(() => {
    if (!isInTelegram) {
      return;
    }

    let cleanup: (() => void) | undefined;

    if (back) {
      try {
        // Пробуем использовать нативный Telegram WebApp API
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.BackButton) {
          // Показываем кнопку назад
          tg.BackButton.show();
          
          // Подключаем обработчик
          const backHandler = () => {
            handleBackClick();
          };
          
          tg.BackButton.onClick(backHandler);
          
          cleanup = () => {
            tg.BackButton.offClick(backHandler);
            tg.BackButton.hide();
          };
        } else {
          // Fallback к SDK функциям
          showBackButton();
          cleanup = onBackButtonClick(handleBackClick);
        }
      } catch (error) {
        console.error('❌ Ошибка при настройке кнопки назад в Telegram:', error);
      }
    } else {
      try {
        // Скрываем кнопку назад
        const tg = (window as any).Telegram?.WebApp;
        if (tg && tg.BackButton) {
          tg.BackButton.hide();
        } else {
          hideBackButton();
        }
      } catch (error) {
        console.error('❌ Ошибка при скрытии кнопки назад в Telegram:', error);
      }
    }

    // Cleanup функция
    return () => {
      if (cleanup) {
        try {
          cleanup();
        } catch (error) {
          console.error('❌ Ошибка при очистке обработчика кнопки назад:', error);
        }
      }
    };
  }, [back, isInTelegram, handleBackClick]);

  // Повторно запрашиваем safe area при монтировании страницы
  useEffect(() => {
    if (isInTelegram) {
      try {
        // Используем новый API если доступен
        let newApiSuccess = false;
        
        if (viewport && viewportSafeAreaInsets) {
          try {
            const safeArea = viewportSafeAreaInsets();
            if (safeArea) {
              // Применяем safe area значения через CSS переменные
              document.documentElement.style.setProperty('--safe-area-top', `${safeArea.top}px`);
              document.documentElement.style.setProperty('--safe-area-right', `${safeArea.right}px`);
              document.documentElement.style.setProperty('--safe-area-bottom', `${safeArea.bottom}px`);
              document.documentElement.style.setProperty('--safe-area-left', `${safeArea.left}px`);
              newApiSuccess = true;
              console.log('Page: Новый API viewport успешно применен');
            }
          } catch (e) {
            console.log('Page: Новый API недоступен, пробуем старый');
          }
        }
        
        // Если новый API не сработал, пробуем старый
        if (!newApiSuccess) {
          try {
            postEvent('web_app_request_safe_area');
            console.log('Page: Используем старый API для safe area');
          } catch (e) {
            console.error('Page: Ошибка при запросе safe area:', e);
          }
        }
      } catch (error) {
        console.error('Page: Ошибка при работе с safe area:', error);
      }
    }

    // Устанавливаем фон в зависимости от типа страницы
    const backgroundColor = isTimerPage ? '#000000' : '#ffffff';
    document.body.style.backgroundColor = backgroundColor;
    if (document.getElementById('root')) {
      document.getElementById('root')!.style.backgroundColor = backgroundColor;
    }
  }, [isInTelegram, isTimerPage]);

  // Добавляем отступ снизу, если показываем TabBar
  const containerStyle = {
    ...(!isTimerPage ? safeAreaStyle : {}),
    paddingTop: !hideTopPadding ? 'calc(var(--safe-area-top, 0px) + var(--fullscreen-extra-padding, 0px))' : '',
    paddingBottom: showTabBar && !isTimerPage ? 'calc(70px + env(safe-area-inset-bottom, 0) + 8px)' : 'var(--safe-area-bottom, 0px)',
    ...(isTimerPage ? { background: '#000', padding: 0, margin: 0 } : {})
  };

  // Логируем состояние fullscreen для отладки
  useEffect(() => {
    console.log('Page fullscreen state:', isFullscreen);
  }, [isFullscreen]);

  // Определяем CSS класс для контейнера
  const containerClass = useMemo(() => {
    let baseClass = 'page-container';
    
    // Проверяем наличие таймера
    const hasTimer = document.querySelector('.timer-player-container') || 
                     document.querySelector('.meditation-timer-container');
    
    // Проверяем наличие аудио плеера
    const hasAudio = document.querySelector('.audio-player-container');
    
    if (hasTimer) {
      baseClass += ' timer-fullscreen';
    } else if (hasAudio) {
      baseClass += ' audio-fullscreen';
    } else if (!showTabBar) {
      baseClass += ' no-tabbar';
    }
    
    return baseClass;
  }, [showTabBar, isTimerPage]);

  // Устанавливаем черный фон для страниц с таймером или аудио плеером
  useEffect(() => {
    const hasTimer = document.querySelector('.timer-player-container') || 
                     document.querySelector('.meditation-timer-container');
    const hasAudio = document.querySelector('.audio-player-container');
    
    if (hasTimer || hasAudio) {
      document.body.style.backgroundColor = '#000';
      document.documentElement.style.backgroundColor = '#000';
    } else {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    }
    
    return () => {
      document.body.style.backgroundColor = '';
      document.documentElement.style.backgroundColor = '';
    };
  }, [isTimerPage]);

  return (
    <div 
      className={containerClass + ' max-w-[600px] !mx-auto'}
      style={containerStyle}
      ref={containerRef}
    >
      {/* Кнопка "Назад" для браузера */}
      {!isInTelegram && back && canNavigateBack() && !isTimerPage && (
        <div className="browser-back-button-container">
          <button 
            className="browser-back-button" 
            onClick={handleBackClick}
            aria-label="Назад"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>Назад</span>
          </button>
        </div>
      )}
      
      <div style={{ backgroundColor: isTimerPage ? '#000' : '#ffffff' }}>
        {children}
      </div>
      {showTabBar && !isTimerPage && <TabBar />}
      {showSafeAreaFade && !isTimerPage && <SafeAreaFade />}
    </div>
  );
}