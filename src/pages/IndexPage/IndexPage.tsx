import { Section, Cell, Image, List, Spinner, Checkbox, Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { ServerStatus } from '@/components/ServerStatus/ServerStatus';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabase/client';
import { type SupabaseUser } from '@/lib/supabase/types';
import { logger } from '@/lib/logger';
import FavoritesDebug from '@/components/FavoritesDebug/FavoritesDebug';

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
  
  // Ref для отслеживания таймеров и предотвращения множественных запросов
  const fetchTimerRef = useRef<number | null>(null);
  const lastFetchTimeRef = useRef<number>(0);
  const isUpdatingRef = useRef<boolean>(false);
  
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
  
  // Функция для получения списка всех пользователей с debounce
  const fetchAllUsers = useCallback(async () => {
    // Проверяем, не идет ли уже обновление и нужен ли debounce
    const now = Date.now();
    if (isUpdatingRef.current) {
      logger.debug('Skipping fetchAllUsers, update already in progress');
      return;
    }
    
    // Проверяем, прошло ли достаточно времени с последнего запроса
    if (now - lastFetchTimeRef.current < 2000) { // 2 секунды между запросами минимум
      // Если уже есть запланированный запрос, просто выходим
      if (fetchTimerRef.current !== null) {
        logger.debug('Fetch already queued, skipping');
        return;
      }
      
      // Откладываем запрос с помощью debounce
      logger.debug('Debouncing fetchAllUsers call');
      if (fetchTimerRef.current !== null) {
        window.clearTimeout(fetchTimerRef.current);
      }
      
      fetchTimerRef.current = window.setTimeout(() => {
        logger.debug('Executing debounced fetchAllUsers');
        fetchTimerRef.current = null;
        fetchAllUsers(); // Рекурсивный вызов после таймаута
      }, 500);
      return;
    }
    
    try {
      // Проверка доступности Supabase клиента
      if (!supabase) {
        logger.error('Supabase client is not available');
        setUsersError(new Error('Supabase client is not available'));
        return;
      }
      
      // Устанавливаем флаг, что идет обновление
      isUpdatingRef.current = true;
      setLoadingUsers(true);
      setUsersError(null);
      
      lastFetchTimeRef.current = now;
      
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
      isUpdatingRef.current = false;
    }
  }, []);
  
  // Настройка слушателя realtime соединения
  useEffect(() => {
    if (!showAppContent) return;
    
    // Для отслеживания каналов и их очистки при размонтировании
    let statusChannel: any = null;
    
    const setupRealtimeListener = () => {
      logger.info('Setting up realtime connection status listener only');
      
      // Проверяем доступность Supabase клиента
      if (!supabase) {
        logger.error('Cannot setup realtime listener: Supabase client is not available');
        return;
      }
      
      // Создаем канал для отслеживания ТОЛЬКО статуса соединения
      statusChannel = supabase.channel('connection-status');
      
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
        .subscribe((status: string) => {
          logger.info(`Status channel subscription: ${status}`);
          if (status === 'SUBSCRIBED') {
            setRealtimeStatus('connected');
          } else {
            setRealtimeStatus('connecting');
          }
        });
      
      // ВАЖНО: Полностью удаляем подписку на изменения таблицы users
      // Это предотвратит постоянные обновления при изменениях в таблице
    };
    
    // Настраиваем слушатели только для статуса соединения
    setupRealtimeListener();
    
    return () => {
      // Отписываемся при размонтировании
      if (statusChannel) {
        statusChannel.unsubscribe();
      }
      
      // Очищаем таймеры
      if (fetchTimerRef.current !== null) {
        window.clearTimeout(fetchTimerRef.current);
        fetchTimerRef.current = null;
      }
      
      logger.info('Cleaned up realtime subscriptions');
    };
  }, [showAppContent]);
  
  // Получаем список всех пользователей только при монтировании
  useEffect(() => {
    // Если это не Telegram App и не разрешен доступ в браузере, не делаем запросы
    if (!showAppContent) return;
    
    logger.info('Initial users data loading - one time only');
    fetchAllUsers();
    
    // ВАЖНО: Убираем fetchAllUsers из зависимостей, чтобы эффект выполнился только один раз
  }, [showAppContent]); // Убрали fetchAllUsers из зависимостей
  
  // Обработчик для повторной загрузки данных только по явному запросу
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
        {/* Компонент отладки избранного */}
        <Section header="🔧 Отладка избранного">
          <FavoritesDebug />
        </Section>

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
