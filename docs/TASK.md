# Задачи по разработке приложения

## Отдел "UI Kit и Дизайн Система"

### Создание UI Kit из Figma дизайна

#### Задачи
- 🟢 **Извлечь UI кит из Figma дизайна**
  - Получить данные из Figma файла https://www.figma.com/design/x7tx9boUSo5hUKlnQ5vUSk/app--Nowa?node-id=13-2933
  - Проанализировать компоненты, цветовую схему, типографику
  - Сохранить все необходимые ассеты (иконки, логотипы, изображения) в public/
  
- 🟢 **Создать локальную UI библиотеку**
  - Создать компоненты кнопок, карточек, инпутов по дизайну
  - Реализовать цветовую схему и типографику
  - Создать storybook или документацию компонентов
  
- 🟢 **Обновить документацию**
  - Описать новые UI компоненты в архитектуре
  - Создать гайд по использованию UI кита
  - Обновить стандарты дизайна

#### Обнаружено в ходе работы
- 🟢 Извлечены все основные дизайн токены из Figma (цвета, типографика, отступы)
- 🟢 Создана система градиентов для аура эффектов (сила 2-109)
- 🟢 Загружены ключевые иконки и изображения из дизайна
- 🟢 Реализована полная TypeScript типизация всех компонентов
- 🟢 Создана адаптивная система для мобильных устройств (375px)

#### Выполненные изменения
- Создана структура UI библиотеки в `src/ui/`
- Реализованы дизайн токены: `colors.ts`, `typography.ts`, `spacing.ts`
- Созданы базовые компоненты: `Button`, `Card`, `Tag`
- Загружены ассеты в `public/assets/icons/` и `public/assets/images/`
- Создана документация `docs/UI_KIT.md`
- Обновлена архитектура проекта с информацией о UI ките
- Добавлена система экспорта компонентов и токенов

## Отдел "Навигация и UX"

### Исправление навигации и дублирования категорий

#### Задачи
- 🟢 **Исправить дублирование категории "Дыхание"**
  - В LibraryPage.tsx категория "breathing" дублируется в mainCategories и allCategories
  - Убрать дублирование из массива allCategories
  
- 🟢 **Редизайн нижнего меню (TabBar)**
  - Исправить кропание иконок
  - Добавить подписи под иконками
  - Улучшить отзывчивость и читаемость
  
- 🟢 **Проверить навигацию назад во всех страницах**
  - Убедиться что везде используется телеграмовская навигация через Page компонент
  - Проверить что back={false} установлен корректно для главных страниц

#### Обнаружено в ходе работы
- 🟢 Дублирование категории "Дыхание" в LibraryPage.tsx (строки 13 и 20) - ИСПРАВЛЕНО
- 🟢 TabBar иконки могут кропаться на некоторых устройствах - ИСПРАВЛЕНО
- 🟢 Нужно улучшить читаемость подписей в TabBar - ИСПРАВЛЕНО

#### Выполненные изменения
- Убрано дублирование категории "Дыхание" из allCategories в LibraryPage.tsx
- Увеличена высота TabBar с 56px до 70px для лучшего отображения
- Увеличены размеры иконок с 22px до 24px
- Увеличен размер шрифта подписей с 11px до 12px
- Добавлен font-weight: 500 для лучшей читаемости
- Изменен overflow с hidden на visible для предотвращения кропания
- Добавлен gap между иконкой и текстом
- Добавлены эффекты для активного состояния (scale и font-weight)
- Обновлены отступы в Page.tsx и Page.css для новой высоты TabBar
- **ИСПРАВЛЕНА КНОПКА НАЗАД**: Убрана собственная кнопка "← Назад" из LibraryPage, теперь используется только телеграмовская навигация
- Добавлен кастомный обработчик onBackClick в Page компонент для гибкой настройки поведения кнопки назад
- Удалены неиспользуемые стили .back-button из LibraryPage.css

## Отдел "Библиотека"

### Обновление раздела "Библиотека" по дизайну из скриншотов 

#### Задачи
- 🟢 Обновить LibraryPage.tsx в соответствии с новым дизайном
- 🟢 Обновить LibraryPage.css с новыми стилями
- 🟢 Обновить FavoritesPage.tsx для соответствия новому дизайну
- 🟢 Обновить FavoritesPage.css с новыми стилями
- 🟢 Добавить модель данных для сложности практик (difficulty)
- 🟢 Обновить useContents.ts для поддержки фильтрации по длительности
- 🟢 Обновить TabBar для соответствия скриншотам

#### Обнаружено в ходе работы
- 🟡 Ошибки сборки в AutoPlayPracticePage.tsx (не связано с библиотекой)

