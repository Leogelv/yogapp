# Краткосрочное планирование

## Логические основания
- **Вещь**: Приложение для йоги/медитаций с интеграцией Telegram и Supabase
- **Свойства**: Интерактивность, персонализация, realtime, календарь событий
- **Отношения**: Пользователь ↔ Контент, События ↔ Пользователь, Контент ↔ Категории

## Приоритеты на текущую итерацию

1. ✅ **Исправить страницу календаря**
   - Создать таблицу events в базе данных
   - Исправить компонент CalendarPage
   - Добавить реальную интеграцию с Supabase

2. ✅ **Исправить страницу библиотеки**
   - Исправить предупреждения и ошибки
   - Улучшить взаимодействие с контентом

3. ✅ **Исправить навигацию и UX**
   - Убрать дублирование категории "Дыхание" в библиотеке
   - Редизайн нижнего меню (TabBar) - увеличить иконки, улучшить читаемость
   - Проверить корректность телеграмовской навигации во всех страницах

4. 🟡 **Добавить функционал в календарь**
   - Добавление новых событий
   - Редактирование событий
   - Интеграция напоминаний

5. 🟡 **Улучшить административную панель**
   - Управление событиями календаря
   - Упрощенное добавление контента

## Чек-лист качества

- [x] Проверка на ошибки консоли
- [x] Проверка интеграции с Supabase
- [x] Проверка корректной работы realtime каналов
- [x] Проверка отображения в Telegram Mini App
- [x] Оптимизация загрузки контента
- [ ] Проверка всех основных пользовательских сценариев
- [ ] Тестирование производительности

## Технические заметки

- Необходимо добавить больше валидации пользовательского ввода
- Рассмотреть кэширование данных для улучшения производительности
- Добавить механизм обработки ошибок сетевых запросов
- Внедрить систему аналитики действий пользователя

# Short Term Plan: Refactor Kinescope Player Logic

## Goal:
Replicate the working Kinescope player logic from the Admin panel to the main client-side PlayerContext and PlayerWidget to fix lagging and ensure videos play correctly. Audio and Timer practices should remain unaffected.

## Checklist & Steps:

### 1. Initial Setup & Investigation:
    - [X] Create/Verify `docs/TASK.md` and `docs/SHORT_PLANNING.md`. (AI - July 26, 2024)
    - [ ] Read `AdminPage` to understand current Kinescope implementation (`handleVideoPreview`).
    - [ ] Read `PlayerContext` and the main `PlayerWidget` (`Player.tsx` likely in `src/components/Player/`) to understand current player logic.
    - [ ] Read `PracticePage` to understand how it uses the player and identify potential causes for lagging.
    - [ ] Check if admin uses an iframe for Kinescope. If so, plan to replace with `@kinescope/react-vite`.

### 2. Implementation:
    - [ ] Update `PlayerContext`:
        - Add state/logic to manage Kinescope player instance and video ID.
        - Modify functions to play Kinescope videos when `contentType` is video and `kinescope_id` is present.
    - [ ] Update `PlayerWidget`:
        - Conditionally render the Kinescope player (e.g., using `@kinescope/react-vite`) when a Kinescope video is active.
        - Ensure existing audio/timer player logic remains functional.
    - [ ] Refactor `PracticePage`:
        - Ensure it correctly passes practice data to `PlayerContext`.
        - Optimize rendering to prevent lags if identified.

### 3. Cleanup & Verification:
    - [ ] Remove `getKinescopeVideoMetadata` from `@/lib/kinescopeService.ts`.
    - [ ] Test Kinescope video playback on `PracticePage`.
    - [ ] Test audio playback on `PracticePage`.
    - [ ] Test timer/meditation on `PracticePage`.
    - [ ] Test Kinescope video playback in Admin Panel (ensure it still works or is improved).
    - [ ] Verify no new linter errors or build issues.

### 4. Documentation & Git:
    - [ ] Update `architecture.md` if any significant changes to player logic or new libraries are introduced.
    - [ ] Update `TASK.md` with progress.
    - [ ] Commit changes with a descriptive message.

## Key Files to Examine/Modify:
- `src/pages/AdminPage/AdminPage.tsx` (or similar)
- `src/contexts/PlayerContext.tsx` (or similar)
- `src/components/Player/Player.tsx` (or similar)
- `src/pages/PracticePage/PracticePage.tsx` (or similar)
- `src/lib/kinescopeService.ts`
- `package.json` (if Kinescope library needs to be added/updated)

## Potential Challenges:
- Integrating Kinescope player library (`@kinescope/react-vite` or `@kinescope/react`) correctly with Vite.
- Managing different player states (Kinescope, audio, timer) within a single context/widget.
- Resolving performance issues on `PracticePage`.