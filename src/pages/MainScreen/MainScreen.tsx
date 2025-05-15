import { useMemo } from 'react';
import { type FC } from 'react';
import {
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { 
  Avatar,
  Placeholder,
  Text,
  Spinner,
} from '@telegram-apps/telegram-ui';

import { Page } from '@/components/Page.tsx';
import Stats from '@/components/Stats';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { logger } from '@/lib/logger';
import { useNavigate } from 'react-router-dom';

// Импорт статических ресурсов
import './MainScreen.css';

// Компонент для индикатора состояния авторизации
const AuthStatusIndicator: FC<{ isAuthenticated: boolean }> = ({ isAuthenticated }) => (
  <div className="auth-status-indicator" style={{ 
    width: 12, 
    height: 12, 
    borderRadius: '50%', 
    backgroundColor: isAuthenticated ? '#4caf50' : '#f44336',
    marginLeft: 8,
    display: 'inline-block',
    verticalAlign: 'middle'
  }} />
);

export const MainScreen: FC = () => {
  const initDataState = useSignal(_initDataState);
  const { supabaseUser, loading, error } = useSupabaseUser(initDataState);
  const navigate = useNavigate();
  
  // Проверяем запуск в телеграме
  const isTelegramApp = useMemo(() => {
    const result = typeof window !== 'undefined' && !!window.Telegram;
    logger.debug(`isTelegramApp check: ${result}`);
    return result;
  }, []);
  
  // Проверяем, можно ли показывать содержимое в браузере
  const allowBrowserAccess = useMemo(() => {
    const allowed = process.env.NEXT_PUBLIC_ALLOW_BROWSER_ACCESS === 'true';
    logger.info('allowBrowserAccess:', { allowed, envValue: process.env.NEXT_PUBLIC_ALLOW_BROWSER_ACCESS });
    return allowed;
  }, []);
  
  // Определяем, показывать ли содержимое приложения
  const showAppContent = useMemo(() => {
    const result = isTelegramApp || allowBrowserAccess;
    logger.info('showAppContent:', { result });
    return result;
  }, [isTelegramApp, allowBrowserAccess]);

  // Определяем пользователя из initDataState
  const user = useMemo(() => 
    initDataState && initDataState.user ? initDataState.user : undefined,
  [initDataState]);

  // Обработчик для кнопки выбора практики
  const handleSelectPractice = () => {
    navigate('/quiz');
  };

  // Если это не Telegram App и не разрешен доступ в браузере, показываем предупреждение
  if (!showAppContent) {
    logger.warn('Access denied: not in Telegram app and browser access not allowed');
    return (
      <Page back={false}>
        <div className="browser-warning">
          <Text weight="3">Только для Telegram</Text>
          <Text>Это приложение доступно только в Telegram Mini Apps.</Text>
        </div>
      </Page>
    );
  }

  // Если данные пользователя загружаются
  if (loading) {
    return (
      <Page back={false}>
        <Placeholder>
          <Spinner size="m" />
          <Text weight="3" style={{ marginTop: 8 }}>Загрузка данных...</Text>
        </Placeholder>
      </Page>
    );
  }

  // Если есть ошибка при получении данных
  if (error) {
    return (
      <Page back={false}>
        <Placeholder 
          header="Ошибка" 
          description={`Не удалось загрузить данные: ${error.message}`}
        />
      </Page>
    );
  }

  // Если нет данных пользователя
  if (!user) {
    return (
      <Page back={false}>
        <Placeholder
          header="Нет данных пользователя"
          description="Не удалось получить данные пользователя из Telegram"
        />
      </Page>
    );
  }

  return (
    <Page back={false}>
      {/* Верхний блок с аватаром и именем пользователя */}
      <div className="user-header">
        <div className="user-info">
          <Avatar size={40} src={user.photo_url} alt={user.username || user.first_name} />
          <div className="user-name">
            <Text weight="3">{user.first_name}</Text>
            <AuthStatusIndicator isAuthenticated={!!supabaseUser} />
          </div>
        </div>
        <div className="like-button">3 <span className="heart-icon">❤</span></div>
      </div>
      
      {/* Блок статистики и кнопка выбора практики */}
      <Stats 
        strength={3}
        practiceMinutes={100}
        daysInFlow={7}
        onSelectPractice={handleSelectPractice}
      />
    </Page>
  );
}; 