### Общий функционал
- Фильтрация по категориям (Все, Тело, Медитация, База, Дыхание)
- Фильтрация по времени (до 7 минут, 7-20 минут, 20-40 минут, 40-60 минут)
- Отображение карточек практик с информацией:
  - Превью
  - Длительность
  - Тип медиа (Видео/Аудио)
  - Уровень сложности ("N силы")
  - Название
  - Описание
  - Кнопка добавления в избранное
- Страница Избранного с аналогичными фильтрами и отображением

## Предстоящие задачи
- Доработать страницу практики
- Настроить плееры (видео, аудио, таймер)
- Исправить ошибки в AutoPlayPracticePage.tsx
- Настроить навигацию по всему приложению

# Task Board: Kinescope Player Refactor & Practice Page Optimization

**Date Created:** July 26, 2024

## Current Sprint Objective:
Refactor Kinescope player logic from Admin panel to client-side PlayerContext/Widget, ensuring correct video playback on PracticePage and addressing performance issues.

---

## Tasks:

### 🚀 Feature: Kinescope Player Integration (Client-Side)

1.  **Investigate Admin Panel Kinescope Implementation** 🔴
    *   Description: Analyze `AdminPage.tsx` to understand how `handleVideoPreview` and Kinescope player (iframe or library) are used.
    *   Files: `src/pages/AdminPage/AdminPage.tsx`
    *   Status: 🔴 Not Started
2.  **Investigate Client-Side Player Logic** 🔴
    *   Description: Review `PlayerContext.tsx` and `Player.tsx` to understand current state management and rendering for different practice types.
    *   Files: `src/contexts/PlayerContext.tsx`, `src/components/Player/Player.tsx`
    *   Status: 🔴 Not Started
3.  **Investigate Practice Page Performance** 🔴
    *   Description: Analyze `PracticePage.tsx` for sources of lag and inefficient data handling when a practice card is opened.
    *   Files: `src/pages/PracticePage/PracticePage.tsx`
    *   Status: 🔴 Not Started
4.  **Search for Kinescope Vite Adapter** 🔴
    *   Description: Google for `@kinescope/react-vite` or similar official/community packages for Kinescope integration in Vite projects.
    *   Status: 🔴 Not Started
5.  **Update PlayerContext for Kinescope** 🔴
    *   Description: Add state for Kinescope video ID, player instance. Modify functions to handle 'video' contentType and `kinescope_id`.
    *   Files: `src/contexts/PlayerContext.tsx`
    *   Depends on: Task 1, 2, 4
    *   Status: 🔴 Not Started
6.  **Update PlayerWidget for Kinescope** 🔴
    *   Description: Conditionally render Kinescope player using the appropriate library. Ensure audio/timer players are not affected.
    *   Files: `src/components/Player/Player.tsx`
    *   Depends on: Task 4, 5
    *   Status: 🔴 Not Started
7.  **Refactor PracticePage for Player Integration** 🔴
    *   Description: Ensure `PracticePage` correctly passes practice data to `PlayerContext` and optimize rendering.
    *   Files: `src/pages/PracticePage/PracticePage.tsx`
    *   Depends on: Task 3, 5, 6
    *   Status: 🔴 Not Started
8.  **Remove `getKinescopeVideoMetadata`** 🔴
    *   Description: Delete the non-functional `getKinescopeVideoMetadata` from `kinescopeService.ts`.
    *   Files: `src/lib/kinescopeService.ts`
    *   Status: 🔴 Not Started

### ✅ Verification & Testing

9.  **Test Kinescope on PracticePage** 🔴
    *   Description: Verify Kinescope videos play correctly from the `PracticePage`.
    *   Depends on: Task 7
    *   Status: 🔴 Not Started
10. **Test Audio/Timer on PracticePage** 🔴
    *   Description: Ensure audio and timer practices still function correctly.
    *   Depends on: Task 7
    *   Status: 🔴 Not Started
11. **Test Kinescope in Admin Panel** 🔴
    *   Description: Confirm Admin panel Kinescope playback is still working (or improved if admin also refactored).
    *   Depends on: Task 1, potentially Task 6 if admin player is changed.
    *   Status: 🔴 Not Started
12. **Linter/Build Check** 🔴
    *   Description: Run linter and build process to catch any errors.
    *   Status: 🔴 Not Started

### 📚 Documentation & Git

13. **Update `architecture.md`** 🔴
    *   Description: Document any changes to player architecture or new libraries.
    *   Files: `docs/architecture.md`
    *   Status: 🔴 Not Started
14. **Commit and Push Changes** 🔴
    *   Description: Commit all changes with a clear message and push to the repository.
    *   Status: 🔴 Not Started

---

## Discovered in ходе работы:
*   (empty for now)