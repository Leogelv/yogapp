import { useMemo, useEffect } from 'react';
import { HashRouter, Route, Routes, Navigate } from 'react-router-dom';
import { retrieveLaunchParams, useSignal, isMiniAppDark } from '@telegram-apps/sdk-react';
import { AppRoot } from '@telegram-apps/telegram-ui';
import { PlayerProvider } from '@/contexts/PlayerContext';
import { QuizProvider } from '@/contexts/QuizContext';

import { routes } from '@/navigation/routes.tsx';
import AppWrapper from '@/pages/AppWrapper';

export function App() {
  const lp = useMemo(() => retrieveLaunchParams(), []);
  const isDark = useSignal(isMiniAppDark);

  // Обработчик для PWA install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Предотвращаем автоматическое появление prompt
      e.preventDefault();
      // Сохраняем событие для использования позже
      (window as any).deferredPrompt = e;
      console.log('PWA install prompt готов к использованию');
    };

    const handleAppInstalled = () => {
      console.log('PWA приложение установлено');
      // Очищаем сохраненный prompt
      (window as any).deferredPrompt = null;
    };

    // Добавляем обработчики событий
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // Очистка при размонтировании
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  return (
    <AppRoot
      appearance={isDark ? 'dark' : 'light'}
      platform={['macos', 'ios'].includes(lp.tgWebAppPlatform) ? 'ios' : 'base'}
    >
      <PlayerProvider>
        <QuizProvider>
          <HashRouter>
            <Routes>
              <Route element={<AppWrapper />}>
                {routes.map((route) => (
                  <Route 
                    key={route.path} 
                    path={route.path} 
                    element={<route.Component />} 
                  />
                ))}
                <Route path="*" element={<Navigate to="/" />} />
              </Route>
            </Routes>
          </HashRouter>
        </QuizProvider>
      </PlayerProvider>
    </AppRoot>
  );
}
