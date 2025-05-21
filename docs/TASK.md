# Задачи по разработке приложения

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