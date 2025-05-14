import { useState, useEffect, useCallback } from 'react';
// import { useInitData } from '@telegram-apps/sdk-react'; // Убираем этот импорт
import { supabase } from './supabaseClient';
import type { User as AuthUser, SignUpWithPasswordCredentials } from '@supabase/supabase-js';
import type { DbUser } from './supabaseClient';
import { v4 as uuidv4 } from 'uuid'; // Для генерации случайного пароля

interface SupabaseAuthData {
  sessionUser: AuthUser | null;
  dbUser: DbUser | null;
  loading: boolean;
  error: Error | null;
  isSupabaseConnected: boolean;
  statusMessage: string | null; // Для вывода сообщений о процессе
}

// Принимаем весь объект launchParams или undefined
export function useSupabaseAuth(launchParamsSource?: any): SupabaseAuthData { 
  // Извлекаем initData безопасно внутри хука
  const initData = launchParamsSource?.initData;

  const [sessionUser, setSessionUser] = useState<AuthUser | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  const manageUser = useCallback(async () => {
    setLoading(true);
    setError(null);
    setStatusMessage(null);

    // Сначала пытаемся получить текущую сессию Supabase, если есть
    try {
      const { data: { user: currentAuthUser }, error: sessionError } = await supabase.auth.getUser();
      if (sessionError && sessionError.message !== 'No active session') {
        throw sessionError;
      }
      setSessionUser(currentAuthUser);
      setIsSupabaseConnected(true); // Успешный запрос к auth

      if (currentAuthUser && !initData?.user?.id) {
        // Если есть auth юзер, но нет initData (не в TG), попробуем найти его в public.users
        const { data: userProfile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', currentAuthUser.id)
          .single();
        if (profileError && profileError.code !== 'PGRST116') throw profileError;
        setDbUser(userProfile);
        setLoading(false);
        return;
      }
    } catch (e) {
      setError(e as Error);
      console.error("Ошибка при начальном получении сессии Supabase или профиля:", e);
      setIsSupabaseConnected(false); // Может быть проблема с подключением
      // Не выходим, если это просто отсутствие сессии, продолжим с initData если есть
    }
    

    if (!initData?.user?.id) {
      setStatusMessage('Нет данных Telegram пользователя (initData).');
      // Если дошли сюда и нет initData, и сессии не было, то делать нечего
      // Если сессия была, setSessionUser и, возможно, dbUser уже установлены выше.
      setLoading(false);
      return;
    }

    const telegramUser = initData.user;
    setStatusMessage('Получены данные Telegram пользователя.');

    try {
      const { data: existingUser, error: checkError } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

      setIsSupabaseConnected(true); // Успешный select к users

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      if (existingUser) {
        setStatusMessage(`Пользователь TG ID ${telegramUser.id} найден в Supabase. Обновляем данные...`);
        setDbUser(existingUser);
        
        const updates: Partial<DbUser> = {
          last_login: new Date().toISOString(),
          first_name: telegramUser.firstName,
          last_name: telegramUser.lastName || null,
          username: telegramUser.username || null,
          photo_url: telegramUser.photoUrl || null,
        };

        // Проверим, изменились ли данные, чтобы не делать лишний update
        const hasChanges = Object.keys(updates).some(
          key => key !== 'last_login' && existingUser[key as keyof DbUser] !== updates[key as keyof Partial<DbUser>]
        );

        if (hasChanges || !existingUser.last_login) { // Обновляем если есть изменения или last_login не было
          const { error: updateError } = await supabase
            .from('users')
            .update(updates)
            .eq('telegram_id', telegramUser.id);
          if (updateError) {
            console.warn('Не удалось обновить данные пользователя:', updateError);
            setError(updateError);
          } else {
            setStatusMessage('Данные пользователя и время входа обновлены.');
            // Обновим локальное состояние dbUser после успешного апдейта
            setDbUser({ ...existingUser, ...updates });
          }
        } else {
          // Если только last_login, то можно и не показывать сообщение или специальное
           await supabase.from('users').update({ last_login: new Date().toISOString() }).eq('telegram_id', telegramUser.id);
          setStatusMessage('Время последнего входа обновлено.');
        }
        
        // Убедимся, что сессия Supabase Auth соответствует, если пользователь уже есть
        // Обычно, если пользователь есть в users, он должен быть и в auth.users
        // Если нет - это аномалия, но мы не можем здесь создать auth сессию без логина/пароля
        if (!sessionUser || sessionUser.id !== existingUser.id) {
            const { data: { user: authUserFromGet } } = await supabase.auth.getUser();
            if (authUserFromGet && authUserFromGet.id === existingUser.id) {
                setSessionUser(authUserFromGet);
            }
        }

      } else {
        setStatusMessage(`Пользователь TG ID ${telegramUser.id} не найден. Создаем нового...`);
        const email = `${telegramUser.id}@telegram.user`;
        const password = uuidv4(); // Генерируем случайный пароль

        const credentials: SignUpWithPasswordCredentials = {
            email,
            password,
            options: {
              data: { // Это попадет в auth.users.raw_user_meta_data
                telegram_id: telegramUser.id,
                first_name: telegramUser.firstName,
                last_name: telegramUser.lastName,
                username: telegramUser.username,
                photo_url: telegramUser.photoUrl,
                // Можно добавить и другие поля из initData.user если нужно
              },
            },
          };

        setStatusMessage(`Пытаемся зарегистрировать пользователя в Supabase Auth: ${email}`);
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp(credentials);

        if (signUpError) {
          // Если ошибка "User already registered", возможно, он есть в auth.users, но нет в public.users
          // Или другая проблема с регистрацией
          if (signUpError.message.includes('User already registered')) {
             setStatusMessage(`Пользователь уже существует в Auth (${email}), но не в таблице users. Пытаемся войти и создать запись...`);
             const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
             if (signInError) {
                console.error('Ошибка входа после "User already registered":', signInError);
                throw new Error(`Не удалось войти существующим Auth пользователем: ${signInError.message}`);
             }
             if (!signInData.user) throw new Error('Вход не вернул пользователя после "User already registered"');
             setSessionUser(signInData.user); // Устанавливаем сессию
             // Теперь создаем запись в public.users, так как ее не было
             await createUserProfile(signInData.user, telegramUser, setDbUser, setStatusMessage, setError);
          }
          throw signUpError; // Другая ошибка signUp
        }

        if (!signUpData.user) {
          throw new Error('Supabase signUp не вернул пользователя, но и не выдал ошибку.');
        }
        
        setStatusMessage(`Пользователь успешно зарегистрирован в Supabase Auth: ${signUpData.user.id}. Создаем профиль...`);
        setSessionUser(signUpData.user); // Устанавливаем сессию

        await createUserProfile(signUpData.user, telegramUser, setDbUser, setStatusMessage, setError);
      }
    } catch (e) {
      setError(e as Error);
      console.error('Ошибка при взаимодействии с Supabase:', e);
      setStatusMessage(`Ошибка: ${(e as Error).message}`);
      setIsSupabaseConnected(false);
    } finally {
      setLoading(false);
    }
  }, [initData, sessionUser]); // Добавил sessionUser в зависимости, чтобы перепроверить если сессия изменилась извне

  // Вспомогательная функция для создания профиля пользователя в public.users
  async function createUserProfile(
    authUser: AuthUser,
    tgUser: any, // Используем any для tgUser здесь тоже, т.к. initData.user это его источник
    setDbUserUpdater: typeof setDbUser,
    setStatusUpdater: typeof setStatusMessage,
    setErrorUpdater: typeof setError
  ) {
    // if (!tgUser) return; // tgUser здесь не может быть null из-за NonNullable
    setStatusUpdater(`Создание записи в public.users для Auth ID: ${authUser.id}, TG ID: ${tgUser.id}`);
    const { data: newUserProfile, error: createUserError } = await supabase
      .from('users')
      .insert({
        id: authUser.id, // Связываем с auth.users
        telegram_id: tgUser.id,
        first_name: tgUser.firstName,
        last_name: tgUser.lastName || null,
        username: tgUser.username || null,
        photo_url: tgUser.photoUrl || null,
        last_login: new Date().toISOString(), // Устанавливаем при создании
      })
      .select()
      .single();

    if (createUserError) {
      console.error('Ошибка при создании пользователя в таблице users:', createUserError);
      // Попытка удалить пользователя из auth, если не удалось создать в public.users?
      // Это сложный кейс, пока просто сообщим об ошибке
      // await supabase.auth.admin.deleteUser(authUser.id) // Требует admin прав
      setErrorUpdater(new Error(`Не удалось создать профиль в таблице users: ${createUserError.message}. Пользователь создан в Auth, но не в профилях.`));
      setStatusUpdater(`Ошибка создания профиля: ${createUserError.message}`);
      return;
    }
    setStatusUpdater('Профиль пользователя успешно создан в таблице users.');
    setDbUserUpdater(newUserProfile);
  }


  useEffect(() => {
    manageUser();
  }, [manageUser]); // manageUser уже обернут в useCallback с нужными зависимостями

  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        console.log('onAuthStateChange event:', _event, 'session:', session);
        const currentAuthUserId = sessionUser?.id;
        const newAuthUserId = session?.user?.id;
        
        setSessionUser(session?.user ?? null);

        // Если сессия изменилась (пользователь вошел/вышел через другой механизм)
        // И это действительно ДРУГОЙ пользователь или его не было, а теперь есть (или наоборот)
        if (currentAuthUserId !== newAuthUserId) {
            // Если есть initData, то manageUser() должен быть основным источником правды
            // и он перезапустится, если initData изменится. 
            // Но если initData нет (не в TG), то эта логика важна.
            const currentInitData = launchParamsSource?.initData;
            if (!currentInitData?.user?.id) {
                if (session?.user) {
                    const { data: userProfile, error: profileError } = await supabase
                        .from('users')
                        .select('*')
                        .eq('id', session.user.id)
                        .single();
                    if (profileError && profileError.code !== 'PGRST116') {
                        setError(profileError);
                        setDbUser(null);
                    } else {
                        setDbUser(userProfile); // Может быть null если не найдено
                        setError(null);
                    }
                } else {
                    setDbUser(null); // Пользователь вышел
                }
            } else {
                // Если есть initData, и сессия изменилась (например, вышел юзер, который был до этого)
                // то нужно запустить manageUser, чтобы он проверил telegramUser и актуализировал dbUser
                // Это может произойти если пользователь разлогинился из Supabase через UI, а потом снова открыл TG апп
                // или если manageUser не отработал корректно при первой загрузке из-за race condition с sessionUser
                console.log('Auth state changed with initData present, re-running manageUser');
                manageUser(); 
            }
        }
      }
    );
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [launchParamsSource, sessionUser, manageUser]); // Добавил manageUser и sessionUser в зависимости

  return { sessionUser, dbUser, loading, error, isSupabaseConnected, statusMessage };
} 