import { Section, Cell, Image, List, Spinner, Checkbox, Button } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useState, useEffect, useMemo } from 'react';
import { initDataState as _initDataState, useSignal } from '@telegram-apps/sdk-react';

import { Link } from '@/components/Link/Link.tsx';
import { Page } from '@/components/Page.tsx';
import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
import { supabase } from '@/lib/supabase/client';
import { type SupabaseUser } from '@/lib/supabase/types';

import tonSvg from './ton.svg';

// Расширяем глобальный объект Window, добавляя Telegram
declare global {
  interface Window {
    Telegram?: unknown;
  }
}

// Проверка, что приложение запущено внутри Telegram
const isTelegramApp = (): boolean => {
  return typeof window !== 'undefined' && !!window.Telegram;
};

export const IndexPage: FC = () => {
  // Проверяем, работает ли приложение в Telegram Mini App
  const isInTelegramApp = useMemo(() => isTelegramApp(), []);
  
  // Проверяем, можно ли показывать содержимое в браузере через env переменную
  const allowBrowserAccess = useMemo(() => {
    return process.env.NEXT_PUBLIC_ALLOW_BROWSER_ACCESS === 'true';
  }, []);
  
  // Определяем, показывать ли содержимое приложения
  const showAppContent = useMemo(() => {
    return isInTelegramApp || allowBrowserAccess;
  }, [isInTelegramApp, allowBrowserAccess]);
  
  // Получаем initData из Telegram SDK
  const initDataState = useSignal(_initDataState);
  
  // Используем наш хук для "аутентификации" в Supabase
  const { supabaseUser, loading, error, refetch } = useSupabaseUser(initDataState);
  
  // Состояние для списка всех пользователей из таблицы users
  const [allUsers, setAllUsers] = useState<SupabaseUser[]>([]);
  const [loadingUsers, setLoadingUsers] = useState<boolean>(false);
  const [usersError, setUsersError] = useState<Error | null>(null);
  
  // Получаем список всех пользователей при монтировании
  useEffect(() => {
    // Если это не Telegram App и не разрешен доступ в браузере, не делаем запросы
    if (!showAppContent) return;
    
    const fetchAllUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('last_login', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setAllUsers(data || []);
      } catch (err) {
        console.error('Ошибка при загрузке списка пользователей:', err);
        setUsersError(err instanceof Error ? err : new Error('Произошла неизвестная ошибка'));
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchAllUsers();
  }, [showAppContent]);
  
  // Обработчик для повторной загрузки данных
  const handleRefresh = () => {
    if (!showAppContent) return;
    
    refetch(); // Перезагружаем данные текущего пользователя
    
    // Перезагружаем список всех пользователей
    const fetchAllUsers = async () => {
      try {
        setLoadingUsers(true);
        setUsersError(null);
        
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('last_login', { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setAllUsers(data || []);
      } catch (err) {
        console.error('Ошибка при загрузке списка пользователей:', err);
        setUsersError(err instanceof Error ? err : new Error('Произошла неизвестная ошибка'));
      } finally {
        setLoadingUsers(false);
      }
    };
    
    fetchAllUsers();
  };

  // Если это не Telegram App и не разрешен доступ в браузере, показываем предупреждение
  if (!showAppContent) {
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
          footer={error ? `Error: ${error.message}` : (loading ? 'Loading user data...' : 'Connection successful')}
        >
          <Cell
            before={loading ? <Spinner size="m" /> : <Checkbox checked={!!supabaseUser} />}
            subtitle={supabaseUser ? `User ID: ${supabaseUser.id}` : 'Not connected'}
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
        </Section>
      </List>
    </Page>
  );
};
