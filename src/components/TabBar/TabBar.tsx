import { FC, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Tabbar } from '@telegram-apps/telegram-ui';
import './TabBar.css';

// Иконки для таб-бара
import { 
  HomeIcon,
  LibraryIcon,
  CalendarIcon,
  ProfileIcon
} from './icons';

interface TabBarUiItem {
  id: string;
  icon: FC<{ isActive: boolean }>;
  label: string;
  path: string;
}

const tabs: TabBarUiItem[] = [
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
    <div className="tab-bar-wrapper">
      <Tabbar className="telegram-tabbar">
        {tabs.map((tab) => (
          <Tabbar.Item
            key={tab.id}
            selected={isActive(tab.path)}
            onClick={() => handleTabClick(tab.path)}
            text={tab.label}
            className={`tabbar-item ${isActive(tab.path) ? 'active' : ''}`}
          >
            <div className="tabbar-icon-wrapper">
              <tab.icon isActive={isActive(tab.path)} />
            </div>
          </Tabbar.Item>
        ))}
      </Tabbar>
      <div className="home-indicator" />
    </div>
  );
}; 