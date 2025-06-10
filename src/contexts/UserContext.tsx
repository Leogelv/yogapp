import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
 } from 'react';
 import {
  initDataState as _initDataState,
  useSignal,
 } from '@telegram-apps/sdk-react';
 import { useSupabaseUser } from '@/lib/supabase/hooks/useSupabaseUser';
 import { SupabaseUser } from '@/lib/supabase/types';
 import { logger } from '@/lib/logger';
 
 // Типы для контекста
 interface User {
  // Telegram данные (первичные)
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  // Supabase данные (дополнительные)
  supabaseId?: string;
  isAdmin?: boolean;
  lastLogin?: string;
 }
 
 interface UserContextType {
  user: User | null;
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: Error | null;
  isAuthenticated: boolean;
  refetch: () => void;
 }
 
 // Создание контекста
 const UserContext = createContext<UserContextType | undefined>(undefined);
 
 // Провайдер контекста
 export const UserProvider: React.FC<{ children: ReactNode }> = ({
  children,
 }) => {
  const [user, setUser] = useState<User | null>(() => {
    // Пытаемся восстановить пользователя из localStorage при инициализации
    try {
      const savedUser = localStorage.getItem('yoga_user');
      if (savedUser) {
        const parsed = JSON.parse(savedUser);
        logger.info('User restored from localStorage', {
          telegramId: parsed.id,
        });
        return parsed;
      }
    } catch (error) {
      logger.warn('Failed to restore user from localStorage', error);
    }
    return null;
  });
 
  // Получаем данные из Telegram
  const initDataState = useSignal(_initDataState);
 
  // Получаем данные из Supabase
  const { supabaseUser, loading, error, refetch } =
    useSupabaseUser(initDataState);
 
  // Проверяем аутентификацию
  const isAuthenticated = !!(
    initDataState?.user?.id ||
    supabaseUser?.telegram_id ||
    user?.id
  );
 
  // Объединяем данные из Telegram и Supabase
  useEffect(() => {
    if (initDataState?.user) {
      const telegramUser = initDataState.user;
 
      // Создаем объединенный объект пользователя
      const combinedUser: User = {
        // Основные данные из Telegram (приоритет)
        id: telegramUser.id,
        first_name: telegramUser.first_name || '',
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        // Дополнительные данные из Supabase
        supabaseId: supabaseUser?.id,
        isAdmin: supabaseUser?.is_admin || false,
        lastLogin: supabaseUser?.last_login || undefined,
      };
 
      // Если есть данные из Supabase, используем их для фото (может быть обновлено)
      if (supabaseUser?.photo_url) {
        combinedUser.photo_url = supabaseUser.photo_url;
      }
 
      setUser(combinedUser);
 
      // Сохраняем пользователя в localStorage
      try {
        localStorage.setItem('yoga_user', JSON.stringify(combinedUser));
        logger.info('User context updated from Telegram', {
          telegramId: combinedUser.id,
          hasSupabaseData: !!supabaseUser,
          hasPhoto: !!combinedUser.photo_url,
        });
      } catch (error) {
        logger.warn('Failed to save user to localStorage', error);
      }
    } else if (supabaseUser) {
      // Если нет данных из Telegram, но есть из Supabase (восстановление сессии)
      const userFromSupabase: User = {
        id: supabaseUser.telegram_id,
        first_name: supabaseUser.first_name || '',
        last_name: supabaseUser.last_name || undefined,
        username: supabaseUser.username || undefined,
        photo_url: supabaseUser.photo_url || undefined,
        supabaseId: supabaseUser.id,
        isAdmin: supabaseUser.is_admin || false,
        lastLogin: supabaseUser.last_login || undefined,
      };
 
      setUser(userFromSupabase);
 
      // Сохраняем пользователя в localStorage
      try {
        localStorage.setItem('yoga_user', JSON.stringify(userFromSupabase));
        logger.info('User restored from Supabase data', {
          telegramId: userFromSupabase.id,
        });
      } catch (error) {
        logger.warn('Failed to save user to localStorage', error);
      }
    } else if (!loading && !initDataState && !supabaseUser && !user) {
      // Очищаем пользователя только если:
      // - загрузка завершена
      // - нет данных из Telegram
      // - нет данных из Supabase
      // - нет сохраненного пользователя
      logger.info('No user data available, clearing user state');
      try {
        localStorage.removeItem('yoga_user');
      } catch (error) {
        logger.warn('Failed to clear user from localStorage', error);
      }
    }
  }, [initDataState, supabaseUser, loading]);
 
  return (
    <UserContext.Provider
      value={{
        user,
        supabaseUser,
        loading,
        error,
        isAuthenticated,
        refetch,
      }}
    >
      {children}
    </UserContext.Provider>
  );
 };
 
 // Хук для использования контекста
 export const useUser = (): UserContextType => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
 };
 
 