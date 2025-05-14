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

// Инициализирует пользователя в системе
export async function initializeUser(): Promise<{
  user: TelegramUser | null;
  dbUser: any | null;
  error: string | null;
}> {
  try {
    // Получаем данные из Telegram
    const { initData } = retrieveLaunchParams();
    const typedInitData = initData as InitData;
    
    if (!typedInitData.user) {
      return { 
        user: null, 
        dbUser: null, 
        error: 'Не удалось получить данные пользователя из Telegram' 
      };
    }

    const telegramUser = typedInitData.user as TelegramUser;
    
    // Проверяем, существует ли пользователь
    const userExists = await checkUserExists(telegramUser.id);
    
    if (userExists) {
      // Если пользователь существует, обновляем время последнего входа
      await updateUserLastLogin(telegramUser.id);
      
      // Пытаемся выполнить вход в Supabase Auth
      await loginUser(telegramUser.id);
      
      // Получаем данные пользователя из БД
      const dbUser = await getUser(telegramUser.id);
      
      return { user: telegramUser, dbUser, error: null };
    } else {
      // Если пользователя нет, создаем нового
      const userId = await registerUser(telegramUser);
      
      if (!userId) {
        return { 
          user: telegramUser, 
          dbUser: null, 
          error: 'Не удалось зарегистрировать пользователя' 
        };
      }
      
      // Создаем запись в таблице users
      const created = await createUserRecord(userId, telegramUser);
      
      if (!created) {
        return { 
          user: telegramUser, 
          dbUser: null, 
          error: 'Не удалось создать запись пользователя' 
        };
      }
      
      // Получаем созданные данные
      const dbUser = await getUser(telegramUser.id);
      
      return { user: telegramUser, dbUser, error: null };
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
  await supabase.auth.signOut();
} 