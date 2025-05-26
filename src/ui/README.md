# UI Kit

Локальная UI библиотека на основе дизайна **app/ Nowa** из Figma.

## Быстрый старт

```typescript
import { Button, Card, Tag, colors, typography } from '@/ui';

// Использование компонентов
<Button variant="accent" size="m">Начать практику</Button>
<Card variant="library" title="Медитация" />
<Tag variant="difficulty">2 силы</Tag>

// Использование токенов
const primaryColor = colors.primary.accent; // #9747FF
const titleStyle = typography.textStyles.h1;
```

## Структура

```
src/ui/
├── components/          # Базовые компоненты
│   ├── Button/         # Кнопка с 3 вариантами
│   ├── Card/           # Карточка с 3 вариантами
│   ├── Tag/            # Тег с 3 вариантами
│   └── index.ts
├── tokens/             # Дизайн токены
│   ├── colors.ts       # Цвета и градиенты
│   ├── typography.ts   # Шрифты и стили текста
│   ├── spacing.ts      # Отступы и размеры
│   └── index.ts
├── examples/           # Примеры использования
│   ├── UIKitExample.tsx
│   └── UIKitExample.css
└── index.ts            # Главный экспорт
```

## Компоненты

### Button
- **Варианты**: default, accent, inverted
- **Размеры**: s, m
- **Состояния**: loading, disabled
- **Поддержка**: иконки, fullWidth

### Card
- **Варианты**: library, content, favourite
- **Функции**: избранное, блокировка, типы контента
- **Адаптивность**: мобильные устройства

### Tag
- **Варианты**: default, difficulty, duration
- **Размеры**: sm, md
- **Интерактивность**: кликабельные, активные состояния

## Дизайн токены

### Цвета
- Основные: white, black, accent (#9747FF)
- Градиенты: система для аура эффектов (сила 2-109)
- Состояния: active, disabled, error, success

### Типографика
- **RF Dewi**: основной шрифт
- **IBM Plex Mono**: моноширинный для описаний
- Предустановленные стили: h1, h2, body, button, tag

### Отступы и размеры
- Базовая сетка: 4px, 8px, 16px, 24px, 32px
- Радиусы: 8px, 16px, 32px, 100px
- Размеры компонентов: кнопки, карточки, иконки

## Источник дизайна

- **Figma**: [app/ Nowa](https://www.figma.com/design/x7tx9boUSo5hUKlnQ5vUSk/app--Nowa?node-id=13-2933)
- **Дата**: 25 декабря 2024
- **Версия**: 1.0.0

## Документация

Полная документация доступна в `docs/UI_KIT.md`

## Лицензия

Соответствует лицензии основного проекта 