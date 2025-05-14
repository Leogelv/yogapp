/**
 * Скрипт для тестирования инициализации пользователя Telegram в Supabase
 * Запуск: node scripts/create-test-user.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

// Получаем текущую директорию для ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения из .env.local
function loadEnv() {
  try {
    const envPath = path.resolve(process.cwd(), '.env.local');
    const envContent = fs.readFileSync(envPath, 'utf8');
    
    envContent.split('\n').forEach(line => {
      const match = line.match(/^([^=]+)=(.*)$/);
      if (match && match[1] && match[2]) {
        const key = match[1].trim();
        const value = match[2].trim().replace(/^['"]|['"]$/g, ''); // Удаляем кавычки если есть
        process.env[key] = value;
      }
    });
    
    console.log('Переменные окружения загружены успешно из .env.local');
  } catch (error) {
    console.error('Ошибка при загрузке .env.local:', error.message);
    console.log('Продолжаем с текущими env переменными');
  }
}

// Тестовые данные пользователя Telegram (можно изменить для тестирования)
const MOCK_TELEGRAM_USER = {
  id: 123456789,
  first_name: 'Тест',
  last_name: 'Пользователь',
  username: 'testuser',
  photo_url: 'https://t.me/i/userpic/320/example.jpg',
  auth_date: Math.floor(Date.now() / 1000),
  hash: 'test-hash-value',
  language_code: 'ru',
  is_premium: true
};

// Функция для инициализации и создания пользователя в Supabase
async function createTelegramUserWithServiceRole() {
  // Загружаем переменные окружения
  loadEnv();
  
  // Supabase URL и SERVICE_ROLE ключ
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('Необходимо указать NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_KEY в .env.local!');
    return null;
  }

  console.log(`Подключение к Supabase: ${supabaseUrl}`);
  
  // Создаем клиент с сервисным ключом для полного доступа
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  try {
    console.log('Проверяем наличие пользователя...');
    console.log(`Telegram ID: ${MOCK_TELEGRAM_USER.id}`);
    
    // Проверяем, существует ли уже пользователь с этим Telegram ID
    const { data: existingUser, error: checkError } = await supabaseAdmin
      .from('users')
      .select('id, telegram_id, first_name, last_name, username, photo_url, created_at, last_login')
      .eq('telegram_id', MOCK_TELEGRAM_USER.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = не найдено
      console.error('Ошибка при проверке пользователя:', checkError);
      return null;
    }

    if (existingUser) {
      console.log('Пользователь уже существует:', JSON.stringify(existingUser, null, 2));
      
      // Обновляем время последнего входа
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ last_login: new Date().toISOString() })
        .eq('telegram_id', MOCK_TELEGRAM_USER.id);
      
      if (updateError) {
        console.error('Ошибка при обновлении времени входа:', updateError);
      } else {
        console.log('Время последнего входа обновлено');
      }
      
      return existingUser;
    }

    console.log('Пользователь не найден, создаем нового...');

    // Генерируем уникальный email на основе Telegram ID для авторизации
    const email = `${MOCK_TELEGRAM_USER.id}@telegram.user`;
    // Генерируем случайный пароль
    const password = Math.random().toString(36).slice(-12);

    console.log(`Создаем auth пользователя с email: ${email}`);
    
    // Создаем пользователя через Auth API, используя сервисный ключ
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Автоматически подтверждаем email
      user_metadata: {
        telegram_id: MOCK_TELEGRAM_USER.id,
        first_name: MOCK_TELEGRAM_USER.first_name,
        last_name: MOCK_TELEGRAM_USER.last_name,
        username: MOCK_TELEGRAM_USER.username,
        photo_url: MOCK_TELEGRAM_USER.photo_url,
        language_code: MOCK_TELEGRAM_USER.language_code,
        is_premium: MOCK_TELEGRAM_USER.is_premium
      }
    });

    if (authError) {
      console.error('Ошибка при создании пользователя через Auth API:', authError);
      return null;
    }

    if (!authData?.user?.id) {
      console.error('Не удалось получить ID пользователя после создания');
      return null;
    }

    console.log(`Auth пользователь создан с ID: ${authData.user.id}`);
    console.log('Создаем запись в таблице users...');

    // Вставляем пользователя в публичную таблицу users
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        id: authData.user.id,
        telegram_id: MOCK_TELEGRAM_USER.id,
        first_name: MOCK_TELEGRAM_USER.first_name,
        last_name: MOCK_TELEGRAM_USER.last_name || null,
        username: MOCK_TELEGRAM_USER.username || null,
        photo_url: MOCK_TELEGRAM_USER.photo_url || null,
        language_code: MOCK_TELEGRAM_USER.language_code || null,
        is_premium: MOCK_TELEGRAM_USER.is_premium || false,
        last_login: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      console.error('Ошибка при создании пользователя в таблице users:', userError);
      return null;
    }

    console.log('Пользователь успешно создан в таблице users:');
    console.log(JSON.stringify(userData, null, 2));
    
    return userData;
  } catch (error) {
    console.error('Ошибка при создании пользователя:', error);
    return null;
  }
}

// Запуск функции для тестирования
createTelegramUserWithServiceRole()
  .then(result => {
    if (result) {
      console.log('\n✅ Операция выполнена успешно!');
      console.log(`ID: ${result.id}`);
      console.log(`Telegram ID: ${result.telegram_id}`);
      console.log(`Имя: ${result.first_name} ${result.last_name || ''}`);
    } else {
      console.log('\n❌ Операция завершилась с ошибкой');
    }
  })
  .catch(error => {
    console.error('\n❌ Необработанная ошибка:', error);
  }); 