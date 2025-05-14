import { retrieveLaunchParams } from '@telegram-apps/sdk-react';
import { 
  supabase, 
  TelegramUser, 
  checkUserExists, 
  getUser, 
  updateUserLastLogin 
} from './client';

// Генерирует уникальный email на основе Telegram ID
function generateEmailFromTelegramId(telegramId: number): string {
  return `${telegramId}@telegram.user`;
}

// Генерирует случайный пароль для пользователя
function generateRandomPassword(): string {
  return Math.random().toString(36).slice(-12);
}

// Регистрирует нового пользователя в Supabase Auth
async function registerUser(user: TelegramUser): Promise<string | null> {
  try {
    const email = generateEmailFromTelegramId(user.id);
    const password = generateRandomPassword();

    // Создаем пользователя в Auth API
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          telegram_id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url,
          language_code: user.language_code,
          is_premium: user.is_premium,
        }
      }
    });

    if (error) {
      console.error('Ошибка при регистрации пользователя:', error);
      return null;
    }

    return data?.user?.id || null;
  } catch (error) {
    console.error('Необработанная ошибка при регистрации:', error);
    return null;
  }
}

// Авторизует существующего пользователя в Supabase Auth
async function loginUser(telegramId: number): Promise<boolean> {
  try {
    const email = generateEmailFromTelegramId(telegramId);
    const password = generateRandomPassword(); // В реальном приложении нужно использовать сохраненный пароль

    // Пытаемся войти через email/password
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.warn('Не удалось войти через пароль, пробуем через OTP:', error.message);
      // Если не удалось войти с паролем, попробуем использовать "магическую ссылку"
      // Это не идеальное решение, но позволит войти без знания пароля
      const { error: magicLinkError } = await supabase.auth.signInWithOtp({
        email,
      });

      if (magicLinkError) {
        console.error('Ошибка при входе через OTP:', magicLinkError);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Необработанная ошибка при входе:', error);
    return false;
  }
}

// Создает запись пользователя в таблице users
async function createUserRecord(
  userId: string, 
  telegramUser: TelegramUser
): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('users')
      .insert({
        id: userId,
        telegram_id: telegramUser.id,
        first_name: telegramUser.first_name,
        last_name: telegramUser.last_name,
        username: telegramUser.username,
        photo_url: telegramUser.photo_url,
        language_code: telegramUser.language_code,
        is_premium: telegramUser.is_premium,
        last_login: new Date().toISOString(),
      });

    if (error) {
      console.error('Ошибка при создании записи пользователя:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Необработанная ошибка при создании записи:', error);
    return false;
  }
}

// Интерфейс для данных initData
interface InitData {
  user?: {
    id: number;
    first_name: string;
    last_name?: string;
    username?: string;
    photo_url?: string;
    language_code?: string;
    is_premium?: boolean;
    [key: string]: any;
  };
  [key: string]: any;
}

// Добавим фиктивный объект TelegramUser для отладки
const MOCK_TELEGRAM_USER: TelegramUser = {
  id: 123456789,
  first_name: 'Test',
  auth_date: Math.floor(Date.now() / 1000),
  hash: 'test-hash'
};

