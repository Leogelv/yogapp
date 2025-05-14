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
  const [contentSafeAreaValues, setContentSafeAreaValues] = useState({
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  });
  const [safeAreaPlusValues, setSafeAreaPlusValues] = useState({
    top: '5px',
    right: '5px',
    bottom: '5px',
    left: '5px',
  });
  const [showSafeAreaIndicator, setShowSafeAreaIndicator] = useState(false);
  const [lastEventData, setLastEventData] = useState<any>(null);
  const [lastEventTime, setLastEventTime] = useState<Date | null>(null);

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
      setContentSafeAreaValues({
        top: computedStyle.getPropertyValue('--content-safe-area-top') || '0px',
        right: computedStyle.getPropertyValue('--content-safe-area-right') || '0px',
        bottom: computedStyle.getPropertyValue('--content-safe-area-bottom') || '0px',
        left: computedStyle.getPropertyValue('--content-safe-area-left') || '0px',
      });
      setSafeAreaValues({
        top: computedStyle.getPropertyValue('--safe-area-top') || '0px',
        right: computedStyle.getPropertyValue('--safe-area-right') || '0px',
        bottom: computedStyle.getPropertyValue('--safe-area-bottom') || '0px',
        left: computedStyle.getPropertyValue('--safe-area-left') || '0px',
      });
      setSafeAreaPlusValues({
        top: computedStyle.getPropertyValue('--safe-area-top-plus') || '5px',
        right: computedStyle.getPropertyValue('--safe-area-right-plus') || '5px',
        bottom: computedStyle.getPropertyValue('--safe-area-bottom-plus') || '5px',
        left: computedStyle.getPropertyValue('--safe-area-left-plus') || '5px',
      });
    };

    // Запрашиваем информацию о content safe area и safe area
    postEvent('web_app_request_content_safe_area');
    postEvent('web_app_request_safe_area');
    
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
          
        if (data.eventType === 'content_safe_area_changed' || data.eventType === 'safe_area_changed') {
          setLastEventData({
            type: data.eventType,
            data: data.eventData
          });
          setLastEventTime(new Date());
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

  // Стили для визуализации safe area + 5px
  const safeAreaPlusIndicatorStyle = showSafeAreaIndicator ? {
    position: 'fixed' as const,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 998,
    pointerEvents: 'none' as const,
    borderTop: `${safeAreaPlusValues.top} solid rgba(255, 0, 0, 0.15)`,
    borderRight: `${safeAreaPlusValues.right} solid rgba(0, 255, 0, 0.15)`,
    borderBottom: `${safeAreaPlusValues.bottom} solid rgba(0, 0, 255, 0.15)`,
    borderLeft: `${safeAreaPlusValues.left} solid rgba(255, 255, 0, 0.15)`,
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
      {/* Визуальный индикатор безопасной зоны +5px */}
      {showSafeAreaIndicator && <div style={safeAreaPlusIndicatorStyle} />}

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
          
          {/* Раздел для отладки Safe Area API */}
          <Section header="Отладка Telegram API">
            <Section header="Safe Area">
              <Cell multiline>
                <div>Top</div>
                <div>{safeAreaValues.top}</div>
              </Cell>
              <Cell multiline>
                <div>Right</div>
                <div>{safeAreaValues.right}</div>
              </Cell>
              <Cell multiline>
                <div>Bottom</div>
                <div>{safeAreaValues.bottom}</div>
              </Cell>
              <Cell multiline>
                <div>Left</div>
                <div>{safeAreaValues.left}</div>
              </Cell>
              <div style={{ padding: 16 }}>
                <Button 
                  size="l" 
                  stretched 
                  onClick={() => postEvent('web_app_request_safe_area')}
                >
                  Запросить Safe Area
                </Button>
              </div>
            </Section>
            
            <Section header="Safe Area +5px">
              <Cell multiline>
                <div>Top</div>
                <div>{safeAreaPlusValues.top}</div>
              </Cell>
              <Cell multiline>
                <div>Right</div>
                <div>{safeAreaPlusValues.right}</div>
              </Cell>
              <Cell multiline>
                <div>Bottom</div>
                <div>{safeAreaPlusValues.bottom}</div>
              </Cell>
              <Cell multiline>
                <div>Left</div>
                <div>{safeAreaPlusValues.left}</div>
              </Cell>
            </Section>
            
            <Section header="Content Safe Area (для сравнения)">
              <Cell multiline>
                <div>Top</div>
                <div>{contentSafeAreaValues.top}</div>
              </Cell>
              <Cell multiline>
                <div>Right</div>
                <div>{contentSafeAreaValues.right}</div>
              </Cell>
              <Cell multiline>
                <div>Bottom</div>
                <div>{contentSafeAreaValues.bottom}</div>
              </Cell>
              <Cell multiline>
                <div>Left</div>
                <div>{contentSafeAreaValues.left}</div>
              </Cell>
              <div style={{ padding: 16 }}>
                <Button 
                  size="l" 
                  stretched 
                  onClick={() => postEvent('web_app_request_content_safe_area')}
                >
                  Запросить Content Safe Area
                </Button>
              </div>
            </Section>
            
            {/* Визуализация */}
            <div style={{ padding: 16 }}>
              <Button 
                size="l" 
                stretched 
                onClick={() => setShowSafeAreaIndicator(!showSafeAreaIndicator)}
              >
                {showSafeAreaIndicator ? 'Скрыть' : 'Показать'} индикатор Safe Area
              </Button>
            </div>
            
            {/* Последнее событие */}
            <Section header="Данные последнего события">
              {lastEventData ? (
                <>
                  <Cell multiline>
                    <div>Тип события</div>
                    <div>{lastEventData.type}</div>
                  </Cell>
                  <Cell multiline>
                    <div>Время</div>
                    <div>{lastEventTime?.toLocaleTimeString()}</div>
                  </Cell>
                  <Cell multiline>
                    <div>Данные</div>
                    <div style={{ wordBreak: 'break-all' }}>
                      {JSON.stringify(lastEventData.data)}
                    </div>
                  </Cell>
                </>
              ) : (
                <Cell>
                  <div>Нет данных о событиях</div>
                </Cell>
              )}
            </Section>
            
            {/* Дополнительные методы Telegram API */}
            <Section header="Другие методы API">
              <div style={{ padding: 16, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                <Button 
                  size="l" 
                  stretched 
                  onClick={() => postEvent('web_app_request_viewport')}
                >
                  Запросить Viewport
                </Button>
                <Button 
                  size="l" 
                  stretched 
                  onClick={() => postEvent('web_app_request_theme')}
                >
                  Запросить Theme
                </Button>
                <Button 
                  size="l" 
                  stretched 
                  onClick={() => postEvent('web_app_setup_settings_button', { is_visible: true })}
                >
                  Показать Settings Button
                </Button>
                <Button 
                  size="l" 
                  stretched 
                  onClick={() => postEvent('web_app_setup_settings_button', { is_visible: false })}
                >
                  Скрыть Settings Button
                </Button>
                <Button 
                  size="l" 
                  stretched 
                  onClick={() => postEvent('web_app_expand')}
                >
                  Expand App
                </Button>
              </div>
            </Section>
          </Section>
        </List>
      </div>
    </Page>
  );
}; 