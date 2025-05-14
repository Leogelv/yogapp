import { type FC, useMemo, useState, useEffect } from 'react';
import {
  initDataState as _initDataState,
  useSignal,
  postEvent,
} from '@telegram-apps/sdk-react';
import { 
  List, 
  Placeholder, 
  Button, 
  Section,
  Avatar, 
  Text,
  Cell,
} from '@telegram-apps/telegram-ui';

import { Page } from '@/components/Page.tsx';

// Стили для контейнера списка
const listContainerStyle = {
  width: '100%',
};

export const ProfilePage: FC = () => {
  const initDataState = useSignal(_initDataState);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [safeAreaValues, setSafeAreaValues] = useState({
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  });
  const [fullscreenPadding, setFullscreenPadding] = useState('0px');
  const [showSafeAreaIndicator, setShowSafeAreaIndicator] = useState(false);

  // Пользователь из initData
  const user = useMemo(() => 
    initDataState && initDataState.user ? initDataState.user : undefined,
  [initDataState]);

  // Переключение режима fullscreen
  const toggleFullscreen = () => {
    if (isFullscreen) {
      postEvent('web_app_exit_fullscreen');
      setIsFullscreen(false);
    } else {
      postEvent('web_app_request_fullscreen');
      setIsFullscreen(true);
    }
  };

  // Получаем текущие значения CSS переменных safe area
  useEffect(() => {
    const updateSafeAreaValues = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      setSafeAreaValues({
        top: computedStyle.getPropertyValue('--safe-area-top') || '0px',
        right: computedStyle.getPropertyValue('--safe-area-right') || '0px',
        bottom: computedStyle.getPropertyValue('--safe-area-bottom') || '0px',
        left: computedStyle.getPropertyValue('--safe-area-left') || '0px',
      });
      setFullscreenPadding(computedStyle.getPropertyValue('--fullscreen-extra-padding') || '0px');
    };

    // Запрашиваем информацию о safe area
    postEvent('web_app_request_safe_area');
    postEvent('web_app_request_viewport');
    
    // Обновляем значения при монтировании
    updateSafeAreaValues();
    
    // Устанавливаем интервал обновления для отслеживания изменений
    const intervalId = setInterval(updateSafeAreaValues, 1000);
    
    // Подписываемся на события от Telegram
    const handleEvents = (event: MessageEvent) => {
      try {
        if (!event.data) return;
        
        const data = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
          
        if (data.eventType === 'safe_area_changed' || data.eventType === 'viewport_changed') {
          if (data.eventType === 'viewport_changed' && data.eventData) {
            setIsFullscreen(!!data.eventData.is_expanded);
          }
        }
      } catch (e) {
        console.error('Error parsing event data:', e);
      }
    };
    
    window.addEventListener('message', handleEvents);
    
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('message', handleEvents);
    };
  }, []);

  // Стили для визуализации безопасной зоны
  const safeAreaIndicatorStyle = showSafeAreaIndicator ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 999,
    pointerEvents: 'none' as const,
    borderTop: `${safeAreaValues.top} solid rgba(255, 0, 0, 0.3)`,
    borderRight: `${safeAreaValues.right} solid rgba(0, 255, 0, 0.3)`,
    borderBottom: `${safeAreaValues.bottom} solid rgba(0, 0, 255, 0.3)`,
    borderLeft: `${safeAreaValues.left} solid rgba(255, 255, 0, 0.3)`,
  } : {};

  // Стили для визуализации fullscreen padding
  const fullscreenPaddingIndicator = showSafeAreaIndicator ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    height: `calc(${safeAreaValues.top} + ${fullscreenPadding})`,
    backgroundColor: 'rgba(255, 0, 0, 0.1)',
    zIndex: 998,
    pointerEvents: 'none' as const,
  } : {};

  // Если нет данных пользователя
  if (!user) {
    return (
      <Page>
        <Placeholder
          header="Нет данных пользователя"
          description="Не удалось получить данные пользователя"
        >
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
        </Placeholder>
      </Page>
    );
  }

  return (
    <Page>
      {/* Визуальный индикатор безопасной зоны */}
      {showSafeAreaIndicator && <div style={safeAreaIndicatorStyle} />}
      {showSafeAreaIndicator && <div style={fullscreenPaddingIndicator} />}

      <div style={listContainerStyle}>
        <List>
          <Section header="Профиль пользователя">
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              padding: '20px 0' 
            }}>
              <Avatar size={96} src={user.photo_url} alt={user.username || user.first_name} />
              <Text weight="2" style={{ marginTop: 12, fontSize: 20 }}>
                {user.first_name} {user.last_name || ''}
              </Text>
              {user.username && (
                <Text style={{ color: 'var(--tgui-text-secondary)' }}>
                  @{user.username}
                </Text>
              )}
            </div>

            <div style={{ padding: 16 }}>
              <Button 
                size="l" 
                stretched 
                onClick={toggleFullscreen}
              >
                {isFullscreen ? 'Выйти из полноэкранного режима' : 'Включить полноэкранный режим'}
              </Button>
            </div>
          </Section>

          <Section header="Информация о пользователе">
            <Cell multiline>
              <div>ID пользователя</div>
              <div>{user.id.toString()}</div>
            </Cell>
            <Cell multiline>
              <div>Язык</div>
              <div>{user.language_code || 'Не указан'}</div>
            </Cell>
            <Cell multiline>
              <div>Premium</div>
              <div>{user.is_premium ? 'Да' : 'Нет'}</div>
            </Cell>
          </Section>
          
          {/* Раздел для отладки Safe Area API - в раздвижной панели */}
          <Section header="Отладочная информация">
            <Cell multiline>
              <div>Safe Area - Top</div>
              <div>{safeAreaValues.top}</div>
            </Cell>
            <Cell multiline>
              <div>Fullscreen Padding</div>
              <div>{fullscreenPadding}</div>
            </Cell>
            <Cell multiline>
              <div>Текущий режим</div>
              <div>{isFullscreen ? 'Fullscreen' : 'Regular'}</div>
            </Cell>
            
            <div style={{ padding: 16 }}>
              <Button 
                size="l" 
                stretched 
                onClick={() => setShowSafeAreaIndicator(!showSafeAreaIndicator)}
              >
                {showSafeAreaIndicator ? 'Скрыть' : 'Показать'} индикаторы
              </Button>
            </div>
            
            <div style={{ padding: 16 }}>
              <Button 
                size="l" 
                stretched 
                onClick={() => {
                  postEvent('web_app_request_safe_area');
                  postEvent('web_app_request_viewport');
                }}
              >
                Обновить данные
              </Button>
            </div>
          </Section>
        </List>
      </div>
    </Page>
  );
}; 