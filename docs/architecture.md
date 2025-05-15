# Архитектура проекта

## Обзор

Проект представляет собой Telegram Mini App на React, разработанное с использованием следующих технологий:
- React + TypeScript
- @telegram-apps/sdk-react для взаимодействия с Telegram API
- @telegram-apps/telegram-ui для компонентов UI
- TON Connect для интеграции с блокчейном TON
- Vite для сборки
- Supabase для хранения данных пользователей и других сущностей

## Структура файлов

```
reactjs-template
  ├── src
  │   ├── components          # Общие компоненты
  │   ├── css                 # Стили
  │   ├── helpers             # Вспомогательные функции
  │   ├── lib                 # Библиотеки и клиенты внешних сервисов
  │   │   └── supabase        # Клиент и хуки для работы с Supabase
  │   │       ├── client.ts   # Инициализация клиента Supabase
  │   │       ├── types.ts    # Типы данных для Supabase
  │   │       └── hooks       # React хуки для работы с Supabase
  │   ├── navigation          # Маршрутизация
  │   ├── pages               # Страницы приложения
  │   ├── index.tsx           # Точка входа
  │   ├── init.ts             # Инициализация приложения
  │   └── mockEnv.ts          # Мок Telegram окружения для локальной разработки
  ├── public                  # Статические файлы
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
- **DiagnosticsPage** - Страница для диагностики соединения с Supabase и сервером

### Особенности реализации

1. **Получение данных пользователя**
   - Используем `initDataState` из `@telegram-apps/sdk-react` для получения информации о пользователе, включая фото
   
2. **Интеграция с Supabase**
   - Клиент Supabase инициализируется в `src/lib/supabase/client.ts`
   - Хук `useSupabaseUser` проверяет/создает/обновляет пользователя в Supabase на основе данных из Telegram
   - В `IndexPage` отображается статус подключения и данные пользователя из Supabase
   - Реализовано получение списка всех пользователей из таблицы `public.users`
   - Реализована диагностика соединения с Supabase через `DiagnosticsPage`
   
3. **Проверка окружения**
   - Реализована проверка запуска приложения внутри Telegram или в браузере
   - Для браузеров показывается специальное сообщение "Доступно только в приложениях Telegram"
   - Проверку можно отключить через переменную окружения `NEXT_PUBLIC_ALLOW_BROWSER_ACCESS=true`

4. **Функционал fullscreen**
   - Реализовано с использованием методов Telegram Mini Apps API:
     - `web_app_request_fullscreen` - запрос на полноэкранный режим
     - `web_app_exit_fullscreen` - выход из полноэкранного режима

5. **Навигация**
   - Реализована через React Router с использованием HashRouter
   - Маршруты определены в файле `navigation/routes.tsx`

## Структура базы данных

### Таблицы
1. **public.users** - Основная таблица пользователей:
   - `id` - UUID, первичный ключ (генерируется автоматически)
   - `telegram_id` - ID пользователя в Telegram
   - `first_name` - Имя пользователя из Telegram
   - `last_name` - Фамилия пользователя из Telegram
   - `username` - Юзернейм в Telegram (может быть null)
   - `photo_url` - URL фото профиля из Telegram (может быть null)
   - `auth_date` - Дата авторизации из Telegram
   - `hash` - Хеш данных инициализации из Telegram
   - `last_login` - Дата последнего входа (timestamptz)
   - `created_at` - Дата создания записи (timestamptz с default now())
   - `updated_at` - Дата обновления записи (timestamptz с default now())

### Известные особенности и проблемы
- Первоначально таблица `public.users` имела ограничение внешнего ключа `users_id_fkey`, связывающее поле `id` с `auth.users.id`. Это вызывало ошибки при создании пользователей, так как auth.users не содержала соответствующих записей. Ограничение было удалено.
- Для корректной работы приложения в браузере (в режиме разработки или тестирования) необходимо установить переменную окружения `NEXT_PUBLIC_ALLOW_BROWSER_ACCESS=true`.

## Специальные методы Telegram

В проекте используются следующие методы Telegram Mini Apps API:
- `postEvent('web_app_request_fullscreen')` - запрос на полноэкранный режим
- `postEvent('web_app_exit_fullscreen')` - выход из полноэкранного режима
- `initDataState` и `initDataRaw` - для получения данных пользователя от Telegram

## Переменные окружения

Проект использует следующие переменные окружения:
- `NEXT_PUBLIC_SUPABASE_URL` - URL Supabase API
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Публичный ключ Supabase для анонимного доступа
- `NEXT_PUBLIC_ALLOW_BROWSER_ACCESS` - Флаг, позволяющий отключить проверку окружения Telegram (true/false)
- `NEXT_PUBLIC_IGNORE_BUILD_ERROR` - Флаг для игнорирования ошибок сборки
- `SUPABASE_PROJECT_ID` - ID проекта Supabase
- `SUPABASE_PROJECT_URL` - URL проекта Supabase
- `SUPABASE_SERVICE_KEY` - Сервисный ключ Supabase (с правами администратора)
- `VITE_SUPABASE_URL` - URL Supabase для Vite
- `VITE_SUPABASE_ANON_KEY` - Анонимный ключ Supabase для Vite

### Особенности деплоя
- Все перечисленные выше переменные окружения должны быть установлены в Vercel.
- При локальной разработке переменные хранятся в файле `.env.local`.
- Для деплоя на Vercel используется CLI команда `vercel deploy --prod`.

## Последняя верификация

Структура проекта верифицирована: 15.05.2025 

## Realtime обновления и оптимизации

### Принцип работы Realtime соединения

В проекте активно используется Supabase Realtime для обеспечения актуальности данных на клиенте. Realtime компонент работает через WebSocket соединение и уведомляет клиентов об изменениях в таблицах базы данных в режиме реального времени.

1. **Типы подписок в проекте:**
   - Подписка на изменения в профиле текущего пользователя (`subscribeToUserChanges` в `client.ts`)
   - Общая подписка на таблицу users для отображения списка всех пользователей
   - Мониторинг статуса Realtime соединения через системные события и presence

2. **Потенциальные проблемы:**
   - Каскадные обновления: изменение записи пользователя может вызвать множественные события
   - Избыточные запросы из-за частых событий Realtime
   - Цикличные обновления (A обновляет B, B вызывает обновление A и т.д.)

### Оптимизации и паттерны

Для предотвращения проблем с Realtime обновлениями применены следующие оптимизации:

1. **Debounce и throttling:**
   - В хуке `useSupabaseUser`: debounce обновлений состояния с задержкой 300 мс
   - В `IndexPage`: throttling обновлений списка пользователей с минимальным интервалом 2 секунды

2. **Отслеживание дубликатов:**
   - Хранение ID и времени последнего обновления
   - Фильтрация повторных событий с одинаковыми данными
   - Игнорирование обновлений, слишком близких по времени

3. **Управление жизненным циклом подписок:**
   - Корректное создание/удаление подписок при монтировании/размонтировании компонентов
   - Явная очистка всех таймеров при размонтировании
   - Использование useRef для хранения ссылок на подписки

4. **Оптимизация потоков данных:**
   - Контролируемые обновления состояния с проверкой необходимости обновления
   - Предотвращение каскадных обновлений через проверку и обновление флагов состояния
   - Логирование всех событий для диагностики и отладки

### Пример паттерна обработки Realtime событий:

```typescript
// 1. Создание и хранение ссылок
const channelRef = useRef<RealtimeChannel | null>(null);
const lastUpdateTimeRef = useRef<number>(0);

// 2. Настройка подписки
channelRef.current = supabase.channel('channel-name')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'tablename',
  }, (payload) => {
    // 3. Проверка и фильтрация событий
    const now = Date.now();
    if (now - lastUpdateTimeRef.current < 200) {
      return; // Игнорируем слишком частые обновления
    }
    
    // 4. Обновление через debounce
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(() => {
      // 5. Здесь выполняем обновление состояния
      setState(newState);
      debounceTimerRef.current = null;
    }, 300);
    
    lastUpdateTimeRef.current = now;
  })
  .subscribe();

// 6. Очистка при размонтировании
useEffect(() => {
  return () => {
    if (channelRef.current) {
      channelRef.current.unsubscribe();
    }
    if (debounceTimerRef.current !== null) {
      clearTimeout(debounceTimerRef.current);
    }
  };
}, []);
``` 