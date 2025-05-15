import { useState, useMemo } from 'react';
import { type FC } from 'react';
import {
  initDataState as _initDataState,
  useSignal,
} from '@telegram-apps/sdk-react';
import { 
  Section, 
  Cell, 
  Avatar,
  Button, 
  Placeholder,
  Text,
  Spinner,
} from '@telegram-apps/telegram-ui';

import { Page } from '@/components/Page.tsx';
import { Link } from '@/components/Link/Link.tsx';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { logger } from '@/lib/logger';

// Импорт статических ресурсов
import './MainScreen.css';

// Временные данные для примера
const mockRecommendedPractice = {
  title: 'Утренняя медитация',
  description: 'Начните день с ясности и спокойствия',
  duration: '15 минут',
  imageUrl: 'https://placehold.co/600x400/orange/white?text=Meditation',
};

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

// Временный компонент таб-бара
const TabBar: FC<{ activeTab: string; setActiveTab: (tab: string) => void }> = ({ 
  activeTab, 
  setActiveTab 
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'space-around', 
      padding: '12px 0',
      borderTop: '1px solid var(--tgui-border)',
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: 'var(--tgui-background)',
      zIndex: 100
    }}>
      <div 
        onClick={() => setActiveTab('main')} 
        style={{ 
          padding: '8px 12px', 
          opacity: activeTab === 'main' ? 1 : 0.7,
          fontWeight: activeTab === 'main' ? 'bold' : 'normal'
        }}
      >
        Главная
      </div>
      <div 
        onClick={() => setActiveTab('library')} 
        style={{ 
          padding: '8px 12px', 
          opacity: activeTab === 'library' ? 1 : 0.7,
          fontWeight: activeTab === 'library' ? 'bold' : 'normal'
        }}
      >
        Библиотека
      </div>
      <div 
        onClick={() => setActiveTab('calendar')} 
        style={{ 
          padding: '8px 12px', 
          opacity: activeTab === 'calendar' ? 1 : 0.7,
          fontWeight: activeTab === 'calendar' ? 'bold' : 'normal'
        }}
      >
        Календарь
      </div>
      <div 
        onClick={() => setActiveTab('profile')} 
        style={{ 
          padding: '8px 12px', 
          opacity: activeTab === 'profile' ? 1 : 0.7,
          fontWeight: activeTab === 'profile' ? 'bold' : 'normal'
        }}
      >
        Профиль
      </div>
    </div>
  );
};

export const MainScreen: FC = () => {
  const initDataState = useSignal(_initDataState);
  const { supabaseUser, loading, error } = useSupabaseUser(initDataState);
  
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

  const [activeTab, setActiveTab] = useState('main');

  // Если это не Telegram App и не разрешен доступ в браузере, показываем предупреждение
  if (!showAppContent) {
    logger.warn('Access denied: not in Telegram app and browser access not allowed');
    return (
      <Page back={false}>
        <Section header="Только для Telegram" footer="Это приложение доступно только в Telegram Mini Apps.">
          <Cell>
            Это приложение должно быть открыто внутри Telegram.
          </Cell>
          <Cell subtitle="Если вы видите это сообщение, значит вы пытаетесь открыть приложение в браузере.">
            Пожалуйста, откройте это приложение через Telegram.
          </Cell>
        </Section>
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
      {/* Верхняя панель навигации - обработана компонентом Page */}
      
      {/* Информационный блок */}
      <Section>
        <div className="welcome-block">
          <div className="user-greeting">
            <Avatar size={40} src={user.photo_url} alt={user.username || user.first_name} />
            <AuthStatusIndicator isAuthenticated={!!supabaseUser} />
            <Text weight="3">
              Привет, {user.first_name}!
            </Text>
          </div>
          <Text>Готовы к сегодняшней практике?</Text>
        </div>
      </Section>
      
      {/* Рекомендуемая практика */}
      <Section header="Рекомендуемая практика">
        <div className="recommended-practice">
          <img 
            src={mockRecommendedPractice.imageUrl} 
            alt={mockRecommendedPractice.title}
            className="practice-image"
          />
          <div className="practice-info">
            <Text weight="3">{mockRecommendedPractice.title}</Text>
            <Text className="practice-description">{mockRecommendedPractice.description}</Text>
            <Text className="practice-duration">
              Длительность: {mockRecommendedPractice.duration}
            </Text>
          </div>
        </div>
      </Section>
      
      {/* Кнопка выбора практики */}
      <Section>
        <div className="action-buttons">
          <Link to="/quiz">
            <Button size="l" stretched>
              Выбрать практику
            </Button>
          </Link>
        </div>
      </Section>
      
      {/* Блок статистики */}
      <Section header="Ваша статистика">
        <Cell
          subtitle="Регулярность практик за последнюю неделю"
        >
          5 из 7 дней
        </Cell>
        <Cell
          subtitle="Общее время практик"
        >
          3ч 45мин
        </Cell>
      </Section>
      
      {/* Блок калькулятора */}
      <Section header="Калькулятор прогресса">
        <Cell subtitle="Текущие показатели">
          <div className="progress-calculator">
            <div className="progress-item">
              <Text weight="3">75%</Text>
              <Text>Регулярность</Text>
            </div>
            <div className="progress-item">
              <Text weight="3">15</Text>
              <Text>Дней подряд</Text>
            </div>
            <div className="progress-item">
              <Text weight="3">42</Text>
              <Text>Всего практик</Text>
            </div>
          </div>
        </Cell>
      </Section>
      
      {/* Переход в профиль - временно */}
      <Section>
        <Link to="/profile">
          <Cell
            subtitle="Просмотр профиля и полноэкранный режим"
          >
            Профиль пользователя
          </Cell>
        </Link>
      </Section>
      
      {/* Добавляем пространство для таб-бара */}
      <div style={{ height: 60 }}></div>
      
      {/* Нижняя панель навигации (таб-бар) */}
      <TabBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </Page>
  );
}; 