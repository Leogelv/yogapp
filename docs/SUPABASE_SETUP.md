# Настройка Supabase в проекте

## Переменные окружения

Для работы с Supabase необходимо настроить следующие переменные окружения в файле `.env.local`:

```bash
# Основные переменные для сборки
NEXT_PUBLIC_IGNORE_BUILD_ERROR=true
VITE_IGNORE_BUILD_ERROR=true

# Supabase конфигурация
SUPABASE_PROJECT_ID=moxwendgxxvhbesajomc
SUPABASE_PROJECT_URL=https://moxwendgxxvhbesajomc.supabase.co
NEXT_PUBLIC_SUPABASE_URL=https://moxwendgxxvhbesajomc.supabase.co
VITE_SUPABASE_URL=https://moxwendgxxvhbesajomc.supabase.co

# Анонимный ключ API для клиентского доступа
# Создается в Supabase Dashboard -> Project Settings -> API
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Сервисный ключ API для административного доступа
# Используется только на сервере или в скриптах
# ВАЖНО: Никогда не публикуйте этот ключ в клиентском коде!
SUPABASE_SERVICE_KEY=your-service-key-here
```

## Создание схемы базы данных

1. Войдите в [Supabase Dashboard](https://app.supabase.io/) и выберите ваш проект
2. Перейдите в раздел SQL Editor
3. Создайте новый запрос и выполните SQL-скрипт из файла `scripts/supabase-schema.sql`

Скрипт создаст:
- Таблицу `users` для хранения информации о пользователях Telegram
- Настроит Row Level Security (RLS) для защиты данных
- Создаст триггер для автоматического обновления поля `updated_at`

## Тестирование инициализации пользователя

Для тестирования процесса создания пользователя выполните:

```bash
node scripts/create-test-user.js
```

Этот скрипт:
1. Загрузит переменные окружения из .env.local
2. Создаст тестового пользователя Telegram в Supabase
3. Обновит время последнего входа, если пользователь уже существует

## Аутентификация

В приложении используется следующий механизм аутентификации:

1. Получаем данные пользователя Telegram через SDK:
   ```typescript
   const { initData } = retrieveLaunchParams();
   ```

2. На основе Telegram ID создаем пользователя в Supabase Auth
   ```
   email: ${telegramId}@telegram.user
   password: [случайная строка]
   ```

3. Создаем запись в таблице users

4. При последующих входах проверяется наличие пользователя по Telegram ID
   и обновляется время последнего входа

## Структура интеграции

- `src/lib/supabase/client.ts` - Клиент Supabase и основные типы
- `src/lib/supabase/auth.ts` - Функции для аутентификации
- `src/lib/supabase/context.tsx` - React Context для использования в компонентах
- `scripts/create-test-user.js` - Скрипт для тестирования инициализации
- `scripts/supabase-schema.sql` - SQL скрипт для создания схемы БД

## Использование в компонентах

```typescript
import { useSupabase } from '@/lib/supabase/context';

function MyComponent() {
  const { user, telegramUser, loading, error } = useSupabase();
  
  if (loading) return <Spinner />;
  if (error) return <ErrorMessage message={error} />;
  if (!user) return <NotAuthenticated />;

  return (
    <div>
      <h1>Привет, {user.first_name}!</h1>
      <p>Последний вход: {new Date(user.last_login).toLocaleString()}</p>
    </div>
  );
}
``` 