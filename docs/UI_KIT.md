# UI Kit Documentation

## Логические основания
- **Вещь**: UI библиотека для йога приложения на основе дизайна Figma
- **Свойства**: Консистентность, переиспользуемость, типизация, адаптивность
- **Отношения**: Токены ↔ Компоненты, Дизайн ↔ Код, Figma ↔ React

---

## Обзор

UI Kit создан на основе дизайна **app/ Nowa** из Figma и включает в себя:

- **Дизайн токены**: цвета, типографика, отступы, размеры
- **Базовые компоненты**: Button, Card, Tag
- **Ассеты**: иконки, изображения из дизайна
- **TypeScript типизация**: полная типизация всех компонентов

### Источник дизайна
- **Figma файл**: [app/ Nowa](https://www.figma.com/design/x7tx9boUSo5hUKlnQ5vUSk/app--Nowa?node-id=13-2933)
- **Дата извлечения**: 25 декабря 2024
- **Версия UI Kit**: 1.0.0

---

## Установка и использование

### Импорт компонентов
```typescript
import { Button, Card, Tag, colors, typography } from '@/ui';
```

### Импорт токенов
```typescript
import { colors, typography, spacing, theme } from '@/ui/tokens';
```

---

## Дизайн токены

### Цвета

#### Основные цвета
```typescript
colors.primary.white     // #FFFFFF
colors.primary.black     // #191919
colors.primary.accent    // #9747FF
colors.primary.gray      // #414141
```

#### Градиенты для аура эффектов
Система включает градиенты для разных уровней силы (2, 6, 18, 27, 52, 94, 109):

```typescript
colors.gradients.strength2.primary    // Оранжевые тона
colors.gradients.strength18.primary   // Фиолетово-оранжевые
colors.gradients.strength109.primary  // Темные тона
```

### Типографика

#### Шрифты
- **RF Dewi**: основной шрифт для заголовков и UI
- **IBM Plex Mono**: моноширинный для описаний

#### Предустановленные стили
```typescript
typography.textStyles.h1        // Заголовок 1 уровня
typography.textStyles.body      // Основной текст
typography.textStyles.button    // Текст кнопок
typography.textStyles.tag       // Текст тегов
```

### Отступы и размеры

```typescript
spacing[3]    // 8px
spacing[5]    // 16px
spacing[7]    // 24px

borderRadius.sm    // 8px
borderRadius.lg    // 32px
borderRadius.full  // 100px
```

---

## Компоненты

### Button

Кнопка с тремя вариантами из дизайна Figma:

```tsx
<Button variant="default" size="m">
  Обычная кнопка
</Button>

<Button variant="accent" size="s">
  Акцентная кнопка
</Button>

<Button variant="inverted" fullWidth>
  Инвертированная кнопка
</Button>
```

#### Пропсы
- `variant`: 'default' | 'accent' | 'inverted'
- `size`: 's' | 'm'
- `fullWidth`: boolean
- `loading`: boolean
- `icon`: ReactNode

### Card

Карточка с тремя вариантами:

```tsx
<Card 
  variant="library"
  title="Название практики"
  description="Описание практики"
  imageUrl="/path/to/image.jpg"
  duration="15 мин"
  difficulty="2 силы"
  onFavouriteClick={() => {}}
/>

<Card 
  variant="content"
  contentType="video"
  locked={false}
/>

<Card 
  variant="favourite"
  imageUrl="/path/to/bg.jpg"
  title="Избранная практика"
/>
```

#### Пропсы
- `variant`: 'library' | 'content' | 'favourite'
- `title`: string
- `description`: string
- `imageUrl`: string
- `contentType`: 'video' | 'audio' | 'timer'
- `duration`: string
- `difficulty`: string
- `locked`: boolean
- `isFavourite`: boolean

### Tag

Тег для фильтров и меток:

```tsx
<Tag variant="default">
  Обычный тег
</Tag>

<Tag variant="difficulty">
  2 силы
</Tag>

<Tag variant="duration" active onClick={() => {}}>
  15 мин
</Tag>
```

#### Пропсы
- `variant`: 'default' | 'difficulty' | 'duration'
- `size`: 'sm' | 'md'
- `active`: boolean
- `onClick`: () => void

---

## Ассеты

### Иконки (SVG)
Расположены в `public/assets/icons/`:
- `home-icon.svg` - иконка дома
- `settings-icon.svg` - иконка настроек
- `play-icon.svg` - иконка воспроизведения
- `pause-icon.svg` - иконка паузы
- `lock-icon.svg` - иконка блокировки
- `heart-filled-icon.svg` - заполненное сердце
- `heart-outline-icon.svg` - контур сердца
- `arrow-down-icon.svg` - стрелка вниз

### Изображения (PNG)
Расположены в `public/assets/images/`:
- `favourites-card-bg.png` - фон для карточки избранного
- `library-card-bg.png` - фон для карточки библиотеки
- `main-avatar.png` - аватар пользователя

---

## Адаптивность

Все компоненты адаптированы для мобильных устройств (375px):

```css
@media (max-width: 375px) {
  /* Уменьшенные размеры и отступы */
}
```

---

## Примеры использования

### Карточка практики
```tsx
import { Card, Tag } from '@/ui';

<Card
  variant="library"
  title="Медитация на дыхание"
  description="Краткое описание о чем речь, чем будем заниматься"
  imageUrl="/assets/images/practice.jpg"
  duration="15 мин"
  difficulty="2 силы"
  isFavourite={false}
  onFavouriteClick={handleFavourite}
  onClick={handlePracticeClick}
>
  <Tag variant="duration">15 мин</Tag>
  <Tag variant="difficulty">2 силы</Tag>
</Card>
```

### Кнопка с иконкой
```tsx
import { Button } from '@/ui';

<Button 
  variant="accent" 
  size="m"
  icon={<PlayIcon />}
  onClick={handlePlay}
>
  Начать практику
</Button>
```

---

## Расширение UI Kit

### Добавление нового компонента

1. Создать папку в `src/ui/components/NewComponent/`
2. Добавить `NewComponent.tsx` и `NewComponent.css`
3. Экспортировать в `src/ui/components/index.ts`
4. Обновить документацию

### Добавление новых токенов

1. Обновить соответствующий файл в `src/ui/tokens/`
2. Добавить типы TypeScript
3. Обновить `src/ui/tokens/index.ts`

---

## Лучшие практики

1. **Используйте токены**: всегда используйте дизайн токены вместо хардкода
2. **Типизация**: все компоненты полностью типизированы
3. **Консистентность**: следуйте дизайну из Figma
4. **Адаптивность**: тестируйте на мобильных устройствах
5. **Переиспользование**: создавайте композиции из базовых компонентов

---

## Обновления

### Версия 1.0.0 (25.12.2024)
- ✅ Извлечение UI кита из Figma
- ✅ Создание дизайн токенов
- ✅ Базовые компоненты: Button, Card, Tag
- ✅ Загрузка ассетов (иконки, изображения)
- ✅ TypeScript типизация
- ✅ Документация

### Планы на будущее
- [ ] Компоненты навигации (TabBar, TopBar)
- [ ] Компоненты плеера (AudioControl, VideoPlayer)
- [ ] Компоненты календаря (Cell, Calendar)
- [ ] Анимации и переходы
- [ ] Storybook для демонстрации компонентов 