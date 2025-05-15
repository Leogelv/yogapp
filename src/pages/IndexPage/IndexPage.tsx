import { Section, Cell, Image, List, Spinner, Checkbox, Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState, useEffect, useMemo, useRef } from 'react';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { ServerStatus } from '@/components/ServerStatus/ServerStatus';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabase/client';
import { type SupabaseUser } from '@/lib/supabase/types';
import { logger } from '@/lib/logger';

import tonSvg from './ton.svg';

// Расширяем глобальный объект Window, добавляя Telegram
declare global {
  interface Window {
    Telegram?: unknown;
  }
}

// Проверка, что приложение запущено внутри Telegram
const isTelegramApp = (): boolean => {
  const result = typeof window !== 'undefined' && !!window.Telegram;
  logger.debug(`isTelegramApp check: ${result}`);
  return result;
};

export const IndexPage: FC = () => {
  // Для отслеживания состояния подключения realtime
  const [realtimeStatus, setRealtimeStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');
  
  // Отслеживаем время последнего обновления данных
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());
  
  // Ref для хранения состояния обновления realtime
  const isInitialMount = useRef(true);
  
  logger.info('IndexPage - начало рендеринга');
  
  // Проверяем, работает ли приложение в Telegram Mini App
  const isInTelegramApp = useMemo(() => {
    const result = isTelegramApp();
    logger.info('isInTelegramApp:', { result });
    return result;
  }, []);
  
  // Проверяем, можно ли показывать содержимое в браузере через env переменную
  const allowBrowserAccess = useMemo(() => {
    const allowed = process.env.NEXT_PUBLIC_ALLOW_BROWSER_ACCESS === 'true';
    logger.info('allowBrowserAccess:', { allowed, envValue: process.env.NEXT_PUBLIC_ALLOW_BROWSER_ACCESS });
    return allowed;
  }, []);
  
  // Определяем, показывать ли содержимое приложения
  const showAppContent = useMemo(() => {
    const result = isInTelegramApp || allowBrowserAccess;
    logger.info('showAppContent:', { result });
    return result;
  }, [isInTelegramApp, allowBrowserAccess]);
  
  // Получаем initData из Telegram SDK
  const initDataState = useSignal(_initDataState);
  logger.debug('initDataState:', { received: !!initDataState });
  
  // Используем наш хук для "аутентификации" в Supabase
  const { supabaseUser, loading, error, refetch } = useSupabaseUser(initDataState);
  logger.debug('useSupabaseUser результат:', { 
    userLoaded: !!supabaseUser, 
    loading, 
    error: error ? error.message : null 
  });
  
  // Состояние для списка всех пользователей из таблицы users
  const [allUsers, setAllUsers] = useState<SupabaseUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<Error | null>(null);
  
  // Настройка слушателя realtime соединения
  useEffect(() => {
    const setupRealtimeListener = () => {
      logger.info('Setting up realtime connection listener');
      
      // Создаем канал для обработки событий
      const statusChannel = supabase.channel('connection-status');
      
      // Подписываемся на изменения статуса соединения через события канала
      statusChannel
        .on('presence', { event: 'sync' }, () => {
          setRealtimeStatus('connected');
          setLastUpdate(new Date());
          logger.info('Realtime presence sync event received');
        })
        .on('presence', { event: 'join' }, () => {
          setRealtimeStatus('connected');
          logger.info('Realtime presence join event received');
        })
        .on('presence', { event: 'leave' }, () => {
          setRealtimeStatus('disconnected');
          logger.warn('Realtime presence leave event received');
        })
        .on('system', { event: 'disconnect' }, () => {
          setRealtimeStatus('disconnected');
          logger.warn('Realtime disconnected');
        })
        .on('system', { event: 'reconnect' }, () => {
          setRealtimeStatus('connecting');
          logger.info('Realtime reconnecting');
        })
        .subscribe((status) => {
          logger.info(`Status channel subscription: ${status}`);
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else {
            setRealtimeStatus('connecting');
          }
        });
      
      // Подписываемся на обновления таблицы users
      const usersChannel = supabase.channel('public:users');
      usersChannel
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'users'
        }, (payload) => {
          logger.info('Realtime users table change:', { payload });
          setLastUpdate(new Date());
          fetchAllUsers(); // Обновляем список пользователей
        })
        .subscribe((status) => {
          logger.info(`Users channel subscription status: ${status}`);
        });
        
      return () => {
        // Отписываемся при размонтировании
        statusChannel.unsubscribe();
        usersChannel.unsubscribe();
        logger.info('Cleaned up realtime subscriptions');
      };
    };
    
    // Настраиваем слушатели только если показываем контент
    if (showAppContent) {
      setupRealtimeListener();
    }
    
  }, [showAppContent]);
  
  // Функция для получения списка всех пользователей
  const fetchAllUsers = async () => {
    try {
      // Проверка доступности Supabase клиента
      if (!supabase) {
        logger.error('Supabase client is not available');
        setUsersError(new Error('Supabase client is not available'));
        return;
      }
      
      setLoadingUsers(true);
      setUsersError(null);
      
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .order('last_login', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      logger.info(`Loaded ${data?.length || 0} users`);
      setAllUsers(data || []);
    } catch (err) {
      logger.error('Ошибка при загрузке списка пользователей:', err);
      setUsersError(err instanceof Error ? err : new Error('Произошла неизвестная ошибка'));
    } finally {
      setLoadingUsers(false);
    }
  };
  
  // Получаем список всех пользователей при монтировании
  useEffect(() => {
    // Если это не Telegram App и не разрешен доступ в браузере, не делаем запросы
    if (!showAppContent) return;
    
    logger.info('Initial users data loading');
    fetchAllUsers();
  }, [showAppContent]);
  
  // Обработчик realtime обновлений пользователя
  useEffect(() => {
    // Пропускаем первый рендер
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    
    if (supabaseUser) {
      logger.info('User data updated via realtime', { 
        id: supabaseUser.id, 
        telegramId: supabaseUser.telegram_id 
      });
      setLastUpdate(new Date());
    }
  }, [supabaseUser]);
  
  // Обработчик для повторной загрузки данных
  const handleRefresh = () => {
    if (!showAppContent) return;
    
    logger.info('Manual refresh triggered');
    
    refetch(); // Перезагружаем данные текущего пользователя
    fetchAllUsers(); // Перезагружаем список всех пользователей
  };

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

  return (
    <Page back={false}>
      <List>
        {/* Секция с информацией о подключении к Supabase */}
        <Section
          header="Supabase Connection Status"
          footer={error ? `Error: ${error.message}` : (loading ? 'Loading user data...' : `Connection successful. Last update: ${lastUpdate.toLocaleTimeString()}`)}
        >
          <Cell
            before={loading ? <Spinner size="m" /> : <Checkbox checked={!!supabaseUser} />}
            subtitle={supabaseUser ? `User ID: ${supabaseUser.id}` : 'Not connected'}
            after={
              <span style={{
                display: 'inline-block',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '12px',
                backgroundColor: realtimeStatus === 'connected' ? '#4caf50' : 
                                realtimeStatus === 'connecting' ? '#ff9800' : '#f44336',
                color: 'white'
              }}>
                {realtimeStatus}
              </span>
            }
          >
            {loading ? 'Connecting to Supabase...' : (supabaseUser ? 'Connected to Supabase' : 'Disconnected')}
          </Cell>
          
          {supabaseUser && (
            <Cell
              subtitle={`Last login: ${new Date(supabaseUser.last_login || '').toLocaleString()}`}
            >
              {supabaseUser.first_name} {supabaseUser.last_name} {supabaseUser.username ? `(@${supabaseUser.username})` : ''}
            </Cell>
          )}
          
          <Cell>
            <Button onClick={handleRefresh}>Refresh Data</Button>
          </Cell>
        </Section>
        
        {/* Секция со списком всех пользователей */}
        <Section
          header="All Users"
          footer={usersError ? `Error: ${usersError.message}` : (loadingUsers ? 'Loading users...' : `Total users: ${allUsers.length}`)}
        >
          {loadingUsers ? (
            <Cell before={<Spinner size="m" />}>Loading users...</Cell>
          ) : usersError ? (
            <Cell subtitle={`Error: ${usersError.message}`}>Failed to load users</Cell>
          ) : allUsers.length === 0 ? (
            <Cell>No users found</Cell>
          ) : (
            allUsers.slice(0, 5).map((user) => (
              <Cell
                key={user.id}
                before={user.photo_url ? <Image src={user.photo_url} /> : undefined}
                subtitle={`Telegram ID: ${user.telegram_id}`}
              >
                {user.first_name} {user.last_name} {user.username ? `(@${user.username})` : ''}
              </Cell>
            ))
          )}
        </Section>
        
        {/* Оригинальные секции */}
        <Section
          header="Features"
          footer="You can use these pages to learn more about features, provided by Telegram Mini Apps and other useful projects"
        >
          <Link to="/profile">
            <Cell
              subtitle="Просмотр профиля и полноэкранный режим"
            >
              Профиль пользователя
            </Cell>
          </Link>
          <Link to="/ton-connect">
            <Cell
              before={<Image src={tonSvg} style={{ backgroundColor: '#007AFF' }}/>}
              subtitle="Connect your TON wallet"
            >
              TON Connect
            </Cell>
          </Link>
        </Section>
        <Section
          header="Application Launch Data"
          footer="These pages help developer to learn more about current launch information"
        >
          <Link to="/init-data">
            <Cell subtitle="User data, chat information, technical data">Init Data</Cell>
          </Link>
          <Link to="/launch-params">
            <Cell subtitle="Platform identifier, Mini Apps version, etc.">Launch Parameters</Cell>
          </Link>
          <Link to="/theme-params">
            <Cell subtitle="Telegram application palette information">Theme Parameters</Cell>
          </Link>
          <Link to="/diagnostics">
            <Cell subtitle="Check server connection and diagnose issues">Diagnostics</Cell>
          </Link>
        </Section>

        {/* Диагностическая секция */}
        <ServerStatus />
      </List>
    </Page>
  );
};
