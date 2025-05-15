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

### Особенности реализации

1. **Получение данных пользователя**
   - Используем `initDataState` из `@telegram-apps/sdk-react` для получения информации о пользователе, включая фото
   
2. **Интеграция с Supabase**
   - Клиент Supabase инициализируется в `src/lib/supabase/client.ts`
   - Хук `useSupabaseUser` проверяет/создает/обновляет пользователя в Supabase на основе данных из Telegram
   - В `IndexPage` отображается статус подключения и данные пользователя из Supabase
   - Реализовано получение списка всех пользователей из таблицы `public.users`
   
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

## Последняя верификация

Структура проекта верифицирована: 08.07.2024 