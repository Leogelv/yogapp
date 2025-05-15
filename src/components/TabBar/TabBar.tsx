import { FC, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import './TabBar.css';

// Иконки для таб-бара
import { 
  HomeIcon,
  LibraryIcon,
  CalendarIcon,
  ProfileIcon
} from './icons';

interface TabBarItem {
  id: string;
  icon: FC<{ isActive: boolean }>;
  label: string;
  path: string;
}

const tabs: TabBarItem[] = [
  {
    id: 'main',
    icon: HomeIcon,
    label: 'Главная',
    path: '/'
  },
  {
    id: 'library',
    icon: LibraryIcon,
    label: 'Библиотека',
    path: '/library'
  },
  {
    id: 'calendar',
    icon: CalendarIcon,
    label: 'Календарь',
    path: '/calendar'
  },
  {
    id: 'profile',
    icon: ProfileIcon,
    label: 'Профиль',
    path: '/profile'
  }
];

export const TabBar: FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const isActive = useCallback(
    (path: string) => location.pathname === path,
    [location.pathname]
  );
  
  const handleTabClick = (path: string) => {
    navigate(path);
  };
  
  return (
    <div className="tab-bar">
      {tabs.map((tab) => (
        <div 
          key={tab.id}
          className={`tab-bar-item ${isActive(tab.path) ? 'active' : ''}`}
          onClick={() => handleTabClick(tab.path)}
        >
          <tab.icon isActive={isActive(tab.path)} />
          <span className="tab-bar-label">{tab.label}</span>
        </div>
      ))}
      <div className="home-indicator" />
    </div>
  );
}; 