import { type FC, useState, useEffect, useCallback } from 'react';
import { postEvent } from '@telegram-apps/sdk-react';
import { 
  List, 
  Placeholder, 
  Button, 
  Section,
  Avatar, 
  Text,
  Cell,
  Spinner,
} from '@telegram-apps/telegram-ui';

import { Page } from '@/components/Page.tsx';
import { useSupabase } from '@/lib/supabase/context';

// Стили для контейнера списка
const listContainerStyle = {
  width: '100%',
};

// Режим отладки
const isDebugMode = import.meta.env.DEV || import.meta.env.VITE_DEBUG === 'true';

export const ProfilePage: FC = () => {
  const { user, telegramUser, loading, error, refreshUser } = useSupabase();
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [safeAreaValues, setSafeAreaValues] = useState({
    top: '0px',
    right: '0px',
    bottom: '0px',
    left: '0px',
  });
  const [fullscreenPadding, setFullscreenPadding] = useState('0px');
  const [showSafeAreaIndicator, setShowSafeAreaIndicator] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);

  // Логирует данные для отладки
  useEffect(() => {
    if (isDebugMode) {
      try {
        const debug = {
          environment: import.meta.env.MODE || 'unknown',
          userPresent: !!user,
          telegramUserPresent: !!telegramUser,
          isLoading: loading,
          error: error || 'none',
          retryCount,
          userKeys: user ? Object.keys(user) : [],
          telegramUserKeys: telegramUser ? Object.keys(telegramUser) : [],
          telegramUserData: telegramUser ? {
            id: telegramUser.id,
            name: telegramUser.first_name,
            username: telegramUser.username || 'none'
          } : null,
          windowLocation: {
            href: window.location.href,
            hash: window.location.hash,
            search: window.location.search,
          }
        };
        
        console.log('Debug Info:', debug);
        setDebugInfo(JSON.stringify(debug, null, 2));
      } catch (err) {
        console.error('Ошибка при сборе отладочной информации:', err);
        setDebugInfo(`Ошибка отладки: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [user, telegramUser, loading, error, retryCount]);

  // Переключение режима fullscreen
  const toggleFullscreen = () => {
    try {
      if (isFullscreen) {
        postEvent('web_app_exit_fullscreen');
        setIsFullscreen(false);
      } else {
        postEvent('web_app_request_fullscreen');
        setIsFullscreen(true);
      }
    } catch (err) {
      console.error('Ошибка при переключении полноэкранного режима:', err);
      if (isDebugMode) {
        setDebugInfo(prev => `${prev}\n\nОшибка fullscreen: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  };

  // Попытка повторно загрузить данные пользователя
  const handleRetryLoad = useCallback(async () => {
    try {
      setRetryCount(prev => prev + 1);
      await refreshUser();
    } catch (err) {
      console.error('Ошибка при попытке обновления данных:', err);
      if (isDebugMode) {
        setDebugInfo(prev => `${prev}\n\nОшибка обновления: ${err instanceof Error ? err.message : String(err)}`);
      }
    }
  }, [refreshUser]);

  // Получаем текущие значения CSS переменных safe area
  useEffect(() => {
    const updateSafeAreaValues = () => {
      try {
        const computedStyle = getComputedStyle(document.documentElement);
        setSafeAreaValues({
          top: computedStyle.getPropertyValue('--safe-area-top') || '0px',
          right: computedStyle.getPropertyValue('--safe-area-right') || '0px',
          bottom: computedStyle.getPropertyValue('--safe-area-bottom') || '0px',
          left: computedStyle.getPropertyValue('--safe-area-left') || '0px',
        });
        setFullscreenPadding(computedStyle.getPropertyValue('--fullscreen-extra-padding') || '0px');
      } catch (err) {
        console.error('Ошибка при получении стилей:', err);
      }
    };

    try {
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
    } catch (err) {
      console.error('Ошибка при установке обработчиков событий:', err);
    }
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

  // Если загрузка
  if (loading) {
    return (
      <Page>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spinner size="l" />
          {isDebugMode && <Text style={{ marginTop: 20 }}>Загрузка данных пользователя...</Text>}
        </div>
        {isDebugMode && debugInfo && (
          <div style={{ marginTop: 20, textAlign: 'left', maxHeight: 200, overflow: 'auto', fontSize: 12, padding: 12 }}>
            <pre>{debugInfo}</pre>
          </div>
        )}
      </Page>
    );
  }

  // Если есть ошибка
  if (error) {
    return (
      <Page>
        <Placeholder
          header="Ошибка загрузки"
          description={error}
        >
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
          <div style={{ marginTop: 20 }}>
            <Button onClick={handleRetryLoad}>Повторить</Button>
          </div>
          {isDebugMode && debugInfo && (
            <div style={{ marginTop: 20, textAlign: 'left', maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </Placeholder>
      </Page>
    );
  }

  // Убедимся, что по крайней мере хоть какие-то данные пользователя есть
  const displayUser = user || telegramUser;
  
  if (!displayUser) {
    return (
      <Page>
        <Placeholder
          header="Нет данных пользователя"
          description="Не удалось получить данные пользователя из Telegram или Supabase"
        >
          <img
            alt="Telegram sticker"
            src="https://xelene.me/telegram.gif"
            style={{ display: 'block', width: '144px', height: '144px' }}
          />
          <div style={{ marginTop: 20 }}>
            <Button onClick={handleRetryLoad}>Повторить</Button>
          </div>
          {isDebugMode && debugInfo && (
            <div style={{ marginTop: 20, textAlign: 'left', maxHeight: 200, overflow: 'auto', fontSize: 12 }}>
              <pre>{debugInfo}</pre>
            </div>
          )}
        </Placeholder>
      </Page>
    );
  }
  
  // Создаем безопасную обертку для извлечения данных пользователя
  // с fallback значениями для предотвращения ошибок
  const safeUser = {
    first_name: displayUser.first_name || 'Пользователь',
    last_name: displayUser.last_name || '',
    photo_url: displayUser.photo_url || '',
    username: displayUser.username || '', 
    id: displayUser.id || 0,
    last_login: user?.last_login ? new Date(user.last_login).toLocaleString() : 'Недавно'
  };
  
  // Извлекаем и проверяем данные пользователя
  const displayName = safeUser.first_name + (safeUser.last_name ? ` ${safeUser.last_name}` : '');
  const photoUrl = safeUser.photo_url;
  const username = safeUser.username;

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
              <Avatar size={96} src={photoUrl} alt={username || displayName} />
              <Text weight="2" style={{ marginTop: 12, fontSize: 20 }}>
                {displayName}
              </Text>
              {username && (
                <Text style={{ color: 'var(--tgui-text-secondary)' }}>
                  @{username}
                </Text>
              )}
              {user && (
                <Text style={{ 
                  color: 'var(--tgui-text-secondary)', 
                  fontSize: 14, 
                  marginTop: 4 
                }}>
                  Последний вход: {safeUser.last_login}
                </Text>
              )}
            </div>
          </Section>

          <Section header="Действия">
            <Cell
              onClick={toggleFullscreen}
              after={
                <Button size="m">
                  {isFullscreen ? 'Выйти из полноэкранного режима' : 'Полноэкранный режим'}
                </Button>
              }
            >
              Переключить режим экрана
            </Cell>
            
            <Cell
              onClick={() => setShowSafeAreaIndicator(!showSafeAreaIndicator)}
              after={
                <Button size="m">
                  {showSafeAreaIndicator ? 'Скрыть' : 'Показать'}
                </Button>
              }
            >
              Показать Safe Area
            </Cell>
          </Section>

          {isDebugMode && (
            <Section header="Отладочная информация">
              <div style={{ padding: 12, fontSize: 12, lineHeight: 1.4 }}>
                <pre style={{ maxHeight: 200, overflow: 'auto', margin: 0 }}>
                  {debugInfo}
                </pre>
              </div>
            </Section>
          )}
        </List>
      </div>
    </Page>
  );
}; 