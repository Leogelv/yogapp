import { FC } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './TabBar.css';

interface TabBarProps {
  className?: string;
}

// Компонент TabBar для нижней навигации
const TabBar: FC<TabBarProps> = ({ className }) => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // При использовании HashRouter, pathname будет без #
  const currentPath = location.pathname;
  
  // Определение активной вкладки по пути (без учета хэша)
  const isActive = (path: string) => {
    if (path === '/library' && currentPath.startsWith('/library')) {
      return true;
    }
    return currentPath === path;
  };
  
  // Обработчик перехода на вкладку
  const handleTabClick = (path: string) => {
    navigate(path);
  };
  
  return (
      <nav className={`tab-bar ${className || ''}`} aria-label="Основная навигация">

          <button
              className={`tab-item ${isActive('/calendar') ? 'active' : ''}`}
              onClick={() => handleTabClick('/calendar')}
              aria-current={isActive('/calendar') ? 'page' : undefined}
              aria-label="Перейти в расписание"
          >
              <span>расписание</span>
          </button>
          <button
              className={`tab-item ${isActive('/') ? 'active' : ''}`}
              onClick={() => handleTabClick('/')}
              aria-current={isActive('/') ? 'page' : undefined}
              aria-label="Перейти на главную страницу"
          >
              <span>главная</span>
          </button>
          <button
              className={`tab-item ${isActive('/library') ? 'active' : ''}`}
              onClick={() => handleTabClick('/library')}
              aria-current={isActive('/library') ? 'page' : undefined}
              aria-label="Перейти в библиотеку"
          >
              <span>библиотека</span>
          </button>

      </nav>
  );
};

export default TabBar; 