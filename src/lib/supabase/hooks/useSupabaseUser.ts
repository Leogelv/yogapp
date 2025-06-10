import { useState, useEffect, useCallback, useRef } from 'react';
import { type InitData as TelegramInitDataType } from '@telegram-apps/sdk-react';
import { supabase } from '../client';
import { type SupabaseUser, type TelegramUserData } from '../types';
import { logger } from '../../logger';

// Определяем тип для возвращаемого значения хука
interface UseSupabaseUserReturn {
  supabaseUser: SupabaseUser | null;
  loading: boolean;
  error: Error | null;
  refetch: () => void; // Функция для повторного запроса
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
  
  // Ref для отслеживания если processUser уже был вызван
  const wasProcessedRef = useRef<boolean>(false);

  // Попытка получить данные пользователя из initData
  const telegramUserFromInitData = initDataRaw?.user;
  const authDateFromInitData = initDataRaw?.auth_date; // Это Unix timestamp (число)
  const hashFromInitData = initDataRaw?.hash;

  // Оборачиваем процесс в useCallback для предотвращения лишних ререндеров
  const processUser = useCallback(async () => {
    logger.info('🚀 processUser started', { 
      telegramId: telegramUserFromInitData?.id,
      authDate: authDateFromInitData,
      hasSupabase: !!supabase
    });
    
    // Проверка доступности необходимых данных
    if (!telegramUserFromInitData || typeof telegramUserFromInitData.id === 'undefined' || typeof authDateFromInitData === 'undefined') {
      logger.warn('Missing required Telegram user data');
      setLoading(false);
      // Не устанавливаем ошибку, если данные еще не полные (например, начальная загрузка)
      return;
    }

    // Проверка доступности Supabase клиента
    if (!supabase) {
      logger.error('Supabase client is not available');
      setError(new Error('Supabase client is not available'));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    // Убедимся, что auth_date - это число
    const authDateAsNumber = typeof authDateFromInitData === 'number' 
      ? authDateFromInitData 
      : Math.floor(new Date(authDateFromInitData as any).getTime() / 1000);

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
      auth_date: authDateAsNumber, // Используем преобразованное число
      hash: hashFromInitData || '',
    };

    logger.info('Processing user authentication', { telegramId: userData.id });

    try {
      let { data: existingUser, error: selectError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', userData.id)
        .single();

      if (selectError && selectError.code !== 'PGRST116') { // PGRST116 - "No rows found"
        throw selectError;
      }

      logger.info('🔍 User lookup result', { 
        existingUser: !!existingUser,
        userId: existingUser?.id,
        selectError: selectError?.code
      });

      if (existingUser) {
        logger.info('Updating existing user', { telegramId: userData.id });
        const updates: Partial<SupabaseUser> = {
          last_login: new Date().toISOString(), // last_login это timestamptz
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          auth_date: authDateAsNumber, // Используем преобразованное число
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
        logger.info('User updated successfully');
        
        // Создаем сессию аутентификации в Supabase Auth
        // ВРЕМЕННО ОТКЛЮЧЕНО для Telegram Web Apps
        /*
        if (!existingUser.auth_user_id) {
          logger.info('🔐 Starting auth session creation', { 
            telegramId: telegramUserFromInitData.id,
            supabaseUserId: existingUser.id 
          });
          
          // Создаем уникальный email и пароль для пользователя Telegram
          const userEmail = `telegram_${telegramUserFromInitData.id}@yoga.app`;
          const userPassword = `telegram_${telegramUserFromInitData.id}_${authDateAsNumber}`;
          
          logger.info('🔐 Preparing auth credentials', { userEmail });
          
          try {
            // Пытаемся войти с существующими данными
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userEmail,
              password: userPassword,
            });
            
            logger.info('🔐 Sign in attempt completed', { 
              success: !!signInData.user,
              hasSession: !!signInData.session,
              error: signInError?.message,
              errorCode: signInError?.status
            });
            
            if (signInError && signInError.message.includes('Invalid login credentials')) {
              logger.info('🔐 User not found, creating new auth user');
            
              // Если пользователь не существует, создаем его
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: userEmail,
                password: userPassword,
                options: {
                  data: {
                    telegram_id: telegramUserFromInitData.id,
                    user_id: existingUser.id,
                    first_name: telegramUserFromInitData.first_name
                  }
                }
              });
              
              logger.info('🔐 Sign up attempt result', { 
                success: !!signUpData.user,
                error: signUpError?.message,
                userId: signUpData.user?.id,
                needsConfirmation: !!signUpData.user && !signUpData.session
              });
              
              if (signUpError) {
                logger.error('❌ Failed to create auth user:', signUpError);
              } else {
                logger.info('✅ Auth user created successfully', { 
                  authUserId: signUpData.user?.id,
                  supabaseUserId: existingUser.id,
                  hasSession: !!signUpData.session
                });
              }
            } else if (signInError) {
              logger.error('❌ Failed to sign in auth user:', signInError);
            } else {
              logger.info('✅ Auth user signed in successfully', { 
                authUserId: signInData.user?.id,
                supabaseUserId: existingUser.id,
                hasSession: !!signInData.session
              });
            }
            
            // Проверяем текущую сессию после всех операций
            const { data: currentSession } = await supabase.auth.getSession();
            logger.info('🔐 Final session check', { 
              hasSession: !!currentSession.session,
              userId: currentSession.session?.user?.id,
              userMetadata: currentSession.session?.user?.user_metadata
            });
            
          } catch (authErr) {
            logger.error('❌ Auth session creation failed:', authErr);
          }
        }
        */
        
        setSupabaseUser(updatedUser);
      } else {
        logger.info('Creating new user', { telegramId: userData.id });
        const newUserPayload: Omit<SupabaseUser, 'id' | 'created_at' | 'updated_at' | 'last_login'> & { last_login?: string } = {
          telegram_id: userData.id,
          first_name: userData.first_name,
          last_name: userData.last_name,
          username: userData.username,
          photo_url: userData.photo_url,
          auth_date: authDateAsNumber, // Используем преобразованное число
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
        logger.info('New user created successfully');
        
        // Создаем сессию аутентификации в Supabase Auth
        // ВРЕМЕННО ОТКЛЮЧЕНО для Telegram Web Apps
        /*
        if (!newUser.auth_user_id) {
          logger.info('🔐 Starting auth session creation', { 
            telegramId: telegramUserFromInitData.id,
            supabaseUserId: newUser.id 
          });
          
          // Создаем уникальный email и пароль для пользователя Telegram
          const userEmail = `telegram_${telegramUserFromInitData.id}@yoga.app`;
          const userPassword = `telegram_${telegramUserFromInitData.id}_${authDateAsNumber}`;
          
          logger.info('🔐 Preparing auth credentials', { userEmail });
          
          try {
            // Пытаемся войти с существующими данными
            const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
              email: userEmail,
              password: userPassword,
            });
            
            logger.info('🔐 Sign in attempt completed', { 
              success: !!signInData.user,
              hasSession: !!signInData.session,
              error: signInError?.message,
              errorCode: signInError?.status
            });
            
            if (signInError && signInError.message.includes('Invalid login credentials')) {
              logger.info('🔐 User not found, creating new auth user');
            
              // Если пользователь не существует, создаем его
              const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email: userEmail,
                password: userPassword,
                options: {
                  data: {
                    telegram_id: telegramUserFromInitData.id,
                    user_id: newUser.id,
                    first_name: telegramUserFromInitData.first_name
                  }
                }
              });
              
              logger.info('🔐 Sign up attempt result', { 
                success: !!signUpData.user,
                error: signUpError?.message,
                userId: signUpData.user?.id,
                needsConfirmation: !!signUpData.user && !signUpData.session
              });
              
              if (signUpError) {
                logger.error('❌ Failed to create auth user:', signUpError);
              } else {
                logger.info('✅ Auth user created successfully', { 
                  authUserId: signUpData.user?.id,
                  supabaseUserId: newUser.id,
                  hasSession: !!signUpData.session
                });
              }
            } else if (signInError) {
              logger.error('❌ Failed to sign in auth user:', signInError);
            } else {
              logger.info('✅ Auth user signed in successfully', { 
                authUserId: signInData.user?.id,
                supabaseUserId: newUser.id,
                hasSession: !!signInData.session
              });
            }
          } catch (authErr) {
            logger.error('❌ Auth session creation failed:', authErr);
          }
        }
        */
        
        setSupabaseUser(newUser);
      }
      
      // Отмечаем, что пользователь был успешно обработан
      wasProcessedRef.current = true;
      
    } catch (err) {
      logger.error('Error processing user in Supabase:', err);
      setError(err instanceof Error ? err : new Error('Произошла неизвестная ошибка'));
      setSupabaseUser(null);
    } finally {
      setLoading(false);
    }
  }, [telegramUserFromInitData, authDateFromInitData, hashFromInitData]);

  useEffect(() => {
    // Запускаем processUser только один раз при первоначальной загрузке
    if (
      !wasProcessedRef.current && 
      telegramUserFromInitData && 
      typeof telegramUserFromInitData.id !== 'undefined' && 
      typeof authDateFromInitData !== 'undefined'
    ) {
      logger.info('Starting user authentication process (one-time only)');
      processUser();
    } else {
      // Если данные не полны, но загрузка была активна, завершаем её
      if(loading) {
        logger.warn('Incomplete user data, stopping loading state');
        setLoading(false);
      }
    }
    // Важно: не включаем processUser в зависимости, чтобы избежать повторных вызовов
  }, [telegramUserFromInitData, authDateFromInitData, loading]);
  
  // Функция для явного обновления данных - вызывается только по запросу пользователя
  const refetch = useCallback(() => {
    // Убедимся, что processUser вызывается только если есть данные
    if (telegramUserFromInitData && typeof telegramUserFromInitData.id !== 'undefined' && typeof authDateFromInitData !== 'undefined') {
      logger.info('Manually refetching user data');
      processUser();
    } else {
      logger.warn('Cannot refetch: incomplete user data');
    }
  }, [processUser, telegramUserFromInitData, authDateFromInitData]);

  return { supabaseUser, loading, error, refetch };
} 