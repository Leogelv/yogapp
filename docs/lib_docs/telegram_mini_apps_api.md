# Telegram Mini Apps API - Документация

## Важные методы API

Данная документация содержит описание ключевых методов Telegram Mini Apps API, необходимых для разработки мини-приложений для Telegram. Особое внимание уделено методам работы с safe area и content safe area.

### Основная терминология

- **Safe Area** - безопасная зона экрана устройства, которая учитывает вырезы, закругленные углы и системные элементы интерфейса. Это пространство всего устройства, где можно безопасно размещать контент без перекрытия системными элементами.

- **Content Safe Area** - подмножество безопасной зоны устройства, специфичное для UI элементов Telegram. Это пространство, где контент не будет перекрываться с элементами интерфейса Telegram.

> **ВАЖНО**: В проекте используется именно **Safe Area** (не Content Safe Area) с добавлением 5 пикселей к каждому отступу для улучшения UX!

## Методы для работы с Safe Area

### `web_app_request_safe_area`

**Доступно с версии**: v8.0

Запрашивает информацию о текущей safe area (безопасной зоне) от Telegram.

В результате Telegram вызывает событие `safe_area_changed`.

Пример использования:
```typescript
import { postEvent } from '@telegram-apps/sdk-react';

postEvent('web_app_request_safe_area');
```

### `web_app_request_content_safe_area`

**Доступно с версии**: v8.0

Запрашивает информацию о текущей content safe area (безопасной зоне контента) от Telegram.

В результате Telegram вызывает событие `content_safe_area_changed`.

Пример использования:
```typescript
import { postEvent } from '@telegram-apps/sdk-react';

postEvent('web_app_request_content_safe_area');
```

## События Safe Area

### `safe_area_changed`

**Доступно с версии**: v8.0

Событие происходит при изменении безопасной зоны в приложении Telegram пользователя, например, при переключении в альбомный режим.

**Safe area** предотвращает перекрытие контента системными элементами UI, такими как выемки или навигационные панели.

| Поле  | Тип      | Описание                                                        |
|-------|----------|----------------------------------------------------------------|
| top   | `number` | Верхний отступ в пикселях                                      |
| bottom| `number` | Нижний отступ в пикселях                                       |
| left  | `number` | Левый отступ в пикселях                                       |
| right | `number` | Правый отступ в пикселях                                      |

### `content_safe_area_changed`

**Доступно с версии**: v8.0

Событие происходит при изменении безопасной зоны контента в приложении Telegram пользователя.

**Content safe area** - это подмножество безопасной зоны устройства, охватывающее UI элементы Telegram.

| Поле  | Тип      | Описание                                                        |
|-------|----------|----------------------------------------------------------------|
| top   | `number` | Верхний отступ в пикселях для области содержимого              |
| bottom| `number` | Нижний отступ в пикселях для области содержимого               |
| left  | `number` | Левый отступ в пикселях для области содержимого               |
| right | `number` | Правый отступ в пикселях для области содержимого              |

## Применение Safe Area в CSS

Для использования значений safe area в CSS, рекомендуется применять CSS переменные. Telegram Mini Apps SDK автоматически создает соответствующие CSS переменные при инициализации:

```css
:root {
  /* Базовые значения Safe Area */
  --safe-area-top: 0px;
  --safe-area-right: 0px;
  --safe-area-bottom: 0px;
  --safe-area-left: 0px;
  
  /* Расчетные значения Safe Area с дополнительными 5 пикселями */
  --safe-area-top-plus: calc(var(--safe-area-top, 0px) + 5px);
  --safe-area-right-plus: calc(var(--safe-area-right, 0px) + 5px);
  --safe-area-bottom-plus: calc(var(--safe-area-bottom, 0px) + 5px);
  --safe-area-left-plus: calc(var(--safe-area-left, 0px) + 5px);
  
  /* Для совместимости также доступны значения Content Safe Area */
  --content-safe-area-top: 0px;
  --content-safe-area-right: 0px;
  --content-safe-area-bottom: 0px;
  --content-safe-area-left: 0px;
}

/* Пример использования переменных (рекомендуемый подход) */
body {
  padding-top: var(--safe-area-top-plus);
  padding-right: var(--safe-area-right-plus);
  padding-bottom: var(--safe-area-bottom-plus);
  padding-left: var(--safe-area-left-plus);
}
```

