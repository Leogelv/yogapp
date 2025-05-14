# Архитектура проекта

## Обзор

Проект представляет собой Telegram Mini App на React, разработанное с использованием следующих технологий:
- React + TypeScript
- @telegram-apps/sdk-react для взаимодействия с Telegram API
- @telegram-apps/telegram-ui для компонентов UI
- TON Connect для интеграции с блокчейном TON
- **Supabase** для бэкенда и базы данных
- Vite для сборки

## Структура файлов

```
reactjs-template
  ├── src
  │   ├── components          # Общие компоненты
  │   ├── css                 # Стили
  │   ├── helpers             # Вспомогательные функции
  │   ├── lib                 # Библиотеки и утилиты
  │   │   └── supabase        # Клиент и хуки для Supabase
  │   │       ├── supabaseClient.ts
  │   │       └── useSupabaseAuth.ts
  │   ├── navigation          # Маршрутизация
  │   ├── pages               # Страницы приложения
  │   ├── index.tsx           # Точка входа
  │   ├── init.ts             # Инициализация приложения
  │   └── mockEnv.ts          # Мок Telegram окружения для локальной разработки
  ├── public                  # Статические файлы
  ├── docs                    # Документация
  │   ├── architecture.md     # Этот файл
  │   ├── SHORT_PLANNING.md   # Краткосрочное планирование
  │   └── TASK.md             # Управление задачами
  └── ...                     # Другие конфигурационные файлы
```

## Основные компоненты

### Страницы

- **IndexPage** - Главная страница с навигацией по доступным функциям
- **ProfilePage** - Страница профиля пользователя с фото и функцией fullscreen
- **InitDataPage** - Страница для отображения данных initData от Telegram
- **LaunchParamsPage** - Страница с параметрами запуска приложения
- **ThemeParamsPage** - Страница с параметрами темы Telegram
- **TONConnectPage** - Страница для подключения TON кошелька

### Особенности реализации

1. **Получение данных пользователя**
   - Используем `initDataState` из `@telegram-apps/sdk-react` для получения информации о пользователе, включая фото
   
2. **Функционал fullscreen**
   - Реализовано с использованием методов Telegram Mini Apps API:
     - `web_app_request_fullscreen` - запрос на полноэкранный режим
     - `web_app_exit_fullscreen` - выход из полноэкранного режима

3. **Навигация**
   - Реализована через React Router с использованием HashRouter
   - Маршруты определены в файле `navigation/routes.tsx`

## Специальные методы Telegram

В проекте используются следующие методы Telegram Mini Apps API:
- `postEvent('web_app_request_fullscreen')` - запрос на полноэкранный режим
- `postEvent('web_app_exit_fullscreen')` - выход из полноэкранного режима

## Интеграция с Supabase

Проект интегрирован с Supabase для управления пользователями и данными.

### Ключевые файлы интеграции:

-   **`src/lib/supabase/supabaseClient.ts`**: Инициализирует клиент Supabase с использованием переменных окружения `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Экспортирует инстанс клиента и TypeScript тип `DbUser`.
-   **`src/lib/supabase/useSupabaseAuth.ts`**: Кастомный React хук. Принимает `launchParams` (полученные через `retrieveLaunchParams()` в вызывающем компоненте) и выполняет следующую логику при монтировании и изменении `launchParams` или сессии Supabase:
    1.  **Извлечение `initData`**: Безопасно извлекает `initData` из `launchParams`.
    2.  **Проверка существующей сессии Supabase**: Пытается получить `currentUser` из `supabase.auth.getUser()`.
    3.  **Обработка пользователя Telegram (`initData.user`):**
        *   Если `initData.user` доступен:
            *   **Поиск в `public.users`**: Ищет пользователя по `telegram_id`.
            *   **Если найден:**
                *   Обновляет `first_name`, `last_name`, `username`, `photo_url` в `public.users` на основе данных из `initData.user`.
                *   Обновляет `last_login`.
                *   Устанавливает `dbUser` и `sessionUser` (если ID совпадают).
            *   **Если НЕ найден:**
                *   Генерирует email: `${telegram_id}@telegram.user` и случайный пароль.
                *   **`supabase.auth.signUp()`**: Регистрирует нового пользователя в Supabase Auth. В `options.data` передаются `telegram_id` и другие данные из `initData.user` для `raw_user_meta_data`.
                *   **Обработка ошибки "User already registered"**: Если `signUp` не удался из-за существующего Auth пользователя, выполняется `supabase.auth.signInWithPassword()` с теми же кредами.
                *   **Создание профиля в `public.users`**: После успешного `signUp` или `signIn` (если юзер был только в Auth), берется `id` из `AuthUser` и создается новая запись в `public.users` со всеми данными из `initData.user`.
                *   Устанавливает `dbUser` (новый профиль) и `sessionUser`.
        *   Если `initData.user` НЕ доступен (например, приложение открыто вне Telegram):
            *   Если есть активная сессия Supabase (`sessionUser`), пытается загрузить профиль из `public.users` по `sessionUser.id`.
    4.  **Состояния**: Хук возвращает `dbUser`, `sessionUser`, `loading`, `error`, `isSupabaseConnected`, и `statusMessage` для отображения прогресса/результатов операций.
    5.  **Подписка на `onAuthStateChange`**: Обновляет `sessionUser` и при необходимости перезагружает `dbUser` или вызывает `manageUser`.

### Таблица `public.users`

Основная таблица для хранения пользовательских данных, связанных с их Telegram ID.
-   `id` (UUID, PK, FK to `auth.users.id`)
-   `telegram_id` (BIGINT, UNIQUE)
-   `first_name` (TEXT)
-   `last_name` (TEXT, nullable)
-   `username` (TEXT, nullable)
-   `photo_url` (TEXT, nullable)
-   `created_at` (TIMESTAMPTZ)
-   `updated_at` (TIMESTAMPTZ)
-   `last_login` (TIMESTAMPTZ)

RLS (Row Level Security) на данный момент отключена для этой таблицы для упрощения разработки начального этапа.

### Переменные окружения

Для работы с Supabase необходимы следующие переменные в `.env.local`:
-   `NEXT_PUBLIC_SUPABASE_URL`: URL вашего проекта Supabase.
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Публичный anon ключ вашего проекта Supabase.

(Для административных операций, таких как создание пользователя в обход стандартного `signUp` через серверный код, потребовался бы `SUPABASE_SERVICE_KEY`, который в текущей клиентской интеграции не используется напрямую).

### Отображение на `IndexPage`

Страница `src/pages/IndexPage/IndexPage.tsx`:
-   Получает `launchParams` при инициализации с помощью `retrieveLaunchParams()`.
-   Передает `launchParams` в хук `useSupabaseAuth`.
-   Отображает статус подключения, прогресс (`statusMessage`), информацию о текущем пользователе (`dbUser`, `sessionUser`).
-   Выводит список всех пользователей из `public.users`.

## Последняя верификация

Структура проекта верифицирована: $(date +'%Y-%m-%d') 