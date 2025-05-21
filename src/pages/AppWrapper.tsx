import React from 'react';
import { Outlet } from 'react-router-dom';
import { AppWrapper as TelegramAppWrapper } from '@/components/AppWrapper';

/**
 * Обертка для всего приложения, служит корневым компонентом для роутинга
 * Использует компонент AppWrapper из папки components для работы с Telegram WebApp API
 */
const AppWrapper: React.FC = () => {
  return (
    <TelegramAppWrapper>
      <Outlet />
    </TelegramAppWrapper>
  );
};

export default AppWrapper; 