## Другие полезные методы

### `web_app_request_fullscreen`

**Доступно с версии**: v8.0

Запрашивает полноэкранный режим для мини-приложения.

Пример использования:
```typescript
import { postEvent } from '@telegram-apps/sdk-react';

postEvent('web_app_request_fullscreen');
```

### `web_app_exit_fullscreen`

**Доступно с версии**: v8.0

Запрашивает выход из полноэкранного режима для мини-приложения.

Пример использования:
```typescript
import { postEvent } from '@telegram-apps/sdk-react';

postEvent('web_app_exit_fullscreen');
```

### `web_app_setup_swipe_behavior`

**Доступно с версии**: v7.7

Устанавливает поведение свайпов.

| Поле                | Тип      | Описание                                          |
|----------------------|----------|------------------------------------------------------|
| allow_vertical_swipe | `boolean` | Разрешает закрытие приложения вертикальным свайпом. |

Пример использования:
```typescript
import { postEvent } from '@telegram-apps/sdk-react';

// Отключить вертикальные свайпы для закрытия приложения
postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: false });

// Включить вертикальные свайпы (поведение по умолчанию)
postEvent('web_app_setup_swipe_behavior', { allow_vertical_swipe: true });
```

### `web_app_expand`

Распространяет мини-приложение на весь экран.

Пример использования:
```typescript
import { postEvent } from '@telegram-apps/sdk-react';

postEvent('web_app_expand');
```

## Реализация в проекте

Для корректной работы с safe area в проекте используется следующий подход:

1. При инициализации приложения запрашиваем текущие значения safe area:
```typescript
useEffect(() => {
  postEvent('web_app_request_safe_area');
}, []);
```

2. Добавляем +5px к каждому отступу safe area для улучшения UX:
```css
:root {
  --safe-area-top-plus: calc(var(--safe-area-top, 0px) + 5px);
  --safe-area-right-plus: calc(var(--safe-area-right, 0px) + 5px);
  --safe-area-bottom-plus: calc(var(--safe-area-bottom, 0px) + 5px);
  --safe-area-left-plus: calc(var(--safe-area-left, 0px) + 5px);
}
```

3. Применяем эти расчетные значения в компоненте Page:
```typescript
// Стили для учета отступов safe area с дополнительными 5px
const safeAreaStyle = {
  paddingTop: 'var(--safe-area-top-plus, 5px)',
  paddingRight: 'var(--safe-area-right-plus, 5px)',
  paddingBottom: 'var(--safe-area-bottom-plus, 5px)',
  paddingLeft: 'var(--safe-area-left-plus, 5px)',
};
```

4. Слушаем события изменения значений safe area:
```typescript
useEffect(() => {
  const handleEvents = (event: MessageEvent) => {
    try {
      if (!event.data) return;
      
      const data = typeof event.data === 'string' 
        ? JSON.parse(event.data) 
        : event.data;
        
      if (data.eventType === 'safe_area_changed') {
        // Обработать изменения
        console.log(data.eventType, data.eventData);
        applySafeAreaToCSS(data.eventData);
      }
    } catch (e) {
      console.error('Error parsing event data:', e);
    }
  };
  
  window.addEventListener('message', handleEvents);
  
  return () => {
    window.removeEventListener('message', handleEvents);
  };
}, []);
```

## Ссылки на официальную документацию

- [Telegram Mini Apps Platform Documentation](https://github.com/Telegram-Mini-Apps/telegram-apps/tree/master/apps/docs/platform)
- [Telegram Mini Apps Methods](https://github.com/Telegram-Mini-Apps/telegram-apps/blob/master/apps/docs/platform/methods.md)
- [Telegram Mini Apps Events](https://github.com/Telegram-Mini-Apps/telegram-apps/blob/master/apps/docs/platform/events.md) 