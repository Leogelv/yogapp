import { useState, useEffect, useCallback } from 'react';
import { type InitData as TelegramInitDataType } from '@telegram-apps/sdk-react';
import { supabase } from '../client';
import { type SupabaseUser, type TelegramUserData } from '../types';

// Определяем тип для возвращаемого значения хука
interface UseSupabaseUserReturn {
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void; // Добавляем функцию для повторного запроса
}

/**
 * Хук для "аутентификации" пользователя Telegram в Supabase.
 * Принимает initData (или initDataUnsafe) от Telegram SDK.
 * Важно: поля в initData.user могут называться first_name, last_name, photo_url (с нижним подчеркиванием).
 * Поле auth_date в initData является числом (Unix timestamp).
 */
export function useSupabaseUser(initDataRaw: TelegramInitDataType | undefined): UseSupabaseUserReturn {
  const [supabaseUser, setSupabaseUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const telegramUserFromInitData = initDataRaw?.user;
  const authDateFromInitData = initDataRaw?.auth_date; // Это Unix timestamp (число)
  const hashFromInitData = initDataRaw?.hash;

  const processUser = useCallback(async () => {
    if (!telegramUserFromInitData || typeof telegramUserFromInitData.id === 'undefined' || typeof authDateFromInitData === 'undefined') {
      setLoading(false);
      // Не устанавливаем ошибку, если данные еще не полные (например, начальная загрузка)
      return;
    }

    setLoading(true);
    setError(null);

    // Используем поля с нижним подчеркиванием из telegramUserFromInitData, если они есть,
    // иначе пробуем camelCase (хотя SDK обычно предоставляет snake_case в user объекте)
    const userData: TelegramUserData = {
      id: telegramUserFromInitData.id,
      // @ts-expect-error SDK типы могут быть неточными для initDataUnsafe, пробуем оба варианта
      first_name: telegramUserFromInitData.first_name || telegramUserFromInitData.firstName,
      // @ts-expect-error
      last_name: telegramUserFromInitData.last_name || telegramUserFromInitData.lastName,
      username: telegramUserFromInitData.username,
      // @ts-expect-error
      photo_url: telegramUserFromInitData.photo_url || telegramUserFromInitData.photoUrl,
      auth_date: authDateFromInitData, // auth_date уже является числом (Unix timestamp)
      hash: hashFromInitData || '',
    };

    try {
      let { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userData.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 - "No rows found"
        throw selectError;
      }

      if (existingUser) {
        const updates: Partial<SupabaseUser> = {
          last_login: new Date().toISOString(), // last_login это timestamptz, так что Date().toISOString() подходит
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          auth_date: userData.auth_date, // auth_date остается числом
        };

        const { data: updatedUser, error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('telegram_id', userData.id)
          .select('*')
          .single();

        if (updateError) {
          throw updateError;
        }
        setSupabaseUser(updatedUser);
      } else {
        const newUserPayload: Omit<SupabaseUser, 'id' | 'created_at' | 'updated_at' | 'last_login'> & { last_login?: string } = {
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          auth_date: userData.auth_date, // auth_date остается числом
          hash: userData.hash,
          last_login: new Date().toISOString(), // last_login это timestamptz
        };

        const { data: newUser, error: insertError } = await supabase
          .from('users')
          .insert(newUserPayload)
          .select('*')
          .single();

        if (insertError) {
          throw insertError;
        }
        setSupabaseUser(newUser);
      }
    } catch (err) {
      console.error('Ошибка при обработке пользователя в Supabase:', err);
      setError(err instanceof Error ? err : new Error('Произошла неизвестная ошибка'));
      setSupabaseUser(null);
    } finally {
      setLoading(false);
    }
  }, [telegramUserFromInitData, authDateFromInitData, hashFromInitData]);

  useEffect(() => {
    // Запускаем processUser только если все необходимые данные из initData присутствуют
    if (telegramUserFromInitData && typeof telegramUserFromInitData.id !== 'undefined' && typeof authDateFromInitData !== 'undefined') {
      processUser();
    } else {
      // Если данные не полны, но загрузка была активна, завершаем её
      if(loading) setLoading(false);
    }
    // Зависимости useEffect должны включать все внешние переменные, используемые внутри
  }, [processUser, telegramUserFromInitData, authDateFromInitData, loading]);
  
  const refetch = useCallback(() => {
    // Убедимся, что processUser вызывается только если есть данные
    if (telegramUserFromInitData && typeof telegramUserFromInitData.id !== 'undefined' && typeof authDateFromInitData !== 'undefined') {
       processUser();
    }
  }, [processUser, telegramUserFromInitData, authDateFromInitData]);

  return { supabaseUser, loading, error, refetch };
} 