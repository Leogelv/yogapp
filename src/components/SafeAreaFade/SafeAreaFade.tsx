import { FC, useEffect, useState } from 'react';
import { useSignal, viewport } from '@telegram-apps/sdk-react';
import './SafeAreaFade.css';

export const SafeAreaFade: FC = () => {
  const [mounted, setMounted] = useState(false);
  const contentSafeAreaInsetTop = useSignal(viewport.contentSafeAreaInsetTop);
  
  useEffect(() => {
    // Монтируем viewport для получения переменных safe area
    if (viewport.mount.isAvailable() && !viewport.isMounted()) {
      viewport.mount();
    }
    
    // Включаем CSS переменные для viewport
    if (viewport.bindCssVars.isAvailable() && !viewport.isCssVarsBound()) {
      viewport.bindCssVars();
    }
    
    setMounted(true);
    
    return () => {
      // При размонтировании не убираем viewport т.к. может использоваться в других местах
    };
  }, []);
  
  if (!mounted) {
    return null;
  }
  
  // Высота safe area плюс дополнительные 20px для эстетики
  const fadeHeight = (contentSafeAreaInsetTop || 90) + 20;
  
  return (
    <div 
      className="safe-area-fade"
      style={{ height: `${fadeHeight}px` }}
    />
  );
}; 