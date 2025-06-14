import type { ComponentType, JSX } from 'react';

import { IndexPage } from '@/pages/IndexPage/IndexPage';
import { InitDataPage } from '@/pages/InitDataPage';
import { LaunchParamsPage } from '@/pages/LaunchParamsPage';
import { ThemeParamsPage } from '@/pages/ThemeParamsPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SupportPage } from '@/pages/SupportPage';
import { TONConnectPage } from '@/pages/TONConnectPage/TONConnectPage';
import { DiagnosticsPage } from '@/pages/DiagnosticsPage/DiagnosticsPage';
import { MainScreen } from '@/pages/MainScreen/MainScreen';
import { QuizFlow } from '@/pages/QuizFlow/QuizFlow';
import EnhancedPracticePageWrapper from '@/pages/PracticePage/EnhancedPracticePageWrapper';
import AdminPage from '@/pages/AdminPage/AdminPage';
import LibraryPage from '@/pages/LibraryPage';
import CategoryPage from '@/pages/LibraryPage/CategoryPage';
import FavoritesPage from '@/pages/LibraryPage/FavoritesPage';
import CalendarPage from '@/pages/CalendarPage';
import { LandingPage } from '@/pages/LandingPage/LandingPage';
import {AudioPracticePage} from "@/pages/AudioPracticePage.tsx";

interface Route {
  path: string;
  Component: ComponentType;
  title?: string;
  icon?: JSX.Element;
}

export const routes: Route[] = [
  // Лендинг курса GenAI Engineer
  { path: '/landing', Component: LandingPage, title: 'Курс GenAI Engineer' },
  
  // Основной экран для телеграм мини-аппа
  { path: '/', Component: MainScreen },
  
  // Библиотека практик
  { path: '/library', Component: LibraryPage, title: 'Библиотека' },
  { path: '/library/favorites', Component: FavoritesPage, title: 'Избранное' },
  { path: '/library/category/:categorySlug', Component: CategoryPage },
  
  // Календарь
  { path: '/calendar', Component: CalendarPage, title: 'Календарь' },
  
  // Новый квиз для выбора практики
  { path: '/quiz', Component: QuizFlow, title: 'Выбор практики' },
  { path: '/quiz/*', Component: QuizFlow, title: 'Выбор практики' },
  
  // Страница практики - путь упрощен для единообразия
  { path: '/practice/:contentId', Component: EnhancedPracticePageWrapper, title: 'Практика' },
  
  // Страница таймера для самостоятельных медитаций
  { path: '/practice/timer', Component: EnhancedPracticePageWrapper, title: 'Медитация' },

  { path: '/practice/audio/:contentId', Component: AudioPracticePage, title: 'Практика'},
  
  // Страница события из календаря
  { path: '/practice/event/:eventId', Component: EnhancedPracticePageWrapper, title: 'Событие' },
  
  // Админ панель
  { path: '/admin', Component: AdminPage, title: 'Админ панель' },
  
  // Оставляем старую главную как диагностический инструмент
  { path: '/old-index', Component: IndexPage, title: 'Старая главная' },
  
  // Другие страницы
  { path: '/init-data', Component: InitDataPage, title: 'Init Data' },
  { path: '/theme-params', Component: ThemeParamsPage, title: 'Theme Params' },
  { path: '/launch-params', Component: LaunchParamsPage, title: 'Launch Params' },
  { path: '/profile', Component: ProfilePage, title: 'Профиль' },
  { path: '/support', Component: SupportPage, title: 'Поддержка' },
  {
    path: '/ton-connect',
    Component: TONConnectPage,
    title: 'TON Connect',
    icon: (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="100%"
        height="100%"
        viewBox="0 0 56 56"
        fill="none"
      >
        <path
          d="M28 56C43.464 56 56 43.464 56 28C56 12.536 43.464 0 28 0C12.536 0 0 12.536 0 28C0 43.464 12.536 56 28 56Z"
          fill="#0098EA"
        />
        <path
          d="M37.5603 15.6277H18.4386C14.9228 15.6277 12.6944 19.4202 14.4632 22.4861L26.2644 42.9409C27.0345 44.2765 28.9644 44.2765 29.7345 42.9409L41.5381 22.4861C43.3045 19.4251 41.0761 15.6277 37.5627 15.6277H37.5603ZM26.2548 36.8068L23.6847 31.8327L17.4833 20.7414C17.0742 20.0315 17.5795 19.1218 18.4362 19.1218H26.2524V36.8092L26.2548 36.8068ZM38.5108 20.739L32.3118 31.8351L29.7417 36.8068V19.1194H37.5579C38.4146 19.1194 38.9199 20.0291 38.5108 20.739Z"
          fill="white"
        />
      </svg>
    ),
  },
  { path: '/diagnostics', Component: DiagnosticsPage },
];
