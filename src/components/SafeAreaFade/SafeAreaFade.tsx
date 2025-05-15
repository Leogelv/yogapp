import { FC, useEffect } from 'react';
import { viewport } from '@telegram-apps/sdk-react';
import './SafeAreaFade.css';

export const SafeAreaFade: FC = () => {
  useEffect(() => {
    // Включаем CSS переменные для viewport - это всё равно нужно для других компонентов
    if (viewport.mount.isAvailable() && !viewport.isMounted()) {
      viewport.mount();
    }
    
    if (viewport.bindCssVars.isAvailable() && !viewport.isCssVarsBound()) {
      viewport.bindCssVars();
    }
  }, []);
  
  return <div className="safe-area-fade" />;
}; 