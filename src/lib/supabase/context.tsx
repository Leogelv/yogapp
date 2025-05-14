import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase, DBUser, TelegramUser } from './client';
import { initializeUser } from './auth';

// Интерфейс контекста
interface SupabaseContextType {
  user: DBUser | null;
  telegramUser: TelegramUser | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

// Создаем контекст
const SupabaseContext = createContext<SupabaseContextType | undefined>(undefined);

// Пропсы для провайдера
interface SupabaseProviderProps {
  children: React.ReactNode;
}

// Провайдер контекста
export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [user, setUser] = useState<DBUser | null>(null);
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Функция для обновления данных пользователя
  const refreshUser = async () => {
    setLoading(true);
    try {
      const { user: tgUser, dbUser, error: initError } = await initializeUser();
      
      setTelegramUser(tgUser);
      setUser(dbUser);
      setError(initError);
    } catch (err) {
      setError(`Ошибка при обновлении пользователя: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setLoading(false);
    }
  };

  // Инициализация при первой загрузке компонента
  useEffect(() => {
    refreshUser();

    // Подписываемся на изменения статуса авторизации
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session) {
          // Если есть сессия, но нет данных пользователя, обновляем их
          if (!user) {
            refreshUser();
          }
        } else {
          // Если сессия завершена, сбрасываем состояние
          setUser(null);
        }
      }
    );

    // Отписываемся при размонтировании
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Значение контекста
  const value = {
    user,
    telegramUser,
    loading,
    error,
    refreshUser,
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}

// Хук для использования контекста
export function useSupabase() {
  const context = useContext(SupabaseContext);
  
  if (context === undefined) {
    throw new Error('useSupabase должен использоваться внутри SupabaseProvider');
  }
  
  return context;
} 