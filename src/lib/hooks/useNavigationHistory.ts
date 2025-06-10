import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

interface NavigationHistoryState {
  canGoBack: boolean;
  historyLength: number;
  previousPath: string | null;
}

export const useNavigationHistory = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [history, setHistory] = useState<NavigationHistoryState>({
    canGoBack: false,
    historyLength: 0,
    previousPath: null
  });

  useEffect(() => {
    // Сохраняем предыдущий путь в sessionStorage
    const currentPath = location.pathname;
    const previousPath = sessionStorage.getItem('previousPath');
    
    if (previousPath && previousPath !== currentPath) {
      setHistory(prev => ({
        ...prev,
        previousPath,
        canGoBack: true
      }));
    }
    
    sessionStorage.setItem('previousPath', currentPath);
    
    // Обновляем длину истории
    setHistory(prev => ({
      ...prev,
      historyLength: window.history.length
    }));
  }, [location.pathname]);

  const goBack = () => {
    if (history.canGoBack && window.history.length > 1) {
      navigate(-1);
    } else {
      // Если нет истории, переходим на главную
      navigate('/');
    }
  };

  const goToPath = (path: string) => {
    navigate(path);
  };

  const canNavigateBack = () => {
    return history.canGoBack || window.history.length > 1;
  };

  return {
    ...history,
    goBack,
    goToPath,
    canNavigateBack
  };
}; 