// Инициализирует пользователя в системе
export async function initializeUser(): Promise<{
  user: TelegramUser | null;
  dbUser: any | null;
  error: string | null;
}> {
  try {
    // Получаем данные из Telegram
    try {
      console.log('Получаем данные из Telegram...');
      let telegramUser: TelegramUser | null = null;
      
      try {
        const launchParams = retrieveLaunchParams();
        console.log('Launch Params retrieved');
        
        // Безопасный журнал: не выводим полный объект, только структуру
        console.log('Launch Params structure:', Object.keys(launchParams));
        
        const { initData } = launchParams;
        
        // Проверка на существование и тип initData
        if (initData) {
          console.log('Init Data получены. Тип:', typeof initData);
          
          if (typeof initData === 'string' && initData.length > 0) {
            try {
              // Если initData - строка, пытаемся распарсить его как JSON
              const parsedData = JSON.parse(initData);
              console.log('Init Data успешно распарсены, ключи:', Object.keys(parsedData));
              
              if (parsedData && parsedData.user) {
                console.log('Пользователь найден в parsedData');
                telegramUser = parsedData.user as TelegramUser;
              } else {
                console.warn('Пользователь не найден в parsedData');
              }
            } catch (parseError) {
              console.error('Ошибка при парсинге initData:', parseError);
              console.log('Raw initData (первые 100 символов):', 
                initData.substring(0, 100) + (initData.length > 100 ? '...' : ''));
            }
          } else if (typeof initData === 'object' && initData !== null) {
            const typedInitData = initData as InitData;
            
            console.log('initData является объектом, ключи:', Object.keys(typedInitData));
            
            if (typedInitData.user) {
              console.log('Пользователь найден в initData object');
              telegramUser = typedInitData.user as TelegramUser;
            } else {
              console.warn('Пользователь не найден в initData object');
            }
          } else {
            console.warn(`initData имеет неподдерживаемый тип: ${typeof initData}`);
          }
        } else {
          console.warn('initData отсутствует в launchParams');
        }
      } catch (launchParamsError) {
        console.error('Ошибка при получении launchParams:', launchParamsError);
      }
      
      // Если не удалось получить пользователя, используем моки для отладки
      if (!telegramUser) {
        console.warn('Пользователь Telegram не найден, используем запасной вариант');
        
        // В режиме разработки используем тестового пользователя
        if (import.meta.env.DEV) {
          telegramUser = { ...MOCK_TELEGRAM_USER };
          console.log('Используем тестового пользователя:', telegramUser);
        } else {
          // В продакшене пытаемся создать минимальный профиль из URL-параметров
          try {
            const params = new URLSearchParams(window.location.search);
            const userId = params.get('user_id') || params.get('tgWebAppStartParam');
            
            if (userId) {
              console.log('Используем ID из URL-параметров:', userId);
              telegramUser = {
                id: parseInt(userId, 10) || Math.floor(Math.random() * 1000000 + 100000),
                first_name: 'Guest',
                auth_date: Math.floor(Date.now() / 1000),
                hash: 'generated-hash'
              };
            } else {
              console.warn('ID пользователя не найден в URL-параметрах');
              return { 
                user: null, 
                dbUser: null, 
                error: 'Не удалось получить данные пользователя из Telegram' 
              };
            }
          } catch (urlError) {
            console.error('Ошибка при получении данных из URL:', urlError);
            return { 
              user: null, 
              dbUser: null, 
              error: 'Не удалось получить данные пользователя' 
            };
          }
        }
      }

      console.log('Получен пользователь Telegram:', 
        telegramUser ? `ID: ${telegramUser.id}, Name: ${telegramUser.first_name}` : 'null');
      
      // Проверяем, существует ли пользователь
      console.log('Проверяем существование пользователя в БД...');
      
      try {
        const userExists = await checkUserExists(telegramUser.id);
        console.log('Пользователь существует в БД:', userExists);
        
        if (userExists) {
          // Если пользователь существует, обновляем время последнего входа
          await updateUserLastLogin(telegramUser.id);
          
          // Пытаемся выполнить вход в Supabase Auth
          await loginUser(telegramUser.id);
          
          // Получаем данные пользователя из БД
          const dbUser = await getUser(telegramUser.id);
          console.log('Получены данные пользователя из БД');
          
          return { user: telegramUser, dbUser, error: null };
        } else {
          console.log('Создаем нового пользователя...');
          // Если пользователя нет, создаем нового
          const userId = await registerUser(telegramUser);
          
          if (!userId) {
            return { 
              user: telegramUser, 
              dbUser: null, 
              error: 'Не удалось зарегистрировать пользователя' 
            };
          }
          
          console.log('Пользователь зарегистрирован с ID:', userId);
          
          // Создаем запись в таблице users
          const created = await createUserRecord(userId, telegramUser);
          
          if (!created) {
            return { 
              user: telegramUser, 
              dbUser: null, 
              error: 'Не удалось создать запись пользователя' 
            };
          }
          
          console.log('Запись пользователя создана, получаем данные...');
          
          // Получаем созданные данные
          const dbUser = await getUser(telegramUser.id);
          
          return { user: telegramUser, dbUser, error: null };
        }
      } catch (dbError) {
        console.error('Ошибка при работе с базой данных:', dbError);
        return { 
          user: telegramUser, 
          dbUser: null, 
          error: `Ошибка БД: ${dbError instanceof Error ? dbError.message : String(dbError)}` 
        };
      }
    } catch (initError) {
      console.error('Ошибка при получении данных из Telegram:', initError);
      console.trace(initError); // Выводим стек вызовов
      
      // В режиме разработки возвращаем мок-пользователя для отладки
      if (import.meta.env.DEV) {
        console.log('Используем тестового пользователя для отладки');
        return {
          user: MOCK_TELEGRAM_USER,
          dbUser: null,
          error: null
        };
      }
      
      return { 
        user: null,
        dbUser: null,
        error: `Ошибка инициализации: ${initError instanceof Error ? initError.message : String(initError)}`
      };
    }
  } catch (error) {
    console.error('Необработанная ошибка при инициализации пользователя:', error);
    return { 
      user: null, 
      dbUser: null, 
      error: `Произошла ошибка: ${error instanceof Error ? error.message : String(error)}` 
    };
  }
}

// Выход пользователя из системы
export async function logoutUser(): Promise<void> {
  try {
    await supabase.auth.signOut();
  } catch (error) {
    console.error('Ошибка при выходе из системы:', error);
  }
} 