// import { Link as RouterLink } from 'react-router-dom';
import { List, Cell, Link as UiLink, Placeholder } from '@telegram-apps/telegram-ui';
import type { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { useEffect, useState } from 'react';

import { useSupabaseAuth } from '../../lib/supabase/useSupabaseAuth';
import type { DbUser } from '../../lib/supabase/supabaseClient';
import { supabase } from '../../lib/supabase/supabaseClient';

import './IndexPage.css';

// Получаем launchParams один раз при загрузке модуля, тип any для упрощения
let launchParams: any; // Вместо ReturnType<typeof retrieveLaunchParams> | undefined;
try {
  launchParams = retrieveLaunchParams();
} catch (e) {
  console.error("Could not retrieve launch params on init", e);
  launchParams = undefined; // Можно также оставить undefined или {} 
}

const IndexPage: FC = () => {
  // Передаем весь объект launchParams в хук
  const { 
    dbUser, 
    loading, 
    error, 
    isSupabaseConnected, 
    sessionUser, 
    statusMessage 
  } = useSupabaseAuth(launchParams);
  
  // initData для использования в JSX получаем здесь, если launchParams доступен
  const initDataForDisplay = launchParams?.initData;

  const [allUsers, setAllUsers] = useState<DbUser[]>([]);
  const [fetchAllUsersError, setFetchAllUsersError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchAllUsers() {
      if (!isSupabaseConnected) return;
      try {
        const { data, error: usersError } = await supabase
          .from('users')
          .select('*');
        if (usersError) {
          throw usersError;
        }
        setAllUsers(data || []);
      } catch (e: any) {
        console.error("Ошибка при загрузке всех пользователей:", e);
        setFetchAllUsersError(e.message || 'Не удалось загрузить список пользователей');
      }
    }

    if(isSupabaseConnected) {
        fetchAllUsers();
    }
  }, [isSupabaseConnected]);

  return (
    <List>
      <Cell 
        subtitle={isSupabaseConnected ? 'Подключено к Supabase' : 'Нет подключения к Supabase'}
      >
        Состояние: {loading ? 'Загрузка...' : (error ? `Ошибка: ${error.message}` : (statusMessage || 'Готово'))}
      </Cell>
      
      {statusMessage && !error && loading &&
        <Cell>
            <i>Процесс: {statusMessage}</i>
        </Cell>
      }

      {isSupabaseConnected && sessionUser && (
        <Cell subtitle={`Supabase Auth User ID: ${sessionUser.id}`}>
          Email: {sessionUser.email}
        </Cell>
      )}

      {isSupabaseConnected && dbUser && (
        <Cell subtitle={`Пользователь из БД (Telegram ID: ${dbUser.telegram_id})`}>
          Привет, {dbUser.first_name || 'Пользователь'}!
          ID в БД: {dbUser.id} <br/>
          Username: {dbUser.username || '-'} <br/>
          Фото: {dbUser.photo_url ? <img src={dbUser.photo_url} alt="avatar" width="30" height="30" /> : 'нет'}
        </Cell>
      )}

      {isSupabaseConnected && !dbUser && !loading && !error && initDataForDisplay?.user?.id && (
        <Placeholder header="Пользователь не найден в БД">
          Telegram ID {initDataForDisplay.user.id} еще не синхронизирован с нашей базой. Это должно произойти автоматически.
          {statusMessage && <p>Статус: {statusMessage}</p>}
        </Placeholder>
      )}
      
      {!initDataForDisplay?.user?.id && !loading && !sessionUser &&
         <Placeholder header="Нет данных Telegram">
          Пожалуйста, откройте приложение в Telegram.
        </Placeholder>
      }
      
      <Cell onClick={() => navigate('/ton-connect') }>
        <UiLink>TON Connect</UiLink>
      </Cell>
      <Cell onClick={() => navigate('/profile')}>
        <UiLink>Профиль пользователя</UiLink>
      </Cell>
      <Cell onClick={() => navigate('/init-data')}>
        <UiLink>Init Data</UiLink>
      </Cell>
      <Cell onClick={() => navigate('/launch-params')}>
        <UiLink>Launch Params</UiLink>
      </Cell>
      <Cell onClick={() => navigate('/theme-params')}>
        <UiLink>Theme Params</UiLink>
      </Cell>

      {isSupabaseConnected && (
        <>
          <Cell subtitle="Все пользователи из Supabase (public.users)">
            {fetchAllUsersError && <div style={{ color: 'red' }}>{fetchAllUsersError}</div>}
            {allUsers.length > 0 ? (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {allUsers.map(user => (
                  <li key={user.id} style={{ borderBottom: '1px solid #eee', padding: '5px 0'}}>
                    ID: {user.id}, TG_ID: {user.telegram_id}, Имя: {user.first_name}
                  </li>
                ))}
              </ul>
            ) : (
              !fetchAllUsersError && (loading ? 'Загрузка списка...' : 'Пользователей не найдено')
            )}
          </Cell>
        </>
      )}
    </List>
  );
};

export default IndexPage;
