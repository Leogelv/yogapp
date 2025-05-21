import { useMemo } from 'react';
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
